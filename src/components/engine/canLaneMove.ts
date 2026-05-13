import { TrafficPhase } from './phases';
import { Lane } from '../models/Lane';
import { Direction, LaneType } from '../models/types';
import {
  APPROACH_AXIS,
  CENTER_X,
  CENTER_Y,
  oppositeDirection,
} from './geometry';

export function canLaneMove(lane: Lane, phase: TrafficPhase, lanes: Lane[]) {
  if (phase === TrafficPhase.PEDESTRIAN) return false;

  const axis = APPROACH_AXIS[lane.direction];

  if (lane.type === LaneType.LEFT) {
    if (phase === TrafficPhase.NS_LEFT) return axis === 'NS';
    if (phase === TrafficPhase.EW_LEFT) return axis === 'EW';

    if (phase === TrafficPhase.NS_STRAIGHT && axis === 'NS') {
      return !hasOpposingThroughTraffic(lane.direction, lanes);
    }

    if (phase === TrafficPhase.EW_STRAIGHT && axis === 'EW') {
      return !hasOpposingThroughTraffic(lane.direction, lanes);
    }

    return false;
  }

  if (phase === TrafficPhase.NS_STRAIGHT) return axis === 'NS';
  if (phase === TrafficPhase.EW_STRAIGHT) return axis === 'EW';

  return false;
}

function hasOpposingThroughTraffic(direction: Direction, lanes: Lane[]) {
  const opposite = oppositeDirection(direction);

  return lanes.some(
    (lane) =>
      lane.direction === opposite &&
      lane.type !== LaneType.LEFT &&
      lane.cars.some((car) => {
        const distanceToCenter =
          direction === Direction.NORTH || direction === Direction.SOUTH
            ? Math.abs(car.y - CENTER_Y)
            : Math.abs(car.x - CENTER_X);

        return distanceToCenter < 190;
      })
  );
}
