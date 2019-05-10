import { Injectable, Output, EventEmitter } from "@angular/core";
import { Observable, Subject, from } from "rxjs";
import { Http, Response } from "@angular/http";
import { map, switchMap } from "rxjs/operators";

import { SimulationResult } from "./simulation-result";
import { SIMMOCKUP } from "./simulation-result-mockup";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root"
})
export class SimulationDataService {


  simulationresultSource = new Subject<SimulationResult>(); 
  simulationresult$ = this.simulationresultSource.asObservable();
  listtsSource = new Subject<number[]>();
  listts$ = this.listtsSource.asObservable();
  //dataSource = new Subject<SimulationResult>(); 
  //data$: Observable<Response>;

  @Output() dataChanged: EventEmitter<boolean> = new EventEmitter();

  // Load actual simulation data
  // stored in assets/data
  loadSimulationData(outbreakLocation = "PPLACE") {
    let dataPath = environment.apiEndpoint + "?name=" + outbreakLocation;
    console.log("Fetching data: ", dataPath);
    this.http.get(dataPath).subscribe(response => {
        console.log("updating simulationresult");
        let simResult = new SimulationResult(response.json());
        this.simulationresultSource.next(simResult);
        let listts: number[] = [];
        for (var i in simResult.snapshots) {
          listts.push(simResult.snapshots[i].timestamp);
        }
        this.listtsSource.next(listts);
      });;
  }

  changeOutbreakLocation(outbreakLocation: string) {
    this.loadSimulationData(outbreakLocation);
    this.dataChanged.emit(true);
  }

  constructor(private http: Http) {

    this.loadSimulationData();

    /*
    // Store simulation snapshots
    this.data$.subscribe(response => {
        console.log("updating simulationresult");
        let simResult = new SimulationResult(response.json());
        this.simulationresultSource.next(simResult);
      });
    // Store time series
    this.data$.subscribe(response => {
        console.log("updating listts");
        let simResult = new SimulationResult(response.json());
        let listts: number[] = [];
        for (var i in simResult.snapshots) {
          listts.push(simResult.snapshots[i].timestamp);
        }
        this.listtsSource.next(listts);
      });
    */
    this.loadSimulationData();

    

  }
}
