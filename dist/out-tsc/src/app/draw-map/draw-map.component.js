var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input } from '@angular/core';
import { DISTRICTSDATA } from '../berlin-bezirke';
import { DisplayControlService } from '../display-control.service';
var DrawMapComponent = /** @class */ (function () {
    function DrawMapComponent(displaycontrolservice) {
        var _this = this;
        this.displaycontrolservice = displaycontrolservice;
        this.heatmapLayer = new HeatmapOverlay({
            radius: 0.02,
            maxOpacity: 0.8,
            scaleRadius: true,
            useLocalExtrema: true,
            latField: 'lat',
            lngField: 'lng',
            valueField: 'count'
        });
        this.districts = L.geoJSON(DISTRICTSDATA);
        this.options = {
            zoom: 10,
            center: L.latLng([52.515, 13.405])
        };
        this.layersControl = {
            baseLayers: {
                'Base Map': L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
                    maxZoom: 18,
                    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
                        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                    id: 'mapbox.light'
                })
            },
            overlays: {
                'Heatmap': this.heatmapLayer,
                'Districts': this.districts
            }
        };
        this.heatmapdata = {
            data: []
        };
        this.displaycontrolservice.selecteddistricts$
            .subscribe(function (districts) {
            _this.selecteddistricts = districts;
        });
    }
    DrawMapComponent.prototype.onMapReady = function (map) {
        var _this = this;
        map.on('mousemove', function (event) {
            _this.heatmapdata.data.push({
                lat: event.latlng.lat,
                lng: event.latlng.lng,
                count: 1
            });
            _this.heatmapLayer.setData(_this.heatmapdata);
        });
    };
    DrawMapComponent.prototype.ngOnInit = function () {
        this.heatmapdata.data = [];
        for (var index in this.heatcoodinates.slice()) {
            this.heatmapdata.data.push({
                lat: this.heatcoodinates[index][0],
                lng: this.heatcoodinates[index][1],
                count: 1
            });
        }
        this.heatmapLayer.setData(this.heatmapdata);
    };
    DrawMapComponent.prototype.ngOnChanges = function () {
        console.log(this.heatmapdata);
        //this.heatmapdata.data = [];
        for (var index in this.heatcoodinates) {
            this.heatmapdata.data.push({
                lat: this.heatcoodinates[index][0],
                lng: this.heatcoodinates[index][1],
                count: 1
            });
        }
        //this.heatmapLayer.setData(this.heatmapdata);
        //console.log(this.heatmapdata)
    };
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], DrawMapComponent.prototype, "heatcoodinates", void 0);
    DrawMapComponent = __decorate([
        Component({
            selector: 'app-draw-map',
            templateUrl: './draw-map.component.html',
            styleUrls: ['./draw-map.component.css']
        }),
        __metadata("design:paramtypes", [DisplayControlService])
    ], DrawMapComponent);
    return DrawMapComponent;
}());
export { DrawMapComponent };
//# sourceMappingURL=draw-map.component.js.map