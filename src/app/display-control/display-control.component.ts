import {
  Component,
  OnInit,
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  EventEmitter
} from "@angular/core";
import { MatCheckboxChange, MatButtonToggleChange } from "@angular/material";
import { FormControl } from "@angular/forms";
import { Observable, Subscription } from "rxjs";

import * as _ from "lodash";

import { DisplayTime } from "./display-time";
import { DisplayControlService } from "../display-control.service";
import { ChoroplethService } from "../choropleth.service";
import { DISTRICTSDATA } from "../berlin-bezirke";
import { HOSPITALDATA } from "../hospitals-berlin";
import {SimulationDataService} from "../simulation-data.service";

@Component({
  selector: "app-display-control",
  templateUrl: "./display-control.component.html",
  styleUrls: ["./display-control.component.css"]
})
export class DisplayControlComponent implements OnInit {
  mintime: number = 0:
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
    private choroplethservice: ChoroplethService,
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
    simulationdataservice.listts$.subscribe(
      listts => {
        this.maxtime = _.last(listts);
        this.mintime = _.first(listts);
      })
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
    console.log("init");
    this.changeTime(this.mintime);
    this.changeSelectedDistricts(this.districtlist);
    this.changeSelectedHospitals(this.getAllHospitals());
    this.changeSelectedHospitals;
    this.choroplethservice.initChoropethDist();
    this.choroplethservice.initChoropethHosp();
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
