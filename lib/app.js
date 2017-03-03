import 'yuki-createjs';
import Enemy from './enemy.js';
import Player from './player.js';

window.WIDTH = 2000;
window.HEIGHT = 1200;
const BACKGROUND = {
  images: ['./img/background.jpg'],
  frames: {width: 2000, height: 1200, regX: 0, regY: 0, count: 1},
};

window.init = () => {
  window.game = new Game(document.getElementById('ctx'));
};

class Game {
  constructor(ctx) {
    this.ctx = ctx;
    this.stage = new createjs.Stage(ctx);
    this.arena = new createjs.Container();
    this.background = new createjs.Shape();
    const bgmap = new createjs.Bitmap('./img/background.jpg');
    bgmap.image.onload = () => {
      this.background.graphics.beginBitmapFill(bgmap.image).drawRect(0, 0, WIDTH, HEIGHT);
    };

    this.stage.addChild(this.arena);
    this.arena.addChild(this.background);
    this.arena.setBounds(0, 0, WIDTH, HEIGHT);

    createjs.Ticker.framerate = 60;
    createjs.Ticker.addEventListener(this.stage);

    this.addGame();
  }

  addGame() {
    this.player = new Player(() => ({x: this.stage.mouseX, y: this.stage.mouseY}));
    this.arena.x = -this.player.x + 500;
    this.arena.y = -this.player.y + 300;

    document.onclick = e => {
      this.player.dash();
    };
    document.onkeydown = e => {
      if (e.keyCode === 32) {this.player.dash();}
    };

    this.enemy = new Enemy(
      () => ({
        x: this.player.x,
        y: this.player.y
      })
    );


    this.stage.addChild(this.player.sprite);
    this.arena.addChild(this.enemy.sprite);
    this.stage.update();
    this.startGame();
  }

  startGame() {
    createjs.Ticker.on('tick', this.update.bind(this));
  }

  update(e) {
    if (this.stage.mouseInBounds) {
      this.player.updatePostition();
        this.arena.x -= this.player.vx;
      this.  arena.y -= this.player.vy;
      this.enemy.updatePostition();
        this.enemy.sprite.x = this.enemy.x;
        this.enemy.sprite.y = this.enemy.y;
      this.enemy.sprite.alpha = 1;
      let hHit = this.player.swordBox.localToLocal(0, -35, this.enemy.handBox);
      if (this.enemy.handBox.hitTest(hHit.x, hHit.y)) {this.enemy.sprite.alpha = 0.1; debugger;}
      let sHit = this.player.swordBox.localToLocal(0, -35, this.enemy.swordBox);
      if (this.enemy.swordBox.hitTest(sHit.x, sHit.y)) {this.enemy.sprite.alpha = 0.1; debugger;}
      this.stage.update(e);
    }
  }
}
