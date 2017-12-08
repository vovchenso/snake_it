const STAGE_ID = '_stage';
const GAME_ID = '_game';
const INFO_ID = '_info';
const HEIGHT = 400;
const WIDTH = 600;
const STEP = 10;

const MAX_WIDTH = WIDTH / STEP;
const MAX_HEIGHT = HEIGHT / STEP;

const DIRECTIONS = {
    Up: 'ArrowUp',
    Right: 'ArrowRight',
    Down: 'ArrowDown',
    Left: 'ArrowLeft'
};

const COLORS = {
    Main: '#0f0',
    Dot: '#ff0',
    Hidden: '#000'
};

let SPEED = 100;
let score = 0;

let direction = DIRECTIONS.Up;
let dot = [-1, -1];


const drawStage = context => {
    for (let x = 0; x <= WIDTH; x+= STEP) {
        context.moveTo(x, 0);
        context.lineTo(x, HEIGHT);
    }

    for (let y = 0; y <= HEIGHT; y+= STEP) {
        context.moveTo(0, y);
        context.lineTo(WIDTH, y);
    }

    context.strokeStyle = COLORS.Main;
    context.stroke();
};

const drawSnake = (context, body, hide = false) => {
    context.beginPath();
    context.fillStyle = hide ? COLORS.Hidden : COLORS.Main;

    body.forEach(part => {
        const [x, y] = part;
        context.rect(x * STEP + 1, y * STEP + 1, STEP, STEP);
        context.fill();
    });
};

const move = (context, body) => {
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

const intercept = body => {
    for (let i = 0; i < body.length; i++) {
        if (dot[0] === body[i][0] && dot[1] === body[i][1]) {
            return true;
        }
    }

    return false;
};

const generateDot = body => {
    do {
        dot = [
            Math.round(Math.random() * (MAX_WIDTH - 1)),
            Math.round(Math.random() * (MAX_HEIGHT - 1))
        ];
    } while(intercept(body));
};

const drawDot = (context, body) => {
    context.beginPath();
    context.fillStyle = COLORS.Hidden;
    context.rect(dot[0] * STEP + 1, dot[1] * STEP + 1, STEP, STEP);
    context.fill();

    generateDot(body);
    updateInfo();

    context.beginPath();
    context.rect(dot[0] * STEP + 1, dot[1] * STEP + 1, STEP, STEP);

    context.fillStyle = COLORS.Dot;
    context.fill();
};

const loop = (context, body) => {
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

const updateInfo = () => {
    const info = document.getElementById(INFO_ID);
    info.innerText = `SCORE: ${score}`;
};

const game = context => {
    const body = [
        [10, 10],
        [10, 11],
        [10, 12]
    ];

    drawDot(context, body);
    loop(context, body);
};

const setDirection = arrow => {
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

const getContext = id => document.getElementById(id).getContext('2d');

const run = () => {
    const contextStage = getContext(STAGE_ID);
    drawStage(contextStage);

    const contextGame = getContext(GAME_ID);
    game(contextGame);

    document.body.addEventListener('keydown', event => {
        if (~Object.values(DIRECTIONS).indexOf(event.key)) {
            setDirection(event.key);
        }
    });
};

run();