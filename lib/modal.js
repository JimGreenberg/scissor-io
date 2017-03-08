const titleImg = {
  images: ['./img/title.png'],
  frames: {width: 563, height: 104, regX: 281, regY: 0, count: 1},
};
const sheet = new createjs.SpriteSheet(titleImg);
const title = new createjs.Sprite(sheet);
title.x = 400;

export default class Modal {
  constructor(stage, starting = false) {

    this.container = new createjs.Container();
    this.container.x = 100;
    this.container.y = 100;

    const shape = new createjs.Shape();
    const body = new createjs.Text(
      starting ? "Mouse to move\n Space/Click to Dash\n Dash into enemies to steal dots!\n Lose all your dots and you die! (avoid dying)\n Safety Tip: Never run with scissors" :
        "You died, how did you let that happen?\n Press the button to play again",

      "20px Arial", "white");
    body.x = 400;
    body.y = 150;
    body.textBaseline = "bottom";
    body.textAlign = "center";

    const button = new createjs.Container();
    button.x = 300;
    button.y = 300;
    const buttonShape = new createjs.Shape();
    buttonShape.graphics.beginFill("orange").beginStroke("black").drawRect(0,0,200,50);
    const buttonText = new createjs.Text(starting ? "Start" : "Play Again", "20px Arial", "#ffffff");
    buttonText.x = 100;
    buttonText.y = 25;
    buttonText.textBaseline = "middle";
    buttonText.textAlign = "center";

    button.addChild(buttonShape);
    button.addChild(buttonText);

    button.addEventListener("click", () => {
      stage.removeChild(this.container);
      game.initGame();
    });

    this.container.addChild(shape);
    this.container.addChild(title);
    this.container.addChild(body);
    this.container.addChild(button);
  }
}
