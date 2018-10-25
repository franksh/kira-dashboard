var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ViewChild, ElementRef } from '@angular/core';
import pointsWithinPolygon from '@turf/points-within-polygon';
import { points, polygon } from '@turf/helpers';
import { DisplayControlService } from '../display-control.service';
import { DISTRICTSDATA } from '../berlin-bezirke';
import { SIMMOCKUP } from '../display-control/simulation-result-mockup';
var TimecoursePlotComponent = /** @class */ (function () {
    function TimecoursePlotComponent(displaycontrolservice) {
        var _this = this;
        this.displaycontrolservice = displaycontrolservice;
        this.graph = {
            data: [
                { x: [1, 2, 3], y: [2, 6, 3], type: 'scatter', mode: 'points', marker: { color: 'red' } },
            ],
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
                height: 250,
                margin: {
                    l: 35,
                    r: 15,
                    b: 45,
                    t: 20,
                    pad: 4
                },
            }
        };
        this.displaycontrolservice.selecteddistricts$
            .subscribe(function (districts) {
            var timecourse = _this.getCasesTimecourse(SIMMOCKUP, districts);
            _this.graph.data[0].x = timecourse.timepoints;
            _this.graph.data[0].y = timecourse.cases;
        });
    }
    TimecoursePlotComponent.prototype.ngAfterViewInit = function () {
        var primaryColor = getComputedStyle(this.primary.nativeElement).color;
        this.graph.data[0].marker = { color: primaryColor };
    };
    TimecoursePlotComponent.prototype.getCasesTimecourse = function (sim, districts) {
        var casestimecourse = { timepoints: [], cases: [] };
        for (var j in sim.snapshots) {
            var snapshot = sim.snapshots[j];
            casestimecourse.timepoints.push(snapshot.timestamp);
            casestimecourse.cases.push(0);
            var snappoints = points(snapshot.points);
            for (var i in districts) {
                var districtname = DISTRICTSDATA.features.find(function (feature) { return feature.properties.spatial_alias === districts[i]; }).geometry;
                var geometry = DISTRICTSDATA.features.find(function (feature) { return feature.properties.spatial_alias === districts[i]; }).geometry;
                var distpolygon = polygon(geometry.coordinates);
                casestimecourse.cases[j] += pointsWithinPolygon(snappoints, distpolygon).features.length;
            }
        }
        return casestimecourse;
    };
    TimecoursePlotComponent.prototype.changeTime = function (ts) {
        this.displaycontrolservice.changeTime(ts);
    };
    TimecoursePlotComponent.prototype.recieveClickEvent = function (arg) {
        if (arg.points) {
            var selectedtime = arg.points[0].x;
            this.changeTime(selectedtime);
        }
    };
    __decorate([
        ViewChild('primary'),
        __metadata("design:type", ElementRef)
    ], TimecoursePlotComponent.prototype, "primary", void 0);
    TimecoursePlotComponent = __decorate([
        Component({
            selector: 'app-timecourse-plot',
            templateUrl: './timecourse-plot.component.html',
            styleUrls: ['./timecourse-plot.component.css']
        }),
        __metadata("design:paramtypes", [DisplayControlService])
    ], TimecoursePlotComponent);
    return TimecoursePlotComponent;
}());
export { TimecoursePlotComponent };
//# sourceMappingURL=timecourse-plot.component.js.map