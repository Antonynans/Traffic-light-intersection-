import { Lane } from '../models/Lane';
import { Car } from '../models/Cars';
import { hasPassedStopLine, stopLineFor } from './geometry';
import { canLaneMove } from './canLaneMove';
import { TrafficPhase } from './phases';
import { Direction } from '../models/types';

export function shouldStopCar(
  car: Car,
  lane: Lane,
  phase: TrafficPhase,
  lanes: Lane[],
  leadCar?: Car
) {
  if (leadCar && gapBetween(lane, car, leadCar) < 28) return true;
  if (hasPassedStopLine(car.direction, car)) return false;
  if (canLaneMove(lane, phase, lanes)) return false;

  const stop = stopLineFor(car.direction, lane.type);

  switch (car.direction) {
    case Direction.NORTH:
      return car.y + car.speed >= stop.y;
    case Direction.SOUTH:
      return car.y - car.speed <= stop.y;
    case Direction.EAST:
      return car.x - car.speed <= stop.x;
    case Direction.WEST:
      return car.x + car.speed >= stop.x;
  }
}

function gapBetween(lane: Lane, car: Car, leadCar: Car) {
  switch (lane.direction) {
    case Direction.NORTH:
      return leadCar.y - car.y;
    case Direction.SOUTH:
      return car.y - leadCar.y;
    case Direction.EAST:
      return car.x - leadCar.x;
    case Direction.WEST:
      return leadCar.x - car.x;
  }
}
