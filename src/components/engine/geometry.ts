import { Direction, LaneType } from '../models/types';

export const CANVAS_WIDTH = 720;
export const CANVAS_HEIGHT = 720;

export const CENTER_X = CANVAS_WIDTH / 2;
export const CENTER_Y = CANVAS_HEIGHT / 2;

export const LANE_WIDTH = 24;
export const LANES_PER_APPROACH = 4;
export const ROAD_WIDTH = LANE_WIDTH * LANES_PER_APPROACH * 2;
export const STOP_DISTANCE = ROAD_WIDTH / 2 + 8;
export const CAR_LENGTH = 18;
export const CAR_WIDTH = 12;

export const DIRECTIONS = [
  Direction.NORTH,
  Direction.SOUTH,
  Direction.EAST,
  Direction.WEST,
];

export const APPROACH_AXIS: Record<Direction, 'NS' | 'EW'> = {
  [Direction.NORTH]: 'NS',
  [Direction.SOUTH]: 'NS',
  [Direction.EAST]: 'EW',
  [Direction.WEST]: 'EW',
};

const laneOffsets: Record<LaneType, number> = {
  [LaneType.LEFT]: -36,
  [LaneType.STRAIGHT_INNER]: -12,
  [LaneType.STRAIGHT_OUTER]: 12,
  [LaneType.RIGHT]: 36,
};

export function laneCenter(direction: Direction, type: LaneType) {
  const offset = laneOffsets[type];

  switch (direction) {
    case Direction.NORTH:
      return { x: CENTER_X + offset, y: -CAR_LENGTH };
    case Direction.SOUTH:
      return { x: CENTER_X - offset, y: CANVAS_HEIGHT + CAR_LENGTH };
    case Direction.EAST:
      return { x: CANVAS_WIDTH + CAR_LENGTH, y: CENTER_Y + offset };
    case Direction.WEST:
      return { x: -CAR_LENGTH, y: CENTER_Y - offset };
  }
}

export function stopLineFor(direction: Direction, type: LaneType) {
  const offset = laneOffsets[type];

  switch (direction) {
    case Direction.NORTH:
      return { x: CENTER_X + offset, y: CENTER_Y - STOP_DISTANCE };
    case Direction.SOUTH:
      return { x: CENTER_X - offset, y: CENTER_Y + STOP_DISTANCE };
    case Direction.EAST:
      return { x: CENTER_X + STOP_DISTANCE, y: CENTER_Y + offset };
    case Direction.WEST:
      return { x: CENTER_X - STOP_DISTANCE, y: CENTER_Y - offset };
  }
}

export function hasPassedStopLine(
  direction: Direction,
  value: { x: number; y: number }
) {
  switch (direction) {
    case Direction.NORTH:
      return value.y > CENTER_Y - STOP_DISTANCE + 4;
    case Direction.SOUTH:
      return value.y < CENTER_Y + STOP_DISTANCE - 4;
    case Direction.EAST:
      return value.x < CENTER_X + STOP_DISTANCE - 4;
    case Direction.WEST:
      return value.x > CENTER_X - STOP_DISTANCE + 4;
  }
}

export function isBeforeStopLine(
  direction: Direction,
  value: { x: number; y: number }
) {
  return !hasPassedStopLine(direction, value);
}

export function directionVector(direction: Direction) {
  switch (direction) {
    case Direction.NORTH:
      return { x: 0, y: 1 };
    case Direction.SOUTH:
      return { x: 0, y: -1 };
    case Direction.EAST:
      return { x: -1, y: 0 };
    case Direction.WEST:
      return { x: 1, y: 0 };
  }
}

export function oppositeDirection(direction: Direction) {
  switch (direction) {
    case Direction.NORTH:
      return Direction.SOUTH;
    case Direction.SOUTH:
      return Direction.NORTH;
    case Direction.EAST:
      return Direction.WEST;
    case Direction.WEST:
      return Direction.EAST;
  }
}
