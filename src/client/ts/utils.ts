import { Point } from './config';

export const getCanvasContext = (id: string): CanvasRenderingContext2D => {
    const canvas = document.getElementById(id);
    if (!(canvas instanceof HTMLCanvasElement)) {
        throw new Error(`Canvas element #${id} not found`);
    }

    const context = canvas.getContext('2d');
    if (!context) {
        throw new Error(`2D context is not available for #${id}`);
    }

    return context;
};

export const intercept = (data: Point[], dot: Point): boolean => {
    for (let i = 0; i < data.length; i++) {
        if (dot[0] === data[i][0] && dot[1] === data[i][1]) {
            return true;
        }
    }

    return false;
};
