import * as _ from './util.js';
export default class MovingObject {
  constructor(pointer, pos = {x: Math.random() * WIDTH, y: Math.random() * HEIGHT}) {
    this.x = pos.x;
    this.y = pos.y;
    this.pointer = pointer;
    this.vx = 0;
    this.vy = 0;
    this.vBonus = 3; //empirical default
    this.forward = 0;//direction the object is facing
  }

  pos() {
    return {x: this.x, y: this.y};
  }

  vel() {
    return {x: this.vx, y: this.vy};
  }

  updatePosition() {
    if (!this.knockback) {
      this.getTurn();
      this.getVel();
    }
    this.x += this.vx;
    this.y += this.vy;
    this.moveSprite();
  }

  moveSprite(){} //will be overwritten by children

  getTurn() {
    let theta = Math.atan2(
      (this.pointer().y - this.sprite.y),
      (this.pointer().x - this.sprite.x));

    theta = _.clean(_.toDeg(theta) + 90);
    let newForward = _.clean(this.forward);
    let turnRate = this.cooldown? 3 : 4;

    if (Math.floor(newForward / 9) !== Math.floor(_.clean(theta) / 9)) {
      newForward += _.clean(newForward - theta) > 180 ? turnRate : -turnRate;
    }
    this.forward = newForward;
  }

  getVel() {
    this.vx = Math.sin(_.toRad(this.forward));
    this.vy = -Math.cos(_.toRad(this.forward));

    this.vx *= this.vBonus;
    this.vy *= this.vBonus;
  }
}
