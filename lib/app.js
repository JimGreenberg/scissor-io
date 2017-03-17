import 'yuki-createjs';
import Enemy from './enemy.js';
import Player from './player.js';
import * as _ from './util.js';
window.WIDTH = 2000;
window.HEIGHT = 1200;

const loadSounds = () => {
  createjs.Sound.registerSound("./sfx/swoosh1.mp3", 'swoosh1');
  createjs.Sound.registerSound("./sfx/swoosh2.mp3", 'swoosh2');
  createjs.Sound.registerSound("./sfx/hit1.mp3", 'hit1');
  createjs.Sound.registerSound("./sfx/hit2.mp3", 'hit2');
  createjs.Sound.registerSound("./sfx/clang1.mp3", 'clang1');
  createjs.Sound.registerSound("./sfx/clang2.mp3", 'clang2');
  createjs.Sound.registerSound("./sfx/thud.mp3", 'thud');
  window.swooshes = {1: 'swoosh1', 2: 'swoosh2'};
  window.clangs = {1: 'clang1', 2: 'clang2'};
  window.hits = {1: 'hit1', 2: 'hit2'};
};

window.init = () => {
  window.canvas = document.getElementById('ctx');
  const context = canvas.getContext('2d');
  window.button = document.getElementById('button');
  window.modal = document.getElementById('modal');
  loadSounds();
  button.addEventListener('click', e => {
    window.game = new Game(canvas);
    window.scrollTo(0,200);
    window.modal.classList.toggle('hidden');
    setTimeout(game.initGame.bind(game), 200);
  });
  context.imageSmoothingQuality = "high";
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
    this.stage.addChild(this.arena);
    this.arena.addChild(this.background);
    this.arena.setBounds(0, 0, WIDTH, HEIGHT);
    this.createPlayer();
    this.stage.update();

    //initialize the game ticker
    createjs.Ticker.framerate = 60;
    createjs.Ticker.addEventListener(this.stage);

    //add player input event listeners
    document.onclick = e => {
      this.player.dash(this.stage);
      createjs.Sound.play(_.sample(swooshes));
    };
    document.onkeydown = e => {
      if (e.keyCode === 32) {
        this.player.dash(this.stage);
        createjs.Sound.play(_.sample(swooshes));
      }
    };

  }

  initGame() {
    this.addEnemies();
    Object.keys(this.players).forEach(
      id => this.players[id].addDots(this.arena)
    );

    //start the game after half a second so the player has time to react
    setTimeout(this.startGame.bind(this), 500);
    //start the game with player dash on cooldown so pressing start doesn't trigger
    setTimeout(() => this.player.cooldown = false, 1000);
    setTimeout(() => this.player.saveDoubleTap = false, 1000);
  }

  startGame() {
    createjs.Ticker.on('tick', this.update.bind(this));
  }

  stopGame() {
    createjs.Ticker.reset();
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

  dotCollide(p1, p2) {
    return _.distance(p1.swordPoint(), p2.lastDot()) < 25;
  }

  checkCollisions() {
    for (var i = 0; i < Object.keys(this.players).length; i++) {
      let aId = Object.keys(this.players)[i];
      let a = this.players[aId];
      for (var j = 0; j < Object.keys(this.players).length; j++) {
        let bId = Object.keys(this.players)[j];
        let b = this.players[bId];
        if (bId !== aId) {
          //check if player a collided with player b
          if (this.swordCollide(a, b)) {
            createjs.Sound.play(_.sample(clangs)).volume = 0.5;
            if (a.dashing) {
              b.handleKnockback(a, 15);
            } else {
              b.handleKnockback(a, 2);
            }
          } else if (this.bodyCollide(a, b)) {
            createjs.Sound.play(_.sample(hits)).volume = 0.5;
            if (a.dashing) {
              createjs.Sound.play('thud').volume = 0.5;
              b.handleKnockback(a, 20);
            } else {
              b.handleKnockback(a, 2);
              a.handleKnockback(b, 2);
            }
          } else if (a.dashing && this.dotCollide(a, b)) {
            let dot = b.loseDot();
            if (dot) {
              a.stealDot(dot);
              this.makeHalo(dot.pos(), dot.color);
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
      let enemy = new Enemy(_.sample(this.players).lastDot());
      this.players[enemy.id] = enemy;
      this.arena.addChild(enemy.sprite);
    }
  }

  createPlayer() {
    this.player = new Player(() => ({x: this.stage.mouseX, y: this.stage.mouseY}), this.arena);
    this.players[this.player.id] = this.player;
    this.arena.x = -this.player.x + 500;
    this.arena.y = -this.player.y + 300;
    this.stage.addChild(this.player.sprite);
  }

  removeDead(player) {
    setTimeout(() => this.makeHalo(player.pos(), player.color), 100);
    setTimeout(() => this.makeHalo(player.pos(), player.color), 200);
    setTimeout(() => this.makeHalo(player.pos(), player.color), 300);
    setTimeout(() => this.makeHalo(player.pos(), player.color), 400);
    this.arena.removeChild(player.sprite);
    this.arena.removeChild(player.ring);
    delete this.players[player.id];
  }

  enemies() {
    let enemies = Object.assign({}, this.players);
    delete enemies[this.player.id];
    return enemies;
  }

  makeHalo(pos, color) {
    this.halo = new createjs.Shape().set(pos);
    this.halo.graphics.beginStroke(color).setStrokeStyle(3).drawCircle(0, 0, 10);
    this.arena.addChild(this.halo);
    createjs.Tween.get(this.halo)
    .to({
      scaleX: 25,
      scaleY: 25,
      alpha: 0
    }, 300)
    .call(() => this.arena.removeChild(this.halo));
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
    if (this.player.dead) {
      this.lose();
    } else if (this.player.dots.length === 12) {
      this.win();
    } else {
      this.player.updatePosition();
      this.updateEnemiesPositions();
      this.checkCollisions();
      this.stage.update(e);
    }
  }

  win() {
    this.stopGame();
    document.getElementById('text').innerHTML = 'YOU WON';
    window.button.innerHTML = "Play Again";
    this.resetGame();
  }
  lose() {
    this.stopGame();
    document.getElementById('text').innerHTML = 'YOU DIED<br/>How did you let that happen?';
    window.button.innerHTML = "Retry";
    this.resetGame();
  }

  resetGame() {
    window.scrollTo(0,0);
    window.modal.classList.toggle('hidden');
    document.getElementById('ctx').remove();
    window.canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.id = 'ctx';
    canvas.width = 1000;
    canvas.height = 600;
    document.body.appendChild(canvas);
  }
}
