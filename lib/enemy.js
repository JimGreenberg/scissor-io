import Scissor from './scissor.js';
import {sample} from './util.js';
export default class Enemy extends Scissor {
  constructor(pointer) {
    super(pointer);
    this.handicap();
    setInterval(this.handicap.bind(this), Math.random() * 3000);
    this.target = this.pointer;
    this.pointer = () => ({
        x: (this.target().x * this.attacking) + this.handicapX,
        y: (this.target().y * this.attacking) + this.handicapY
      });
  }

  handicap() {
    this.handicapX = (Math.random() - 0.5) * 500;
    this.handicapY = (Math.random() - 0.5) * 500;
    this.vBonus = Math.abs(this.vBonus);
    this.vBonus *= Math.random() < 0.20 ? -1 : 1; //flee every once in a while
    setTimeout(this.dash(), (Math.random() - 0.5) * 9000);
  }

  getNewTarget() {
    if(this.target.dead) {
      let newTarget = sample(game.players);
      while (newTarget !== this) {
        newTarget = sample(game.players);
      }
      this.target = newTarget;
    }
  }
}
