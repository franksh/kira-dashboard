import { Injectable } from "@angular/core";
import { Observable, from } from "rxjs";
import { Http } from "@angular/http";
import { map } from "rxjs/operators";

import { SimulationResult } from "./simulation-result";
import { SIMMOCKUP } from "./simulation-result-mockup";

@Injectable({
  providedIn: "root"
})
export class SimulationDataService {
  simulationresult$: Observable<SimulationResult> = from([SIMMOCKUP]);
  listts: number[];
  listts$: Observable<number[]>;

  // Load mock data
  loadMockData() {
    this.simulationresult$ = from([SIMMOCKUP]);
  }

  // Load actual simulation data
  // stored in assets/data
  loadSimulationData() {
    this.simulationresult$ = this.http
      .get("http://localhost:4200/assets/data/Simulation_results_N100_T76.json")
      .pipe(
        map(response => {
          let simResult = new SimulationResult(response.json());
          return simResult;
        })
      );
  }

  // This method works
  initializeMockTimescale() {
    this.listts = [];
    for (var i in SIMMOCKUP.snapshots) {
      this.listts.push(SIMMOCKUP.snapshots[i].timestamp);
    }
    this.listts$ = from([this.listts]);
  }

  // This does not work, why?
  initializeTimescale() {
    this.simulationresult$.subscribe(simResults => {
      this.listts = [];
      for (var i in simResults.snapshots) {
        this.listts.push(simResults.snapshots[i].timestamp);
      }
      this.listts$ = from([this.listts]);
    });
  }

  constructor(private http: Http) {
    // this.loadMockData();
    this.loadSimulationData();

    // this.initializeTimescale();
    this.initializeMockTimescale();
  }
}
