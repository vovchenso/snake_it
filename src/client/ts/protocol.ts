import { Direction, Point } from './config';

export type SnakeView = { id: 0 | 1; body: Point[]; score: number };

export type ServerMessage =
    | { type: 'welcome'; you: 0 | 1; width: number; height: number }
    | { type: 'full' }
    | { type: 'state'; started: boolean; dot: Point; snakes: [SnakeView | null, SnakeView | null] };

export type StateMessage = Extract<ServerMessage, { type: 'state' }>;

export type ClientMessage = { type: 'dir'; dir: Direction };
