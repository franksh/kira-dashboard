var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component } from '@angular/core';
import { map } from 'rxjs/operators';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
var DashboardComponent = /** @class */ (function () {
    function DashboardComponent(breakpointObserver) {
        this.breakpointObserver = breakpointObserver;
        /** Based on the screen size, switch from standard to one column per row */
        this.cards = this.breakpointObserver.observe(Breakpoints.Handset).pipe(map(function (_a) {
            var matches = _a.matches;
            if (matches) {
                return [
                    { title: 'Simulation Variables', cols: 1, rows: 1 },
                    { title: 'Display Variables', cols: 1, rows: 1 },
                    { title: 'Table', cols: 1, rows: 1 },
                    { title: 'Map', cols: 1, rows: 1 },
                    { title: 'Time Course', cols: 1, rows: 1 }
                ];
            }
            return [
                { title: 'Simulation Variables', cols: 1, rows: 1 },
                { title: 'Display Variables', cols: 1, rows: 1 },
                { title: 'Table', cols: 1, rows: 2 },
                { title: 'Map', cols: 1, rows: 2 },
                { title: 'Time Course', cols: 2, rows: 1 }
            ];
        }));
    }
    DashboardComponent = __decorate([
        Component({
            selector: 'app-dashboard',
            templateUrl: './dashboard.component.html',
            styleUrls: ['./dashboard.component.css']
        }),
        __metadata("design:paramtypes", [BreakpointObserver])
    ], DashboardComponent);
    return DashboardComponent;
}());
export { DashboardComponent };
//# sourceMappingURL=dashboard.component.js.map