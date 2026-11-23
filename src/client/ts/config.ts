export const STAGE_ID = '_stage';
export const GAME_ID = '_game';
export const INFO_ID = '_info';
export const HEIGHT = 400;
export const WIDTH = 600;
export const STEP = 10;

export const MAX_WIDTH = WIDTH / STEP;
export const MAX_HEIGHT = HEIGHT / STEP;

export const DIRECTIONS = {
    Up: 'ArrowUp',
    Right: 'ArrowRight',
    Down: 'ArrowDown',
    Left: 'ArrowLeft'
} as const;

export type Direction = typeof DIRECTIONS[keyof typeof DIRECTIONS];

export const COLORS = {
    Main: '#0f0',
    Dot: '#ff0',
    Hidden: '#000'
} as const;

export type Point = [number, number];
