var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, NgZone, ElementRef, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import { DisplayControlService } from '../display-control.service';
import { ChoroplethService } from '../choropleth.service';
import { DISTRICTSDATA } from '../berlin-bezirke';
var MapDisplayComponent = /** @class */ (function () {
    function MapDisplayComponent(displaycontrolservice, choroplethservice, zone) {
        var _this = this;
        this.displaycontrolservice = displaycontrolservice;
        this.choroplethservice = choroplethservice;
        this.zone = zone;
        this.primaryColor = '#000000';
        this.secondaryColor = '#000000';
        this.heatmaplayer = new HeatmapOverlay({
            radius: 0.06,
            maxOpacity: 0.8,
            scaleRadius: true,
            useLocalExtrema: true,
            latField: 'lat',
            lngField: 'lng',
            valueField: 'count'
        });
        this.heatmapdata = {
            data: []
        };
        this.options = {
            zoom: 10,
            center: L.latLng([52.515, 13.405])
        };
        this.heatselect = true;
        this.geoselect = true;
        this.choroselect = true;
        this.basemaplayer = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
                '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            id: 'mapbox.light'
        });
        this.geolayers = [];
        this.chorolayers = [];
        this.choroplethnorm = 5;
        this.selectedsnapshotsub = displaycontrolservice.selectedsnapshot$
            .subscribe(function (selectedsnapshot) {
            _this.changeHeatmap(selectedsnapshot.points);
        });
        this.districtchoroplethsub = choroplethservice.selectedchrorplethdist$
            .subscribe(function (choropleth) {
            console.log(choropleth);
            _this.chorolayers = [];
            var districtsgeojson = L.geoJSON(DISTRICTSDATA);
            districtsgeojson.eachLayer(function (layer) {
                var districtname = layer.feature.properties.spatial_alias;
                var choroplethvalue = _.find(choropleth.distdata, function (datum) { return datum.district == districtname; }).cases;
                layer.options.opacity = 0.0;
                layer.options.color = "#D30000";
                layer.options.fillOpacity = choroplethvalue / choropleth.maximum;
                _this.chorolayers.push(layer);
            });
        });
        displaycontrolservice.selecteddistricts$.subscribe(function (districts) {
            _this.selecteddistricts = districts;
            _this.geolayers = [];
            var districtsgeojson = L.geoJSON(DISTRICTSDATA);
            districtsgeojson.eachLayer(function (layer) {
                layer.options.color = "#000000";
                layer.options.fillOpacity = 0.0;
                layer.options.opacity = 0.0;
                if (_.find(_this.selecteddistricts, function (d) { return d === layer.feature.properties.spatial_alias; }) === undefined) {
                    layer.on({ click: function (e) {
                            _this.zone.run(function () {
                                var selecteddistricts_copy = _.cloneDeep(_this.selecteddistricts);
                                selecteddistricts_copy.push(e.target.feature.properties.spatial_alias);
                                _this.displaycontrolservice.changeSelectedDistricts(selecteddistricts_copy);
                            });
                        } });
                }
                else {
                    layer.on({ click: function (e) {
                            _this.zone.run(function () {
                                var selecteddistricts_copy = _.cloneDeep(_this.selecteddistricts);
                                _.remove(selecteddistricts_copy, function (x) { return x === layer.feature.properties.spatial_alias; });
                                _this.displaycontrolservice.changeSelectedDistricts(selecteddistricts_copy);
                            });
                        } });
                    layer.options.opacity = 0.4;
                }
                _this.geolayers.push(layer);
            });
        });
    }
    MapDisplayComponent.prototype.onMapReady = function (map) {
        map.scrollWheelZoom.disable();
    };
    MapDisplayComponent.prototype.ngAfterViewInit = function () {
        this.primaryColor = getComputedStyle(this.primary.nativeElement).color;
        this.secondaryColor = getComputedStyle(this.secondary.nativeElement).color;
    };
    MapDisplayComponent.prototype.changeHeatmap = function (heatcoodinates) {
        this.heatmapdata.data = [];
        for (var index in heatcoodinates) {
            this.heatmapdata.data.push({
                lat: heatcoodinates[index][1],
                lng: heatcoodinates[index][0],
                count: 1
            });
        }
        this.heatmaplayer.setData(this.heatmapdata);
    };
    __decorate([
        ViewChild('primary'),
        __metadata("design:type", ElementRef)
    ], MapDisplayComponent.prototype, "primary", void 0);
    __decorate([
        ViewChild('secondary'),
        __metadata("design:type", ElementRef)
    ], MapDisplayComponent.prototype, "secondary", void 0);
    MapDisplayComponent = __decorate([
        Component({
            selector: 'app-map-display',
            templateUrl: './map-display.component.html',
            styleUrls: ['./map-display.component.css']
        }),
        __metadata("design:paramtypes", [DisplayControlService, ChoroplethService, NgZone])
    ], MapDisplayComponent);
    return MapDisplayComponent;
}());
export { MapDisplayComponent };
//# sourceMappingURL=map-display.component.js.map