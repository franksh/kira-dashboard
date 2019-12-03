import { Injectable, Output, EventEmitter } from "@angular/core";
import { Observable, Subject, from, interval } from "rxjs";
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
  submittedscenarioloadingSource = new Subject<boolean>();
  submittedscenarioloading$ = this.submittedscenarioloadingSource.asObservable();
  taskidSource  = new Subject<string>();
  taskid$ = this.taskidSource.asObservable();

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
      console.log(simResult.snapshots[0].timestamp)
      this.simulationresultSource.next(simResult);
      let listts: number[] = [];
      for (var i in simResult.snapshots) {
        listts.push(simResult.snapshots[i].timestamp);
      }
      this.listtsSource.next(listts);
    });


    let simstart = new SimulationStart(parseInt(outbreakTime));
    this.simulationstartSource.next(simstart);
  }

  requestSimulation(latitute:number, longitute: number, time: SimulationStart) {
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
      this.taskidSource.next(response.text().slice(1, -2))
      this.submittedscenarioloadingSource.next(true);
    })
  }

  checkSimulationTask(task_id: string) {
    let taskPath = 
      environment.apiEndpoint +
      "status/" +
      task_id;
    this.http.get(taskPath).subscribe(response => {
      if (response.status != 202) {
        this.submittedscenarioloadingSource.next(false);
      }
    });
  }

  changeOutbreakLocation(outbreakLocation: string) {
    this.loadSimulationData(outbreakLocation);
  }

  constructor(private http: Http) {
    this.loadSimulationData();
    this.submittedscenarioloadingSource.next(false);
  }
}
