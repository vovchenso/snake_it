/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
const STAGE_ID = '_stage';
/* harmony export (immutable) */ __webpack_exports__["i"] = STAGE_ID;

const GAME_ID = '_game';
/* harmony export (immutable) */ __webpack_exports__["c"] = GAME_ID;

const INFO_ID = '_info';
/* harmony export (immutable) */ __webpack_exports__["f"] = INFO_ID;

const HEIGHT = 400;
/* harmony export (immutable) */ __webpack_exports__["e"] = HEIGHT;

const WIDTH = 600;
/* harmony export (immutable) */ __webpack_exports__["k"] = WIDTH;

const STEP = 10;
/* harmony export (immutable) */ __webpack_exports__["j"] = STEP;


const MAX_WIDTH = WIDTH / STEP;
/* harmony export (immutable) */ __webpack_exports__["h"] = MAX_WIDTH;

const MAX_HEIGHT = HEIGHT / STEP;
/* harmony export (immutable) */ __webpack_exports__["g"] = MAX_HEIGHT;


const DIRECTIONS = {
    Up: 'ArrowUp',
    Right: 'ArrowRight',
    Down: 'ArrowDown',
    Left: 'ArrowLeft'
};
/* harmony export (immutable) */ __webpack_exports__["b"] = DIRECTIONS;


const COLORS = {
    Main: '#0f0',
    Dot: '#ff0',
    Hidden: '#000'
};
/* harmony export (immutable) */ __webpack_exports__["a"] = COLORS;


const GAME_TYPE = {
    Standard: 'standard',
    MultiPlayer: 'multiplayer'
};
/* harmony export (immutable) */ __webpack_exports__["d"] = GAME_TYPE;



/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
const getCanvasContext = id => document.getElementById(id).getContext('2d');
/* harmony export (immutable) */ __webpack_exports__["a"] = getCanvasContext;


const intercept = (data, dot) => {
    for (let i = 0; i < data.length; i++) {
        if (dot[0] === data[i][0] && dot[1] === data[i][1]) {
            return true;
        }
    }

    return false;
};
/* harmony export (immutable) */ __webpack_exports__["b"] = intercept;


/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__menu__ = __webpack_require__(3);


Object(__WEBPACK_IMPORTED_MODULE_0__menu__["a" /* default */])();


/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__runner__ = __webpack_require__(4);


const menu = () => {
    const items = document.querySelectorAll('nav button');
    Array.from(items).forEach(button => {
        button.addEventListener('click', event => {
            event.preventDefault();
            const type = event.currentTarget.getAttribute('data-type');
            Object(__WEBPACK_IMPORTED_MODULE_0__runner__["a" /* default */])(type);
        });
    });
};

/* harmony default export */ __webpack_exports__["a"] = (menu);

/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__config__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__stage__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__game__ = __webpack_require__(6);







const showMainArea = () => {
    document.querySelector('nav').style.display = 'none';
    document.querySelector('main').style.display = 'flex';
};

const runner = type => {
    showMainArea();

    if (__WEBPACK_IMPORTED_MODULE_0__config__["d" /* GAME_TYPE */].Multiplayer === type) {
        console.warn('Mutiplayer mode currently is under development.')
    }

    const contextStage = Object(__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* getCanvasContext */])(__WEBPACK_IMPORTED_MODULE_0__config__["i" /* STAGE_ID */]);
    Object(__WEBPACK_IMPORTED_MODULE_2__stage__["a" /* default */])(contextStage);

    const contextGame = Object(__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* getCanvasContext */])(__WEBPACK_IMPORTED_MODULE_0__config__["c" /* GAME_ID */]);
    Object(__WEBPACK_IMPORTED_MODULE_3__game__["a" /* default */])(contextGame);
};

/* harmony default export */ __webpack_exports__["a"] = (runner);

/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__config__ = __webpack_require__(0);


const stage = context => {
    for (let x = 0; x <= __WEBPACK_IMPORTED_MODULE_0__config__["k" /* WIDTH */]; x+= __WEBPACK_IMPORTED_MODULE_0__config__["j" /* STEP */]) {
        context.moveTo(x, 0);
        context.lineTo(x, __WEBPACK_IMPORTED_MODULE_0__config__["e" /* HEIGHT */]);
    }

    for (let y = 0; y <= __WEBPACK_IMPORTED_MODULE_0__config__["e" /* HEIGHT */]; y+= __WEBPACK_IMPORTED_MODULE_0__config__["j" /* STEP */]) {
        context.moveTo(0, y);
        context.lineTo(__WEBPACK_IMPORTED_MODULE_0__config__["k" /* WIDTH */], y);
    }

    context.strokeStyle = __WEBPACK_IMPORTED_MODULE_0__config__["a" /* COLORS */].Main;
    context.stroke();
};

/* harmony default export */ __webpack_exports__["a"] = (stage);

/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__config__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__info__ = __webpack_require__(7);




let SPEED = 100;
let score = 0;

let direction = __WEBPACK_IMPORTED_MODULE_0__config__["b" /* DIRECTIONS */].Up;
let dot = [-1, -1];

const drawSnake = (context, body, hide = false) => {
    context.beginPath();
    context.fillStyle = hide ? __WEBPACK_IMPORTED_MODULE_0__config__["a" /* COLORS */].Hidden : __WEBPACK_IMPORTED_MODULE_0__config__["a" /* COLORS */].Main;

    body.forEach(part => {
        const [x, y] = part;
        context.rect(x * __WEBPACK_IMPORTED_MODULE_0__config__["j" /* STEP */] + 1, y * __WEBPACK_IMPORTED_MODULE_0__config__["j" /* STEP */] + 1, __WEBPACK_IMPORTED_MODULE_0__config__["j" /* STEP */], __WEBPACK_IMPORTED_MODULE_0__config__["j" /* STEP */]);
        context.fill();
    });
};

const move = (context, body) => {
    let [x, y] = body[0];

    switch (direction) {
        case __WEBPACK_IMPORTED_MODULE_0__config__["b" /* DIRECTIONS */].Up:
            if (--y === -1) {
                y = __WEBPACK_IMPORTED_MODULE_0__config__["g" /* MAX_HEIGHT */] - 1;
            }
            break;

        case __WEBPACK_IMPORTED_MODULE_0__config__["b" /* DIRECTIONS */].Down:
            if (++y === __WEBPACK_IMPORTED_MODULE_0__config__["g" /* MAX_HEIGHT */]) {
                y = 0;
            }
            break;

        case __WEBPACK_IMPORTED_MODULE_0__config__["b" /* DIRECTIONS */].Left:
            if (--x === -1) {
                x = __WEBPACK_IMPORTED_MODULE_0__config__["h" /* MAX_WIDTH */] - 1;
            }
            break;

        case __WEBPACK_IMPORTED_MODULE_0__config__["b" /* DIRECTIONS */].Right:
            if (++x === __WEBPACK_IMPORTED_MODULE_0__config__["h" /* MAX_WIDTH */]) {
                x = 0;
            }
            break;

        default:
            break;
    }

    body.unshift([x, y]);

    if (x === dot[0] && y === dot[1]) {
        score++;
        drawDot(context, body);
        increaseSpeed();
    } else {
        body.pop();
    }
};

const increaseSpeed = () => {
    if (SPEED > 40) {
        SPEED -= 2;
    } else if (SPEED > 20) {
        SPEED--;
    }
};

const generateDot = body => {
    do {
        dot = [
            Math.round(Math.random() * (__WEBPACK_IMPORTED_MODULE_0__config__["h" /* MAX_WIDTH */] - 1)),
            Math.round(Math.random() * (__WEBPACK_IMPORTED_MODULE_0__config__["g" /* MAX_HEIGHT */] - 1))
        ];
    } while(Object(__WEBPACK_IMPORTED_MODULE_1__utils__["b" /* intercept */])(body, dot));
};

const drawDot = (context, body) => {
    context.beginPath();
    context.fillStyle = __WEBPACK_IMPORTED_MODULE_0__config__["a" /* COLORS */].Hidden;
    context.rect(dot[0] * __WEBPACK_IMPORTED_MODULE_0__config__["j" /* STEP */] + 1, dot[1] * __WEBPACK_IMPORTED_MODULE_0__config__["j" /* STEP */] + 1, __WEBPACK_IMPORTED_MODULE_0__config__["j" /* STEP */], __WEBPACK_IMPORTED_MODULE_0__config__["j" /* STEP */]);
    context.fill();

    generateDot(body);
    Object(__WEBPACK_IMPORTED_MODULE_2__info__["a" /* default */])({ score });

    context.beginPath();
    context.rect(dot[0] * __WEBPACK_IMPORTED_MODULE_0__config__["j" /* STEP */] + 1, dot[1] * __WEBPACK_IMPORTED_MODULE_0__config__["j" /* STEP */] + 1, __WEBPACK_IMPORTED_MODULE_0__config__["j" /* STEP */], __WEBPACK_IMPORTED_MODULE_0__config__["j" /* STEP */]);

    context.fillStyle = __WEBPACK_IMPORTED_MODULE_0__config__["a" /* COLORS */].Dot;
    context.fill();
};

const loop = (context, body) => {
    drawSnake(context, body, true);

    move(context, body);
    drawSnake(context, body);

    setTimeout(() =>
        requestAnimationFrame(() =>
            loop(context, body)
        ),
        SPEED
    );
};

const setDirection = arrow => {
    switch (arrow) {
        case __WEBPACK_IMPORTED_MODULE_0__config__["b" /* DIRECTIONS */].Up:
            if (direction !== __WEBPACK_IMPORTED_MODULE_0__config__["b" /* DIRECTIONS */].Down) {
                direction = __WEBPACK_IMPORTED_MODULE_0__config__["b" /* DIRECTIONS */].Up;
            }
            break;

        case __WEBPACK_IMPORTED_MODULE_0__config__["b" /* DIRECTIONS */].Down:
            if (direction !== __WEBPACK_IMPORTED_MODULE_0__config__["b" /* DIRECTIONS */].Up) {
                direction = __WEBPACK_IMPORTED_MODULE_0__config__["b" /* DIRECTIONS */].Down;
            }
            break;

        case __WEBPACK_IMPORTED_MODULE_0__config__["b" /* DIRECTIONS */].Left:
            if (direction !== __WEBPACK_IMPORTED_MODULE_0__config__["b" /* DIRECTIONS */].Right) {
                direction = __WEBPACK_IMPORTED_MODULE_0__config__["b" /* DIRECTIONS */].Left;
            }
            break;

        case __WEBPACK_IMPORTED_MODULE_0__config__["b" /* DIRECTIONS */].Right:
            if (direction !== __WEBPACK_IMPORTED_MODULE_0__config__["b" /* DIRECTIONS */].Left) {
                direction = __WEBPACK_IMPORTED_MODULE_0__config__["b" /* DIRECTIONS */].Right;
            }
            break;

        default:
            break;
    }
};
/* unused harmony export setDirection */


const game = context => {
    document.body.addEventListener('keydown', event => {
        if (~Object.values(__WEBPACK_IMPORTED_MODULE_0__config__["b" /* DIRECTIONS */]).indexOf(event.key)) {
            setDirection(event.key);
        }
    });

    const body = [
        [10, 10],
        [10, 11],
        [10, 12]
    ];

    drawDot(context, body);
    loop(context, body);
};

/* harmony default export */ __webpack_exports__["a"] = (game);

/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__config__ = __webpack_require__(0);


/* harmony default export */ __webpack_exports__["a"] = ((data) => {
    const info = document.getElementById(__WEBPACK_IMPORTED_MODULE_0__config__["f" /* INFO_ID */]);
    info.innerText = `SCORE: ${data.score}`;
});

/***/ })
/******/ ]);