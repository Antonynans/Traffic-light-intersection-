import { Direction } from './types';

export interface Car {
  id: string;

  x: number;
  y: number;

  speed: number;
  direction: Direction;
}
