import { Canvas } from './components/Canvas';
import { TrafficController } from './components/engine/trafficController';
import { PHASE_LABELS } from './components/engine/phases';
import { useSimulation } from './components/hooks/useSimulation';
import { Direction, LaneType } from './components/models/types';

const controller = new TrafficController();

const approaches = [
  Direction.NORTH,
  Direction.SOUTH,
  Direction.EAST,
  Direction.WEST,
];

export default function App() {
  const { lanes, phase, pedestrianRequested, requestPedestrianCrossing } =
    useSimulation(controller);

  const totalCars = lanes.reduce((sum, lane) => sum + lane.cars.length, 0);
  const activeSensors = lanes.filter((lane) => lane.sensorActive).length;

  return (
    <main className='appShell'>
      <section className='controlPanel' aria-label='Traffic controls'>
        <div>
          <p className='eyebrow'>Traffic signal lab</p>
          <h1>Four-way intersection</h1>
        </div>

        <div className='phaseCard'>
          <span>Current phase</span>
          <strong>{PHASE_LABELS[phase]}</strong>
        </div>

        <div className='statsGrid'>
          <Stat label='Cars in system' value={totalCars} />
          <Stat label='Active sensors' value={activeSensors} />
          <Stat label='Open lanes' value={lanes.length} />
        </div>

        <button
          className='walkButton'
          type='button'
          onClick={requestPedestrianCrossing}
          disabled={pedestrianRequested}
        >
          {pedestrianRequested ? 'Walk requested' : 'Press walk'}
        </button>

        <div className='legend'>
          <LegendDot color='#38bdf8' label='Left turn' />
          <LegendDot color='#a78bfa' label='Straight' />
          <LegendDot color='#f97316' label='Right turn' />
        </div>
      </section>

      <Canvas lanes={lanes} phase={phase} />

      <section className='approachPanel' aria-label='Approach sensors'>
        {approaches.map((direction) => {
          const approachLanes = lanes.filter(
            (lane) => lane.direction === direction
          );

          return (
            <article className='approach' key={direction}>
              <div>
                <h2>{titleCase(direction)}</h2>
                <p>
                  {approachLanes.reduce(
                    (sum, lane) => sum + lane.cars.length,
                    0
                  )}{' '}
                  cars
                </p>
              </div>

              <div className='laneRows'>
                {approachLanes.map((lane) => (
                  <div className='laneRow' key={lane.id}>
                    <span>{laneLabel(lane.type)}</span>
                    <span
                      className={lane.sensorActive ? 'sensor on' : 'sensor'}
                    >
                      {lane.sensorActive ? 'waiting' : 'clear'}
                    </span>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className='stat'>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className='legendItem'>
      <span style={{ backgroundColor: color }} />
      {label}
    </div>
  );
}

function titleCase(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

function laneLabel(type: LaneType) {
  switch (type) {
    case LaneType.LEFT:
      return 'Left';
    case LaneType.STRAIGHT_INNER:
      return 'Straight 1';
    case LaneType.STRAIGHT_OUTER:
      return 'Straight 2';
    case LaneType.RIGHT:
      return 'Right';
  }
}
