import Scissor from './scissor.js';
import * as _ from './util.js';
export default class Enemy extends Scissor {
  constructor(pointer) {
    super(pointer);
    this.handicap();
    setInterval(this.handicap.bind(this), _.randPlusMinus(3000, 1000));
    this.target = this.pointer;
    this.pointer = () => ({
        x: (this.target.x ) + this.handicapX,
        y: (this.target.y ) + this.handicapY
      });
  }

  handicap() {
    this.handicapX = _.randPlusMinus(0, 500);
    this.handicapY = _.randPlusMinus(0, 500);
    this.vBonus = Math.abs(this.vBonus);
    this.vBonus *= Math.random() < 0.20 ? -1 : 1; //flee every once in a while
    setTimeout(this.dash(),  _.randPlusMinus(5000,4000));
  }

  moveSprite() {
    super.moveSprite.call(this);
    this.sprite.x = this.x;
    this.sprite.y = this.y;
  }

  getNewTarget() {
    if(this.target.dead) {
      let newTarget = _.sample(game.players);
      while (newTarget !== this) {
        newTarget = _.sample(game.players);
      }
      this.target = newTarget;
    }
  }
}
