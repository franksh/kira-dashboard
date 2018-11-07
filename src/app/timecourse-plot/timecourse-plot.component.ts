import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef
} from "@angular/core";
import { Observable, Subject, Subscription, combineLatest } from "rxjs";
declare let getComputedStyle: any;

import pointsWithinPolygon from "@turf/points-within-polygon";
import { points, polygon } from "@turf/helpers";
import * as _ from "lodash";

import {
  SimSnapshot,
  SimulationResult
} from "../display-control/simulation-result";
import { DisplayControlService } from "../display-control.service";
import { ChoroplethService } from "../choropleth.service";
import { DISTRICTSDATA } from "../berlin-bezirke";
import { SIMMOCKUP } from "../display-control/simulation-result-mockup-2";

export interface CasesTimecourse {
  timepoints: number[];
  cases: number[];
}

@Component({
  selector: "app-timecourse-plot",
  templateUrl: "./timecourse-plot.component.html",
  styleUrls: ["./timecourse-plot.component.css"]
})
export class TimecoursePlotComponent {
  @ViewChild("primary")
  primary: ElementRef;

  choroplethmode_isdistrict: boolean = true;

  simresult = SIMMOCKUP;
  alldistrictsdata = [];

  public graph = {
    datadist: [],
    datahosp: [],
    layout: {
      xaxis: {
        title: "Time [s]",
        titlefont: {
          family: "Roboto, sans-serif",
          size: 18,
          color: "grey"
        }
      },
      yaxis: {
        title: "# of Cases",
        titlefont: {
          family: "Roboto, sans-serif",
          size: 18,
          color: "grey"
        }
      },
      autoresize: true,
      margin: {
        l: 35,
        r: 15,
        b: 45,
        t: 20,
        pad: 4
      }
    },
    style: {
      height: "100%",
      width: "100%"
    }
  };
  color = "#000000";

  constructor(
    private displaycontrolservice: DisplayControlService,
    private choroplethservice: ChoroplethService
  ) {
    displaycontrolservice.choroplethmode$.subscribe(state => {
      state == "district"
        ? (this.choroplethmode_isdistrict = true)
        : (this.choroplethmode_isdistrict = false);
    });

    combineLatest(
      choroplethservice.allchoroplethdists$,
      displaycontrolservice.selecteddistricts$
    ).subscribe(([choropleths, districts]) => {
      console.log(choropleths);

      this.graph.datadist = [];
      var x = Array(this.simresult.snapshots.length).fill(0);
      var y = Array(this.simresult.snapshots.length).fill(0);
      for (var i in districts) {
        for (var j in this.simresult.snapshots) {
          var ts = this.simresult.snapshots[j].timestamp;
          y[j] += choropleths[ts].find(
            data => data.district == districts[i]
          ).cases;
          x[j] = ts;
        }
      }
      this.graph.datadist = [
        {
          x: x,
          y: y,
          type: "scatter",
          mode: "points",
          name: districts[i],
          marker: { color: "#212121" }
        }
      ];
    });

    combineLatest(
      choroplethservice.allchoroplethhosp$,
      displaycontrolservice.selectedhospitals$
    ).subscribe(([choropleths, hospital]) => {
      this.graph.datahosp = [];
      var x = Array(this.simresult.snapshots.length).fill(0);
      var y = Array(this.simresult.snapshots.length).fill(0);
      for (var i in hospital) {
        for (var j in this.simresult.snapshots) {
          var ts = this.simresult.snapshots[j].timestamp;
          y[j] += choropleths[ts].find(
            data => data.district == hospital[i]
          ).cases;
          x[j] = ts;
        }
      }
      this.graph.datahosp = [
        {
          x: x,
          y: y,
          type: "scatter",
          mode: "points",
          name: hospital[i],
          marker: { color: "#212121" }
        }
      ];
    });
  }

  ngAfterViewInit() {
    const primaryColor = getComputedStyle(this.primary.nativeElement).color;
    this.color = primaryColor;
  }

  changeTime(ts: number): void {
    this.displaycontrolservice.changeTime(ts);
  }

  recieveClickEvent(arg): void {
    if (arg.points) {
      var selectedtime = arg.points[0].x;
      this.changeTime(selectedtime);
    }
  }
}
