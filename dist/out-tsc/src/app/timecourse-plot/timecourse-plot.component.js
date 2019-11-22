var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ViewChild, ElementRef } from "@angular/core";
import { combineLatest } from "rxjs";
import { DisplayControlService } from "../services/display-control.service";
import { DataProcessing } from "../services/data-processing.service";
import { SimulationDataService } from "../services/simulation-data.service";
var TimecoursePlotComponent = /** @class */ (function () {
    function TimecoursePlotComponent(displaycontrolservice, dataprocessing, simulationdataservice) {
        var _this = this;
        this.displaycontrolservice = displaycontrolservice;
        this.dataprocessing = dataprocessing;
        this.simulationdataservice = simulationdataservice;
        this.choroplethmode_isdistrict = true;
        this.alldistrictsdata = [];
        this.graph = {
            datadist: [],
            datahosp: [],
            layout: {
                xaxis: {
                    title: "Time [h]",
                    titlefont: {
                        family: "Roboto, sans-serif",
                        size: 18,
                        color: "grey"
                    }
                },
                yaxis: {
                    title: "Number of Cases",
                    titlefont: {
                        family: "Roboto, sans-serif",
                        size: 18,
                        color: "grey"
                    }
                },
                autoresize: true,
                margin: {
                    l: 60,
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
        this.color = "#000000";
        displaycontrolservice.choroplethmode$.subscribe(function (state) {
            state == "district"
                ? (_this.choroplethmode_isdistrict = true)
                : (_this.choroplethmode_isdistrict = false);
        });
        combineLatest(dataprocessing.allchoroplethdists$, displaycontrolservice.selecteddistricts$, simulationdataservice.listts$).subscribe(function (_a) {
            var choropleths = _a[0], districts = _a[1], listts = _a[2];
            _this.graph.datadist = [];
            var x = Array(listts.length).fill(0);
            var y = Array(listts.length).fill(0);
            for (var i in districts) {
                for (var j in listts) {
                    var ts = listts[j];
                    y[j] += choropleths[ts].find(function (data) { return data.district == districts[i]; }).cases;
                    x[j] = ts;
                }
            }
            _this.graph.datadist = [
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
        combineLatest(dataprocessing.allchoroplethhosp$, displaycontrolservice.selectedhospitals$, simulationdataservice.listts$).subscribe(function (_a) {
            var choropleths = _a[0], hospital = _a[1], listts = _a[2];
            _this.graph.datahosp = [];
            var x = Array(listts.length).fill(0);
            var y = Array(listts.length).fill(0);
            for (var i in hospital) {
                for (var j in listts) {
                    var ts = listts[j];
                    y[j] += choropleths[ts].find(function (data) { return data.district == hospital[i]; }).cases;
                    x[j] = ts;
                }
            }
            _this.graph.datahosp = [
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
    TimecoursePlotComponent.prototype.ngAfterViewInit = function () {
        var primaryColor = getComputedStyle(this.primary.nativeElement).color;
        this.color = primaryColor;
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
        ViewChild("primary"),
        __metadata("design:type", ElementRef)
    ], TimecoursePlotComponent.prototype, "primary", void 0);
    TimecoursePlotComponent = __decorate([
        Component({
            selector: "app-timecourse-plot",
            templateUrl: "./timecourse-plot.component.html",
            styleUrls: ["./timecourse-plot.component.css"]
        }),
        __metadata("design:paramtypes", [DisplayControlService,
            DataProcessing,
            SimulationDataService])
    ], TimecoursePlotComponent);
    return TimecoursePlotComponent;
}());
export { TimecoursePlotComponent };
//# sourceMappingURL=timecourse-plot.component.js.map