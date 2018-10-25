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
import { Subject, combineLatest } from 'rxjs';
import pointsWithinPolygon from '@turf/points-within-polygon';
import { points, polygon } from '@turf/helpers';
import voronoi from '@turf/voronoi';
import bbox from '@turf/bbox';
import { DisplayControlService } from './display-control.service';
import { DISTRICTSDATA } from './berlin-bezirke';
import { HOSPITALDATA } from './hospitals-berlin';
import { SIMMOCKUP } from './display-control/simulation-result-mockup';
var ChoroplethService = /** @class */ (function () {
    function ChoroplethService(displaycontrolservice) {
        var _this = this;
        this.displaycontrolservice = displaycontrolservice;
        this.simresult = SIMMOCKUP;
        this.districtsdata = DISTRICTSDATA;
        this.hospitaldata = HOSPITALDATA;
        this.allchrorplethdistsSource = new Subject();
        this.allchrorplethdists$ = this.allchrorplethdistsSource.asObservable();
        this.allchrorplethhospSource = new Subject();
        this.allchrorplethhosp$ = this.allchrorplethhospSource.asObservable();
        this.selectedchrorplethdistSource = new Subject();
        this.selectedchrorplethdist$ = this.selectedchrorplethdistSource.asObservable();
        this.selectedchrorplethhospSource = new Subject();
        this.selectedchrorplethhosp$ = this.selectedchrorplethhospSource.asObservable();
        this.displaytimesub = combineLatest(displaycontrolservice.displaytime$, this.allchrorplethdists$)
            .subscribe(function (_a) {
            var time = _a[0], allchrorplethdists = _a[1];
            var chororplethdist = { distdata: allchrorplethdists[time.timestamp], maximum: _this.maxvaluechrorplethdists };
            _this.selectedchrorplethdistSource.next(chororplethdist);
        });
        this.displaytimesub = combineLatest(displaycontrolservice.displaytime$, this.allchrorplethhosp$)
            .subscribe(function (_a) {
            var time = _a[0], allchrorplethhosp = _a[1];
            var chororpleth = { distdata: allchrorplethhosp[time.timestamp], maximum: _this.maxvaluechrorplethhosp };
            _this.selectedchrorplethhospSource.next(chororpleth);
            console.log(chororpleth);
        });
        this.initChoropethDist();
        this.initChoropethHosp();
    }
    ChoroplethService.prototype.computeChoroplethDist = function (districtsdata, snapshot) {
        var choropleth = { distdata: [], maximum: 0 };
        var snappoints = points(snapshot.points);
        for (var i in districtsdata.features) {
            var district = districtsdata.features[i].properties.spatial_alias;
            var distpolygon = polygon(districtsdata.features[i].geometry.coordinates);
            var cases = pointsWithinPolygon(snappoints, distpolygon).features.length;
            choropleth.distdata.push({ 'district': district, 'cases': pointsWithinPolygon(snappoints, distpolygon).features.length });
            if (cases > choropleth.maximum) {
                choropleth.maximum = cases;
            }
        }
        return choropleth;
    };
    ChoroplethService.prototype.initChoropethDist = function () {
        var allchrorplethdists = [];
        this.maxvaluechrorplethdists = 0;
        for (var i in this.simresult.snapshots) {
            var snapshot = this.simresult.snapshots[i];
            var ts = snapshot.timestamp;
            var choropleth = this.computeChoroplethDist(this.districtsdata, snapshot);
            allchrorplethdists[ts] = choropleth.distdata;
            if (choropleth.maximum > this.maxvaluechrorplethdists) {
                this.maxvaluechrorplethdists = choropleth.maximum;
            }
        }
        this.allchrorplethdistsSource.next(allchrorplethdists);
    };
    ChoroplethService.prototype.computeChoroplethHosp = function (hospitalnames, voronoihospitals, snapshot) {
        var choropleth = { distdata: [], maximum: 0 };
        var snappoints = points(snapshot.points);
        for (var i in voronoihospitals.features) {
            var name = hospitalnames[i];
            var distpolygon = voronoihospitals.features[i];
            var cases = pointsWithinPolygon(snappoints, distpolygon).features.length;
            choropleth.distdata.push({ 'district': name, 'cases': cases });
            if (cases > choropleth.maximum) {
                choropleth.maximum = cases;
            }
        }
        return choropleth;
    };
    ChoroplethService.prototype.initChoropethHosp = function () {
        var hospitalcoodinates = [];
        var hospitalname = [];
        for (var i in this.hospitaldata) {
            var hospital = this.hospitaldata[i];
            hospitalcoodinates.push([hospital.lon, hospital.lat]);
            hospitalname.push(hospital.address.hospital);
        }
        var hospitalpoints = points(hospitalcoodinates);
        var bboxberlin = bbox(this.districtsdata);
        var voronoihospitals = voronoi(hospitalpoints, { bbox: bboxberlin });
        console.log(voronoihospitals);
        var allchrorplethhosp = [];
        this.maxvaluechrorplethhosp = 0;
        for (var i in this.simresult.snapshots) {
            var snapshot = this.simresult.snapshots[i];
            var ts = snapshot.timestamp;
            var choropleth = this.computeChoroplethHosp(hospitalname, voronoihospitals, snapshot);
            allchrorplethhosp[ts] = choropleth.distdata;
            if (choropleth.maximum > this.maxvaluechrorplethhosp) {
                this.maxvaluechrorplethhosp = choropleth.maximum;
            }
        }
        this.allchrorplethdistsSource.next(allchrorplethhosp);
    };
    ChoroplethService = __decorate([
        Injectable({
            providedIn: 'root'
        }),
        __metadata("design:paramtypes", [DisplayControlService])
    ], ChoroplethService);
    return ChoroplethService;
}());
export { ChoroplethService };
//# sourceMappingURL=choropleth.service.js.map