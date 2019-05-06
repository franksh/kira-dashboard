import { Injectable, Output, EventEmitter } from "@angular/core";
import { Observable, from } from "rxjs";
import { Http } from "@angular/http";
import { map, switchMap } from "rxjs/operators";

import { SimulationResult } from "./simulation-result";
import { SIMMOCKUP } from "./simulation-result-mockup";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root"
})
export class SimulationDataService {
  simulationresult$: Observable<SimulationResult> = from([SIMMOCKUP]);
  // listts: number[];
  listts$: Observable<number[]>;

  @Output() dataChanged: EventEmitter<boolean> = new EventEmitter();

  // Load mock data
  loadMockData() {
    this.simulationresult$ = from([SIMMOCKUP]);

    let listts: number[] = [];
    for (var i in SIMMOCKUP.snapshots) {
      listts.push(SIMMOCKUP.snapshots[i].timestamp);
    }
    // this.listts = listts;
    this.listts$ = from([listts]);
  }

  // Load actual simulation data
  // stored in assets/data
  loadSimulationData(outbreakLocation = "PPLACE") {
    let dataPath = environment.apiEndpoint + "?name=" + outbreakLocation;
    console.log("Fetching data: ", dataPath);
    let data$ = this.http.get(dataPath);
    // Store simulation snapshots
    this.simulationresult$ = data$.pipe(
      map(response => {
        let simResult = new SimulationResult(response.json());
        return simResult;
      })
    );
    // Store time series
    this.listts$ = data$.pipe(
      switchMap(response => {
        let simResult = new SimulationResult(response.json());
        let listts: number[] = [];
        for (var i in simResult.snapshots) {
          listts.push(simResult.snapshots[i].timestamp);
        }
        // this.listts = listts;
        return from([listts]);
      })
    );
  }

  changeOutbreakLocation(outbreakLocation: string) {
    this.loadSimulationData(outbreakLocation);
    this.dataChanged.emit(true);
  }

  constructor(private http: Http) {
    // this.loadMockData();
    this.loadSimulationData();
  }
}
