import 'yuki-createjs';
import Enemy from './enemy.js';
import Player from './player.js';
import Modal from './modal.js';
import * as _ from './util.js';
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
    //initialize primal game constants
    this.players = {};
    this.stage = new createjs.Stage(canvas);
    this.arena = new createjs.Container();
    this.background = new createjs.Shape();
    const bgmap = new createjs.Bitmap('./img/background.jpg');
    bgmap.image.onload = () => {
      this.background.graphics
      .beginBitmapFill(bgmap.image)
      .drawRect(0, 0, WIDTH, HEIGHT);
    };

    //populate the drawing context with the game arena
    this.stage.addChild(new Modal(this.stage, starting).container);
    this.stage.addChild(this.arena);
    this.arena.addChild(this.background);
    this.arena.setBounds(0, 0, WIDTH, HEIGHT);
    this.stage.update();
    this.createPlayer();

    //initialize the game ticker
    createjs.Ticker.framerate = 60;
    createjs.Ticker.addEventListener(this.stage);

    //add player input event listeners
    document.onclick = e => {
      this.player.dash();
    };
    document.onkeydown = e => {
      if (e.keyCode === 32) {this.player.dash();}
    };

  }

  initGame() {
    this.addEnemies();
    //add dots to each player
    Object.keys(this.players).forEach(
      id => this.players[id].addDots(this.arena)
    );

    //start the game after half a second so the player has time to react
    setTimeout(this.startGame.bind(this), 500);
  }

  startGame() {
    createjs.Ticker.on('tick', this.update.bind(this));
  }

  swordCollide(p1, p2) {
    return _.distance(p1.swordPoint(), p2.swordPoint()) < 34;
  }

  bodyCollide(p1, p2) {
    return(_.distance(p1.swordPoint(), p2.pos()) < 37 ||
           _.distance(p1.swordPoint(), p2.backRightPoint()) < 37 ||
           _.distance(p1.swordPoint(), p2.backLeftPoint()) < 37
    );
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
          } else if (this.bodyCollide(player, otherPlayer)) {
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
      /*
      Enemy gets passed a player object instead of a pointer callback,
      which will be converted to a pointer callback in the Enemy constructor
      */
      let enemy = new Enemy(_.sample(this.players));
      this.players[enemy.id] = enemy;
      this.arena.addChild(enemy.sprite);
    }
  }

  createPlayer() {
    this.player = new Player(() => ({x: this.stage.mouseX, y: this.stage.mouseY}));
    this.players[this.player.id] = this.player;
    this.arena.x = -this.player.x + 500;
    this.arena.y = -this.player.y + 300;
    this.stage.addChild(this.player.sprite);
  }

  removeDead(player) {
    this.arena.removeChild(player.sprite);
    delete this.players[player.id];
  }

  enemies() {
    let enemies = Object.assign({}, this.players);
    delete enemies[this.player.id];
    return enemies;
  }

  updateEnemiesPositions() {
    let enemies = this.enemies();
    Object.keys(enemies).forEach(id => {
      let enemy = enemies[id];
      enemy.updatePosition();
      if (enemy.dead) {this.removeDead(enemy);}
    });
  }

  update(e) {
    if (this.player.dead) {this.resetGame();}
    this.player.updatePosition();
    this.updateEnemiesPositions();
    this.checkCollisions();
    this.stage.update(e);
  }

  resetGame() {
    const old = document.getElementById('ctx');
    document.body.removeChild(old);
    const next = document.createElement('canvas');
    next.id = 'ctx';
    next.width = 1000;
    next.height = 600;
    document.body.appendChild(next);
    window.game = new Game(document.getElementById('ctx'), false);
  }
}
