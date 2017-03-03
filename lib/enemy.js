import Scissor from './scissor.js';
export default class Enemy extends Scissor {
  constructor(pointer) {
    super(pointer);
    this.handicap();
    setInterval(this.handicap.bind(this), Math.random() * 3000);
    this.target = this.pointer;
    this.pointer = () => ({
        x: this.target().x + this.handicapX,
        y: this.target().y + this.handicapY
      });
  }

  handicap() {
    this.handicapX = (Math.random() - 0.5) * 500;
    this.handicapY = (Math.random() - 0.5) * 500;
    if (Math.random() < 0.10) {
      this.dash();
    }
  }
}
