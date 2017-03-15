import * as _ from './util.js';
import MovingObject from './moving_object.js';

export default class Dot extends MovingObject {
  constructor(pointer, anchor, ownerId, color = _.randomColor()) {
    super(pointer, anchor);
    this.ownerId = ownerId;
    this.color = color;
    this.sprite = new createjs.Shape();
    this.sprite.graphics.beginFill(color).drawCircle(0, 0, 10);
    this.sprite.alpha = 0.5;
  }

  changeOwner(id, pos) {
    this.ownerId = id;
  }

  updatePosition() {
    // this.moveTo({x: this.x + this.vx, y: this.y + this.vy});
    // this.vBonus *= _.distance(this.pos(), this.pointer()) < 25 ? 1 : 3;
    super.updatePosition.call(this);
  }
  moveSprite() {
    this.sprite.x = this.x;
    this.sprite.y = this.y;
  }
}
