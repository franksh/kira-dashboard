export class SimSnapshot{
  timestamp: number;
  points: number[][];
  constructor(ts: number, points: number[][]) {this.timestamp=ts, this.points=points};
}


export class SimulationResult {
  snapshots: SimSnapshot[];
  constructor(snapshots: SimSnapshot[]) {this.snapshots=snapshots};
}