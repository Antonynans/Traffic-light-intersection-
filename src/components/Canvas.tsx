import { useEffect, useRef } from 'react';
import { Lane } from './models/Lane';
import { Direction, LaneType, LightColor } from './models/types';
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  CAR_LENGTH,
  CAR_WIDTH,
  CENTER_X,
  CENTER_Y,
  LANE_WIDTH,
  ROAD_WIDTH,
  STOP_DISTANCE,
  stopLineFor,
} from './engine/geometry';
import { TrafficPhase } from './engine/phases';

interface Props {
  lanes: Lane[];
  phase: TrafficPhase;
}

export function Canvas({ lanes, phase }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = CANVAS_WIDTH * pixelRatio;
    canvas.height = CANVAS_HEIGHT * pixelRatio;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    drawScene(ctx, lanes, phase);
  }, [lanes, phase]);

  return (
    <div className='canvasShell'>
      <canvas ref={canvasRef} aria-label='Traffic intersection simulation' />
    </div>
  );
}

function drawScene(
  ctx: CanvasRenderingContext2D,
  lanes: Lane[],
  phase: TrafficPhase
) {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  drawBackground(ctx);
  drawRoads(ctx);
  drawLaneMarkers(ctx);
  drawCrosswalks(ctx);
  drawStopLines(ctx);
  drawSignals(ctx, phase);
  drawCars(ctx, lanes);
  drawLabels(ctx);
}

function drawBackground(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#dce8df';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.fillStyle = '#c7ddcd';
  ctx.fillRect(0, 0, CENTER_X - ROAD_WIDTH / 2, CENTER_Y - ROAD_WIDTH / 2);
  ctx.fillRect(
    CENTER_X + ROAD_WIDTH / 2,
    0,
    CANVAS_WIDTH,
    CENTER_Y - ROAD_WIDTH / 2
  );
  ctx.fillRect(
    0,
    CENTER_Y + ROAD_WIDTH / 2,
    CENTER_X - ROAD_WIDTH / 2,
    CANVAS_HEIGHT
  );
  ctx.fillRect(
    CENTER_X + ROAD_WIDTH / 2,
    CENTER_Y + ROAD_WIDTH / 2,
    CANVAS_WIDTH,
    CANVAS_HEIGHT
  );
}

function drawRoads(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#263238';
  ctx.fillRect(CENTER_X - ROAD_WIDTH / 2, 0, ROAD_WIDTH, CANVAS_HEIGHT);
  ctx.fillRect(0, CENTER_Y - ROAD_WIDTH / 2, CANVAS_WIDTH, ROAD_WIDTH);

  ctx.fillStyle = '#304047';
  ctx.fillRect(
    CENTER_X - ROAD_WIDTH / 2,
    CENTER_Y - ROAD_WIDTH / 2,
    ROAD_WIDTH,
    ROAD_WIDTH
  );
}

function drawLaneMarkers(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 2;
  ctx.setLineDash([18, 16]);

  for (let i = -3; i <= 3; i += 1) {
    if (i === 0) continue;
    const offset = i * LANE_WIDTH;
    line(
      ctx,
      CENTER_X + offset,
      0,
      CENTER_X + offset,
      CENTER_Y - ROAD_WIDTH / 2
    );
    line(
      ctx,
      CENTER_X + offset,
      CENTER_Y + ROAD_WIDTH / 2,
      CENTER_X + offset,
      CANVAS_HEIGHT
    );
    line(
      ctx,
      0,
      CENTER_Y + offset,
      CENTER_X - ROAD_WIDTH / 2,
      CENTER_Y + offset
    );
    line(
      ctx,
      CENTER_X + ROAD_WIDTH / 2,
      CENTER_Y + offset,
      CANVAS_WIDTH,
      CENTER_Y + offset
    );
  }

  ctx.setLineDash([]);
  ctx.strokeStyle = '#f6d76b';
  ctx.lineWidth = 3;
  line(ctx, CENTER_X, 0, CENTER_X, CENTER_Y - ROAD_WIDTH / 2);
  line(ctx, CENTER_X, CENTER_Y + ROAD_WIDTH / 2, CENTER_X, CANVAS_HEIGHT);
  line(ctx, 0, CENTER_Y, CENTER_X - ROAD_WIDTH / 2, CENTER_Y);
  line(ctx, CENTER_X + ROAD_WIDTH / 2, CENTER_Y, CANVAS_WIDTH, CENTER_Y);
}

function drawCrosswalks(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  for (let i = 0; i < 8; i += 1) {
    const offset = -ROAD_WIDTH / 2 + i * 24 + 6;
    ctx.fillRect(CENTER_X + offset, CENTER_Y - STOP_DISTANCE - 22, 12, 16);
    ctx.fillRect(CENTER_X + offset, CENTER_Y + STOP_DISTANCE + 6, 12, 16);
    ctx.fillRect(CENTER_X - STOP_DISTANCE - 22, CENTER_Y + offset, 16, 12);
    ctx.fillRect(CENTER_X + STOP_DISTANCE + 6, CENTER_Y + offset, 16, 12);
  }
}

function drawStopLines(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = '#f7fafc';
  ctx.lineWidth = 4;

  Object.values(Direction).forEach((direction) => {
    const leftStop = stopLineFor(direction, LaneType.LEFT);
    const rightStop = stopLineFor(direction, LaneType.RIGHT);

    if (direction === Direction.NORTH || direction === Direction.SOUTH) {
      line(ctx, leftStop.x - 14, leftStop.y, rightStop.x + 14, rightStop.y);
    } else {
      line(ctx, leftStop.x, leftStop.y - 14, rightStop.x, rightStop.y + 14);
    }
  });
}

function drawSignals(ctx: CanvasRenderingContext2D, phase: TrafficPhase) {
  const signals = [
    { direction: Direction.NORTH, x: CENTER_X - 92, y: CENTER_Y - 138 },
    { direction: Direction.SOUTH, x: CENTER_X + 92, y: CENTER_Y + 138 },
    { direction: Direction.EAST, x: CENTER_X + 138, y: CENTER_Y - 92 },
    { direction: Direction.WEST, x: CENTER_X - 138, y: CENTER_Y + 92 },
  ];

  signals.forEach(({ direction, x, y }) => {
    drawSignalHead(
      ctx,
      x,
      y,
      mainLightFor(direction, phase),
      leftLightFor(direction, phase)
    );
  });
}

function drawSignalHead(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  main: LightColor,
  left: LightColor
) {
  ctx.fillStyle = '#111827';
  roundRect(ctx, x - 18, y - 28, 36, 56, 8);
  ctx.fill();

  drawBulb(ctx, x - 8, y - 10, left, true);
  drawBulb(ctx, x + 8, y + 10, main);
}

function drawBulb(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: LightColor,
  isLeft = false
) {
  const fill =
    color === LightColor.GREEN
      ? '#22c55e'
      : color === LightColor.YELLOW
        ? '#facc15'
        : color === LightColor.FLASHING_ORANGE
          ? '#fb923c'
          : '#ef4444';

  ctx.beginPath();
  ctx.arc(x, y, 7, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();

  if (isLeft) {
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 8px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('L', x, y + 3);
  }
}

function drawCars(ctx: CanvasRenderingContext2D, lanes: Lane[]) {
  lanes.forEach((lane) => {
    lane.cars.forEach((car) => {
      ctx.save();
      ctx.translate(car.x, car.y);

      if (
        car.direction === Direction.EAST ||
        car.direction === Direction.WEST
      ) {
        ctx.rotate(Math.PI / 2);
      }

      ctx.fillStyle = carColor(lane.type);
      roundRect(ctx, -CAR_WIDTH / 2, -CAR_LENGTH / 2, CAR_WIDTH, CAR_LENGTH, 3);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillRect(-4, -5, 8, 4);
      ctx.restore();
    });
  });
}

function drawLabels(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
  ctx.font = '700 13px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('NORTH', CENTER_X, 28);
  ctx.fillText('SOUTH', CENTER_X, CANVAS_HEIGHT - 20);
  ctx.fillText('WEST', 34, CENTER_Y - 10);
  ctx.fillText('EAST', CANVAS_WIDTH - 34, CENTER_Y - 10);
}

function mainLightFor(direction: Direction, phase: TrafficPhase) {
  const isNS = direction === Direction.NORTH || direction === Direction.SOUTH;

  if (phase === TrafficPhase.PEDESTRIAN) return LightColor.RED;
  if (isNS && phase === TrafficPhase.NS_STRAIGHT) return LightColor.GREEN;
  if (isNS && phase === TrafficPhase.NS_YELLOW) return LightColor.YELLOW;
  if (!isNS && phase === TrafficPhase.EW_STRAIGHT) return LightColor.GREEN;
  if (!isNS && phase === TrafficPhase.EW_YELLOW) return LightColor.YELLOW;

  return LightColor.RED;
}

function leftLightFor(direction: Direction, phase: TrafficPhase) {
  const isNS = direction === Direction.NORTH || direction === Direction.SOUTH;

  if (phase === TrafficPhase.PEDESTRIAN) return LightColor.RED;
  if (isNS && phase === TrafficPhase.NS_LEFT) return LightColor.GREEN;
  if (!isNS && phase === TrafficPhase.EW_LEFT) return LightColor.GREEN;
  if (isNS && phase === TrafficPhase.NS_STRAIGHT)
    return LightColor.FLASHING_ORANGE;
  if (!isNS && phase === TrafficPhase.EW_STRAIGHT)
    return LightColor.FLASHING_ORANGE;

  return LightColor.RED;
}

function carColor(type: LaneType) {
  if (type === LaneType.LEFT) return '#38bdf8';
  if (type === LaneType.RIGHT) return '#f97316';
  return '#a78bfa';
}

function line(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
