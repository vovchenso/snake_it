import {
    STAGE_ID,
    GAME_ID
} from './config';

import { getCanvasContext } from './utils';
import stage from './stage';
import game from './game';

const run = () => {
    const contextStage = getCanvasContext(STAGE_ID);
    stage(contextStage);

    const contextGame = getCanvasContext(GAME_ID);
    game(contextGame);
};

run();