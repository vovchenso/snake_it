"use strict";
(() => {
  // ts/config.ts
  var STAGE_ID = "_stage";
  var GAME_ID = "_game";
  var INFO_ID = "_info";
  var HEIGHT = 400;
  var WIDTH = 600;
  var STEP = 10;
  var MAX_WIDTH = WIDTH / STEP;
  var MAX_HEIGHT = HEIGHT / STEP;
  var DIRECTIONS = {
    Up: "ArrowUp",
    Right: "ArrowRight",
    Down: "ArrowDown",
    Left: "ArrowLeft"
  };
  var COLORS = {
    Main: "#0f0",
    Dot: "#ff0",
    Hidden: "#000"
  };

  // ts/utils.ts
  var getCanvasContext = (id) => {
    const canvas = document.getElementById(id);
    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new Error(`Canvas element #${id} not found`);
    }
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error(`2D context is not available for #${id}`);
    }
    return context;
  };
  var intercept = (data, dot2) => {
    for (let i = 0; i < data.length; i++) {
      if (dot2[0] === data[i][0] && dot2[1] === data[i][1]) {
        return true;
      }
    }
    return false;
  };

  // ts/stage.ts
  var stage = (context) => {
    for (let x = 0; x <= WIDTH; x += STEP) {
      context.moveTo(x, 0);
      context.lineTo(x, HEIGHT);
    }
    for (let y = 0; y <= HEIGHT; y += STEP) {
      context.moveTo(0, y);
      context.lineTo(WIDTH, y);
    }
    context.strokeStyle = COLORS.Main;
    context.stroke();
  };
  var stage_default = stage;

  // ts/info.ts
  var info_default = (data) => {
    const info = document.getElementById(INFO_ID);
    if (!info) {
      throw new Error(`Info element #${INFO_ID} not found`);
    }
    info.innerText = `SCORE: ${data.score}`;
  };

  // ts/game.ts
  var SPEED = 100;
  var score = 0;
  var direction = DIRECTIONS.Up;
  var dot = [-1, -1];
  var drawSnake = (context, body, hide = false) => {
    context.beginPath();
    context.fillStyle = hide ? COLORS.Hidden : COLORS.Main;
    body.forEach((part) => {
      const [x, y] = part;
      context.rect(x * STEP + 1, y * STEP + 1, STEP, STEP);
      context.fill();
    });
  };
  var move = (context, body) => {
    let [x, y] = body[0];
    switch (direction) {
      case DIRECTIONS.Up:
        if (--y === -1) {
          y = MAX_HEIGHT - 1;
        }
        break;
      case DIRECTIONS.Down:
        if (++y === MAX_HEIGHT) {
          y = 0;
        }
        break;
      case DIRECTIONS.Left:
        if (--x === -1) {
          x = MAX_WIDTH - 1;
        }
        break;
      case DIRECTIONS.Right:
        if (++x === MAX_WIDTH) {
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
      if (SPEED > 40) {
        SPEED -= 2;
      } else if (SPEED > 20) {
        SPEED--;
      }
    } else {
      body.pop();
    }
  };
  var generateDot = (body) => {
    do {
      dot = [
        Math.round(Math.random() * (MAX_WIDTH - 1)),
        Math.round(Math.random() * (MAX_HEIGHT - 1))
      ];
    } while (intercept(body, dot));
  };
  var drawDot = (context, body) => {
    context.beginPath();
    context.fillStyle = COLORS.Hidden;
    context.rect(dot[0] * STEP + 1, dot[1] * STEP + 1, STEP, STEP);
    context.fill();
    generateDot(body);
    info_default({ score });
    context.beginPath();
    context.rect(dot[0] * STEP + 1, dot[1] * STEP + 1, STEP, STEP);
    context.fillStyle = COLORS.Dot;
    context.fill();
  };
  var loop = (context, body) => {
    drawSnake(context, body, true);
    move(context, body);
    drawSnake(context, body);
    setTimeout(
      () => requestAnimationFrame(
        () => loop(context, body)
      ),
      SPEED
    );
  };
  var setDirection = (arrow) => {
    switch (arrow) {
      case DIRECTIONS.Up:
        if (direction !== DIRECTIONS.Down) {
          direction = DIRECTIONS.Up;
        }
        break;
      case DIRECTIONS.Down:
        if (direction !== DIRECTIONS.Up) {
          direction = DIRECTIONS.Down;
        }
        break;
      case DIRECTIONS.Left:
        if (direction !== DIRECTIONS.Right) {
          direction = DIRECTIONS.Left;
        }
        break;
      case DIRECTIONS.Right:
        if (direction !== DIRECTIONS.Left) {
          direction = DIRECTIONS.Right;
        }
        break;
      default:
        break;
    }
  };
  var isDirection = (key) => Object.values(DIRECTIONS).includes(key);
  var game = (context) => {
    document.body.addEventListener("keydown", (event) => {
      if (isDirection(event.key)) {
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
  var game_default = game;

  // ts/index.ts
  var run = () => {
    const contextStage = getCanvasContext(STAGE_ID);
    stage_default(contextStage);
    const contextGame = getCanvasContext(GAME_ID);
    game_default(contextGame);
  };
  run();
})();
