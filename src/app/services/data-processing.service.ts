import { Injectable } from "@angular/core";
import { Observable, Subject, Subscription, combineLatest } from "rxjs";

import pointsWithinPolygon from "@turf/points-within-polygon";
import {
  points,
  polygon,
  Polygon,
  FeatureCollection,
  featureCollection,
  GeoJSONObject
} from "@turf/helpers";
import * as d3voronoi from 'd3-voronoi';
import bbox from "@turf/bbox";
import * as _ from "lodash";

import { SimSnapshot, SimulationResult } from "./simulation-result";
import { DisplayTime } from "../display-control/display-time";
import { DisplayControlService } from "./display-control.service";
import { DISTRICTSDATA } from "../berlin-bezirke-simpl";
import { HOSPITALDATA, HOSPITALLIST_EMERGENCYCENTER } from "../hospitals-berlin";
import { SIMMOCKUP } from "./simulation-result-mockup-2";
import { SimulationDataService } from "./simulation-data.service";

export interface DistData {
  district: string;
  cases: number;
}

export interface Choropleth {
  distdata: DistData[];
  maximum: number;
}

@Injectable({
  providedIn: "root"
})
export class DataProcessing {
  simresult: SimulationResult;
  districtsdata = DISTRICTSDATA;
  hospitaldata = HOSPITALDATA;
  hospitallist = HOSPITALLIST_EMERGENCYCENTER;

  maxvaluechoroplethdists: number;
  maxvaluechoroplethhosp: number;

  voronoihospitals: any;

  allchoroplethdistsSource = new Subject<DistData[][]>();
  allchoroplethdists$ = this.allchoroplethdistsSource.asObservable();
  allchoroplethhospSource = new Subject<DistData[][]>();
  allchoroplethhosp$ = this.allchoroplethhospSource.asObservable();

  selectedchoroplethdistSource = new Subject<Choropleth>();
  selectedchoroplethdist$ = this.selectedchoroplethdistSource.asObservable();

  selectedchoroplethhospSource = new Subject<Choropleth>();
  selectedchoroplethhosp$ = this.selectedchoroplethhospSource.asObservable();

  selectedsnapshotSource = new Subject<SimSnapshot>();
  selectedsnapshot$ = this.selectedsnapshotSource.asObservable();

  displaytimesub: Subscription;

  constructor(
    private displaycontrolservice: DisplayControlService,
    private simulationdataservice: SimulationDataService
  ) {
    
    displaycontrolservice.displaytime$.subscribe((time) => this.changesslectedsnapshot(time.timestamp))

    this.displaytimesub = combineLatest(
      displaycontrolservice.displaytime$,
      this.allchoroplethdists$
    ).subscribe(([time, allchoroplethdists]) => {
      var chororpleth: Choropleth = {
        distdata: allchoroplethdists[time.timestamp],
        maximum: this.maxvaluechoroplethdists
      };
      this.selectedchoroplethdistSource.next(chororpleth);
    });
    this.displaytimesub = combineLatest(
      displaycontrolservice.displaytime$,
      this.allchoroplethhosp$
    ).subscribe(([time, allchoroplethhosp]) => {
      var chororpleth: Choropleth = {
        distdata: allchoroplethhosp[time.timestamp],
        maximum: this.maxvaluechoroplethhosp
      };
      this.selectedchoroplethhospSource.next(chororpleth);
    });

    simulationdataservice.simulationresult$.subscribe(simresult => {
      console.log("getting simresult");
      console.log(simresult);
      this.simresult = simresult;
      this.initChoropethDist();
      this.initChoropethHosp();
    });
  }

  computeChoroplethDist(districtsdata: any, snapshot: SimSnapshot): Choropleth {
    var choropleth: Choropleth = { distdata: [], maximum: 0 };

    var snappoints = points(snapshot.points);
    for (var i in districtsdata.features) {
      var district = districtsdata.features[i].properties.spatial_alias;
      var distpolygon = districtsdata.features[i];
      var cases = pointsWithinPolygon(snappoints, distpolygon).features.length;
      choropleth.distdata.push({district: district, cases: cases});
      if (cases > choropleth.maximum) {
        choropleth.maximum = cases;
      }
    }
    return choropleth;
  }

  initChoropethDist() {
    var allchoroplethdists: DistData[][] = [];
    this.maxvaluechoroplethdists = 0;
    for (var i in this.simresult.snapshots) {
      var snapshot: SimSnapshot = this.simresult.snapshots[i];
      var ts = snapshot.timestamp;
      var choropleth = this.computeChoroplethDist(this.districtsdata, snapshot);
      allchoroplethdists[ts] = choropleth.distdata;
      if (choropleth.maximum > this.maxvaluechoroplethdists) {
        this.maxvaluechoroplethdists = choropleth.maximum;
      }
    }
    this.allchoroplethdistsSource.next(allchoroplethdists);
  }

  computeChoroplethHosp(
    hospitalnames: string[],
    voronoihospitals: any,
    snapshot: SimSnapshot
  ): Choropleth {
    var choropleth: Choropleth = { distdata: [], maximum: 0 };

    var snappoints = points(snapshot.points);
    for (var i in voronoihospitals.features) {
      var name = hospitalnames[i];
      var distpolygon = voronoihospitals.features[i];
      var cases = pointsWithinPolygon(snappoints, distpolygon).features.length;
      choropleth.distdata.push({ district: name, cases: cases });
      if (cases > choropleth.maximum) {
        choropleth.maximum = cases;
      }
    }
    return choropleth;
  }

  initChoropethHosp() {
    var hospitalcoodinates = [];
    var hospitalnames = []

    for (var i in this.hospitaldata) {
      var hospital = this.hospitaldata[i];
      if (this.hospitallist.includes(hospital.properties.name)) {
        hospitalcoodinates.push(hospital.geometry.coordinates);
        hospitalnames.push(hospital.properties.name);
      }
    }
    var hospitalpoints = points(hospitalcoodinates);
    this.voronoihospitals = this.voronoi(hospitalpoints, bbox(this.districtsdata));
    for (var i in hospitalnames) {
      this.voronoihospitals.features[i].properties.name = hospitalnames[i];
    }

    var allchoroplethhosp: DistData[][] = [];
    this.maxvaluechoroplethhosp = 0;
    for (var i in this.simresult.snapshots) {
      var snapshot: SimSnapshot = this.simresult.snapshots[i];
      var ts = snapshot.timestamp;
      var choropleth = this.computeChoroplethHosp(
        this.hospitallist,
        this.voronoihospitals,
        snapshot
      );
      allchoroplethhosp[ts] = choropleth.distdata;
      if (choropleth.maximum > this.maxvaluechoroplethhosp) {
        this.maxvaluechoroplethhosp = choropleth.maximum;
      }
    }
    this.allchoroplethhospSource.next(allchoroplethhosp);
  }

  getvoronoihospitals(): any {
    return this.voronoihospitals;
  }

  changesslectedsnapshot(ts: number): void {
    this.selectedsnapshotSource.next(
      this.simresult.snapshots.find(snaps => snaps.timestamp === ts)
    );
  }

  voronoi(points, bbox): FeatureCollection<Polygon> {
    return featureCollection(
        d3voronoi.voronoi()
            .x(function (feature) { return feature.geometry.coordinates[0]; })
            .y(function (feature) { return feature.geometry.coordinates[1]; })
            .extent([[bbox[0], bbox[1]], [bbox[2], bbox[3]]])
            .polygons(points.features)
            .map(this.coordsToPolygon)
    );
  }
  coordsToPolygon(coords): Polygon {
    coords = coords.slice();
    coords.push(coords[0]);
    return polygon([coords]);
  }
}


