import {randomColor} from './util.js';

export default class Dot {
  constructor(anchor, ownerId, color = randomColor()) {
    this.x = anchor.x;
    this.y = anchor.y;
    this.vx = 0;
    this.vy = 0;
    this.ownerId = ownerId;
    this.color = color;
    this.shape = new createjs.Shape();
    this.shape.graphics.beginFill(color).drawCircle(0, 0, 15);
    this.shape.alpha = 0.5;
    this.moveQueue = [];
  }

  changeOwner(id, pos) {
    this.ownerId = id;
  }

  pos() {
    return {x: this.x, y: this.y};
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

  updatePosition() {
    this.moveTo({x: this.x + this.vx, y: this.y + this.vy});
  }
}
