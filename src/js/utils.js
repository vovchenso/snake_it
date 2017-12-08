export const getCanvasContext = id => document.getElementById(id).getContext('2d');

export const intercept = (data, dot) => {
    for (let i = 0; i < data.length; i++) {
        if (dot[0] === data[i][0] && dot[1] === data[i][1]) {
            return true;
        }
    }

    return false;
};