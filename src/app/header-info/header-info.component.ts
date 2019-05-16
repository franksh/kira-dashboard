import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { MatSelectChange } from "@angular/material";
import { SimulationDataService } from "../services/simulation-data.service";
import { DisplayControlService } from "../services/display-control.service";

@Component({
  selector: "app-header-info",
  templateUrl: "./header-info.component.html",
  styleUrls: ["./header-info.component.css"]
})
export class HeaderInfoComponent implements OnInit {
  outbreakPlace = "PPLACE";
  outbreakTime = "12";
  @Output("startLoading") startLoading = new EventEmitter();

  constructor(
    private simulationdataservice: SimulationDataService,
    private displaycontrolservice: DisplayControlService
  ) {}

  ngOnInit() {}

  outbreakLocationChange($event: MatSelectChange) {
    // this.simulationdataservice.loadSimulationData($event.value);
    // this.startLoading.emit({
    //   isLoading: true
    // });
  }

  updateScenario() {
    this.simulationdataservice.loadSimulationData(
      this.outbreakPlace,
      this.outbreakTime
    );
    this.startLoading.emit({
      isLoading: true
    });
  }
}
