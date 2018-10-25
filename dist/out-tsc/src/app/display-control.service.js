var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@angular/core';
import { of, Subject } from 'rxjs';
import { SIMMOCKUP } from './display-control/simulation-result-mockup';
import { DisplayTime } from './display-control/display-time';
var DisplayControlService = /** @class */ (function () {
    function DisplayControlService() {
        // Observable sources
        this.simresultSource = new Subject();
        this.displaytimeSource = new Subject();
        this.selectedsnapshotSource = new Subject();
        this.selecteddistrictsSource = new Subject();
        // Observable streams
        this.simresult$ = this.simresultSource.asObservable();
        this.displaytime$ = this.displaytimeSource.asObservable();
        this.selectedsnapshot$ = this.selectedsnapshotSource.asObservable();
        this.selecteddistricts$ = this.selecteddistrictsSource.asObservable();
        this.simresult = SIMMOCKUP;
    }
    DisplayControlService.prototype.changeTime = function (ts) {
        var time = new DisplayTime(ts);
        this.displaytimeSource.next(time);
        this.selectedsnapshotSource.next(this.simresult.snapshots.find(function (snaps) { return snaps.timestamp === ts; }));
    };
    DisplayControlService.prototype.changeSelectedDistricts = function (districts) {
        this.selecteddistrictsSource.next(districts);
    };
    DisplayControlService.prototype.getSimulationResult = function () {
        return of(this.simresult);
    };
    DisplayControlService = __decorate([
        Injectable({
            providedIn: 'root'
        }),
        __metadata("design:paramtypes", [])
    ], DisplayControlService);
    return DisplayControlService;
}());
export { DisplayControlService };
//# sourceMappingURL=display-control.service.js.map