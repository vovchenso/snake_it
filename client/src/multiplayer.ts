import {
    COLORS,
    DEFAULT_WS_URL,
    DIRECTIONS,
    Direction,
    HEIGHT,
    MAX_HEIGHT,
    MAX_WIDTH,
    Point,
    STEP,
    WIDTH
} from './config';
import { setInfoLines } from './info';
import { hideOverlay, showStatus } from './menu';
import { ClientMessage, ServerMessage, StateMessage } from './protocol';

const SNAKE_COLORS = [COLORS.Main, COLORS.Player2] as const;

export const wsUrl = (loc: Location): string => {
    switch (loc.protocol) {
        case 'http:':
            return `ws://${loc.host}/ws`;
        case 'https:':
            return `wss://${loc.host}/ws`;
        default:
            return DEFAULT_WS_URL;
    }
};

const fillCells = (context: CanvasRenderingContext2D, cells: Point[], color: string): void => {
    context.beginPath();
    context.fillStyle = color;
    cells.forEach(([x, y]) => context.rect(x * STEP + 1, y * STEP + 1, STEP, STEP));
    context.fill();
};

export const drawState = (context: CanvasRenderingContext2D, msg: StateMessage, you: 0 | 1): void => {
    context.clearRect(0, 0, WIDTH + STEP, HEIGHT + STEP);
    fillCells(context, [msg.dot], COLORS.Dot);
    msg.snakes.forEach(snake => {
        if (snake) {
            fillCells(context, snake.body, SNAKE_COLORS[snake.id]);
        }
    });

    setInfoLines(msg.snakes
        .filter((s): s is NonNullable<typeof s> => s !== null)
        .map(s => ({
            text: `${s.id === you ? 'YOU' : `P${s.id + 1}`}: ${s.score}`,
            color: SNAKE_COLORS[s.id]
        })));
};

const isDirection = (key: string): key is Direction =>
    (Object.values(DIRECTIONS) as string[]).includes(key);

const multiplayer = (context: CanvasRenderingContext2D): void => {
    showStatus('Connecting…', false);

    let socket: WebSocket;
    try {
        socket = new WebSocket(wsUrl(location));
    } catch {
        showStatus('Disconnected / server not running', true);
        return;
    }

    let you: 0 | 1 = 0;
    let finished = false;

    const end = (text: string): void => {
        if (!finished) {
            finished = true;
            showStatus(text, true);
        }
    };

    socket.addEventListener('message', event => {
        let msg: ServerMessage;
        try {
            msg = JSON.parse(String(event.data));
        } catch {
            return;
        }

        switch (msg.type) {
            case 'welcome':
                if (msg.width !== MAX_WIDTH || msg.height !== MAX_HEIGHT) {
                    end('Server board size mismatch');
                    socket.close();
                    return;
                }
                you = msg.you;
                break;

            case 'full':
                end('Game is full');
                break;

            case 'state':
                if (finished) {
                    return;
                }
                if (msg.started) {
                    hideOverlay();
                } else {
                    showStatus('Waiting for player 2…', false);
                }
                drawState(context, msg, you);
                break;
        }
    });

    socket.addEventListener('close', () => end('Disconnected / server not running'));
    socket.addEventListener('error', () => end('Disconnected / server not running'));

    document.body.addEventListener('keydown', (event: KeyboardEvent) => {
        if (!isDirection(event.key)) {
            return;
        }
        event.preventDefault();
        if (socket.readyState === WebSocket.OPEN) {
            const msg: ClientMessage = { type: 'dir', dir: event.key };
            socket.send(JSON.stringify(msg));
        }
    });
};

export default multiplayer;
