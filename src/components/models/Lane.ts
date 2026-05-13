import { Car } from './Cars';
import { Direction, LaneType } from './types';

export interface Lane {
  id: string;

  direction: Direction;

  type: LaneType;

  cars: Car[];

  sensorActive: boolean;
}
