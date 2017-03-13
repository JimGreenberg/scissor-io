import 'yuki-createjs';
import Matter from '../node_modules/matter-js';
import Enemy from './enemy.js';
import Player from './player.js';
import Modal from './modal.js';
import {sample} from './util.js';

window.WIDTH = 2000;
window.HEIGHT = 1200;

window.init = () => {
  const canvas = document.getElementById('ctx');
  const context = canvas.getContext('2d');
  context.imageSmoothingQuality = "high";
  window.game = new Game(canvas);
};

class Game {
  constructor(canvas, starting = true) {
    this.engine = Matter.Engine.create(canvas);
    this.players = {};
    this.stage = new createjs.Stage(canvas);
    this.render = Matter.Render.create();
    this.render.canvas = canvas;
    this.arena = new createjs.Container();
    this.background = new createjs.Shape();
    const bgmap = new createjs.Bitmap('./img/background.jpg');
    bgmap.image.onload = () => {
      this.background.graphics.beginBitmapFill(bgmap.image).drawRect(0, 0, WIDTH, HEIGHT);
    };

    this.stage.addChild(new Modal(this.stage, starting).container);
    this.stage.addChild(this.arena);
    this.arena.addChild(this.background);
    this.arena.setBounds(0, 0, WIDTH, HEIGHT);
    this.stage.update();

    createjs.Ticker.framerate = 60;
    createjs.Ticker.addEventListener(this.stage);

    document.onclick = e => {
      this.player.dash();
    };
    document.onkeydown = e => {
      if (e.keyCode === 32) {this.player.dash();}
    };

  }

  initGame() {
    this.player = new Player(() => ({x: this.stage.mouseX, y: this.stage.mouseY}));
    this.players[this.player.id] = this.player;
    this.arena.x = -this.player.x + 500;
    this.arena.y = -this.player.y + 300;
    Matter.World.addComposite(this.engine.world, this.player.composite);
    this.stage.addChild(this.player.sprite);
    this.addEnemies();
    // Object.keys(this.players).forEach(id => this.players[id].addDots(this.arena));
    setTimeout(this.startGame.bind(this), 500);
  }

  startGame() {
    createjs.Ticker.on('tick', this.update.bind(this));
  }

  swordCollide(p1, p2) {
    return ( Math.abs(p1.swordPoint().x - p2.swordPoint().x) < 40 &&
             Math.abs(p1.swordPoint().y - p2.swordPoint().y) < 40 );
  }
  backCollide(p1, p2) {
    return ((Math.abs(p1.swordPoint().x - p2.backPoint().x) < 40 &&
             Math.abs(p1.swordPoint().y - p2.backPoint().y) < 40)|| //left

            (Math.abs(p1.swordPoint().x + p2.backPoint().x) < 40 && //right
             Math.abs(p1.swordPoint().y + p2.backPoint().y) < 40));
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
              otherPlayer.handleKnockback(player, 15);
              player.stealDot(otherPlayer.loseDot());
            } else {
              otherPlayer.handleKnockback(player, 2);
            }
          } else if (this.backCollide(player, otherPlayer)) {
            if (player.dashing) {
              otherPlayer.handleKnockback(player, 20);
              player.stealDot(otherPlayer.loseDot());
            } else {
              otherPlayer.handleKnockback(player, 2);
              player.handleKnockback(otherPlayer, 2);
            }
          }
        }
      }
    }
  }

  addEnemies() {
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
      Matter.World.addComposite(this.engine.world, enemy.composite);
      // enemy.addDots(this.arena);
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
        // this.player.updateDots();
      let enemies = Object.assign({}, this.players);
      delete enemies[this.player.id];
      Object.keys(enemies).forEach(id => {
        let enemy = enemies[id];
        enemy.updatePostition();
        enemy.sprite.x = enemy.x;
        enemy.sprite.y = enemy.y;
        // enemy.updateDots();
        if (enemy.dead) {this.removeDead(enemy);}
      });
      if (this.player.dead) {
        const old = document.getElementById('ctx');
        document.body.removeChild(old);
        const next = document.createElement('canvas');
        next.id = 'ctx';
        next.width = 1000;
        next.height = 600;
        document.body.appendChild(next);
        window.game = new Game(document.getElementById('ctx'), false);
      }
      this.checkCollisions();
      Matter.Engine.update(this.engine);
      this.stage.update(e);
    }
  }
}
