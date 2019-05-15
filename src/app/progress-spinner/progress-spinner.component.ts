import { Component, OnInit, Input } from "@angular/core";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

@Component({
  selector: "app-progress-spinner",
  templateUrl: "./progress-spinner.component.html",
  styleUrls: ["./progress-spinner.component.css"]
})
export class ProgressSpinnerComponent implements OnInit {
  @Input("isLoading") showSpinner: boolean;
  constructor() {}

  ngOnInit() {}

  turnOn() {
    this.showSpinner = true;
  }

  turnOff() {
    this.showSpinner = false;
  }
}
