import {randomColor} from './util.js';
import Matter from '../node_modules/matter-js';

export default class Dot {
  constructor(ownerId, anchor, color) {
    const spawn = anchor.position;
    this.ownerId = ownerId;
    this.dot = Matter.Bodies.circle(spawn.x, spawn.y, 10, {
      mass: 0,
      render: {fillStyle: color},
      label: `.${ownerId}`,
      collisionFilter: {group: -ownerId}
    });

    this.chain = Matter.Constraint.create({
      bodyA: this.dot,
      bodyB: anchor,
      length: 80,
      stiffness: 0.2
    });
  }

  changeOwner(id) {
    this.ownerId = id;
    this.dot.label=`.${id}`;
  }

}
