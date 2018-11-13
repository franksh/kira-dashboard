import { Injectable } from '@angular/core';
import { Observable, from, Subject } from "rxjs";

import {
  SimSnapshot,
  SimulationResult
} from "./display-control/simulation-result";
import { SIMMOCKUP } from "./display-control/simulation-result-mockup";


@Injectable({
  providedIn: 'root'
})
export class SimulationDataService {

	simulationresult$ = from([SIMMOCKUP])
	listts: number[];
	listts$: Observable;

  constructor() {
  	this.listts = [];
  	for (var i in SIMMOCKUP.snapshots) {
  		this.listts.push(SIMMOCKUP.snapshots[i].timestamp)
  	}
  	
  	this.listts$ = from([this.listts])
  }
}
