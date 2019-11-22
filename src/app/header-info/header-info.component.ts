import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import {ErrorStateMatcher} from '@angular/material/core';
import {FormControl, FormGroupDirective, NgForm, Validators} from '@angular/forms';
import { MatSelectChange } from "@angular/material";

import { SimulationDataService } from "../services/simulation-data.service";
import { DisplayControlService } from "../services/display-control.service";
import {SimulationStart} from "../services/simulation-result";

export interface Scenario {
  isCustom: boolean;
  outbreakLocation: string;
  outbreakTime?: string; // for now
}
export interface LocationOption {
  optionName: string;
  locationValue: string;
}
export interface TimeOption {
  optionName: string;
  timeValue: string;
}

export interface DayOption {
  optionName: string;
  dayValue: string;
}

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}


@Component({
  selector: "app-header-info",
  templateUrl: "./header-info.component.html",
  styleUrls: ["./header-info.component.css"]
})

export class HeaderInfoComponent implements OnInit {

  selectedScenario: Scenario = {isCustom: false, outbreakLocation: "PPLACE", outbreakTime: "12"}
  locationOptions: LocationOption[] = [
    {optionName: "Potsdamer Platz", locationValue: "PPLACE"},
    {optionName: "Alexanderplatz", locationValue: "APLACE"},
    {optionName: "Olympiastadion", locationValue: "OLYMP"},
    {optionName: "Potsdamer Platz (Cloud)", locationValue: "PPLACE_CLOUD"},
    {optionName: "Custom Scenario", locationValue: "CUSTOM"},
  ];
  fixedTimeOptions: TimeOption[] = [
    {optionName: "Monday 12pm", timeValue:"12"},
    {optionName: "Saturday 18pm", timeValue:"138"},
  ];
  dayOptions: DayOption[] = [
    {optionName: "Monday", dayValue: "Mon"}, 
    {optionName: "Tuesday", dayValue: "Tue"}, 
    {optionName: "Wednesday", dayValue: "Wed"}, 
    {optionName: "Thursday", dayValue: "Thu"}, 
    {optionName: "Friday", dayValue: "Fri"}, 
    {optionName: "Saturday", dayValue: "Sat"}, 
    {optionName: "Sunday", dayValue: "Sun"},
  ];
  hourOptions: number[] = Array(24).fill(undefined).map((v,i)=>i+1) // this is js for range(1,25) WHY?? 
  simulationStart: SimulationStart = new SimulationStart("Mon",1);
  long_low = 13.0 // all rough guesses about wath makes sense
  long_high = 13.8
  lat_low = 52.3
  lat_high = 52.7

  latitute:number = 52.520008;
  longitude:number = 13.404954; 
  longFormControl = new FormControl(this.longitude, [
    Validators.required,
    Validators.pattern("^[-+]?[0-9]*\.?[0-9]+$"),
    Validators.min(this.long_low),
    Validators.max(this.long_high),
    ]);
  latFormControl = new FormControl(this.latitute, [
    Validators.required,
    Validators.pattern("^[-+]?[0-9]*\.?[0-9]+$"),
    Validators.min(this.lat_low),
    Validators.max(this.lat_high),
    ]);
  matcher = new MyErrorStateMatcher();
  

  @Output("startLoading") startLoading = new EventEmitter();

  constructor(
    private simulationdataservice: SimulationDataService,
  ) {}
 

  ngOnInit() {}

  outbreakLocationChange($event: MatSelectChange) {
      if ($event.value == "CUSTOM") {
        this.selectedScenario.isCustom = true;
      }
      else{
        this.selectedScenario.isCustom = false;
      }
      this.selectedScenario.outbreakLocation = $event.value;
    }

  updateScenario() {
    this.simulationdataservice.loadSimulationData(
      this.selectedScenario.outbreakLocation, this.selectedScenario.outbreakTime
    );
    this.startLoading.emit({
      isLoading: true
    });
  }

  submitScenario() {
    this.simulationdataservice.requestSimulation(
      Number(this.latFormControl.value), 
      Number(this.longFormControl.value), 
      this.simulationStart)
  }
}
