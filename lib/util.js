export const toRad = (num) => Math.PI * num / 180;
export const toDeg = (num) => 180 * num / Math.PI;
export const sample = (obj) => {
    var keys = Object.keys(obj);
    return obj[keys[ keys.length * Math.random() << 0]];
};
export const randomColor = () => "#"+((1<<24)*Math.random()|0).toString(16);
export const drawDebug = (scissor) => {
  scissor.swordBox = new createjs.Shape();
  scissor.swordBox.graphics.beginFill("yellow").drawCircle(0, -28, 25);
  scissor.handBox = new createjs.Shape();
  scissor.handBox.graphics.beginFill("yellow").drawCircle(-26, 32, 20);
  scissor.handBox.graphics.beginFill("yellow").drawCircle(26, 32, 20);
  scissor.handBox.alpha = 0.3;
  scissor.swordBox.alpha = 0.3;
  scissor.sprite.addChild(scissor.swordBox);
  scissor.sprite.addChild(scissor.handBox);
};
export const clean = theta => (theta + 360) % 360;
