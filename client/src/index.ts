import {
    STAGE_ID,
    GAME_ID
} from './config';

import { getCanvasContext } from './utils';
import stage from './stage';
import game from './game';
import multiplayer from './multiplayer';
import { hideOverlay, showMenu } from './menu';

const run = (): void => {
    const contextStage = getCanvasContext(STAGE_ID);
    stage(contextStage);

    const contextGame = getCanvasContext(GAME_ID);
    showMenu(mode => {
        if (mode === 'single') {
            hideOverlay();
            game(contextGame);
        } else {
            multiplayer(contextGame);
        }
    });
};

run();
