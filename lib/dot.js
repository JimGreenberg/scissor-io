import {randomColor} from './util.js';

export default class Dot {
  constructor(anchor, ownerId, color = randomColor()) {
    this.x = anchor.x;
    this.y = anchor.y;
    this.ownerId = ownerId;
    this.color = color;
    this.shape = new createjs.Shape();
    this.shape.graphics.beginFill(color).drawCircle(0, 0, 15);
    this.moveQueue = [];
  }

  changeOwner(id, pos) {
    this.ownerId = id;
  }


  pos() {
    return { x: this.x, y: this.y};
  }

  moveTo(point) {
    this.x = point.x;
    this.y = point.y;
    this.shape.x = this.x;
    this.shape.y = this.y;
  }
}
