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
    this.x = Math.random() * WIDTH;
    this.y = Math.random() * HEIGHT;
    this.vx = 0;
    this.vy = 0;
    this.dead = false;
    this.dashing = false;
    this.cooldown = false;
    this.sprite = new createjs.Container();
    this.swordBox = new createjs.Shape();
    this.swordBox.graphics.beginFill("yellow").drawCircle(-5, -35, 25);
    this.handBox = new createjs.Shape();
    this.handBox.graphics.beginFill("BurlyWood").drawCircle(-5, 45, 25);
    this.handBox.alpha = 0.3;
    this.swordBox.alpha = 0.3;
    this.sprite.addChild(this.swordBox);
    this.sprite.addChild(this.handBox);
    this.left = this.sprite.addChild(left1.clone());
    this.right = this.sprite.addChild(right1.clone());
    this.pointer = pointer;
  }

  didHit(otherBox) {
    this.trueCenter(otherBox);
  }

  die() {
    this.dead = true;
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

  updatePostition() {
    this.getTurn();
    this.getVel();
    if (this.x > WIDTH - 25 ||
        this.y > HEIGHT - 25 ||
        this.x < 25 ||
        this.y < 25
       ) {
          this.die();
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
    theta = ((theta * 180 / Math.PI) + 90) % 360;
    let spriteTheta = (this.sprite.rotation + 360) % 360;
    let turnRate = this.cooldown? 2 : 3;

    if (Math.floor(spriteTheta / 9) !== Math.floor((theta + 360) % 360 / 9)) {
      spriteTheta += (spriteTheta - theta + 360) % 360 > 180 ? turnRate : -turnRate;
    }
    this.sprite.rotation = spriteTheta;
  }

  getVel() {
    this.vx = Math.sin(this.sprite.rotation * Math.PI / 180);
    this.vy = -Math.cos(this.sprite.rotation * Math.PI / 180);
    let vBonus = this.dashing ? 25 : 3;
    vBonus *= this.cooldown ? 0.75 : 1;
    this.vx *= vBonus;
    this.vy *= vBonus;
  }
}
