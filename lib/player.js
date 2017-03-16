import Scissor from './scissor.js';
export default class Player extends Scissor {
  constructor(pointer) {
    super(pointer);
    this.sprite.x = 500;
    this.sprite.y = 300;
  }

  moveSprite() {
    //move the arena around the player
    game.arena.x -= this.vx;
    game.arena.y -= this.vy;
    super.moveSprite.call(this);
  }

  dash() {
    super.dash();
    if (this.cooldown) {return;}
    let cdRing = new createjs.Shape().set({x: 500, y:300});
    cdRing.graphics.beginStroke('rgba(35, 193, 84,0.4)')
      .setStrokeStyle(15).arc(0,0,100,-Math.PI/2,-Math.PI/2);
    game.stage.addChild(cdRing);
    createjs.Tween.get(cdRing.graphics.command)
      .to({endAngle: (3/2) * Math.PI}, 1500)
      .call(() => game.stage.removeChild(cdRing));
  }

}
