import { MENU_ID } from './config';

export type Mode = 'single' | 'multi';

const overlay = (): HTMLElement => {
    const el = document.getElementById(MENU_ID);
    if (!el) {
        throw new Error(`Menu element #${MENU_ID} not found`);
    }
    return el;
};

const button = (label: string, onClick: () => void): HTMLButtonElement => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    b.addEventListener('click', onClick);
    return b;
};

const show = (...children: HTMLElement[]): void => {
    const el = overlay();
    el.replaceChildren(...children);
    el.classList.remove('hidden');
};

export const showMenu = (onPick: (mode: Mode) => void): void => {
    const title = document.createElement('h1');
    title.textContent = 'SNAKE IT';
    const single = button('Single', () => onPick('single'));
    show(title, single, button('Multiplayer', () => onPick('multi')));
    single.focus();
};

export const showStatus = (text: string, withBack: boolean): void => {
    const p = document.createElement('div');
    p.textContent = text;
    show(p, ...(withBack ? [button('Back', () => location.reload())] : []));
};

export const hideOverlay = (): void => {
    overlay().classList.add('hidden');
};
