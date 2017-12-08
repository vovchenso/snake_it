import {
    COLORS,
    HEIGHT,
    STEP,
    WIDTH
} from './config';

export default stage = context => {
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