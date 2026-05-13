import { CANVAS_HEIGHT, CANVAS_WIDTH, laneCenter } from './geometry';
import { Car } from '../models/Cars';
import { Lane } from '../models/Lane';
import { Direction } from '../models/types';

export function spawnRandomCar(lanes: Lane[]) {
  if (Math.random() > 0.72) return;

  const lane = lanes[Math.floor(Math.random() * lanes.length)];
  if (!lane) return;

  const spawn = laneCenter(lane.direction, lane.type);

  const car: Car = {
    id: crypto.randomUUID(),
    x: spawn.x,
    y: spawn.y,
    speed: 3,
    direction: lane.direction,
  };

  const lastCar = lane.cars[lane.cars.length - 1];
  if (lastCar && distanceAlongApproach(lane, lastCar) < 42) return;

  lane.cars.push(car);
}

function distanceAlongApproach(lane: Lane, car: Car) {
  switch (lane.direction) {
    case Direction.NORTH:
      return car.y;
    case Direction.SOUTH:
      return CANVAS_HEIGHT - car.y;
    case Direction.EAST:
      return CANVAS_WIDTH - car.x;
    case Direction.WEST:
      return car.x;
  }
}
