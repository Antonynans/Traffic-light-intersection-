import { Lane } from '../models/Lane';
import { Direction, LaneType, LightColor } from '../models/types';
import { APPROACH_AXIS } from './geometry';
import { TrafficPhase } from './phases';

interface PhaseConfig {
  duration: number;
  minDuration: number;
  next: TrafficPhase;
}

export const PHASE_CONFIG: Record<TrafficPhase, PhaseConfig> = {
  [TrafficPhase.NS_STRAIGHT]: {
    duration: 9000,
    minDuration: 4500,
    next: TrafficPhase.NS_YELLOW,
  },
  [TrafficPhase.NS_YELLOW]: {
    duration: 2500,
    minDuration: 2500,
    next: TrafficPhase.NS_LEFT,
  },
  [TrafficPhase.NS_LEFT]: {
    duration: 5500,
    minDuration: 2500,
    next: TrafficPhase.EW_STRAIGHT,
  },
  [TrafficPhase.EW_STRAIGHT]: {
    duration: 9000,
    minDuration: 4500,
    next: TrafficPhase.EW_YELLOW,
  },
  [TrafficPhase.EW_YELLOW]: {
    duration: 2500,
    minDuration: 2500,
    next: TrafficPhase.EW_LEFT,
  },
  [TrafficPhase.EW_LEFT]: {
    duration: 5500,
    minDuration: 2500,
    next: TrafficPhase.NS_STRAIGHT,
  },
  [TrafficPhase.PEDESTRIAN]: {
    duration: 6500,
    minDuration: 6500,
    next: TrafficPhase.NS_STRAIGHT,
  },
};

export class TrafficController {
  currentPhase = TrafficPhase.NS_STRAIGHT;

  phaseStartedAt = Date.now();

  pedestrianRequested = false;

  update(lanes: Lane[]) {
    const config = PHASE_CONFIG[this.currentPhase];
    const elapsed = Date.now() - this.phaseStartedAt;

    if (this.currentPhase === TrafficPhase.PEDESTRIAN) {
      if (elapsed >= config.duration) {
        this.pedestrianRequested = false;
        this.changePhase(TrafficPhase.NS_STRAIGHT);
      }
      return;
    }

    if (this.pedestrianRequested && elapsed >= config.minDuration) {
      this.changePhase(TrafficPhase.PEDESTRIAN);
      return;
    }

    if (elapsed < config.minDuration) return;

    const shouldSkipProtectedLeft =
      (this.currentPhase === TrafficPhase.NS_LEFT &&
        !hasWaitingLeft(lanes, 'NS')) ||
      (this.currentPhase === TrafficPhase.EW_LEFT &&
        !hasWaitingLeft(lanes, 'EW'));

    const hasTimedOut = elapsed >= config.duration;
    const greenHasNoDemand =
      isStraightPhase(this.currentPhase) &&
      !hasWaitingTraffic(lanes, activeAxis(this.currentPhase));

    if (shouldSkipProtectedLeft || hasTimedOut || greenHasNoDemand) {
      this.changePhase(config.next);
    }
  }

  requestPedestrianCrossing() {
    this.pedestrianRequested = true;
  }

  getLightColor(direction: Direction, laneType: LaneType): LightColor {
    if (this.currentPhase === TrafficPhase.PEDESTRIAN) return LightColor.RED;

    const axis = APPROACH_AXIS[direction];
    const isLeft = laneType === LaneType.LEFT;
    const active = activeAxis(this.currentPhase) === axis;

    if (isLeft && active && isLeftPhase(this.currentPhase))
      return LightColor.GREEN;
    if (isLeft && active && isStraightPhase(this.currentPhase)) {
      return LightColor.FLASHING_ORANGE;
    }
    if (!isLeft && active && isStraightPhase(this.currentPhase))
      return LightColor.GREEN;
    if (!isLeft && active && isYellowPhase(this.currentPhase))
      return LightColor.YELLOW;

    return LightColor.RED;
  }

  private changePhase(phase: TrafficPhase) {
    this.currentPhase = phase;
    this.phaseStartedAt = Date.now();
  }
}

function activeAxis(phase: TrafficPhase) {
  if (
    phase === TrafficPhase.NS_STRAIGHT ||
    phase === TrafficPhase.NS_YELLOW ||
    phase === TrafficPhase.NS_LEFT
  ) {
    return 'NS';
  }

  return 'EW';
}

function isStraightPhase(phase: TrafficPhase) {
  return (
    phase === TrafficPhase.NS_STRAIGHT || phase === TrafficPhase.EW_STRAIGHT
  );
}

function isYellowPhase(phase: TrafficPhase) {
  return phase === TrafficPhase.NS_YELLOW || phase === TrafficPhase.EW_YELLOW;
}

function isLeftPhase(phase: TrafficPhase) {
  return phase === TrafficPhase.NS_LEFT || phase === TrafficPhase.EW_LEFT;
}

function hasWaitingTraffic(lanes: Lane[], axis: 'NS' | 'EW') {
  return lanes.some(
    (lane) => APPROACH_AXIS[lane.direction] === axis && lane.sensorActive
  );
}

function hasWaitingLeft(lanes: Lane[], axis: 'NS' | 'EW') {
  return lanes.some(
    (lane) =>
      APPROACH_AXIS[lane.direction] === axis &&
      lane.type === LaneType.LEFT &&
      lane.sensorActive
  );
}
