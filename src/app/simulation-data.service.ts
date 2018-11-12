import { Injectable } from '@angular/core';
import { Observable, of, Subject } from "rxjs";

import {
  SimSnapshot,
  SimulationResult
} from "./display-control/simulation-result";
import { SIMMOCKUP } from "../display-control/simulation-result-mockup-2";


@Injectable({
  providedIn: 'root'
})
export class SimulationDataService {

	private simulationresultSource = new Subject<SimulationResult>;
	simulationresult$ = this.simulationresultSource.asObservable();

  constructor() {
  	this.simulationresultSource.next(SIMMOCKUP)
  }
}
