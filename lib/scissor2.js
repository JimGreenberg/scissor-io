import * as _ from './util.js';
import Dot from './dot.js';
import Matter from '../node_modules/matter-js';

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
    this.sprite = new createjs.Container();
    this.x = Math.random() * WIDTH;
    this.y = Math.random() * HEIGHT;
    this.vx = 0;
    this.vy = 0;
    this.pointer = pointer;
    this.dead = false;
    this.dashing = false;
    this.cooldown = false;
    this.knockback = false;
    this.invincible = false;
    this.right = this.sprite.addChild(right1.clone());
    this.left = this.sprite.addChild(left1.clone());
    this.leftCircle = Matter.Bodies.circle(this.x-26, this.y+32, 20, {collisionFilter: {group: -this.id}});
    this.rightCircle = Matter.Bodies.circle(this.x+26, this.y+32, 20, {collisionFilter: {group: -this.id}});
    this.leftBlade = Matter.Bodies.rectangle(this.x, this.y, 10, 40, {collisionFilter: {group: -this.id}});
    this.rightBlade = Matter.Bodies.rectangle(this.x, this.y, 10, 40, {collisionFilter: {group: -this.id}});
    Matter.Body.setAngle(this.leftBlade, _.toRad(this.left.rotation - 30));
    Matter.Body.setAngle(this.rightBlade, _.toRad(this.right.rotation + 30));
    this.leftComp = Matter.Composite.create();
    Matter.Composite.add(this.leftComp, [this.leftCircle, this.leftBlade]);
    this.rightComp = Matter.Composite.create();
    Matter.Composite.add(this.rightComp, [this.rightCircle, this.rightBlade]);
    this.composite = Matter.Composite.create();
    Matter.Composite.add(this.composite, [this.rightComp, this.leftComp]);
    // this.dotColor = _.randomColor();
    // this.dots = [];
    // while (this.dots.length < 3) {
    //   this.dots.push(new Dot(this.pos(), this.id, this.dotColor));
    // }
    // _.drawDebug(this);
  }

  addDots(parent) {
    this.dots.forEach(dot => parent.addChild(dot.shape));
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

  dash() {
    if (this.cooldown) {return;}
    this.dashing = true;
    this.knockback = false;
    setTimeout(() => {
      this.dashing = false;
      this.cooldown = true;
    }, 200);
    setTimeout(() => {this.cooldown = false;}, 2400);
  }

  handleKnockback(source, coeff) {
    this.knockback = true;
    let magnitude = coeff / Math.sqrt(Math.pow(source.x - this.x, 2) + Math.pow(source.y - this.y, 2));
    this.vx = magnitude * (this.x - source.x);
    this.vy = magnitude * (this.y - source.y);
    setTimeout(() => {this.knockback = false;}, 300);
  }

  updatePostition() {
    if (this.x > WIDTH - 25) {this.hitWall('right');}
    if (this.y > HEIGHT - 25) {this.hitWall('bottom');}
    if (this.x < 25) {this.hitWall('left');}
    if (this.y < 25) {this.hitWall('top');}

    if (!this.knockback) {
      this.getTurn();
      this.getVel();
    }
    this.x += this.vx;
    this.y += this.vy;
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


  getTurn() {
    if (this.dashing) {
      this.left.rotation += 3.75 / 2;
      this.right.rotation -= 3.75 / 2;
    } else if (this.left.rotation > 0) {
      this.left.rotation -= 0.375 / 2;
      this.right.rotation += 0.375 / 2;
    }

    let theta = Math.atan2(
      (this.pointer().y - this.sprite.y),
      (this.pointer().x - this.sprite.x));

    theta = (_.toDeg(theta) + 90) % 360;
    let spriteTheta = (this.sprite.rotation + 360) % 360;
    let turnRate = this.cooldown? 3 : 4;

    if (Math.floor(spriteTheta / 9) !== Math.floor((theta + 360) % 360 / 9)) {
      spriteTheta += (spriteTheta - theta + 360) % 360 > 180 ? turnRate : -turnRate;
    }
    this.sprite.rotation = spriteTheta;
  }

  getVel() {
    this.vx = Math.sin(_.toRad(this.sprite.rotation));
    this.vy = -Math.cos(_.toRad(this.sprite.rotation));
    let vBonus = this.dashing ? 18 : 3;
    vBonus *= this.cooldown ? 0.75 : 1;
    this.vx *= vBonus;
    this.vy *= vBonus;
  }
}