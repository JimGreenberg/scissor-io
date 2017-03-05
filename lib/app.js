import 'yuki-createjs';
import Enemy from './enemy.js';
import Player from './player.js';
import {randomVal} from './util.js';
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
    this.players = {};
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
    this.players[this.player.id] = this.player;
    this.arena.x = -this.player.x + 500;
    this.arena.y = -this.player.y + 300;
    this.stage.addChild(this.player.sprite);

    document.onclick = e => {
      this.player.dash();
    };
    document.onkeydown = e => {
      if (e.keyCode === 32) {this.player.dash();}
    };

    while (Object.keys(this.players).length < 9) {
      var target = randomVal(this.players);
      var enemy = new Enemy(
        () => ({
          x: target.x,
          y: target.y
        })
      );
      this.players[enemy.id] = enemy;
      this.arena.addChild(enemy.sprite);
    }

    this.stage.update();
    this.startGame();
  }

  startGame() {
    createjs.Ticker.on('tick', this.update.bind(this));
  }

  swordCollide(p1, p2) {
    return ( Math.abs(p1.swordPoint().x - p2.swordPoint().x) < 25 &&
             Math.abs(p1.swordPoint().y - p2.swordPoint().y) < 25 );
  }
  handCollide(p1, p2) {
    return ( Math.abs(p1.swordPoint().x - p2.handPoint().x) < 25 &&
             Math.abs(p1.swordPoint().y - p2.handPoint().y) < 25 );
  }

  checkCollisions() {
    for (var i = 0; i < Object.keys(this.players).length; i++) {
      let id = Object.keys(this.players)[i];
      let iPlayer = this.players[id];
      for (var j = 0; j < Object.keys(this.players).length; j++) {
        let otherId = Object.keys(this.players)[j];
        let otherPlayer = this.players[otherId];
        if (otherId !== id) {
          if (this.swordCollide(iPlayer, otherPlayer)) {
            otherPlayer.handleKnockback(iPlayer, iPlayer.dashing ? 20 : 4);
          } else if (this.handCollide(iPlayer, otherPlayer)) {
            otherPlayer.die();
            this.removeDead(otherPlayer);
          }
        }
      }
    }
  }

  removeDead(player) {
    this.arena.removeChild(player.sprite);
    delete this.players[player.id];
  }

  update(e) {
    if (this.stage.mouseInBounds) {
      this.player.updatePostition();
        this.arena.x -= this.player.vx;
        this.arena.y -= this.player.vy;
      let enemies = Object.assign({}, this.players);
      delete enemies[this.player.id];
      Object.keys(enemies).forEach(id => {
        let enemy = enemies[id];
        enemy.updatePostition();
        enemy.sprite.x = enemy.x;
        enemy.sprite.y = enemy.y;
      });
      this.checkCollisions();
      this.stage.update(e);
    }
  }
}
