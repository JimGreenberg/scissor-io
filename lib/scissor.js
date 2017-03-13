import * as _ from './util.js';
import Dot from './dot.js';
import Matter from '../node_modules/matter-js';
const tau = Math.PI * 2;

export default class Scissor {
  constructor(pointer, color) {
    //initialize constants
    this.id = _.uniqueId();
    const pos = _.randomPosition(WIDTH, HEIGHT);
    this.x = pos.x;
    this.y = pos.y;
    this.pointer = pointer;
    this.dead = false;
    this.cooldown = false;

    //Create physics actors
    this.rightCircle = Matter.Bodies.circle(this.x+20, this.y+32, 20, {
      collisionFilter: {group: -this.id},
      mass: 0,
      render: {opacity: 0}
    });
    this.leftCircle = Matter.Bodies.circle(this.x-20, this.y+32, 20, {
      collisionFilter: {group: -this.id},
      mass: 0,
      render: {opacity: 0}
    });
    this.rightBlade = Matter.Bodies.rectangle(this.x, this.y, 10, 100, {
      collisionFilter: {group: -this.id},
      render: {sprite: {texture: './img/righttoon.png'}}
    });
    this.leftBlade = Matter.Bodies.rectangle(this.x, this.y, 10, 100, {
      collisionFilter: {group: -this.id},
      render: {sprite: {texture: './img/lefttoon.png'}}
    });
    Matter.Body.setAngle(this.leftBlade, _.toRad(30));
    Matter.Body.setAngle(this.rightBlade, _.toRad(-30));

    this.spring1 = Matter.Constraint.create({
      bodyA: this.leftBlade,
      pointA: {x:-30, y:40},
      bodyB: this.leftCircle,
      stiffness: 0.2,
      length: 0
    });
    this.spring2 = Matter.Constraint.create({
      bodyA: this.rightBlade,
      pointA: {x:30, y:40},
      bodyB: this.rightCircle,
      stiffness: 0.2,
      length: 0
    });

    this.dot = new Dot(this.id, this.leftBlade, color);
    //sensor for dot hit detection
    this.sensor = Matter.Bodies.circle(this.x, this.y-20, 5,{
      mass: 0,
      label: `#${this.id}`,
      isSensor: true,
      collisionFilter: {group: -this.id},
      render: {
        strokeStyle: '#f00',
        fillStyle: 'transparent',
        lineWidth: 1
      }
    });
    this.sensorChain =  Matter.Constraint.create({
      bodyA: this.sensor,
      bodyB: this.leftBlade,
      pointB: {x: -10, y:-20},
      length: 0,
      stiffness: 0.5
    });
    this.sensorChain2 =  Matter.Constraint.create({
      bodyA: this.sensor,
      bodyB: this.rightBlade,
      pointB: {x: 10, y:-20},
      length: 0,
      stiffness: 0.5
    });

    //this.composite is the whole player object
    this.composite = Matter.Composite.create({
      bodies: [this.leftBlade, this.rightBlade, this.leftCircle, this.rightCircle, this.sensor],
      constraints: [this.spring1, this.spring2, this.sensorChain, this.sensorChain2]
    });
    Matter.Composites.mesh(this.composite,2,2,true,{stiffness: 0.1});
    // this.composite.constraints.forEach(c => c.render.visible = false);
  }

  angle() {
    let theta = (_.cir(this.leftBlade.angle + 1 - Math.PI));
    return _.cir(theta);
  }

  _getTurn() {
    let theta = _.cir(Math.atan2(
      (this.pointer().y - this.y),
      (this.pointer().x - this.x)));
    const currAng = (this.angle() + tau) % tau;
    if (Math.floor(_.toDeg(currAng) / 9) !== Math.floor((_.toDeg(_.cir(theta)) / 9))) {
      let turn = _.cir(currAng - theta) > Math.PI ? 0.05 : -0.05;
      Matter.Composite.rotate(this.composite, turn, this.pos());
    }
  }

  dash() {
    if (this.cooldown) {return;}
    setTimeout(() => {
      this.cooldown = false;
      this.leftBlade.torque = -0.5;
      this.rightBlade.torque = 0.5;
    }, 500);
    this.cooldown = true;
    this.composite.bodies.forEach(body => {
      Matter.Body.setVelocity(body, this._getVel(10));
    });

  }

  _getVel(multiplier = 3) {
    const vector = Matter.Vector.create(
      Math.cos(this.angle()),
      Math.sin(this.angle())
    );
    return Matter.Vector.mult((vector), multiplier);
  }

  updatePosition() {
    this._getTurn();
    this.composite.bodies.forEach(body => {
      Matter.Body.translate(body, this._getVel());
    });
    this.x = this.leftBlade.position.x;
    this.y = this.leftBlade.position.y;
  }

  pos() {
    return {x: this.x, y: this.y};
  }
  //
  // lastDot() {
  //   return this.dots.slice(-1)[0];
  // }
  //
  // stealDot(dot) {
  //   if (!dot) {return;}
  //   dot.changeOwner(this.id, this.lastDot().pos());
  //   this.dots.push(dot);
  // }
  //
  // loseDot() {
  //   if (this.invincible) {return;}
  //   if (this.dots.length === 1) {this.die();}
  //   this.invincible = true;
  //   this.sprite.alpha = 0.5;
  //   setTimeout(() => {
  //     this.invincible = false;
  //     this.sprite.alpha = 1;
  //   }, 2000);
  //   return this.dots.pop();
  // }

  die(list) {
    delete list[this.id];
    Matter.Composite.remove(game.engine.world, [this.composite, this.dot,this.dot.chain], true);
  }
}
