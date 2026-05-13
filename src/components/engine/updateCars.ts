import { shouldStopCar } from './shouldStopCar';
import { moveCar } from './moveCar';
import { Lane } from '../models/Lane';
import { TrafficPhase } from './phases';
import { CANVAS_HEIGHT, CANVAS_WIDTH, hasPassedStopLine } from './geometry';
import { Direction } from '../models/types';

export function updateCars(lanes: Lane[], phase: TrafficPhase) {
  lanes.forEach((lane) => {
    const cars = sortApproachQueue(lane);

    cars.forEach((car, index) => {
      const leadCar = cars[index - 1];
      const mustStop = shouldStopCar(car, lane, phase, lanes, leadCar);

      if (!mustStop) {
        moveCar(car);
      }
    });

    lane.cars = lane.cars.filter(
      (car) =>
        car.x > -80 &&
        car.x < CANVAS_WIDTH + 80 &&
        car.y > -80 &&
        car.y < CANVAS_HEIGHT + 80
    );

    lane.sensorActive = lane.cars.some(
      (car) => !hasPassedStopLine(car.direction, car)
    );
  });
}

function sortApproachQueue(lane: Lane) {
  return [...lane.cars].sort((a, b) => {
    switch (lane.direction) {
      case Direction.NORTH:
        return b.y - a.y;
      case Direction.SOUTH:
        return a.y - b.y;
      case Direction.EAST:
        return a.x - b.x;
      case Direction.WEST:
        return b.x - a.x;
    }
  });
}
