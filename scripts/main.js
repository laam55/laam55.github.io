function TouchTouch() {
  var startBtnClass = "start-btn";
  var restartBtnClass = "restart-btn";
  var subImageClass = "sub-image";
  var urlImage = "images/quynhnga.jpg";
  var maxHeight = 500;
  var isPlaying = false;
  const gameConfig = {
    h: 5,
    v: 6,
    timeOut: 30,
  };

  var gameControlObj = new GameControl();
  var boardObj = new Board();
  var timerObj = new Timer();
  var audioClick = document.getElementById("audio_one");
  var audioEnd = document.getElementById("audio_uplevel");

  function Timer() {
    this.elementClass = "score-label";
    this.intervalTime;
    this.seconds = 0;

    this.start = () => {
      this.intervalTime = setInterval(() => {
        this.seconds += 1;
        this.update();
      }, 1000);
    };
    this.stop = () => {
      clearInterval(this.intervalTime);
    };
    this.reset = () => {
      this.seconds = 0;
      clearInterval(this.intervalTime);
      this.update();
    };
    this.restore = () => {
      this.seconds = 0;
      clearInterval(this.intervalTime);
    };
    this.prefix = (num) => {
      return num < 10 ? `0${num}` : num;
    };
    this.update = () => {
      const secs = this.prefix(this.seconds % 60);
      const mins = this.prefix(Math.floor(this.seconds / 60) % 60);
      const hours = this.prefix(Math.floor(this.seconds / 60 / 60) % 24);
      jQuery(`.${this.elementClass}`).html(`${hours}:${mins}:${secs}`);
    };
  }

  function Board() {
    this.boardClass = "game-control";
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
      jQuery(`.main-image`).attr("src", `${urlImage}`);
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
        ) {
          continue;
        }
        const temp = tempNewObject[newY][newX];
        _.set(tempNewObject, `[${y0}][${x0}]`, temp);
        _.set(tempNewObject, `[${newY}][${newX}]`, 0);
        newObject = _.cloneDeep(tempNewObject);
      }
      this.boardVal = newObject;
      this.updateBoard;
    };
    this.reset = () => {
      this.init();
    };
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
      this.enableAudio(audioClick)
      this.checkEndGame();
    };
    this.clickSwitchImage = (e) => {
      var url = jQuery(e.target).attr("src");
      urlImage = url;
      boardObj.updateBoard();
      this.checkSelectedImage();
    };
    this.checkSelectedImage = (e) => {
      this.handleRestartGame();
      jQuery(`.${subImageClass}`).removeClass("selected");
      jQuery(`.${subImageClass}`).each(function (e) {
        if (jQuery(this).attr("src") === urlImage) {
          jQuery(this).addClass("selected");
        }
      });
    };
    // ---------------------
    // GAME EVENT
    this.initEvent = () => {
      jQuery("body").on("click", `.${boardObj.pointClass}`, this.clickSwap);
      jQuery("body").on("click", `.${startBtnClass}`, this.clickButtonStart);
      jQuery("body").on("click", `.${restartBtnClass}`, this.handleRestartGame);
      jQuery("body").on("click", `.${subImageClass}`, this.clickSwitchImage);
    };
    this.restore = () => {
      jQuery("body").off("click", `.${boardObj.pointClass}`, this.clickSwap);
      jQuery("body").off("click", `.${startBtnClass}`, this.clickButtonStart);
      jQuery("body").off("click", `.${restartBtnClass}`, this.handleRestartGame);
      jQuery("body").off("click", `.${subImageClass}`, this.clickSwitchImage);
    };
    // ---------------------
    // GAME STATUS
    this.checkEndGame = () => {
      if (_.isEqual(boardObj.boardVal, this.correctBoardVal)) {
        alert("You win!");
        this.handleEndGame();
      }
    };
    this.handleEndGame = () => {
      isPlaying = false;
      this.enableAudio(audioEnd)
      this.setTitleStartButton(true);
      timerObj.stop();
    };
    this.handleStartGame = (e) => {};
    this.handleRestartGame = (e) => {
      isPlaying = false;
      this.setTitleStartButton();
      boardObj.reset();
      timerObj.reset();
    };
    this.clickButtonStart = () => {
      if (isPlaying) return;
      isPlaying = true;
      this.setTitleStartButton();
      timerObj.start();
    };
    this.setTitleStartButton = (isEnd = false) => {
      jQuery(`.${startBtnClass}`).html(
        isEnd ? "You win!" : isPlaying ? "...Playing..." : "Start"
      );
      jQuery(`.${startBtnClass}`).prop("disabled", isEnd ? true : isPlaying);
    };
    this.restore = function () {};
    // ---------------------
    // AUDIO
    this.enableAudio = function (audio) {
      audio.currentTime = 0;
      audio.play();
    };
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
