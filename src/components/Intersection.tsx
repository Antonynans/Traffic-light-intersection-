import { PHASE_LABELS, TrafficPhase } from './engine/phases';

export function Intersection({ phase }: { phase: TrafficPhase }) {
  return (
    <div className='intersection'>
      <h2>Current Phase</h2>

      <div>{PHASE_LABELS[phase]}</div>
    </div>
  );
}
