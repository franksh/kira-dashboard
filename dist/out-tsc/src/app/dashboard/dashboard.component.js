var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component } from "@angular/core";
import { BreakpointObserver } from "@angular/cdk/layout";
var DashboardComponent = /** @class */ (function () {
    function DashboardComponent(breakpointObserver) {
        this.breakpointObserver = breakpointObserver;
        /** Based on the screen size, switch from standard to one column per row */
        this.isSmallScreen = false;
        this.isLoading = true;
        breakpointObserver.observe("(max-width: 1528px)").subscribe(function (result) {
            console.log(result);
            var accordion = document.getElementById("side-accordion");
            var map = document.getElementById("map-div");
            if (result.matches) {
                accordion.style.width = "100%";
                accordion.style.minWidth = "800px";
                map.style.width = "100%";
            }
            else {
                accordion.style.width = "calc(30% + 200px)";
                accordion.style.minWidth = "400px";
                map.style.width = "calc(70% - 240px)";
            }
        });
    }
    // Call this to start / end loading animation
    DashboardComponent.prototype.onToggleLoading = function (event) {
        this.isLoading = event.isLoading;
    };
    DashboardComponent = __decorate([
        Component({
            selector: "app-dashboard",
            templateUrl: "./dashboard.component.html",
            styleUrls: ["./dashboard.component.css"]
        }),
        __metadata("design:paramtypes", [BreakpointObserver])
    ], DashboardComponent);
    return DashboardComponent;
}());
export { DashboardComponent };
//# sourceMappingURL=dashboard.component.js.map