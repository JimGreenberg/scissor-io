export default class Modal {
  constructor(action) {
    this.shape = new createjs.Shape();
    this.shape.graphics.beginFill("#333").drawRect(100, 100, 1100, 500);
    this.action = action;
  }
}
