import 'yuki-createjs';
const WIDTH = 2000;
const HEIGHT = 1200;
class Player {
  constructor(id) {
    this.x = Math.random() * WIDTH;
    this.y = Math.random() * HEIGHT;
    arena.x = -this.x + 500;
    arena.y = -this.y + 300;
    this.vx = 0;
    this.vy = 0;
    this.dashing = false;
    this.cooldown = false;
  }

  dash() {
    if (this.cooldown) {return;}
    this.dashing = true;
    this.cooldown = true;
    sprite.removeChild(regAnim);
    sprite.addChild(cutAnim);
    setTimeout(() => {
      this.dashing = false;
      sprite.removeChild(cutAnim);
      sprite.addChild(regAnim);
    }, 200);
    setTimeout(() => {this.cooldown = false;console.log('ready');}, 2000);
  }

  updatePostition() {
    let theta = Math.atan2((stage.mouseY - 300), (stage.mouseX - 500)) * 180 / Math.PI;
    theta = (theta + 90) % 360;
    let spriteTheta = (sprite.rotation + 360) % 360;
    if (Math.floor(spriteTheta / 18) !== Math.floor((theta + 360) % 360 / 18)) {
      spriteTheta += (spriteTheta - theta + 360) % 360 > 180 ? 3 : -3;
    }
    sprite.rotation = spriteTheta;

    this.vx = Math.sin(sprite.rotation * Math.PI / 180);
    this.vy = -Math.cos(sprite.rotation * Math.PI / 180);
    let vBonus = this.dashing ? 15 : 3;
    this.vx *= vBonus;
    this.vy *= vBonus;

    if (this.x > WIDTH - 25) {
      this.x = WIDTH - 25;
      arena.x = -WIDTH/2 - 475;
      this.vx = 0;
    }
    if (this.y > HEIGHT - 25) {
      this.y = HEIGHT - 25;
      arena.y = -HEIGHT/2 - 275;
      this.vy = 0;
    }
    if (this.x < 25) {
      this.x = 25;
      arena.x = WIDTH/2 - 525;
      this.vx = 0;
    }
    if (this.y < 25) {
      this.y = 25;
      arena.y = HEIGHT/2 - 325;
      this.vy = 0;
    }


    if (stage.mouseInBounds) {
      this.x += this.vx;
      this.y += this.vy;
      arena.x -= this.vx;
      arena.y -= this.vy;
    }
  }
}
window.init = () => {
  const ctx = document.getElementById('ctx');
  window.stage = new createjs.Stage(ctx);
  window.arena = new createjs.Container();
  const background = new createjs.Shape();
  background.graphics.beginRadialGradientFill(["#777", "#444"], [0, 1], WIDTH / 2, HEIGHT / 2, 0,WIDTH / 2, HEIGHT / 2, 1000).drawRect(0, 0, WIDTH, HEIGHT);
  arena.addChild(background);
  stage.addChild(arena);
  arena.setBounds(0, 0, 1000, 600);
  stage.mouseEventsEnabled = true;
  stage.keyboardEventsEnabled = true;
  createjs.Ticker.framerate = 60;
  createjs.Ticker.addEventListener(stage);

  addGame();
};

const addGame = () => {
  window.player = new Player(1);
  stage.on('click', e => {
    player.dash();
  });
  document.onkeydown = e => {
    if (e.keyCode === 32) {player.dash();}
  };
  const spritedata = {
    images: ['./img/basicscissor.png'],
    frames: {width: 425, height: 425, regX: 190, regY: 150, count: 4},
    framerate: 30,
    animations: {cut: [0, 1, 2, 3, 2, 1, 0], reg: 0 }
  };
  window.spriteSheet = new createjs.SpriteSheet(spritedata);
  window.sprite = new createjs.Container();
  window.regAnim = new createjs.Sprite(spriteSheet, 'reg');
  window.cutAnim = new createjs.Sprite(spriteSheet, 'cut');
    window.swordBox = new createjs.Shape();
    swordBox.graphics.beginFill("yellow").drawCircle(100,-120,15).drawCircle(-100, -120, 15);
    window.handBox = new createjs.Shape();
    handBox.graphics.beginFill("green").drawRect(-125, 150, 250, 250);
  window.findme = new createjs.Shape();

  stage.enableMouseOver(60);

  findme.graphics.beginFill("Orange").drawCircle(0, 0, 25);

  sprite.x = 500;
  sprite.y = 300;
  sprite.scaleX = 0.2;
  sprite.scaleY = 0.2;
  findme.x = Math.random() * WIDTH;
  findme.y = Math.random() * HEIGHT;


  sprite.addChild(regAnim);
    sprite.addChild(swordBox);
    sprite.addChild(handBox);
  stage.addChild(sprite);
  arena.addChild(findme);
  stage.update();
  startGame();
};

const startGame = () => {

  createjs.Ticker.on('tick', update);
};

const update = (e) => {
  player.updatePostition();
  findme.alpha = 1;
  let lHit = swordBox.localToLocal(100, -120,findme)
  let rHit = swordBox.localToLocal(-100, -120,findme)
  if (findme.hitTest(lHit.x, lHit.y) || findme.hitTest(rHit.x, rHit.y)) { debugger;findme.alpha = 0.5 }
  stage.update(e);
};
