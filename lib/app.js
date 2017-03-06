import 'yuki-createjs';
import Enemy from './enemy.js';
import Player from './player.js';
import Modal from './modal.js';
import {sample} from './util.js';
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

    this.initGame();
  }

  initGame() {
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

    while (Object.keys(this.players).length < 4) {
      var target = sample(this.players);
      var enemy = new Enemy(
        () => ({
          x: target.x,
          y: target.y
        })
      );
      this.players[enemy.id] = enemy;
      this.arena.addChild(enemy.sprite);
      // enemy.addDots(this.arena);
    }
    Object.keys(this.players).forEach(id => this.players[id].addDots(this.arena));
    // this.stage.addChild(new Modal(startGame.bind(this)));
    this.startGame();
    this.stage.update();
  }

  startGame() {
    createjs.Ticker.on('tick', this.update.bind(this));
  }

  swordCollide(p1, p2) {
    return ( Math.abs(p1.swordPoint().x - p2.swordPoint().x) < 25 &&
             Math.abs(p1.swordPoint().y - p2.swordPoint().y) < 25 );
  }
  backCollide(p1, p2) {
    return ( Math.abs(p1.swordPoint().x - p2.backPoint().x) < 25 &&
             Math.abs(p1.swordPoint().y - p2.backPoint().y) < 25 );
  }

  checkCollisions() {
    for (var i = 0; i < Object.keys(this.players).length; i++) {
      let id = Object.keys(this.players)[i];
      let player = this.players[id];
      for (var j = 0; j < Object.keys(this.players).length; j++) {
        let otherId = Object.keys(this.players)[j];
        let otherPlayer = this.players[otherId];
        if (otherId !== id) {
          if (this.swordCollide(player, otherPlayer)) {
            if (player.dashing) {
              otherPlayer.handleKnockback(player, 20);
              player.stealDot(otherPlayer.loseDot());
            } else {
            otherPlayer.handleKnockback(player, 3);
            }
          } else if (this.backCollide(player, otherPlayer) && player.dashing) {
            otherPlayer.handleKnockback(player, 30);
            player.stealDot(otherPlayer.loseDot());
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
        let pos = {x: this.player.x, y: this.player.y};
        this.player.dots.forEach(dot => {
          setTimeout(() => dot.moveTo(pos), 500 + (this.player.dots.indexOf(dot) * 300));


        });
      let enemies = Object.assign({}, this.players);
      delete enemies[this.player.id];
      Object.keys(enemies).forEach(id => {
        let enemy = enemies[id];
        enemy.updatePostition();
        enemy.sprite.x = enemy.x;
        enemy.sprite.y = enemy.y;
        let pos = {x: enemy.x, y: enemy.y};
        enemy.dots.forEach(dot => {
          setTimeout(() => dot.moveTo(pos), 500 + (enemy.dots.indexOf(dot) * 300));
        });
        if (enemy.dead) {this.removeDead(enemy);}
      });
      this.checkCollisions();
      this.stage.update(e);
    }
  }
}
