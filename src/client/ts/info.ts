import {
    INFO_ID
} from './config';

export interface InfoData {
    score: number;
}

export default (data: InfoData): void => {
    const info = document.getElementById(INFO_ID);
    if (!info) {
        throw new Error(`Info element #${INFO_ID} not found`);
    }
    info.innerText = `SCORE: ${data.score}`;
};
