import * as _ from './util.js';
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
    this.x = Math.random() * WIDTH;
    this.y = Math.random() * HEIGHT;
    this.vx = 0;
    this.vy = 0;
    this.dashing = false;
    this.cooldown = false;
    this.knockback = false;
    this.sprite = new createjs.Container();
    this.pointer = pointer;
    // this.swordBox = new createjs.Shape();
    // this.swordBox.graphics.beginFill("yellow").drawCircle(-5, -35, 25);
    // this.handBox = new createjs.Shape();
    // this.handBox.graphics.beginFill("BurlyWood").drawCircle(-5, 45, 25);
    // this.handBox.alpha = 0.3;
    // this.swordBox.alpha = 0.3;
    // this.sprite.addChild(this.swordBox);
    // this.sprite.addChild(this.handBox);
    this.left = this.sprite.addChild(left1.clone());
    this.right = this.sprite.addChild(right1.clone());

  }

  swordPoint() {
    if (!this.sprite) {return {x:null, y:null};}
    this.swordTip = {
      x: this.x + this.offsetRotate(-5, -35).x,
      y: this.y + this.offsetRotate(-5, -35).y
    };
    return this.swordTip;
  }

  handPoint() {
    if (!this.sprite) {return {x:null, y:null};}
    this.handTip = {
      x: this.x + this.offsetRotate(-5, 45).x,
      y: this.y + this.offsetRotate(-5, 45).y
    };
    return this.handTip;
  }

  offsetRotate(xOffset, yOffset) {
    if (!this.sprite) {return {x:null, y:null};}
    return {
      x: -yOffset * Math.sin(_.toRad(this.sprite.rotation))+
          xOffset * Math.cos(_.toRad(this.sprite.rotation)),

      y: yOffset * Math.cos(_.toRad(this.sprite.rotation))+
         xOffset * Math.sin(_.toRad(this.sprite.rotation))
    };
  }

  die() {
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
    setTimeout(() => {this.cooldown = false;}, 1300);
  }

  handleKnockback(source, coeff){
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
  }


  getTurn() {
    if (this.dashing) {
      this.left.rotation -= 3.75;
    } else if (this.left.rotation < -15) {this.left.rotation += 0.75;}

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
    let vBonus = this.dashing ? 10 : 3;
    vBonus *= this.cooldown ? 0.75 : 1;
    this.vx *= vBonus;
    this.vy *= vBonus;
  }
}
