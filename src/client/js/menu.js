import runner from './runner';

const menu = () => {
    const items = document.querySelectorAll('nav button');
    Array.from(items).forEach(button => {
        button.addEventListener('click', event => {
            event.preventDefault();
            const type = event.currentTarget.getAttribute('data-type');
            runner(type);
        });
    });
};

export default menu;