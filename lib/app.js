import 'yuki-createjs';
const WIDTH = 2000;
const HEIGHT = 1200;

class Scissor {
  constructor(pointer) {
    this.x = Math.random() * WIDTH;
    this.y = Math.random() * HEIGHT;
    this.vx = 0;
    this.vy = 0;
    this.dashing = false;
    this.cooldown = false;
    this.sprite = new createjs.Container();
    this.regAnim = this.sprite.addChild(regAnim.clone());
    this.pointer = pointer;
  }

  die() {
    console.log('dead');
  }

  dash() {
    if (this.cooldown) {return;}
    this.dashing = true;
    this.cooldown = true;
    this.sprite.removeChild(this.regAnim);
    this.sprite.addChild(this.cutAnim);
    setTimeout(() => {
      this.dashing = false;
      this.sprite.removeChild(this.cutAnim);
      this.sprite.addChild(this.regAnim);
    }, 200);
    setTimeout(() => {this.cooldown = false;console.log('ready');}, 1500);
  }

  updatePostition() {
    let turnRate = this.cooldown? 2 : 3;
    let theta = Math.atan2((this.pointer().y - this.sprite.y), (this.pointer().x - this.sprite.x)) * 180 / Math.PI;
    theta = (theta + 90) % 360;
    let spriteTheta = (this.sprite.rotation + 360) % 360;
    if (Math.floor(spriteTheta / 18) !== Math.floor((theta + 360) % 360 / 18)) {
      spriteTheta += (spriteTheta - theta + 360) % 360 > 180 ? turnRate : -turnRate;
    }
    this.sprite.rotation = spriteTheta;

    this.vx = Math.sin(this.sprite.rotation * Math.PI / 180);
    this.vy = -Math.cos(this.sprite.rotation * Math.PI / 180);
    let vBonus = this.dashing ? 30 : 3;
    vBonus *= this.cooldown ? 0.5 : 1
    this.vx *= vBonus;
    this.vy *= vBonus;

    if (this.x > WIDTH - 25) {
      this.die();
    }
    if (this.y > HEIGHT - 25) {
      this.die();
    }
    if (this.x < 25) {
      this.die();
    }
    if (this.y < 25) {
      this.die();
    }

    this.x += this.vx;
    this.y += this.vy;
  }
}

class Player extends Scissor {
  constructor(pointer = () => ({x: stage.mouseX, y: stage.mouseY})) {
    super(pointer);
    this.sprite.x = 500;
    this.sprite.y = 300;
    stage.addChild(this.sprite)
  }
}

class Enemy extends Scissor {
  constructor(pointer = () => player) {
    super(pointer);
    this.handicap();
    this.pointer = () => ({
      x: player.x + this.handicapX,
      y: player.y + this.handicapY
    });
    setInterval(this.handicap.bind(this), Math.random() * 3000);
    arena.addChild(this.sprite)

  }

  handicap() {
    this.handicapX = (Math.random() - 0.5) * 300;
    this.handicapY = (Math.random() - 0.5) * 300;
    if (Math.random() < 0.20) {
      this.dash();
    }
  }

  updatePostition() {
    super.updatePostition();
  }
}

window.init = () => {
  const ctx = document.getElementById('ctx');
  window.stage = new createjs.Stage(ctx);
  window.arena = new createjs.Container();
  const background = new createjs.Shape();
  background.graphics.beginRadialGradientFill(["#888", "#333"], [0, 1], WIDTH / 2, HEIGHT / 2, 0,WIDTH / 2, HEIGHT / 2, 1000).drawRect(0, 0, WIDTH, HEIGHT);
  arena.addChild(background);
  stage.addChild(arena);
  arena.setBounds(0, 0, WIDTH, HEIGHT);
  stage.mouseEventsEnabled = true;
  stage.keyboardEventsEnabled = true;
  createjs.Ticker.framerate = 60;
  createjs.Ticker.addEventListener(stage);

  addGame();
};

const addGame = () => {
  const spritedata = {
    images: ['./img/basicscissor.png'],
    frames: {width: 425, height: 425, regX: 190, regY: 150, count: 4},
    framerate: 30,
    animations: {cut: [0, 1, 2, 3, 2, 1, 0], reg: 0 }
  };
  window.spriteSheet = new createjs.SpriteSheet(spritedata);
  window.regAnim = new createjs.Sprite(spriteSheet, 'reg');
  window.cutAnim = new createjs.Sprite(spriteSheet, 'cut');
  regAnim.scaleX = 0.2;
  regAnim.scaleY = 0.2;
  cutAnim.scaleX = 0.2;
  cutAnim.scaleY = 0.2;

    window.swordBox = new createjs.Shape();
    swordBox.graphics.beginFill("yellow").drawCircle(100,-120,15).drawCircle(-100, -120, 15);
    window.handBox = new createjs.Shape();
    handBox.graphics.beginFill("BurlyWood").drawCircle(0, 250, 125);

  window.player = new Player();
  arena.x = -player.x + 500;
  arena.y = -player.y + 300;
  window.enemy = new Enemy();

  stage.on('click', e => {
    player.dash();
  });
  document.onkeydown = e => {
    if (e.keyCode === 32) {player.dash();}
  };


  // sprite.addChild(regAnim);
  //   sprite.addChild(swordBox);
  //   sprite.addChild(handBox);

  stage.update();
  startGame();
};

const startGame = () => {
  createjs.Ticker.on('tick', update);
};

const update = (e) => {
  if (stage.mouseInBounds) {
  player.updatePostition();
    arena.x -= player.vx;
    arena.y -= player.vy;
  enemy.updatePostition();
    enemy.sprite.x = enemy.x;
    enemy.sprite.y = enemy.y;
  // enemySprite.alpha = 1;
  // let lHit = sprite.localToLocal(100, -120, enemySprite);
  // let rHit = sprite.localToLocal(-100, -120, enemySprite);
  // if (enemySprite.hitTest(lHit.x, lHit.y) || enemySprite.hitTest(rHit.x, rHit.y)) {enemySprite.alpha = 0.5};
  stage.update(e);
}
};
