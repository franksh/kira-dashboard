var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ViewChild } from '@angular/core';
import { combineLatest } from 'rxjs';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import pointsWithinPolygon from '@turf/points-within-polygon';
import { points, polygon } from '@turf/helpers';
import * as _ from 'lodash';
import { DisplayControlService } from '../display-control.service';
import { DISTRICTSDATA } from '../berlin-bezirke';
var TableDistrictsComponent = /** @class */ (function () {
    function TableDistrictsComponent(displaycontrolservice) {
        this.displaycontrolservice = displaycontrolservice;
        this.displayedColumns = ['district', 'cases', 'remove'];
        this.dataSource = new MatTableDataSource([{ 'district': 'Moabit', 'cases': 10 }, { 'district': 'Eichkamp', 'cases': 5 }]);
    }
    TableDistrictsComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.selecteddistrictssub = this.displaycontrolservice.selecteddistricts$
            .subscribe(function (districts) { return _this.selecteddistricts = districts; });
        this.timeanddistrictssub = combineLatest(this.displaycontrolservice.selectedsnapshot$, this.displaycontrolservice.selecteddistricts$)
            .subscribe(function (_a) {
            var snapshot = _a[0], districts = _a[1];
            return _this.dataSource.data = _this.changeCasesInDistricts(snapshot, districts);
        });
    };
    TableDistrictsComponent.prototype.changeCasesInDistricts = function (snapshot, districts) {
        var casesindistricts = [];
        var snappoints = points(snapshot.points);
        for (var i in districts) {
            var districtname = DISTRICTSDATA.features.find(function (feature) { return feature.properties.spatial_alias === districts[i]; }).geometry;
            var geometry = DISTRICTSDATA.features.find(function (feature) { return feature.properties.spatial_alias === districts[i]; }).geometry;
            var distpolygon = polygon(geometry.coordinates);
            casesindistricts.push({ 'district': districts[i], 'cases': pointsWithinPolygon(snappoints, distpolygon).features.length });
        }
        return casesindistricts;
    };
    TableDistrictsComponent.prototype.getTotalCases = function () {
        return this.dataSource.data.map(function (t) { return t.cases; }).reduce(function (acc, value) { return acc + value; }, 0);
    };
    TableDistrictsComponent.prototype.removeDistrict = function (rmdistrict) {
        var selecteddistricts_copy = _.cloneDeep(this.selecteddistricts);
        _.remove(selecteddistricts_copy, function (x) { return x == rmdistrict; });
        this.displaycontrolservice.changeSelectedDistricts(selecteddistricts_copy);
    };
    __decorate([
        ViewChild(MatPaginator),
        __metadata("design:type", MatPaginator)
    ], TableDistrictsComponent.prototype, "paginator", void 0);
    __decorate([
        ViewChild(MatSort),
        __metadata("design:type", MatSort)
    ], TableDistrictsComponent.prototype, "sort", void 0);
    TableDistrictsComponent = __decorate([
        Component({
            selector: 'app-table-districts',
            templateUrl: './table-districts.component.html',
            styleUrls: ['./table-districts.component.css']
        }),
        __metadata("design:paramtypes", [DisplayControlService])
    ], TableDistrictsComponent);
    return TableDistrictsComponent;
}());
export { TableDistrictsComponent };
//# sourceMappingURL=table-districts.component.js.map