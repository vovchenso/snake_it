import {
    INFO_ID
} from './config';

export interface InfoData {
    score: number;
}

export interface InfoLine {
    text: string;
    color: string;
}

const infoElement = (): HTMLElement => {
    const info = document.getElementById(INFO_ID);
    if (!info) {
        throw new Error(`Info element #${INFO_ID} not found`);
    }
    return info;
};

export const setInfo = (text: string): void => {
    infoElement().innerText = text;
};

// One line per entry, each in its own colour.
export const setInfoLines = (lines: InfoLine[]): void => {
    infoElement().replaceChildren(...lines.map(({ text, color }) => {
        const line = document.createElement('div');
        line.textContent = text;
        line.style.color = color;
        return line;
    }));
};

export default (data: InfoData): void => {
    setInfo(`SCORE: ${data.score}`);
};
