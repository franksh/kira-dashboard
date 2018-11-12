import { Component, OnInit, ViewChild} from '@angular/core';
import {SelectionModel} from '@angular/cdk/collections';
import { Observable, Subject, Subscription, combineLatest} from 'rxjs';
import {MatTableDataSource, MatPaginator, MatSort} from '@angular/material'

import pointsWithinPolygon from "@turf/points-within-polygon";
import { points, polygon } from "@turf/helpers";
import * as _ from "lodash";

import {
  SimSnapshot,
  SimulationResult
} from "../display-control/simulation-result";
import { DisplayTime } from "../display-control/display-time";
import { DisplayControlService } from "../display-control.service";
import { ChoroplethService, Choropleth } from "../choropleth.service";

import { DISTRICTSDATA } from "../berlin-bezirke";
import { SIMMOCKUP } from "../display-control/simulation-result-mockup-2";

export interface DistData {
  district: string;
  cases: number;
}

@Component({
  selector: "app-table-districts",
  templateUrl: "./table-districts.component.html",
  styleUrls: ["./table-districts.component.css"]
})
export class TableDistrictsComponent implements OnInit {
  simresult = SIMMOCKUP;

  displayedColumns: string[] = ['district', 'cases', "remove"];
  dataSource = new MatTableDataSource<DistData>([{'district': 'Moabit', 'cases': 10},{'district': 'Eichkamp', 'cases': 5}]);
  @ViewChild(MatSort) sort: MatSort;
  selection = new SelectionModel<DistData>(true, []);

  choroplethmode_isdistrict: boolean = true;
  lists = {
    districts: [],
    hospitals: []
  }
  data = {
    districts: [],
    hospitals: []
  };

  ngOnInit() {
    this.dataSource.sort = this.sort;
  }

  constructor(
    private displaycontrolservice: DisplayControlService,
    private choroplethservice: ChoroplethService
  ) {
    displaycontrolservice.choroplethmode$.subscribe(state => {
      if (state == "district") {
        this.choroplethmode_isdistrict = true;
        this.dataSource.data = this.data.districts;
      } else {
        this.choroplethmode_isdistrict = false;
        this.dataSource.data = this.data.hospitals;
      }
    });

    combineLatest(
      choroplethservice.selectedchoroplethdist$,
      displaycontrolservice.selecteddistricts$
    ).subscribe(([choropleth, districts]) => {
      this.lists.districts = districts;
      this.data.districts = [];
      for (var i in districts) {
        this.data.districts.push(
          choropleth.distdata.find(data => data.district == districts[i])
        );
      }
      if (this.choroplethmode_isdistrict) {
        this.dataSource.data = this.data.districts;
      }
    });

    combineLatest(
      choroplethservice.selectedchoroplethhosp$,
      displaycontrolservice.selectedhospitals$
    ).subscribe(([choropleth, hospitals]) => {
      this.lists.hospitals = hospitals;
      this.data.hospitals = [];
      for (var i in hospitals) {
        this.data.hospitals.push(
          choropleth.distdata.find(data => data.district == hospitals[i])
        );
      }
      if (!this.choroplethmode_isdistrict) {
        this.dataSource.data = this.data.hospitals;
      }
    });
  }

  getTotalCases() {
    return this.dataSource.data
      .map(t => t.cases)
      .reduce((acc, value) => acc + value, 0);
  }

  removeDistrict(rm: string): void {
    var selected_copy = this.choroplethmode_isdistrict ? _.cloneDeep(this.lists.districts) : _.cloneDeep(this.lists.hospitals);
    _.remove(selected_copy, x => x == rm);
    this.choroplethmode_isdistrict ? 
      this.displaycontrolservice.changeSelectedDistricts(selected_copy) : 
      this.displaycontrolservice.changeSelectedHospitals(selected_copy);
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.data.forEach(row => this.selection.select(row));
  }
}
