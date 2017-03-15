import * as _ from './util.js';
import Dot from './dot.js';
import MovingObject from './moving_object.js';
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

const rightHalfSprite = new createjs.Sprite(rightSheet);
const leftHalfSprite = new createjs.Sprite(leftSheet);

export default class Scissor extends MovingObject {
  constructor(pointer) {
    super(pointer);
    this.id = Math.random();
    this.sprite = new createjs.Container();

    this.dead = false;
    this.dashing = false;
    this.cooldown = false;
    this.knockback = false;
    this.invincible = false;
    this.dotColor = _.randomColor();

    this.dots = [];
    this.createDots();

    this.right = this.sprite.addChild(rightHalfSprite.clone());
    this.left = this.sprite.addChild(leftHalfSprite.clone());
    _.drawDebug(this);
  }

  makeDot(pointer) {
    return new Dot(pointer, pointer(), this.id, this.dotColor);
  }

  addDots(drawingCtx) {
    this.dots.forEach(dot => drawingCtx.addChild(dot.shape));
  }
  createDots() {
    while (this.dots.length < 3) {
      let pointer;
      if (this.dots.length === 0) {
        pointer = this.pos.bind(this);
      } else {
        let lastDot = this.dots.slice(-1)[0];
        pointer = lastDot.pos.bind(lastDot);
      }
      this.dots.push(this.makeDot(pointer));
    }
  }

  swordPoint() {
    if (!this.sprite) {return {x: null, y: null};}
    this.swordPos = {
      x: this.x + this.offsetRotate(-2, -34).x,
      y: this.y + this.offsetRotate(-2, -34).y
    };
    return this.swordPos;
  }

  backLeftPoint() {
    if (!this.sprite) {return {x: null, y: null};}
    this.backLPos = {
      x: this.x + this.offsetRotate(-26, 32).x,
      y: this.y + this.offsetRotate(-26, 32).y
    };
    return this.backLPos;
  }

  backRightPoint() {
    if (!this.sprite) {return {x: null, y: null};}
    this.backRPos = {
      x: this.x + this.offsetRotate(26, 32).x,
      y: this.y + this.offsetRotate(26, 32).y
    };
    return this.backRPos;
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
    /*
    returns the transformed value of a point on a
    local coordinate system rotated about its center
    to the absolute coordinate system of the local systems context
    */
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
    let magnitude = coeff /
      Math.sqrt(
        Math.pow(source.x - this.x, 2) +
        Math.pow(source.y - this.y, 2)
      );
    this.vx = magnitude * (this.x - source.x);
    this.vy = magnitude * (this.y - source.y);
    setTimeout(() => {this.knockback = false;}, 300);
  }

  updatePosition() {
    if (this.x > WIDTH - 25) {this.hitWall('right');}
    if (this.y > HEIGHT - 25) {this.hitWall('bottom');}
    if (this.x < 25) {this.hitWall('left');}
    if (this.y < 25) {this.hitWall('top');}
    this.vBonus = this.dashing ? 18 : 3;
    this.vBonus *= this.cooldown ? 0.75 : 1;
    super.updatePosition.call(this);
    this.dots.forEach(dot => {dot.updatePosition();});
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
    // let knockCode = setTimeout(() => {this.knockback = false;}, 300);
    this.rescueFromKnockbackLoop();
  }

  outOfBounds() {
    if ((this.x > WIDTH - 25) ||
       (this.y > HEIGHT - 25) ||
       (this.x < 25) ||
       (this.y < 25)) {
         return true;
    } else {
      return false;
    }
  }
  rescueFromKnockbackLoop() {
    // clearTimeout(code);
    setTimeout(() => {
      if (this.knockback || this.outOfBounds()) {
        this.handleKnockback({x: WIDTH / 2, y: HEIGHT / 2}, -10);
      }
    }, 400);
  }

  getTurn() {
    if (this.dashing) {
      this.left.rotation += 3.75 / 2;
      this.right.rotation -= 3.75 / 2;
    } else if (this.left.rotation > 0) {
      this.left.rotation -= 0.375 / 2;
      this.right.rotation += 0.375 / 2;
    }
    super.getTurn.call(this);
    this.sprite.rotation = this.forward;

  }
}
