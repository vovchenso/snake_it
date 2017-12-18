import {
    STAGE_ID,
    GAME_ID,
    GAME_TYPE
} from './config';

import { getCanvasContext } from './utils';
import stage from './stage';
import game from './game';


const showMainArea = () => {
    document.querySelector('nav').style.display = 'none';
    document.querySelector('main').style.display = 'flex';
};

const runner = type => {
    showMainArea();

    if (GAME_TYPE.Multiplayer === type) {
        console.warn('Mutiplayer mode currently is under development.')
    }

    const contextStage = getCanvasContext(STAGE_ID);
    stage(contextStage);

    const contextGame = getCanvasContext(GAME_ID);
    game(contextGame);
};

export default runner;