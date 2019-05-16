export class SimSnapshot{
  timestamp: number;
  points: number[][];
  constructor(ts: number, points: number[][]) {this.timestamp=ts, this.points=points};
}


export class SimulationResult {
  snapshots: SimSnapshot[];
  constructor(snapshots: SimSnapshot[]) {this.snapshots=snapshots};
}


export class SimulationStart {
	timeoftheday: number
	weekday: string // from ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
	constructor(weekday: string, timeoftheday: number) {
		this.timeoftheday=timeoftheday
		this.weekday=weekday
	};
}