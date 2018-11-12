import { Injectable } from '@angular/core';
import { Observable, from, Subject } from "rxjs";

import {
  SimSnapshot,
  SimulationResult
} from "./display-control/simulation-result";
import { SIMMOCKUP } from "./display-control/simulation-result-mockup-2";


@Injectable({
  providedIn: 'root'
})
export class SimulationDataService {

	simulationresult$ = from([SIMMOCKUP])

  constructor() {
  }
}
