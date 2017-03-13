import * as _ from './util.js';
import Dot from './dot.js';
import Matter from '../node_modules/matter-js';

const tau = Math.PI * 2;

const RIGHTIMG = {
  images: ['./img/righttoon.png'],
  frames: {width: 100, height: 100, regX: 50, regY: 50, count: 1},
};
const LEFTIMG = {
  images: ['./img/lefttoon.png'],
  frames: {width: 100, height: 100, regX: 50, regY: 50, count: 1},
};

const rightSheet = new createjs.SpriteSheet(RIGHTIMG);
const leftSheet = new createjs.SpriteSheet(LEFTIMG);

const right1 = new createjs.Sprite(rightSheet);
const left1 = new createjs.Sprite(leftSheet);

export default class Scissor {
  constructor(pointer) {
    this.id = _.uniqueId();
    this.x = Math.random() * WIDTH;
    this.y = Math.random() * HEIGHT;
    this.pointer = pointer;
    // this.angle = -Math.PI / 2;

    this.dead = false;
    this.dashing = false;
    this.cooldown = false;
    this.knockback = false;
    this.invincible = false;

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
    // this.left = Matter.Body.create({
    //   parts: [this.leftBlade, this.leftCircle],
    //   collisionFilter: {group: -this.id},
    //   render: {sprite: {texture: './img/lefttoon.png'}}
    // });
    // this.right = Matter.Body.create({
    //   parts: [this.rightBlade, this.rightCircle],
    //   collisionFilter: {group: -this.id},
    //   render: {sprite: {texture: './img/righttoon.png'}}
    // });
    this.s1 = Matter.Constraint.create({
      bodyA: this.leftBlade,
      pointA: {x:35, y:-20},
      bodyB: this.rightBlade,
      pointB: {x:-35, y:-20},
      // length: -50,
      stiffness: 0.1
    });
    this.s2 = Matter.Constraint.create({
      bodyA: this.leftBlade,
      pointA: {x:-35, y:20},
      bodyB: this.rightBlade,
      pointB: {x:35, y:20},
      // length: 30,
      stiffness: 0.1
    });
    // this.s3 = Matter.Constraint.create({
    //   bodyA: this.left,
    //   pointA: {x:35, y:-35},
    //   bodyB: this.right,
    //   pointB: {x:35, y:35},
    //   // length: -50,
    //   stiffness: 0.1
    // });
    // this.s4 = Matter.Constraint.create({
    //   bodyA: this.left,
    //   pointA: {x:-35, y:35},
    //   bodyB: this.right,
    //   pointB: {x:-35, y:-35},
    //   // length: 30,
    //   stiffness: 0.1
    // });

    // this.composite = Matter.Body.create({
    //   parts: [this.right, this.left]
    // });
    this.soft = Matter.Composites.softBody(500, 300, 2, 2, 2, 2, true, 10,{},{stiffness: 0.5});
    // this.composite = Matter.Composite.create({
    //   bodies: [this.left, this.right],
    //   constraints: [this.s1, this.s2, this.s3, this.s4]
    // });
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
    this.composite = Matter.Composite.create({
      bodies: [this.leftBlade, this.rightBlade, this.leftCircle, this.rightCircle],
      constraints: [this.spring1, this.spring2]
    });
    Matter.Composites.mesh(this.composite,2,2,true,{stiffness: 0.1});

  }

  angle() {
    let theta = (_.cir(this.leftBlade.angle + 1 - Math.PI));
    return _.cir(theta);
  }

  getTurn() {
    let theta = _.cir(Math.atan2(
      (this.pointer().y - this.y),
      (this.pointer().x - this.x)));
    const currAng = (this.angle() + tau) % tau;
    if (Math.floor(_.toDeg(currAng) / 9) !== Math.floor((_.toDeg(_.cir(theta)) / 9))) {
      let turn = _.cir(currAng - theta) > Math.PI ? 0.05 : -0.05;
      // this.angle += turn;
      // this.angle = (this.angle + tau) % tau;
      Matter.Composite.rotate(this.composite, turn, this.pos());
    }
  }

  dash() {
    if (this.cooldown) {return;}
    setTimeout(() => {this.cooldown = false;}, 1000);
    this.composite.bodies.forEach(body => {
      Matter.Body.setVelocity(body, this.getVel(10));
    });
  }

  getVel(multiplier = 3) {
    const vector = Matter.Vector.create(
      Math.cos(this.angle()),
      Math.sin(this.angle())
    );
    return Matter.Vector.mult((vector), multiplier);
  }

  updatePosition() {
    this.getTurn();
    console.log(_.toDeg(this.angle()));
    this.composite.bodies.forEach(body => {
      // Matter.Body.applyForce(body, {x: 0, y: 0}, this.getVel());
      Matter.Body.translate(body, this.getVel());
    });
    this.x = this.leftBlade.position.x;
    this.y = this.leftBlade.position.y;
  }

  pos() {
    return {x: this.x, y: this.y};
  }

  vel() {
    return {x: this.vx, y: this.vy};
  }

  swordPoint() {
    if (!this.sprite) {return {x: null, y: null};}
    this.swordPos = {
      x: this.x + this.offsetRotate(0, -28).x,
      y: this.y + this.offsetRotate(0, -28).y
    };
    return this.swordPos;
  }

  backPoint() {
    if (!this.sprite) {return {x: null, y: null};}
    this.backPos = {
      x: this.x + this.offsetRotate(-26, 32).x,
      y: this.y + this.offsetRotate(-26, 32).y
    };
    return this.backPos;
  }

  lastDot() {
    return this.dots.slice(-1)[0];
  }

  stealDot(dot) {
    if (!dot) {return;}
    dot.changeOwner(this.id, this.lastDot().pos());
    this.dots.push(dot);
  }

  loseDot() {
    if (this.invincible) {return;}
    if (this.dots.length === 1) {this.die();}
    this.invincible = true;
    this.sprite.alpha = 0.5;
    setTimeout(() => {
      this.invincible = false;
      this.sprite.alpha = 1;
    }, 2000);
    return this.dots.pop();
  }

  offsetRotate(xOffset, yOffset) {
    if (!this.sprite) {return {x: null, y: null};}
    return {
      x: -yOffset * Math.sin(_.toRad(this.sprite.rotation))+
          xOffset * Math.cos(_.toRad(this.sprite.rotation)),

      y: yOffset * Math.cos(_.toRad(this.sprite.rotation))+
         xOffset * Math.sin(_.toRad(this.sprite.rotation))
    };
  }

  die() {
    this.dead = true;
    this.sprite.removeChild(this.left);
    this.sprite.removeChild(this.right);
  }


  handleKnockback(source, coeff) {
    this.knockback = true;
    let magnitude = coeff / Math.sqrt(Math.pow(source.x - this.x, 2) + Math.pow(source.y - this.y, 2));
    this.vx = magnitude * (this.x - source.x);
    this.vy = magnitude * (this.y - source.y);
    setTimeout(() => {this.knockback = false;}, 300);
  }

  method() {
    // if (this.x > WIDTH - 25) {this.hitWall('right');}
    // if (this.y > HEIGHT - 25) {this.hitWall('bottom');}
    // if (this.x < 25) {this.hitWall('left');}
    // if (this.y < 25) {this.hitWall('top');}

    if (!this.knockback) {
      this.getTurn();
      this.getVel();
    }
    // this.x += this.vx;
    // this.y += this.vy;
  }

  hitWall(dir) {
    this.knockback = true;
    switch(dir) {
      case 'top':
      case 'bottom':
        // this.handleKnockback({x:this.x - 10*this.vx, y:this.y + 10*this.vy}, 10);
        this.handleKnockback({x: WIDTH / 2, y: HEIGHT / 2}, -10);
        break;
      case 'left':
      case 'right':
      // this.handleKnockback({x:this.x + 10*this.vx, y:this.y - 10*this.vy}, 10);
      this.handleKnockback({x: WIDTH / 2, y: HEIGHT / 2}, -10);
        break;
    }
    let knockCode = setTimeout(() => {this.knockback = false;}, 300);
    this.rescueFromKnockbackLoop(knockCode);
  }

  rescueFromKnockbackLoop(code) {
    // clearTimeout(code);
    setTimeout(() => {
      if (this.knockback ||
         (this.x > WIDTH - 25) ||
         (this.y > HEIGHT - 25) ||
         (this.x < 25) ||
         (this.y < 25)) {
           this.handleKnockback({x: WIDTH / 2, y: HEIGHT / 2}, -10);
      }
    }, 400);
  }

  updateDots() {
    let pos = this.pos();
    this.dots.forEach(dot => {
      setTimeout(
        () => dot.moveTo(pos),
        500 + (this.dots.indexOf(dot) * 300));
      dot.updatePosition();
    });
  }
}
