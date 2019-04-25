import { Injectable } from "@angular/core";
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
  loadSimulationData() {
    let data$ = this.http.get(
      environment.apiEndpoint
      // "http://localhost:4200/assets/data/Simulation_results_N100_T76.json"
      // "http://localhost:4200/assets/data/Kira_trajectories_N1000_T168_real.json"
    );
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

  constructor(private http: Http) {
    // this.loadMockData();
    this.loadSimulationData();
  }
}
