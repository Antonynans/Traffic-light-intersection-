export enum TrafficPhase {
  NS_STRAIGHT,
  NS_YELLOW,
  NS_LEFT,

  EW_STRAIGHT,
  EW_YELLOW,
  EW_LEFT,

  PEDESTRIAN,
}

export const PHASE_LABELS: Record<TrafficPhase, string> = {
  [TrafficPhase.NS_STRAIGHT]: 'North/South main green',
  [TrafficPhase.NS_YELLOW]: 'North/South yellow',
  [TrafficPhase.NS_LEFT]: 'North/South protected left',
  [TrafficPhase.EW_STRAIGHT]: 'East/West main green',
  [TrafficPhase.EW_YELLOW]: 'East/West yellow',
  [TrafficPhase.EW_LEFT]: 'East/West protected left',
  [TrafficPhase.PEDESTRIAN]: 'Pedestrian crossing',
};
