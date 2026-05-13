import { Direction, LaneType } from '../models/types';
import { Lane } from '../models/Lane';
import { DIRECTIONS } from './geometry';

export function createIntersectionLanes(): Lane[] {
  const lanes: Lane[] = [];

  const laneTypes = [
    LaneType.LEFT,
    LaneType.STRAIGHT_INNER,
    LaneType.STRAIGHT_OUTER,
    LaneType.RIGHT,
  ];

  DIRECTIONS.forEach((direction: Direction) => {
    laneTypes.forEach((type) => {
      lanes.push({
        id: `${direction}-${type}`,

        direction,

        type,

        cars: [],

        sensorActive: false,
      });
    });
  });

  return lanes;
}
