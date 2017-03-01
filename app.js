// document.onkeydown = e => {
//     if (e.keyCode === 68){//d
//     player.rt = true;
//     }
//     else if (e.keyCode === 83){//s
//       player.dn = true;
//     }
//     else if (e.keyCode === 65){//a
//       player.lf = true;
//     }
//     else if (e.keyCode === 87){//w
//       player.up = true;
//     }
//   };
//
// document.onkeyup = e => {
//     if (e.keyCode === 68){//d
//       player.rt = false;
//     }
//     else if (e.keyCode === 83){//s
//       player.dn = false;
//     }
//     else if (e.keyCode === 65){//a
//       player.lf = false;
//     }
//     else if (e.keyCode === 87){//w
//       player.up = false;
//     }
//   };


class Player {
  constructor(id) {
    this.id = id;
    this.x = 250;
    this.y = 250;
    this.icon = 1;
    this.rt = false;
    this.dn = false;
    this.up = false;
    this.lf = false;
    this.accel = 0.5;
    this.vx = 0;
    this.vy = 0;
    this.theta = 0;
  }

  updatePostition() {
    let newVX = stage.mouseX - this.x;
    let newVY = stage.mouseY - this.y;
    let newV = Math.sqrt(Math.pow(newVX, 2) + Math.pow(newVY, 2))
    this.vx += newVX / newV;
    this.vy += newVY / newV;
    if (newV < 0.2 || !stage.mouseInBounds) {
      this.vx = 0;
      this.vy = 0;
    }

  //   if (this.rt) {
  //     this.vx += this.accel;
  //   }
  //   if (this.lf) {
  //     this.vx -= this.accel;
  //   }
  //   if (this.up) {
  //     this.vy -= this.accel;
  //   }
  //   if (this.dn) {
  //     this.vy += this.accel;
  //   }
    this.x += this.vx;
    this.y += this.vy;
    this.vx = this.vx * 0.8;
    this.vy = this.vy * 0.8;

    if (this.x > 975) {
      this.x = 975;
      this.vx = -this.vx * 0.5;
      this.icon++;
    }
    if (this.y > 575) {
      this.y = 575;
      this.vy = -this.vy * 0.5;
      this.icon++;

    }
    if (this.x < 25) {
      this.x = 25;
      this.vx = -this.vx * 0.5;
      this.icon++;

    }
    if (this.y < 25) {
      this.y = 25;
      this.vy = -this.vy * 0.5;
      this.icon++;

    }
  }
}
const init = () => {
  const ctx = document.getElementById('ctx');
  window.stage = new createjs.Stage(ctx);
  stage.mouseEventsEnabled = true;
  stage.keyboardEventsEnabled = true;
  createjs.Ticker.framerate = 60;
  createjs.Ticker.addEventListener(stage);

  addGame();
};

const addGame = () => {
  window.player = new Player(1);
  window.circle = new createjs.Shape();
  circle.graphics.beginFill("DeepSkyBlue").drawCircle(0, 0, 25);
  circle.x = player.x;
  circle.y = player.y;
  stage.addChild(circle);
  stage.update();
  startGame();
};

const startGame = () => {

  createjs.Ticker.addEventListener('tick', update);
};

const update = () => {
  player.updatePostition();
  circle.x = player.x;
  circle.y = player.y;
  stage.update();
};
