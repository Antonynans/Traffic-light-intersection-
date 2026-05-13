import { Car } from '../models/Cars';
import { Direction } from '../models/types';

export function moveCar(car: Car) {
  switch (car.direction) {
    case Direction.NORTH:
      car.y += car.speed;
      break;

    case Direction.SOUTH:
      car.y -= car.speed;
      break;

    case Direction.EAST:
      car.x -= car.speed;
      break;

    case Direction.WEST:
      car.x += car.speed;
      break;
  }
}
