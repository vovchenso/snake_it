import { COLORS, HEIGHT, Point, STEP, WIDTH } from './config';

const GLOW_BLUR = 16;
// Each pass stacks another shadow, so two passes give a brighter halo.
const GLOW_PASSES = 2;

const cell = (context: CanvasRenderingContext2D, [x, y]: Point): void => {
    context.rect(x * STEP + 1, y * STEP + 1, STEP, STEP);
};

const glowCell = (context: CanvasRenderingContext2D, point: Point, color: string): void => {
    context.save();
    context.shadowColor = color;
    context.shadowBlur = GLOW_BLUR;
    context.fillStyle = color;
    context.beginPath();
    cell(context, point);
    for (let i = 0; i < GLOW_PASSES; i++) {
        context.fill();
    }
    context.restore();
};

export const clearBoard = (context: CanvasRenderingContext2D): void => {
    context.clearRect(0, 0, WIDTH + STEP, HEIGHT + STEP);
};

export const drawDot = (context: CanvasRenderingContext2D, dot: Point): void => {
    glowCell(context, dot, COLORS.Dot);
};

/** Body cells are plain; the head (body[0]) gets a blurred glow in the snake's colour. */
export const drawSnake = (context: CanvasRenderingContext2D, body: Point[], color: string): void => {
    if (body.length === 0) {
        return;
    }
    context.beginPath();
    context.fillStyle = color;
    body.slice(1).forEach(part => cell(context, part));
    context.fill();

    glowCell(context, body[0], color);
};
