import * as _ from './util.js';
import MovingObject from './moving_object.js';

export default class Dot extends MovingObject {
  constructor(pointer, anchor, ownerId, color) {
    super(pointer, anchor);
    this.ownerId = ownerId;
    this.turnRate = 5;
    this.color = color;
    this.sprite = new createjs.Shape();
    this.sprite.graphics.beginFill(color).drawCircle(0, 0, 10);
    this.sprite.cache(-10, -10, 20, 20);
  }

  changeOwner(id, newPointer) {
    let halo = new createjs.Shape().set(this.pos());

    halo.graphics.beginStroke(this.color).setStrokeStyle(3).drawCircle(0, 0, 10);
    game.arena.addChild(halo);

    createjs.Tween.get(halo)
    .to({
      scaleX: 25,
      scaleY: 25,
      alpha: 0
    }, 300)
    .call(() => game.arena.removeChild(halo));

    this.ownerId = id;
    this.pointer = newPointer;
  }

  updatePosition() {
    // this.moveTo({x: this.x + this.vx, y: this.y + this.vy});
    let distance = _.distance(this.pos(), this.pointer());
    if (distance < 50) {
      this.vBonus = 2;
    } else if (distance > 60) {
      this.vBonus = 6;
    } else {
      this.vBonus = 3;
    }
    super.updatePosition.call(this);
  }
  moveSprite() {
    this.sprite.x = this.x;
    this.sprite.y = this.y;
  }
}
