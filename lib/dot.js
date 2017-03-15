import {randomColor} from './util.js';
import MovingObject from './moving_object.js';

export default class Dot extends MovingObject {
  constructor(pointer, anchor, ownerId, color = randomColor()) {
    super(pointer, anchor);
    this.ownerId = ownerId;
    this.color = color;
    this.shape = new createjs.Shape();
    this.shape.graphics.beginFill(color).drawCircle(0, 0, 10);
    this.shape.alpha = 0.5;
  }

  changeOwner(id, pos) {
    this.ownerId = id;
  }

  moveTo(point) {
    this.x = point.x;
    this.y = point.y;
    this.shape.x = this.x;
    this.shape.y = this.y;
  }

  acceptVel(vel) {
    this.vx = vel.x;
    this.vy = vel.y;
  }

  // updatePosition() {
  //   this.moveTo({x: this.x + this.vx, y: this.y + this.vy});
  // }
}
