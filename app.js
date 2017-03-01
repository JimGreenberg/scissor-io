const WIDTH = 1000;
const HEIGHT = 600;
class Player {
  constructor(id) {
    this.x = Math.random() * WIDTH;
    this.y = Math.random() * HEIGHT;
    arena.x = WIDTH / 2 - this.x;
    arena.y = HEIGHT / 2 - this.y;
    this.vx = 0;
    this.vy = 0;
  }

  updatePostition() {
    let newVX = stage.mouseX - 500;
    let newVY = stage.mouseY - 300;
    let newV = Math.sqrt(Math.pow(newVX, 2) + Math.pow(newVY, 2));
    if (newV === 0) {return;}
    this.vx = newVX / newV;
    this.vy = newVY / newV;
    this.vx *= 3;
    this.vy *= 3;

    if (this.x > WIDTH - 25) {
      this.x = WIDTH - 25;
      arena.x = -WIDTH / 2 + 25;
      this.vx = 0;
    }
    if (this.y > HEIGHT - 25) {
      this.y = HEIGHT - 25;
      arena.y = -HEIGHT / 2 + 25;
      this.vy = 0;

    }
    if (this.x < 25) {
      this.x = 25;
      arena.x = WIDTH / 2 - 25;
      this.vx = 0;
    }
    if (this.y < 25) {
      this.y = 25;
      arena.y = HEIGHT / 2 - 25;
      this.vy = 0;
    }


    if (stage.mouseInBounds) {
      this.x += this.vx;
      this.y += this.vy;
      arena.x -= this.vx;
      arena.y -= this.vy;
    }
  }
}
window.init = () => {
  const ctx = document.getElementById('ctx');
  window.stage = new createjs.Stage(ctx);
  window.arena = new createjs.Container();
  const background = new createjs.Shape();
  background.graphics.beginRadialGradientFill(["#777","#444"], [0, 1], WIDTH / 2, HEIGHT / 2, 0,WIDTH / 2, HEIGHT / 2, 1000).drawRect(0, 0, WIDTH, HEIGHT);
  arena.addChild(background);
  stage.addChild(arena);
  arena.setBounds(0, 0, 1000, 600);
  stage.mouseEventsEnabled = true;
  stage.keyboardEventsEnabled = true;
  createjs.Ticker.framerate = 60;
  createjs.Ticker.addEventListener(stage);

  addGame();
};

const addGame = () => {
  window.player = new Player(1);
  window.circle = new createjs.Shape();
  window.findme = new createjs.Shape();
  circle.graphics.beginFill("DeepSkyBlue").drawCircle(0, 0, 25);
  findme.graphics.beginFill("Orange").drawCircle(0, 0, 25);

  circle.x = 500;
  circle.y = 300;
  findme.x = player.x;
  findme.y = player.y;

  stage.addChild(circle);
  arena.addChild(findme);
  stage.update();
  startGame();
};

const startGame = () => {

  createjs.Ticker.addEventListener('tick', update);
};

const update = () => {
  player.updatePostition();
  stage.setChildIndex(circle, 1)

  stage.update();
};
