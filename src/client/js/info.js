import {
    INFO_ID
} from './config';

export default (data) => {
    const info = document.getElementById(INFO_ID);
    info.innerText = `SCORE: ${data.score}`;
};