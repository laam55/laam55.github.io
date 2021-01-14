function TouchTouch() {
  var gameClass = "game";
  var startBtnClass = "game__info--start-btn";
  var subImageClass = "sub-image";
  var urlImage = "images/quynhnga.jpg";
  var maxHeight = 500;
  const gameConfig = {
    h: 3,
    v: 4,
    timeOut: 30,
  };
  var isPlaying = false;
  var gameControlObj = new GameControl();
  var boardObj = new Board();

  function Board() {
    this.boardClass = "game__control";
    this.boardElement = jQuery(`.${this.boardClass}`);
    this.pointClass = "point";
    this.boardVal = [];
    this.aroundPoint = [
      [0, -1],
      [1, 0],
      [0, 1],
      [-1, 0],
    ];
    var unitPx = maxHeight / gameConfig.v;

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
      jQuery(this.boardElement).css({
        width: `${gameConfig.h * unitPx}px`,
        "grid-template-columns": `${100 / gameConfig.h}%`.repeat(gameConfig.h),
        "grid-template-rows": `${100 / gameConfig.v}%`.repeat(gameConfig.v),
      });
      this.boardVal = make2DArray(
        _.range(gameConfig.v * gameConfig.h),
        gameConfig.h
      );
    };
    this.updateBoard = () => {
      jQuery(`.game__info--image`).attr("src", `${urlImage}`);
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
            .attr(
              "style",
              `--point-width: ${unitPx}px;
              --point-height: ${unitPx}px;
              --point-before-top: -${x * unitPx}px;
              --point-before-left: -${y * unitPx}px;
              --image-url: url(../${urlImage})`
            )
            .attr("value", JSON.stringify({ x: j, y: i, point }));
        }
      }
    };
    this.randomBoard = () => {
      let newObject = _.cloneDeep(this.boardVal);
      for (i = 0; i < 1000; i++) {
        const tempNewObject = _.cloneDeep(newObject);
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
        _.set(tempNewObject, `[${y0}][${x0}]`, temp);
        _.set(tempNewObject, `[${newY}][${newX}]`, 0);
        newObject = _.cloneDeep(tempNewObject);
      }
      this.boardVal = newObject;
      this.updateBoard;
    };
    // update cell class
    this.setStylePoint = () => {};
    this.restore = () => {};
  }

  function GameControl() {
    // property
    this.correctBoardVal = [];

    // ---------------------
    // INIT GAME
    this.init = () => {
      this.initScreen();
      this.initEvent();
      boardObj.init();
      this.checkSelectedImage();
    };
    this.initScreen = () => {
      this.correctBoardVal = _.range(gameConfig.v * gameConfig.h);
      this.correctBoardVal = make2DArray(this.correctBoardVal, gameConfig.h);
    };
    this.initEvent = () => {
      jQuery("body").on("click", `.${boardObj.pointClass}`, this.clickSwap);
      jQuery("body").on("click", `.${startBtnClass}`, this.clickButtonStart);
      jQuery("body").on("click", `.${subImageClass}`, this.clickSwitchImage);
    };
    this.restore = function () {};
    // ---------------------
    // GAME CONTROL
    this.clickSwap = (e) => {
      e.preventDefault();
      if (!isPlaying) return;
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
    // GAME CONTROL
    this.enableAudio = function (audio) {};
    this.clickSwitchImage = (e) => {
      var url = jQuery(e.target).attr("src");
      urlImage = url;
      boardObj.updateBoard();
      this.checkSelectedImage();
    };
    this.checkSelectedImage = (e) => {
      jQuery(`.${subImageClass}`).removeClass("selected");
      jQuery(`.${subImageClass}`).each(function (e) {
        if (jQuery(this).attr("src") === urlImage) {
          jQuery(this).addClass("selected");
        }
      });
    };
    // ---------------------
    // GAME EVENT
    this.restore = () => {
      jQuery("body").off("click", `.${boardObj.pointClass}`, this.clickSwap);
      jQuery("body").off("click", `.${startBtnClass}`, this.clickButtonStart);
      jQuery("body").off("click", `.${subImageClass}`, this.clickSwitchImage);
    };
    // ---------------------
    // GAME STATUS
    this.checkEndGame = () => {
      if (_.isEqual(boardObj.boardVal, this.correctBoardVal)) {
        alert("You win!");
        this.handleRestartGame();
        isPlaying = false;
      }
    };
    this.isEndGameCannotPlay = (e) => {
      if (isEndGame) throw "Cannot play game!";
    };
    this.handleEndGame = () => {};
    this.handleStartGame = (e) => {};
    this.handleRestartGame = (e) => {};
    this.clickButtonStart = () => {
      isPlaying = true;
    };
    // ---------------------
    // AUDIO
  }

  return {
    init: gameControlObj.init,
    initEvent: gameControlObj.initEvent,
  };
}
jQuery(document).ready(function ($) {
  var game = TouchTouch();
  game.init();
});
