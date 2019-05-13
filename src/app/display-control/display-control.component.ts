import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { MatCheckboxChange, MatButtonToggleChange } from "@angular/material";
import { FormControl } from "@angular/forms";
import { Subscription } from "rxjs";

import * as _ from "lodash";

import { DisplayTime } from "./display-time";
import { DisplayControlService } from "../services/display-control.service";
import { DataProcessing } from "../services/data-processing.service";
import { DISTRICTSDATA } from "../berlin-bezirke";
import { HOSPITALDATA } from "../hospitals-berlin";
import { SimulationDataService } from "../services/simulation-data.service";

@Component({
  selector: "app-display-control",
  templateUrl: "./display-control.component.html",
  styleUrls: ["./display-control.component.css"]
})
export class DisplayControlComponent implements OnInit {
  mintime: number = 0;
  maxtime: number = 1;
  displaytime: DisplayTime = new DisplayTime(0);
  sub: Subscription;
  dcontrol = new FormControl();
  districtlist: string[] = this.getAllDistricts();
  selecteddistricts: string[] = ["None"];
  numseldist: number = 0;
  subdistricts: Subscription;

  choroplethactive: boolean;
  selectactive: boolean;

  constructor(
    private displaycontrolservice: DisplayControlService,
    private dataprocessing: DataProcessing,
    private simulationdataservice: SimulationDataService,
    cdr: ChangeDetectorRef
  ) {
    displaycontrolservice.displaytime$.subscribe(
      displaytime => (this.displaytime = displaytime)
    );
    displaycontrolservice.selecteddistricts$.subscribe(districts => {
      this.dcontrol.setValue(districts, { emitEvent: false });
      this.districtlist = this.getAllDistricts();
      this.selecteddistricts = districts;
      this.numseldist = districts.length;
    });
    simulationdataservice.listts$.subscribe(listts => {
      console.log("getting listts");
      console.log(listts);
      this.maxtime = _.last(listts);
      this.mintime = _.first(listts);
      this.initiateSubsciptions()
    });
  }

  changeTime(ts: number): void {
    this.displaycontrolservice.changeTime(ts);
  }

  changeSelectedDistricts(districts: string[]): void {
    this.displaycontrolservice.changeSelectedDistricts(districts);
  }

  changeSelectedHospitals(districts: string[]): void {
    this.displaycontrolservice.changeSelectedHospitals(districts);
  }

  ngOnInit() {
    this.dcontrol.reset(this.districtlist);
    this.subdistricts = this.dcontrol.valueChanges.subscribe(districts =>
      this.changeSelectedDistricts(districts)
    );
  }

  getAllDistricts(): string[] {
    var districtlist = [];
    for (var i in DISTRICTSDATA.features) {
      districtlist.push(DISTRICTSDATA.features[i].properties.spatial_alias);
    }
    return districtlist;
  }

  getAllHospitals(): string[] {
    var hospitallist = [];
    for (var i in HOSPITALDATA) {
      hospitallist.push(HOSPITALDATA[i].address.hospital);
    }
    return hospitallist;
  }

  initiateSubsciptions() {
    console.log("Initializing subscriptions");
    this.changeTime(this.mintime);
    this.changeSelectedDistricts(this.districtlist);
    this.changeSelectedHospitals(this.getAllHospitals());
    // this.changeSelectedHospitals;
    this.dataprocessing.initChoropethDist();
    this.dataprocessing.initChoropethHosp();
  }

  heatmapactiveChange($event) {
    this.displaycontrolservice.changeHeatmapactive($event.source._checked);
  }
  choroplethactiveChange($event) {
    this.choroplethactive = $event.source._checked;
    this.displaycontrolservice.changeChoroplethactive($event.source._checked);
  }

  choroplethmodeChange($event: MatButtonToggleChange) {
    this.displaycontrolservice.changeChoroplethmode($event.value);
  }

  selectactiveChange($event) {
    this.selectactive = $event.source._checked;
    this.displaycontrolservice.changeSelectactive($event.source._checked);
  }
}
