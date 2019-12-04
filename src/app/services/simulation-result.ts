import { indexOf } from "lodash";

export class SimSnapshot {
  timestamp: number;
  points: number[][];
  constructor(ts: number, points: number[][]) {
    (this.timestamp = ts), (this.points = points);
  }
}

export class SimulationResult {
  snapshots: SimSnapshot[];
  timeStart: number;
  constructor(simSnapshot: SimSnapshot[], timeStart: number) {
    this.snapshots = simSnapshot;
    this.timeStart = timeStart;
  }
}

export class SimulationStart {
  timeoftheday: number;
  weekday: string; // from ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  constructor(hour: number, weekday?: string) {
    if (weekday) {
      this.timeoftheday = hour;
      this.weekday = weekday;
    } else {
      if (hour < 24 * 7 && hour > 0) {
        let daysoftheweek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        this.weekday = daysoftheweek[Math.floor(hour / 24)];
        this.timeoftheday = hour % 24;
      } else {
        Error("invalid time of the week");
      }
    }
  }
  getabsolutehours() {
    let dayoftheweekHours = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    let hourvalueday = indexOf(dayoftheweekHours, this.weekday) * 24;
    return hourvalueday + this.timeoftheday;
  }
}
