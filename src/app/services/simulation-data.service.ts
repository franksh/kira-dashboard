import { Injectable, Output, EventEmitter } from "@angular/core";
import { Observable, Subject, from } from "rxjs";
import { Http, Response } from "@angular/http";
import { map, switchMap } from "rxjs/operators";

import { SimulationResult, SimulationStart } from "./simulation-result";
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
  simulationstartSource = new Subject<SimulationStart>();
  simulationstart$ = this.simulationstartSource.asObservable();

  // Load actual simulation data
  // stored in assets/data
  loadSimulationData(outbreakLocation = "PPLACE", outbreakTime = "12") {
    let dataPath =
      environment.apiEndpoint +
      "?name=" +
      outbreakLocation +
      "&time=" +
      outbreakTime;
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
    });
    let simstart;
    if (outbreakTime == "12") {
      simstart = new SimulationStart("Mon", 12);
    }
    if (outbreakTime == "138") {
      simstart = new SimulationStart("Sat", 18);
    }
    this.simulationstartSource.next(simstart);
  }

  requestSimulation(latitute:number, longitute: number, time: SimulationStart){
    let dataPath =
      environment.apiEndpoint +
      "run" +
      "?lat=" +
      latitute +
      "&lon=" +
      longitute +
      "&time=" +
      time.getabsolutehours();
    this.http.get(dataPath).subscribe(response => {
      console.log("requested simulation")
    });
  }

  changeOutbreakLocation(outbreakLocation: string) {
    this.loadSimulationData(outbreakLocation);
  }

  constructor(private http: Http) {
    this.loadSimulationData();
  }
}
