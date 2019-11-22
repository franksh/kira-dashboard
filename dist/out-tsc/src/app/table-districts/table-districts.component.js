var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ViewChild } from "@angular/core";
import { SelectionModel } from "@angular/cdk/collections";
import { combineLatest } from "rxjs";
import { MatTableDataSource, MatSort } from "@angular/material";
import * as _ from "lodash";
import { DisplayControlService } from "../services/display-control.service";
import { DataProcessing } from "../services/data-processing.service";
import { SIMMOCKUP } from "../services/simulation-result-mockup-2";
var TableDistrictsComponent = /** @class */ (function () {
    function TableDistrictsComponent(displaycontrolservice, dataprocessing) {
        var _this = this;
        this.displaycontrolservice = displaycontrolservice;
        this.dataprocessing = dataprocessing;
        this.simresult = SIMMOCKUP;
        this.displayedColumns = ["district", "cases", "remove"];
        this.dataSource = new MatTableDataSource([
            { district: "Moabit", cases: 10 },
            { district: "Eichkamp", cases: 5 }
        ]);
        this.selection = new SelectionModel(true, []);
        this.choroplethmode_isdistrict = true;
        this.lists = {
            districts: [],
            hospitals: []
        };
        this.data = {
            districts: [],
            hospitals: []
        };
        displaycontrolservice.choroplethmode$.subscribe(function (state) {
            if (state == "district") {
                _this.choroplethmode_isdistrict = true;
                _this.dataSource.data = _this.data.districts;
            }
            else {
                _this.choroplethmode_isdistrict = false;
                _this.dataSource.data = _this.data.hospitals;
            }
        });
        combineLatest(dataprocessing.selectedchoroplethdist$, displaycontrolservice.selecteddistricts$).subscribe(function (_a) {
            var choropleth = _a[0], districts = _a[1];
            _this.lists.districts = districts;
            _this.data.districts = [];
            for (var i in districts) {
                _this.data.districts.push(choropleth.distdata.find(function (data) { return data.district == districts[i]; }));
            }
            if (_this.choroplethmode_isdistrict) {
                _this.dataSource.data = _this.data.districts;
            }
        });
        combineLatest(dataprocessing.selectedchoroplethhosp$, displaycontrolservice.selectedhospitals$).subscribe(function (_a) {
            var choropleth = _a[0], hospitals = _a[1];
            _this.lists.hospitals = hospitals;
            _this.data.hospitals = [];
            for (var i in hospitals) {
                _this.data.hospitals.push(choropleth.distdata.find(function (data) { return data.district == hospitals[i]; }));
            }
            if (!_this.choroplethmode_isdistrict) {
                _this.dataSource.data = _this.data.hospitals;
            }
        });
    }
    TableDistrictsComponent.prototype.ngOnInit = function () {
        this.dataSource.sort = this.sort;
    };
    TableDistrictsComponent.prototype.getTotalCases = function () {
        return this.dataSource.data
            .map(function (t) { return t.cases; })
            .reduce(function (acc, value) { return acc + value; }, 0);
    };
    TableDistrictsComponent.prototype.removeDistrict = function (rm) {
        var selected_copy = this.choroplethmode_isdistrict
            ? _.cloneDeep(this.lists.districts)
            : _.cloneDeep(this.lists.hospitals);
        _.remove(selected_copy, function (x) { return x == rm; });
        this.choroplethmode_isdistrict
            ? this.displaycontrolservice.changeSelectedDistricts(selected_copy)
            : this.displaycontrolservice.changeSelectedHospitals(selected_copy);
    };
    /** Whether the number of selected elements matches the total number of rows. */
    TableDistrictsComponent.prototype.isAllSelected = function () {
        var numSelected = this.selection.selected.length;
        var numRows = this.dataSource.data.length;
        return numSelected === numRows;
    };
    /** Selects all rows if they are not all selected; otherwise clear selection. */
    TableDistrictsComponent.prototype.masterToggle = function () {
        var _this = this;
        this.isAllSelected()
            ? this.selection.clear()
            : this.dataSource.data.forEach(function (row) { return _this.selection.select(row); });
    };
    __decorate([
        ViewChild(MatSort),
        __metadata("design:type", MatSort)
    ], TableDistrictsComponent.prototype, "sort", void 0);
    TableDistrictsComponent = __decorate([
        Component({
            selector: "app-table-districts",
            templateUrl: "./table-districts.component.html",
            styleUrls: ["./table-districts.component.css"]
        }),
        __metadata("design:paramtypes", [DisplayControlService,
            DataProcessing])
    ], TableDistrictsComponent);
    return TableDistrictsComponent;
}());
export { TableDistrictsComponent };
//# sourceMappingURL=table-districts.component.js.map