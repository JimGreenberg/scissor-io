import * as _ from './util.js';
import Dot from './dot.js';
import MovingObject from './moving_object.js';
import 'createjs-collection';

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
    this.color = _.randomColor();
    this.dots = [];
    this.createDots();
    this.ring = new createjs.Shape().set(this.lastDot().pos());
    this.ring.graphics
      .beginStroke(this.color)
      .setStrokeStyle(2)
      .drawCircle(0,0,15);

    this.right = this.sprite.addChild(rightHalfSprite.clone());
    this.left = this.sprite.addChild(leftHalfSprite.clone());

    // _.drawDebug(this);
  }

  makeDot(pointer) {
    return new Dot(pointer, pointer(), this.id, this.color);
  }

  addDots(drawingCtx) {
    this.dots.forEach(dot => drawingCtx.addChild(dot.sprite));
    drawingCtx.addChild(this.ring);
  }

  createDots() {
    while (this.dots.length < 3) {
      let pointer;
      if (this.dots.length === 0) {
        pointer = this.pos.bind(this);
      } else {
        let lastDot = this.lastDot();
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
    let lastDot = this.lastDot();
    dot.changeOwner(this.id, lastDot.pos.bind(lastDot));
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
    if (this.cooldown) return;
    var a = createjs.Sound.play(_.sample(swooshes)).volume = 0.2;
    this.dashing = true;
    this.knockback = false;
    this.cooldown = true;
    setTimeout(() => {
      this.dashing = false;
    }, 200);
    setTimeout(() => {this.cooldown = false;}, 1500);
  }

  handleKnockback(source, coeff) {
    this.knockback = true;
    let magnitude = coeff / _.distance(this, source);
    this.vx = magnitude * (this.x - source.x);
    this.vy = magnitude * (this.y - source.y);
    setTimeout(() => {this.knockback = false;}, 100);
  }

  updatePosition() {
    if (this.outOfBounds()) {
      this.handleKnockback({x: WIDTH / 2, y: HEIGHT / 2}, -10);
      this.rescueFromKnockbackLoop();
    }

    this.vBonus = this.dashing ? 18 : 3;
    this.vBonus *= this.cooldown ? 0.75 : 1;
    super.updatePosition.call(this);
    this.dots.forEach(dot => {dot.updatePosition();});
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
    setTimeout(() => {
      if (this.knockback || this.outOfBounds()) {
        this.handleKnockback({x: WIDTH / 2, y: HEIGHT / 2}, -10);
      }
    }, 400);
  }

  moveSprite() {
    if (this.dead) {return;}
    const lastDot = this.lastDot();
    this.ring.x = lastDot.x;
    this.ring.y = lastDot.y;

    this.sprite.rotation = this.forward;
    if (this.dashing) {
      this.left.rotation += 2;
      this.right.rotation -= 2;
    } else if (this.left.rotation > 0) {
      this.left.rotation -= 0.3;
      this.right.rotation += 0.3;
    }
  }

}
