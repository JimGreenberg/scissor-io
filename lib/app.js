import 'yuki-createjs';
import Matter from '../node_modules/matter-js';
import Enemy from './enemy.js';
import Player from './player.js';
import Modal from './modal.js';
import {sample} from './util.js';

window.WIDTH = 1000;
window.HEIGHT = 600;
window.init = () => {
  const canvas = document.getElementById('ctx');
  const context = canvas.getContext('2d');
  context.imageSmoothingQuality = "high";
  window.game = new Game(canvas);
  //On Update Event
  Matter.Events.on(game.engine, 'beforeUpdate', (e) => {
    game.player.updatePosition();
  });
  window.toggle = () => {game.render.options.wireframes = !game.render.options.wireframes }
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
        wireframes: false,
        showPositions: true
      }
    });
    this.mouse = Matter.Mouse.create(this.render.canvas);
    this.mouseConstraint = Matter.MouseConstraint.create(this.engine, {
            mouse: this.mouse,
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: false
                }
            }
        });
    Matter.World.add(this.engine.world, this.mouseConstraint);
    this.render.mouse = this.mouse;
    this.players = {};

    this.player = new Player(() => this.mouse.position);
    document.onclick = e => {
      this.player.dash();
    };
    document.onkeydown = e => {
      if (e.keyCode === 32) {this.player.dash();}
    };
    this.erectWalls();
    Matter.World.add(this.engine.world,[this.player.composite, this.player.soft]);
    Matter.Engine.run(this.engine);
    Matter.Render.run(this.render);

  }

  erectWalls() {
    Matter.World.add(this.engine.world, [
      Matter.Bodies.rectangle(WIDTH / 2, 0, WIDTH, 10, {isStatic: true}),
      Matter.Bodies.rectangle(WIDTH / 2, HEIGHT, WIDTH, 10, {isStatic: true}),
      Matter.Bodies.rectangle(HEIGHT / 2, 0, HEIGHT, 10, {isStatic: true}),
      Matter.Bodies.rectangle(HEIGHT / 2, 0, WIDTH, 10, {isStatic: true})
    ]);
  }

}
