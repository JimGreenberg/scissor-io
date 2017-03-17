import Scissor from './scissor.js';
export default class Player extends Scissor {
  constructor(pointer, arena) {
    super(pointer);
    this.sprite.x = 500;
    this.sprite.y = 300;
    this.arena = arena;
  }

  moveSprite() {
    //move the arena around the player
    this.arena.x -= this.vx;
    this.arena.y -= this.vy;
    super.moveSprite.call(this);
  }

  dash(stage) {
    super.dash();
    if (this.cooldown) {return;}
    let cdRing = new createjs.Shape().set({x: 500, y:300});
    cdRing.graphics.beginStroke('rgba(35, 193, 84,0.4)')
      .setStrokeStyle(15).arc(0,0,100,-Math.PI/2,-Math.PI/2);
    stage.addChild(cdRing);
    createjs.Tween.get(cdRing.graphics.command)
      .to({endAngle: (3/2) * Math.PI}, 1500)
      .call(() => stage.removeChild(cdRing));
  }

}
