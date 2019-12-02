var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ChangeDetectorRef, Output, EventEmitter } from "@angular/core";
import { FormControl } from "@angular/forms";
import * as _ from "lodash";
import { DisplayTime } from "./display-time";
import { DisplayControlService } from "../services/display-control.service";
import { DataProcessing } from "../services/data-processing.service";
import { DISTRICTSDATA } from "../berlin-bezirke-simpl";
import { HOSPITALLIST_EMERGENCYHOSPITAL } from "../hospitals-berlin";
import { SimulationDataService } from "../services/simulation-data.service";
var DisplayControlComponent = /** @class */ (function () {
    function DisplayControlComponent(displaycontrolservice, dataprocessing, simulationdataservice, cdr) {
        var _this = this;
        this.displaycontrolservice = displaycontrolservice;
        this.dataprocessing = dataprocessing;
        this.simulationdataservice = simulationdataservice;
        this.mintime = 0;
        this.maxtime = 1;
        this.displaytime = new DisplayTime(0);
        this.dcontrol = new FormControl();
        this.districtlist = this.getAllDistricts();
        this.selecteddistricts = ["None"];
        this.numseldist = 0;
        this.hospitallist = HOSPITALLIST_EMERGENCYHOSPITAL;
        this.options = {
            floor: 0,
            ceil: 7 * 24,
            showTicks: true,
            tickStep: 24,
            translate: function (value) {
                return Math.floor(value / 24) + "d " + (value % 24) + "h";
            },
            getLegend: function (value) {
                var days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
                return days[Math.floor(value / 24) % 7] + " " + 12 + ":00";
            }
        };
        this.endLoading = new EventEmitter();
        displaycontrolservice.displaytime$.subscribe(function (displaytime) { return (_this.displaytime = displaytime); });
        displaycontrolservice.selecteddistricts$.subscribe(function (districts) {
            _this.dcontrol.setValue(districts, { emitEvent: false });
            _this.districtlist = _this.getAllDistricts();
            _this.selecteddistricts = districts;
            _this.numseldist = districts.length;
        });
        simulationdataservice.listts$.subscribe(function (listts) {
            console.log("getting listts");
            var newOptions = Object.assign({}, _this.options);
            newOptions.ceil = _.last(listts);
            newOptions.floor = _.first(listts);
            _this.options = newOptions;
            _this.initiateSubsciptions();
        });
        simulationdataservice.simulationstart$.subscribe(function (simstart) {
            var newOptions = Object.assign({}, _this.options);
            newOptions.getLegend = function (value) {
                var days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
                var index_first_day = days.indexOf(simstart.weekday);
                return (days[(Math.floor((value + simstart.timeoftheday) / 24) +
                    index_first_day) %
                    7] +
                    " " +
                    ("0" + ((value + simstart.timeoftheday) % 24)).slice(-2) +
                    ":00");
            };
            var ticksArray = [newOptions.floor];
            ticksArray = ticksArray.concat(_.range(newOptions.floor + 24 - simstart.timeoftheday, newOptions.ceil, 24));
            ticksArray.push(newOptions.ceil);
            newOptions.ticksArray = ticksArray;
            _this.options = newOptions;
        });
    }
    DisplayControlComponent.prototype.changeTime = function (ts) {
        this.displaycontrolservice.changeTime(ts);
    };
    DisplayControlComponent.prototype.changeSelectedDistricts = function (districts) {
        this.displaycontrolservice.changeSelectedDistricts(districts);
    };
    DisplayControlComponent.prototype.changeSelectedHospitals = function (districts) {
        this.displaycontrolservice.changeSelectedHospitals(districts);
    };
    DisplayControlComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.dcontrol.reset(this.districtlist);
        this.subdistricts = this.dcontrol.valueChanges.subscribe(function (districts) {
            return _this.changeSelectedDistricts(districts);
        });
    };
    DisplayControlComponent.prototype.getAllDistricts = function () {
        var districtlist = [];
        for (var i in DISTRICTSDATA.features) {
            districtlist.push(DISTRICTSDATA.features[i].properties.spatial_alias);
        }
        return districtlist;
    };
    DisplayControlComponent.prototype.getAllHospitals = function () {
        var hospitallist = [];
        for (var i in this.hospitallist) {
            hospitallist.push(this.hospitallist[i]);
        }
        return hospitallist;
    };
    DisplayControlComponent.prototype.initiateSubsciptions = function () {
        console.log("Initializing subscriptions");
        this.changeTime(this.mintime);
        this.changeSelectedDistricts(this.districtlist);
        this.changeSelectedHospitals(this.getAllHospitals());
        // this.changeSelectedHospitals;
        this.dataprocessing.initChoropethDist();
        this.dataprocessing.initChoropethHosp();
        this.endLoading.emit({
            isLoading: false
        });
    };
    DisplayControlComponent.prototype.heatmapactiveChange = function ($event) {
        this.displaycontrolservice.changeHeatmapactive($event.source._checked);
    };
    DisplayControlComponent.prototype.choroplethactiveChange = function ($event) {
        this.choroplethactive = $event.source._checked;
        this.displaycontrolservice.changeChoroplethactive($event.source._checked);
    };
    DisplayControlComponent.prototype.choroplethmodeChange = function ($event) {
        this.displaycontrolservice.changeChoroplethmode($event.value);
    };
    DisplayControlComponent.prototype.selectactiveChange = function ($event) {
        this.selectactive = $event.source._checked;
        this.displaycontrolservice.changeSelectactive($event.source._checked);
    };
    __decorate([
        Output("endLoading"),
        __metadata("design:type", Object)
    ], DisplayControlComponent.prototype, "endLoading", void 0);
    DisplayControlComponent = __decorate([
        Component({
            selector: "app-display-control",
            templateUrl: "./display-control.component.html",
            styleUrls: [
                "./display-control.component.css",
                "./display-control.component.scss"
            ]
        }),
        __metadata("design:paramtypes", [DisplayControlService,
            DataProcessing,
            SimulationDataService,
            ChangeDetectorRef])
    ], DisplayControlComponent);
    return DisplayControlComponent;
}());
export { DisplayControlComponent };
//# sourceMappingURL=display-control.component.js.map