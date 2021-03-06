import { Injectable, Output, EventEmitter } from "@angular/core";
import { Observable, of, Subject, combineLatest } from "rxjs";

import * as _ from "lodash";

import { SimSnapshot, SimulationResult } from "./simulation-result";
import { DisplayTime } from "../display-control/display-time";

@Injectable({
  providedIn: "root"
})
export class DisplayControlService {
  // Observable sources
  private displaytimeSource = new Subject<DisplayTime>();
  private selecteddistrictsSource = new Subject<string[]>();
  private selectedhospitalsSource = new Subject<string[]>();
  private heatmapactiveSource = new Subject<boolean>();
  private choroplethactiveSource = new Subject<boolean>();
  private choroplethmodeSource = new Subject<string>();
  private selectactiveSource = new Subject<boolean>();

  // Observable streams
  displaytime$ = this.displaytimeSource.asObservable();
  selecteddistricts$ = this.selecteddistrictsSource.asObservable();
  selectedhospitals$ = this.selectedhospitalsSource.asObservable();
  heatmapactive$ = this.heatmapactiveSource.asObservable();
  choroplethactive$ = this.choroplethactiveSource.asObservable();
  choroplethmode$ = this.choroplethmodeSource.asObservable();
  selectactive$ = this.selectactiveSource.asObservable();

  changeTime(ts: number): void {
    var time = new DisplayTime(ts);
    this.displaytimeSource.next(time);
  }

  changeSelectedDistricts(districts: string[]): void {
    // make sure we have no dublicates, as a safety measure, a bit hacky
    var uniqdistricts = _.uniq(districts);
    this.selecteddistrictsSource.next(uniqdistricts);
  }

  changeSelectedHospitals(hospitals: string[]): void {
    // make sure we have no dublicates, as a safety measure, a bit hacky
    var uniqhospitals = _.uniq(hospitals);
    this.selectedhospitalsSource.next(uniqhospitals);
  }

  changeHeatmapactive(state: boolean) {
    this.heatmapactiveSource.next(state);
  }
  changeChoroplethactive(state: boolean) {
    this.choroplethactiveSource.next(state);
  }
  changeChoroplethmode(mode) {
    this.choroplethmodeSource.next(mode);
  }
  changeSelectactive(state: boolean) {
    this.selectactiveSource.next(state);
  }

  constructor() {
  }
}
