import { Component, OnInit } from "@angular/core";
import { MatSelectChange } from "@angular/material";
import { SimulationDataService } from "../services/simulation-data.service";
import { DisplayControlService } from "../services/display-control.service";

@Component({
  selector: "app-header-info",
  templateUrl: "./header-info.component.html",
  styleUrls: ["./header-info.component.css"]
})
export class HeaderInfoComponent implements OnInit {
  constructor(
    private simulationdataservice: SimulationDataService,
    private displaycontrolservice: DisplayControlService
  ) {}

  ngOnInit() {}

  outbreakLocationChange($event: MatSelectChange) {
    // this.displaycontrolservice.changeChoroplethmode($event.value);
    this.simulationdataservice.changeOutbreakLocation($event.value);
    this.displaycontrolservice.reloadSimulationData();
  }
}
