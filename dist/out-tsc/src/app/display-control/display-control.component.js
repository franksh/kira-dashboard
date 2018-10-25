var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ChangeDetectorRef } from '@angular/core';
import { FormControl, } from '@angular/forms';
import { DisplayTime } from './display-time';
import { DisplayControlService } from '../display-control.service';
import { DISTRICTSDATA } from '../berlin-bezirke';
var DisplayControlComponent = /** @class */ (function () {
    function DisplayControlComponent(displaycontrolservice, cdr) {
        var _this = this;
        this.displaycontrolservice = displaycontrolservice;
        this.displaytime = new DisplayTime(0);
        this.dcontrol = new FormControl();
        this.districtlist = this.getAllDistricts();
        this.selecteddistricts = ['None'];
        this.numseldist = 0;
        displaycontrolservice.displaytime$
            .subscribe(function (displaytime) { return _this.displaytime = displaytime; });
        displaycontrolservice.selecteddistricts$
            .subscribe(function (districts) {
            _this.dcontrol.setValue(districts, { emitEvent: false });
            _this.districtlist = _this.getAllDistricts();
            _this.selecteddistricts = districts;
            _this.numseldist = districts.length;
        });
    }
    DisplayControlComponent.prototype.changeTime = function (ts) {
        this.displaycontrolservice.changeTime(ts);
    };
    DisplayControlComponent.prototype.changeSelectedDistricts = function (districts) {
        this.displaycontrolservice.changeSelectedDistricts(districts);
    };
    DisplayControlComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.dcontrol.reset(this.districtlist);
        this.subdistricts = this.dcontrol.valueChanges.subscribe(function (districts) { return _this.changeSelectedDistricts(districts); });
    };
    DisplayControlComponent.prototype.getAllDistricts = function () {
        var districtlist = [];
        for (var feature in DISTRICTSDATA.features) {
            districtlist.push(DISTRICTSDATA.features[feature].properties.spatial_alias);
        }
        return districtlist;
    };
    DisplayControlComponent.prototype.initiateSubsciptions = function () {
        console.log("init");
        this.changeTime(0);
        this.changeSelectedDistricts(this.districtlist);
    };
    DisplayControlComponent = __decorate([
        Component({
            selector: 'app-display-control',
            templateUrl: './display-control.component.html',
            styleUrls: ['./display-control.component.css'],
        }),
        __metadata("design:paramtypes", [DisplayControlService, ChangeDetectorRef])
    ], DisplayControlComponent);
    return DisplayControlComponent;
}());
export { DisplayControlComponent };
//# sourceMappingURL=display-control.component.js.map