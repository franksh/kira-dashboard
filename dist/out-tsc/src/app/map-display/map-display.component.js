var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, NgZone, ElementRef, ViewChild } from "@angular/core";
import * as _ from "lodash";
import { DisplayControlService } from "../services/display-control.service";
import { DataProcessing } from "../services/data-processing.service";
import { DISTRICTSDATA } from "../berlin-bezirke";
import { DISTRICT_COLORS } from "../districtcolors";
import { HOSPITAL_COLORS } from "../hospitalcolors";
var MapDisplayComponent = /** @class */ (function () {
    function MapDisplayComponent(displaycontrolservice, dataprocessing, zone) {
        var _this = this;
        this.displaycontrolservice = displaycontrolservice;
        this.dataprocessing = dataprocessing;
        this.zone = zone;
        this.primaryColor = "#000000";
        this.secondaryColor = "#000000";
        this.heatmaplayer = new HeatmapOverlay({
            radius: 0.02,
            maxOpacity: 0.8,
            scaleRadius: true,
            latField: "lat",
            lngField: "lng",
            valueField: "count"
        });
        this.heatmapdata = {
            data: []
        };
        this.options = {
            zoom: 10,
            center: L.latLng([52.515, 13.405])
        };
        this.heatmapactive = false;
        this.choroplethactive = false;
        this.choroplethmode_isdistrict = true;
        this.selectactive = false;
        this.basemaplayer = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw", {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
                '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            id: "mapbox.light"
        });
        this.geolayers = [];
        this.hospgeolayers = [];
        this.distchorolayers = [];
        this.hospchorolayers = [];
        this.layers = [];
        this.choroplethnorm = 5;
        this.layertoggle = true;
        this.displaycontrolservice.heatmapactive$.subscribe(function (state) {
            _this.heatmapactive = state;
            _this.updateLayers();
        });
        this.displaycontrolservice.choroplethactive$.subscribe(function (state) {
            _this.choroplethactive = state;
            _this.updateLayers();
        });
        this.displaycontrolservice.choroplethmode$.subscribe(function (state) {
            state == "district"
                ? (_this.choroplethmode_isdistrict = true)
                : (_this.choroplethmode_isdistrict = false);
            _this.updateLayers();
        });
        this.displaycontrolservice.selectactive$.subscribe(function (state) {
            _this.selectactive = state;
            _this.updateLayers();
        });
        this.selectedsnapshotsub = dataprocessing.selectedsnapshot$.subscribe(function (selectedsnapshot) {
            _this.changeHeatmap(selectedsnapshot.points);
            _this.updateLayers();
        });
        this.districtchoroplethsub = dataprocessing.selectedchoroplethdist$.subscribe(function (choropleth) {
            _this.distchorolayers = [];
            var districtsgeojson = L.geoJSON(DISTRICTSDATA);
            districtsgeojson.eachLayer(function (layer) {
                var districtname = layer.feature.properties.spatial_alias;
                var distdata = choropleth.distdata;
                var choroplethvalue = distdata.find(function (datum) { return datum.district == districtname; }).cases;
                layer.options.opacity = 0.8;
                layer.options.color = "#FFFFFF";
                layer.options.weight = 1;
                layer.options.fillColor = "#003366";
                layer.options.fillOpacity =
                    (0.8 * Math.log(choroplethvalue + 1)) /
                        Math.log(choropleth.maximum);
                _this.distchorolayers.push(layer);
            });
            _this.updateLayers();
        });
        this.hospitalchoroplethsub = dataprocessing.selectedchoroplethhosp$.subscribe(function (choropleth) {
            _this.hospchorolayers = [];
            var hospitalgeojson = L.geoJSON(dataprocessing.getvoronoihospitals());
            hospitalgeojson.eachLayer(function (layer) {
                var hospitalname = layer.feature.properties.name;
                var distdata = choropleth.distdata;
                var choroplethvalue = distdata.find(function (datum) { return datum.district == hospitalname; }).cases;
                layer.options.opacity = 0.8;
                layer.options.color = "#FFFFFF";
                layer.options.weight = 1;
                layer.options.fillColor = "#003366";
                layer.options.fillOpacity =
                    (0.8 * Math.log(choroplethvalue + 1)) /
                        Math.log(choropleth.maximum);
                _this.hospchorolayers.push(layer);
            });
            _this.updateLayers();
        });
        displaycontrolservice.selecteddistricts$.subscribe(function (districts) {
            _this.selecteddistricts = districts;
            _this.geolayers = [];
            var districtsgeojson = L.geoJSON(DISTRICTSDATA);
            districtsgeojson.eachLayer(function (layer) {
                layer.options.color =
                    DISTRICT_COLORS[layer.feature.properties.spatial_alias];
                layer.options.fillOpacity = 0;
                layer.options.opacity = 0.0;
                if (_.find(_this.selecteddistricts, function (d) { return d == layer.feature.properties.spatial_alias; }) === undefined) {
                    layer.on({
                        click: function (e) {
                            _this.zone.run(function () {
                                var selecteddistricts_copy = _.cloneDeep(_this.selecteddistricts);
                                selecteddistricts_copy.push(e.target.feature.properties.spatial_alias);
                                _this.displaycontrolservice.changeSelectedDistricts(selecteddistricts_copy);
                            });
                        }
                    });
                }
                else {
                    layer.on({
                        click: function (e) {
                            _this.zone.run(function () {
                                var selecteddistricts_copy = _.cloneDeep(_this.selecteddistricts);
                                _.remove(selecteddistricts_copy, function (x) { return x == layer.feature.properties.spatial_alias; });
                                _this.displaycontrolservice.changeSelectedDistricts(selecteddistricts_copy);
                            });
                        }
                    });
                    layer.options.opacity = 0.8;
                }
                _this.geolayers.push(layer);
            });
            _this.updateLayers();
        });
        displaycontrolservice.selectedhospitals$.subscribe(function (hospitals) {
            _this.selectedhospitals = hospitals;
            _this.hospgeolayers = [];
            var voronoihospitals = dataprocessing.getvoronoihospitals(); // this.shrinkPolygons(dataprocessing.getvoronoihospitals())
            var hospitalgeojson = L.geoJSON(voronoihospitals);
            hospitalgeojson.eachLayer(function (layer) {
                layer.options.color = HOSPITAL_COLORS[layer.feature.properties.name];
                layer.options.fillOpacity = 0;
                layer.options.opacity = 0.0;
                if (_.find(_this.selectedhospitals, function (d) { return d == layer.feature.properties.name; }) === undefined) {
                    layer.on({
                        click: function (e) {
                            _this.zone.run(function () {
                                var selectedhospitals_copy = _.cloneDeep(_this.selectedhospitals);
                                selectedhospitals_copy.push(e.target.feature.properties.name);
                                _this.displaycontrolservice.changeSelectedHospitals(selectedhospitals_copy);
                            });
                        }
                    });
                }
                else {
                    layer.on({
                        click: function (e) {
                            _this.zone.run(function () {
                                var selectedhospitals_copy = _.cloneDeep(_this.selectedhospitals);
                                _.remove(selectedhospitals_copy, function (x) { return x == layer.feature.properties.name; });
                                _this.displaycontrolservice.changeSelectedHospitals(selectedhospitals_copy);
                            });
                        }
                    });
                    layer.options.opacity = 0.7;
                }
                _this.hospgeolayers.push(layer);
            });
            _this.updateLayers();
        });
    }
    MapDisplayComponent.prototype.onMapReady = function (map) {
        map.scrollWheelZoom.disable();
    };
    MapDisplayComponent.prototype.ngAfterViewInit = function () {
        this.primaryColor = getComputedStyle(this.primary.nativeElement).color;
        this.secondaryColor = getComputedStyle(this.secondary.nativeElement).color;
    };
    MapDisplayComponent.prototype.changeHeatmap = function (heatcoordinates) {
        this.heatmapdata.data = [];
        for (var index in heatcoordinates) {
            this.heatmapdata.data.push({
                lat: heatcoordinates[index][1],
                lng: heatcoordinates[index][0],
                count: 0.1
            });
        }
        this.heatmaplayer.setData(this.heatmapdata);
    };
    MapDisplayComponent.prototype.updateLayers = function () {
        this.layers = [];
        if (this.heatmapactive) {
            this.layers.push(this.heatmaplayer);
        }
        if (this.choroplethactive) {
            if (this.choroplethmode_isdistrict) {
                this.layers = this.layers.concat(this.distchorolayers);
            }
            else {
                this.layers = this.layers.concat(this.hospchorolayers);
            }
        }
        if (this.selectactive) {
            if (this.choroplethmode_isdistrict) {
                this.layers = this.layers.concat(this.geolayers);
            }
            else {
                this.layers = this.layers.concat(this.hospgeolayers);
            }
        }
        this.layertoggle = !this.layertoggle;
    };
    __decorate([
        ViewChild("primary"),
        __metadata("design:type", ElementRef)
    ], MapDisplayComponent.prototype, "primary", void 0);
    __decorate([
        ViewChild("secondary"),
        __metadata("design:type", ElementRef)
    ], MapDisplayComponent.prototype, "secondary", void 0);
    MapDisplayComponent = __decorate([
        Component({
            selector: "app-map-display",
            templateUrl: "./map-display.component.html",
            styleUrls: ["./map-display.component.css"]
        }),
        __metadata("design:paramtypes", [DisplayControlService,
            DataProcessing,
            NgZone])
    ], MapDisplayComponent);
    return MapDisplayComponent;
}());
export { MapDisplayComponent };
//# sourceMappingURL=map-display.component.js.map