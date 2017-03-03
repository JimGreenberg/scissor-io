import Scissor from './scissor.js';
export default class Player extends Scissor {
  constructor(pointer) {
    super(pointer);
    this.sprite.x = 500;
    this.sprite.y = 300;
  }
}
