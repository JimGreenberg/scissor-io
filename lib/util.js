export const toRad = (num) => Math.PI * num / 180;

export const toDeg = (num) => 180 * num / Math.PI;

export const sample = (obj) => {
    var keys = Object.keys(obj);
    return obj[keys[ keys.length * Math.random() << 0]];
};

export const randomColor = () => "#"+((1<<24)*Math.random()|0).toString(16);

export const clean = theta => (theta + 360) % 360;

export const distance = (pos1, pos2) => {
  let delX = Math.pow(pos1.x - pos2.x, 2);
  let delY = Math.pow(pos1.y - pos2.y, 2);
  return Math.sqrt(delX + delY);
};
export const randPlusMinus = (mu, sigma) => ((Math.random() - 0.5) * sigma) + mu;

export const drawDebug = (scissor) => {
  scissor.swordBox = new createjs.Shape();
  scissor.swordBox.graphics.beginFill("red").drawCircle(-2, -34, 17);
  scissor.handBox = new createjs.Shape();
  scissor.handBox.graphics.beginFill("red").drawCircle(-26, 32, 20);
  scissor.handBox.graphics.beginFill("red").drawCircle(26, 32, 20);
  scissor.bodyBox = new createjs.Shape();
  scissor.bodyBox.graphics.beginFill("red").drawCircle(0, 0, 20);
  scissor.handBox.alpha = 0.3;
  scissor.bodyBox.alpha = 0.3;
  scissor.swordBox.alpha = 0.3;
  scissor.sprite.addChild(scissor.swordBox);
  scissor.sprite.addChild(scissor.handBox);
  scissor.sprite.addChild(scissor.bodyBox);
};
