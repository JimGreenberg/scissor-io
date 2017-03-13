import 'yuki-createjs';
import Matter from '../node_modules/matter-js';
import Enemy from './enemy.js';
import Player from './player.js';
import Modal from './modal.js';
import {sample} from './util.js';

window.WIDTH = 1200;
window.HEIGHT = 600;
window.init = () => {
  const canvas = document.getElementById('ctx');
  const context = canvas.getContext('2d');
  context.imageSmoothingQuality = "high";
  window.game = new Game(canvas);
  //On Update Event
  Matter.Events.on(game.engine, 'beforeUpdate', (e) => {
    Object.keys(game.players).forEach(id => game.players[id].updatePosition());
  });
  //toggle wireframes for debug
  window.toggle = () => game.render.options.wireframes = !game.render.options.wireframes;
};

class Game {
  constructor(canvas, starting = true) {
    this.engine = Matter.Engine.create({
      world: Matter.World.create({
        gravity: {x: 0, y:0}
      })
    });
    this.render = Matter.Render.create({
      canvas,
      engine: this.engine,
      options: {
        width: WIDTH,
        height: HEIGHT,
        wireframes: false
      }
    });
    this.mouse = Matter.Mouse.create(this.render.canvas);
    this.render.mouse = this.mouse;
    this.initGame()
  }
  initGame() {
    this.players = {};
    //Add the human player
    this.player = new Player(() => this.mouse.position);
    this.players[this.player.id] = this.player;
    Matter.World.add(this.engine.world,[this.player.composite]);
    //Event listeners for the human player
    document.onclick = e => {
      this.player.dash();
    };
    document.onkeydown = e => {
      if (e.keyCode === 32) {this.player.dash();}
    };

    this.erectWalls();
    this.addEnemies();
    Matter.Engine.run(this.engine);
    Matter.Render.run(this.render);
  }

  addEnemies() {
    while (Object.keys(this.players).length < 3) {
      var target = sample(this.players);
      var enemy = new Enemy(
        () => ({
          x: target.x,
          y: target.y
        })
      );
      this.players[enemy.id] = enemy;
      Matter.World.addComposite(this.engine.world, enemy.composite);
    }
  }

  erectWalls() {
    Matter.World.add(this.engine.world, [
      Matter.Bodies.rectangle(WIDTH / 2, 0, WIDTH, 10, {isStatic: true}),
      Matter.Bodies.rectangle(WIDTH / 2, HEIGHT, WIDTH, 10, {isStatic: true}),
      Matter.Bodies.rectangle(0, HEIGHT / 2, 10, HEIGHT, {isStatic: true}),
      Matter.Bodies.rectangle(WIDTH, HEIGHT / 2, 10, HEIGHT, {isStatic: true})
    ]);
  }

}
