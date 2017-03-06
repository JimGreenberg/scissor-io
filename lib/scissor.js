import * as _ from './util.js';
import Dot from './dot.js';
const RIGHTIMG = {
  images: ['./img/rightscis.png'],
  frames: {width: 100, height: 100, regX: 50, regY: 50, count: 1},
};
const LEFTIMG = {
  images: ['./img/leftscis.png'],
  frames: {width: 100, height: 100, regX: 55, regY: 55, count: 1},
};

const rightSheet = new createjs.SpriteSheet(RIGHTIMG);
const leftSheet = new createjs.SpriteSheet(LEFTIMG);

const left1 = new createjs.Sprite(leftSheet);
const right1 = new createjs.Sprite(rightSheet);
  left1.rotation = -15;
  right1.rotation = 15;

export default class Scissor {
  constructor(pointer) {
    this.id = Math.random();
    this.sprite = new createjs.Container();
    this.x = Math.random() * WIDTH;
    this.y = Math.random() * HEIGHT;
    this.vx = 0;
    this.vy = 0;
    this.pointer = pointer;
    this.dashing = false;
    this.cooldown = false;
    this.knockback = false;
    this.invincible = false;
    this.dead = false;
    this.dotColor = _.randomColor();
    this.dots = [];
    while (this.dots.length < 3) {
      this.dots.push(new Dot(this.pos(), this.id, this.dotColor));
    }
    this.left = this.sprite.addChild(left1.clone());
    this.right = this.sprite.addChild(right1.clone());
    // this.swordBox = new createjs.Shape();
    // this.swordBox.graphics.beginFill("yellow").drawCircle(-5, -35, 25);
    // this.handBox = new createjs.Shape();
    // this.handBox.graphics.beginFill("BurlyWood").drawCircle(-5, 30, 25);
    // this.handBox.alpha = 0.3;
    // this.swordBox.alpha = 0.3;
    // this.sprite.addChild(this.swordBox);
    // this.sprite.addChild(this.handBox);
  }

  addDots(parent) {
    this.dots.forEach(dot => parent.addChild(dot.shape));
  }

  pos() {
    return {x: this.x, y: this.y};
  }

  swordPoint() {
    if (!this.sprite || this.invincible) {return {x: null, y: null};}
    this.swordPos = {
      x: this.x + this.offsetRotate(-5, -35).x,
      y: this.y + this.offsetRotate(-5, -35).y
    };
    return this.swordPos;
  }

  backPoint() {
    if (!this.sprite || this.invincible) {return {x: null, y: null};}
    this.backPos = {
      x: this.x + this.offsetRotate(-5, 35).x,
      y: this.y + this.offsetRotate(-5, 35).y
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
    if (this.dots.length === 1) {this.die();}
    this.invincible = true;
    this.sprite.alpha = 0.5;
    setTimeout(() => {
      this.invincible = false;
      this.sprite.alpha = 1;
    }, 3000);
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
    setTimeout(() => {
      this.knockback = false;
    }, 300
    );
  }

  updatePostition() {
    if (!this.knockback) {
      this.getTurn();
      this.getVel();
      if (this.x > WIDTH - 25 ||
          this.y > HEIGHT - 25 ||
          this.x < 25 ||
          this.y < 25
         ) {
            this.handleKnockback({x: WIDTH / 2, y: HEIGHT / 2}, -10);
           }
    }
    this.x += this.vx;
    this.y += this.vy;
    // for (let dotIdx = 0; dotIdx < this.dots.length; dotIdx++) {
    //   setTimeout(() => this.dots[dotIdx].moveTo(this.x, this.y), 100 * dotIdx + 100);
    // }
  }


  getTurn() {
    if (this.dashing) {
      this.left.rotation -= 3.75;
    } else if (this.left.rotation < -15) {this.left.rotation += 0.375;}

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
    let vBonus = this.dashing ? 25 : 3;
    vBonus *= this.cooldown ? 0.75 : 1;
    this.vx *= vBonus;
    this.vy *= vBonus;
  }
}
