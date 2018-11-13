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
import { ChoroplethService, Choropleth, DistData } from "../choropleth.service";
import { DISTRICTSDATA } from "../berlin-bezirke";
import { DISTRICT_COLORS } from "../districtcolors";
import { HOSPITAL_COLORS } from "../hospitalcolors";
import { SimulationDataService } from "../simulation-data.service";

export interface CasesTimecourse {
  timepoints: number[];
  cases: number[];
}

@Component({
  selector: "app-timecourse-plot-individual",
  templateUrl: "./timecourse-plot-individual.component.html",
  styleUrls: ["./timecourse-plot-individual.component.css"]
})
export class TimecoursePlotIndividualComponent {
  @ViewChild("primary")
  primary: ElementRef;

  choroplethmode_isdistrict: boolean = true;

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
    private choroplethservice: ChoroplethService,
    private simulationdataservice: SimulationDataService
  ) {
    displaycontrolservice.choroplethmode$.subscribe(state => {
      state == "district"
        ? (this.choroplethmode_isdistrict = true)
        : (this.choroplethmode_isdistrict = false);
    });

    combineLatest(
      choroplethservice.allchoroplethdists$,
      displaycontrolservice.selecteddistricts$,
      simulationdataservice.listts$
    ).subscribe(([choropleths, districts, listts]) => {
      this.graph.datadist = [];
      for (var i in districts) {
        var x = [];
        var y = [];
        for (var j in listts) {
          var ts = listts[j];
          y.push(
            choropleths[ts].find(data => data.district == districts[i]).cases
          );
          x.push(ts);
        }
        var color = DISTRICT_COLORS[districts[i]];
        this.graph.datadist.push({
          x: x,
          y: y,
          type: "scatter",
          mode: "points",
          name: districts[i],
          marker: { color: color }
        });
      }
    });

    combineLatest(
      choroplethservice.allchoroplethhosp$,
      displaycontrolservice.selectedhospitals$,
      simulationdataservice.listts$
    ).subscribe(([choropleths, hospital, listts]) => {
      this.graph.datahosp = [];
      for (var i in hospital) {
        var x = [];
        var y = [];
        for (var j in listts) {
          var ts = listts[j];
          y.push(
            choropleths[ts].find(data => data.district == hospital[i]).cases
          );
          x.push(ts);
        }
        var color = HOSPITAL_COLORS[hospital[i]];
        this.graph.datahosp.push({
          x: x,
          y: y,
          type: "scatter",
          mode: "points",
          name: hospital[i],
          marker: { color: color }
        });
      }
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
