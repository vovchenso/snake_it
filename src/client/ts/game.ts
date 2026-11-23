import {
    COLORS,
    DIRECTIONS,
    MAX_HEIGHT,
    MAX_WIDTH,
    STEP,
    Direction,
    Point
} from './config';
import { intercept } from './utils';
import info from './info';

let SPEED = 100;
let score = 0;

let direction: Direction = DIRECTIONS.Up;
let dot: Point = [-1, -1];

const drawSnake = (context: CanvasRenderingContext2D, body: Point[], hide = false): void => {
    context.beginPath();
    context.fillStyle = hide ? COLORS.Hidden : COLORS.Main;

    body.forEach(part => {
        const [x, y] = part;
        context.rect(x * STEP + 1, y * STEP + 1, STEP, STEP);
        context.fill();
    });
};

const move = (context: CanvasRenderingContext2D, body: Point[]): void => {
    let [x, y] = body[0];

    switch (direction) {
        case DIRECTIONS.Up:
            if (--y === -1) {
                y = MAX_HEIGHT - 1;
            }
            break;

        case DIRECTIONS.Down:
            if (++y === MAX_HEIGHT) {
                y = 0;
            }
            break;

        case DIRECTIONS.Left:
            if (--x === -1) {
                x = MAX_WIDTH - 1;
            }
            break;

        case DIRECTIONS.Right:
            if (++x === MAX_WIDTH) {
                x = 0;
            }
            break;

        default:
            break;
    }

    body.unshift([x, y]);

    if (x === dot[0] && y === dot[1]) {
        score++;
        drawDot(context, body);
        if (SPEED > 40) {
            SPEED -= 2;
        } else if (SPEED > 20) {
            SPEED--;
        }
    } else {
        body.pop();
    }
};

const generateDot = (body: Point[]): void => {
    do {
        dot = [
            Math.round(Math.random() * (MAX_WIDTH - 1)),
            Math.round(Math.random() * (MAX_HEIGHT - 1))
        ];
    } while(intercept(body, dot));
};

const drawDot = (context: CanvasRenderingContext2D, body: Point[]): void => {
    context.beginPath();
    context.fillStyle = COLORS.Hidden;
    context.rect(dot[0] * STEP + 1, dot[1] * STEP + 1, STEP, STEP);
    context.fill();

    generateDot(body);
    info({ score });

    context.beginPath();
    context.rect(dot[0] * STEP + 1, dot[1] * STEP + 1, STEP, STEP);

    context.fillStyle = COLORS.Dot;
    context.fill();
};

const loop = (context: CanvasRenderingContext2D, body: Point[]): void => {
    drawSnake(context, body, true);

    move(context, body);
    drawSnake(context, body);

    setTimeout(() =>
            requestAnimationFrame(() =>
                loop(context, body)
            ),
        SPEED
    );
};

export const setDirection = (arrow: Direction): void => {
    switch (arrow) {
        case DIRECTIONS.Up:
            if (direction !== DIRECTIONS.Down) {
                direction = DIRECTIONS.Up;
            }
            break;

        case DIRECTIONS.Down:
            if (direction !== DIRECTIONS.Up) {
                direction = DIRECTIONS.Down;
            }
            break;

        case DIRECTIONS.Left:
            if (direction !== DIRECTIONS.Right) {
                direction = DIRECTIONS.Left;
            }
            break;

        case DIRECTIONS.Right:
            if (direction !== DIRECTIONS.Left) {
                direction = DIRECTIONS.Right;
            }
            break;

        default:
            break;
    }
};

const isDirection = (key: string): key is Direction =>
    (Object.values(DIRECTIONS) as string[]).includes(key);

const game = (context: CanvasRenderingContext2D): void => {
    document.body.addEventListener('keydown', (event: KeyboardEvent) => {
        if (isDirection(event.key)) {
            setDirection(event.key);
        }
    });

    const body: Point[] = [
        [10, 10],
        [10, 11],
        [10, 12]
    ];

    drawDot(context, body);
    loop(context, body);
};

export default game;