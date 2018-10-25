import { Component, OnInit, ViewChild} from '@angular/core';
import { Observable, Subject, Subscription, combineLatest} from 'rxjs';
import {MatTableDataSource, MatPaginator, MatSort} from '@angular/material'

import pointsWithinPolygon from '@turf/points-within-polygon';
import {points, polygon} from '@turf/helpers';
import * as _ from 'lodash';

import { SimSnapshot, SimulationResult } from '../display-control/simulation-result';
import {DisplayTime} from '../display-control/display-time';
import {DisplayControlService} from '../display-control.service';
import {ChoroplethService, Choropleth} from '../choropleth.service';

import { DISTRICTSDATA } from '../berlin-bezirke';
import {SIMMOCKUP} from '../display-control/simulation-result-mockup';


export interface DistData {
  district: string;
  cases: number;
}


@Component({
  selector: 'app-table-districts',
  templateUrl: './table-districts.component.html',
  styleUrls: ['./table-districts.component.css']
})

export class TableDistrictsComponent implements OnInit {

  simresult = SIMMOCKUP;

  displayedColumns: string[] = ['district', 'cases', 'remove'];
  dataSource = new MatTableDataSource<DistData>([{'district': 'Moabit', 'cases': 10},{'district': 'Eichkamp', 'cases': 5}]);
  @ViewChild(MatSort) sort: MatSort;
  
  choroplethmode_isdistrict: boolean = true;
  selecteddistricts: string[];
  selectedhospitals: string[];
  data = {
      districts: [],
      hospitals: [],
    }

  ngOnInit() {
    this.dataSource.sort = this.sort;
  }

  constructor(private displaycontrolservice: DisplayControlService, private choroplethservice: ChoroplethService) {
    displaycontrolservice.choroplethmode$.subscribe(state =>  {
      if (state == 'district') {
        this.choroplethmode_isdistrict = true;
        this.dataSource.data  = this.data.districts;
      }
       else {
        this.choroplethmode_isdistrict = false;
        this.dataSource.data  = this.data.hospitals;
    }});

    combineLatest(choroplethservice.selectedchoroplethdist$, displaycontrolservice.selecteddistricts$)
      .subscribe(([choropleth, districts]) => {
        this.data.districts = [];
        for (var i in districts) {
            this.data.districts.push(choropleth.distdata.find(data => data.district == districts[i]));
          }
        if (this.choroplethmode_isdistrict) {this.dataSource.data  = this.data.districts};
      })

    combineLatest(choroplethservice.selectedchoroplethhosp$, displaycontrolservice.selectedhospitals$)
      .subscribe(([choropleth, hospitals]) => {
        this.data.hospitals = [];
        for (var i in hospitals) {
           this.data.hospitals.push(choropleth.distdata.find(data => data.district == hospitals[i]));
        }
        if (!this.choroplethmode_isdistrict) {this.dataSource.data  = this.data.hospitals};
    })
  }


  getTotalCases() {
    return this.dataSource.data.map(t => t.cases).reduce((acc, value) => acc + value, 0);
  }

  removeDistrict(rmdistrict: string): void {
    var selecteddistricts_copy = _.cloneDeep(this.selecteddistricts)
    _.remove(selecteddistricts_copy, (x) => x == rmdistrict);
    this.displaycontrolservice.changeSelectedDistricts(selecteddistricts_copy);
    
  }


}
