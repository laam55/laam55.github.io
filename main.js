function make2DArray(arr, w = 3) {
  const newArr = [];
  while (arr.length) {
    newArr.push(arr.splice(0, w));
  }
  return newArr;
}
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array.slice();
}

function findArray2D(array, findNum) {
  let x = 0,
    y = 0;
  for (let i = 0; i < array.length; i++) {
    y = i;
    if (array[i].includes(findNum)) {
      x = array[i].indexOf(findNum);
      break;
    }
  }

  return { x, y };
}

function TouchTouch() {
  var gameClass = "game";
  var startBtnClass = "game__info--start-btn";
  const gameConfig = {
    h: 3,
    v: 5,
    timeOut: 30,
  };
  var isPlaying = false
  // game object
  var gameControlObj = new GameControl();
  var boardObj = new Board();

  function Board() {
    // boardElement
    this.boardClass = "game__control";
    this.boardElement = jQuery(`.${this.boardClass}`);
    this.pointClass = "point";
    this.boardVal = [];
    // property
    this.aroundPoint = [
      [0, -1],
      [1, 0],
      [0, 1],
      [-1, 0],
    ];
    this.init = () => {
      this.initBoard();
      this.randomBoard();
      this.updateBoard();
    };
    this.initBoard = () => {
      jQuery(this.boardElement).html("");
      for (var i = 0; i < gameConfig.v; i++) {
        for (var j = 0; j < gameConfig.h; j++) {
          let html = jQuery("<div>").addClass(this.pointClass);
          jQuery(this.boardElement).append(html);
        }
      }
      this.boardVal = make2DArray(_.range(gameConfig.v * gameConfig.h), gameConfig.h);
    };
    // mount cell
    this.updateBoard = () => {
      jQuery(`.${this.pointClass}.empty`).removeClass("empty");
      for (var i = 0; i < gameConfig.v; i++) {
        for (var j = 0; j < gameConfig.h; j++) {
          const point = this.boardVal[i][j];
          const y = Math.floor(point / gameConfig.h);
          const x = point - y * gameConfig.h;
          if (point === 0) {
            jQuery(this.boardElement)
              .children()
              .eq(i * gameConfig.h + j)
              .addClass("empty");
          }
          jQuery(this.boardElement)
            .children()
            .eq(i * gameConfig.h + j)
            .attr("style", `--top: -${x * 100}px; --left: -${y * 100}px`)
            .attr("value", JSON.stringify({ x: j, y: i, point }));
        }
      }
    };
    this.randomBoard = () => {
      let newObject = _.cloneDeep(this.boardVal);
      for (i = 0; i < 1000; i++) {
        const tempNewObject = _.cloneDeep(newObject)
        const { x: x0, y: y0 } = findArray2D(tempNewObject, 0);
        const randomNum = _.random(0, 3);
        const [randomX, randomY] = this.aroundPoint[randomNum];

        const newX = x0 + randomX;
        const newY = y0 + randomY;
        if (
          newX < 0 ||
          newX >= gameConfig.h ||
          newY < 0 ||
          newY >= gameConfig.v
        )
          continue;
        const temp = tempNewObject[newY][newX];
        _.set(tempNewObject, `[${y0}][${x0}]`, temp)
        _.set(tempNewObject, `[${newY}][${newX}]`, 0)
        newObject = _.cloneDeep(tempNewObject)
      }
      this.boardVal = newObject;
      this.updateBoard;
    };
    // update cell class
    this.setStylePoint = () => {};
    this.restore = () => {};
  }

  function GameControl() {
    this.btnRestart = jQuery(".restart");
    // property
    this.correctBoardVal = [];

    // ---------------------
    // INIT GAME
    this.init = () => {
      this.initScreen();
      this.initEvent();
      boardObj.init();
    };

    // init config
    this.initScreen = () => {
      this.correctBoardVal = _.range(gameConfig.v * gameConfig.h);
      this.correctBoardVal = make2DArray(this.correctBoardVal, gameConfig.h);
    };
    // init event
    this.initEvent = () => {
      $("body").on("click", `.${boardObj.pointClass}`, this.clickSwap);
      $("body").on("click", `.${startBtnClass}`, this.clickButtonStart);
    };
    this.restore = function () {};
    // ---------------------
    // GAME CONTROL
    this.clickSwap = (e) => {
      e.preventDefault();
      if (!isPlaying)
        return
      const { point, x, y } = JSON.parse(e.target.value);
      const { x: x0, y: y0 } = JSON.parse(
        jQuery(`.${boardObj.boardClass} .empty`).val()
      );
      if (point === 0 || (x - x0) ** 2 + (y - y0) ** 2 !== 1) return;
      const newObject = boardObj.boardVal;
      _.set(newObject, `[${y0}][${x0}]`, point);
      _.set(newObject, `[${y}][${x}]`, 0);
      boardObj.boardVal = newObject;
      boardObj.updateBoard();
      this.checkEndGame();
    };
    // ---------------------
    // GAME STATUS
    this.checkEndGame = () => {
      if (_.isEqual(boardObj.boardVal, this.correctBoardVal)) {
        alert("You win!");
        this.handleRestartGame();
        isPlaying = false
      }
    };
    this.isEndGameCannotPlay = (e) => {
      if (isEndGame) throw "Cannot play game!";
    };
    this.handleEndGame = () => {};
    this.handleStartGame = (e) => {};
    this.handleRestartGame = (e) => {};
    this.clickButtonStart = () => {
      isPlaying = true
    };

    this.restore = () => {};

    // ---------------------
    // GAME CONTROL
    this.enableAudio = function (audio) {};
    // ---------------------
    // AUDIO

    this.initEventTouch = () => {};
  }

  return {
    init: gameControlObj.init,
    initEvent: gameControlObj.initEvent,
  };
}
$(document).ready(function ($) {
  var game = TouchTouch();
  game.init();
});
