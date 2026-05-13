import { useEffect, useState } from 'react';
import { TrafficController } from '../engine/trafficController';
import { spawnRandomCar } from '../engine/carSpawner';
import { createIntersectionLanes } from '../engine/createIntersection';
import { Lane } from '../models/Lane';
import { updateCars } from '../engine/updateCars';

export function useSimulation(controller: TrafficController) {
  const [lanes, setLanes] = useState<Lane[]>(createIntersectionLanes());

  const [phase, setPhase] = useState(controller.currentPhase);
  const [pedestrianRequested, setPedestrianRequested] = useState(
    controller.pedestrianRequested
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setLanes((prev) => {
        const updated = structuredClone(prev);

        controller.update(updated);
        spawnRandomCar(updated);
        updateCars(updated, controller.currentPhase);

        setPhase(controller.currentPhase);
        setPedestrianRequested(controller.pedestrianRequested);

        return updated;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [controller]);

  function requestPedestrianCrossing() {
    controller.requestPedestrianCrossing();
    setPedestrianRequested(true);
  }

  return {
    phase,
    lanes,
    pedestrianRequested,
    requestPedestrianCrossing,
  };
}
