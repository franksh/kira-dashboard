import { Injectable } from "@angular/core";
import { Observable, Subject, Subscription, combineLatest } from "rxjs";

import pointsWithinPolygon from "@turf/points-within-polygon";
import {
  points,
  polygon,
  Polygon,
  FeatureCollection,
  GeoJSONObject
} from "@turf/helpers";
import voronoi from "@turf/voronoi";
import bbox from "@turf/bbox";
import * as _ from "lodash";

import {
  SimSnapshot,
  SimulationResult
} from "./display-control/simulation-result";
import { DisplayTime } from "./display-control/display-time";
import { DisplayControlService } from "./display-control.service";
import { DISTRICTSDATA } from "./berlin-bezirke";
import { HOSPITALDATA } from "./hospitals-berlin";
import { SIMMOCKUP } from "./display-control/simulation-result-mockup-2";
import {SimulationDataService} from "./simulation-data.service";

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
export class ChoroplethService {
  simresult: SimulationResult;
  districtsdata = DISTRICTSDATA;
  hospitaldata = HOSPITALDATA;

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

  displaytimesub: Subscription;

  constructor(private displaycontrolservice: DisplayControlService, private simulationdataservice: SimulationDataService) {
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

    simulationdataservice.simulationresult$.subscribe(
      simresult => {
        console.log(simresult);
        this.simresult = simresult;
        this.initChoropethDist();
        this.initChoropethHosp();
    })

  }

  computeChoroplethDist(districtsdata: any, snapshot: SimSnapshot): Choropleth {
    var choropleth: Choropleth = { distdata: [], maximum: 0 };

    var snappoints = points(snapshot.points);
    for (var i in districtsdata.features) {
      var district = districtsdata.features[i].properties.spatial_alias;
      var distpolygon = polygon(districtsdata.features[i].geometry.coordinates);
      var cases = pointsWithinPolygon(snappoints, distpolygon).features.length;
      choropleth.distdata.push({
        district: district,
        cases: pointsWithinPolygon(snappoints, distpolygon).features.length
      });
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
    var hospitalnames = [];
    for (var i in this.hospitaldata) {
      var hospital = this.hospitaldata[i];
      hospitalcoodinates.push([hospital.lon, hospital.lat]);
      hospitalnames.push(hospital.address.hospital);
    }
    var hospitalpoints = points(hospitalcoodinates);
    var bboxberlin = bbox(this.districtsdata);
    this.voronoihospitals = voronoi(hospitalpoints, { bbox: bboxberlin });
    for (var i in hospitalnames) {
      var hospitalname = hospitalnames[i];
      this.voronoihospitals.features[i].properties.name = hospitalname;
    }

    var allchoroplethhosp: DistData[][] = [];
    this.maxvaluechoroplethhosp = 0;
    for (var i in this.simresult.snapshots) {
      var snapshot: SimSnapshot = this.simresult.snapshots[i];
      var ts = snapshot.timestamp;
      var choropleth = this.computeChoroplethHosp(
        hospitalnames,
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
}
