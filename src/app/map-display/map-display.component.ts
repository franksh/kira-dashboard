import {
  Component,
  OnInit,
  NgZone,
  ElementRef,
  ViewChild,
  AfterViewInit
} from "@angular/core";
import { Observable, Subscription } from "rxjs";

declare var L;
declare var HeatmapOverlay;
import * as _ from "lodash";

import { SimSnapshot, SimulationResult } from "../services/simulation-result";
import { DisplayTime } from "../display-control/display-time";
import { DisplayControlService } from "../services/display-control.service";
import {
  DataProcessing,
  DistData,
  Choropleth
} from "../services/data-processing.service";
import { DISTRICTSDATA } from "../berlin-bezirke";
import { DISTRICT_COLORS } from "../districtcolors";
import { HOSPITAL_COLORS } from "../hospitalcolors";

@Component({
  selector: "app-map-display",
  templateUrl: "./map-display.component.html",
  styleUrls: ["./map-display.component.css"]
})
export class MapDisplayComponent implements AfterViewInit {
  @ViewChild("primary")
  primary: ElementRef;
  @ViewChild("secondary")
  secondary: ElementRef;
  primaryColor = "#000000";
  secondaryColor = "#000000";

  selecteddistricts: string[];
  selectedhospitals: string[];
  selectedsnapshotsub: Subscription;

  districtchoroplethsub: Subscription;
  hospitalchoroplethsub: Subscription;

  heatmaplayer = new HeatmapOverlay({
    radius: 0.02,
    maxOpacity: 0.8,
    scaleRadius: true,
    latField: "lat",
    lngField: "lng",
    valueField: "count"
  });
  heatmapdata = {
    data: []
  };

  options: any = {
    zoom: 10,
    center: L.latLng([52.515, 13.405])
  };

  heatmapactive = false;
  choroplethactive = false;
  choroplethmode_isdistrict = true;
  selectactive = false;

  basemaplayer = L.tileLayer(
    "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",
    {
      maxZoom: 18,
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      id: "mapbox.light"
    }
  );

  geolayers: any[] = [];
  hospgeolayers: any[] = [];
  distchorolayers: any[] = [];
  hospchorolayers: any[] = [];
  layers: any[] = [];
  choroplethnorm: number = 5;

  layertoggle = true;

  constructor(
    private displaycontrolservice: DisplayControlService,
    public dataprocessing: DataProcessing,
    private zone: NgZone
  ) {
    this.displaycontrolservice.heatmapactive$.subscribe(state => {
      this.heatmapactive = state;
      this.updateLayers();
    });
    this.displaycontrolservice.choroplethactive$.subscribe(state => {
      this.choroplethactive = state;
      this.updateLayers();
    });
    this.displaycontrolservice.choroplethmode$.subscribe(state => {
      state == "district"
        ? (this.choroplethmode_isdistrict = true)
        : (this.choroplethmode_isdistrict = false);
      this.updateLayers();
    });
    this.displaycontrolservice.selectactive$.subscribe(state => {
      this.selectactive = state;
      this.updateLayers();
    });

    this.selectedsnapshotsub = dataprocessing.selectedsnapshot$.subscribe(
      selectedsnapshot => {
        this.changeHeatmap(selectedsnapshot.points);
        this.updateLayers();
      }
    );

    this.districtchoroplethsub = dataprocessing.selectedchoroplethdist$.subscribe(
      (choropleth: Choropleth) => {
        this.distchorolayers = [];
        var districtsgeojson = L.geoJSON(DISTRICTSDATA as any);
        districtsgeojson.eachLayer(layer => {
          var districtname = layer.feature.properties.spatial_alias;
          var distdata: any[] = choropleth.distdata;
          var choroplethvalue = distdata.find(
            datum => datum.district == districtname
          ).cases;
          layer.options.opacity = 0.8;
          layer.options.color = "#FFFFFF";
          layer.options.weight = 1;
          layer.options.fillColor = "#003366";
          layer.options.fillOpacity =
            (0.8 * Math.log(choroplethvalue + 1)) /
            Math.log(choropleth.maximum);
          this.distchorolayers.push(layer);
        });
        this.updateLayers();
      }
    );
    this.hospitalchoroplethsub = dataprocessing.selectedchoroplethhosp$.subscribe(
      (choropleth: Choropleth) => {
        this.hospchorolayers = [];
        var hospitalgeojson = L.geoJSON(dataprocessing.getvoronoihospitals());
        hospitalgeojson.eachLayer(layer => {
          var hospitalname = layer.feature.properties.name;
          var distdata: any[] = choropleth.distdata;
          var choroplethvalue = distdata.find(
            datum => datum.district == hospitalname
          ).cases;
          layer.options.opacity = 0.8;
          layer.options.color = "#FFFFFF";
          layer.options.weight = 1;
          layer.options.fillColor = "#003366";
          layer.options.fillOpacity =
            (0.8 * Math.log(choroplethvalue + 1)) /
            Math.log(choropleth.maximum);
          this.hospchorolayers.push(layer);
        });
        this.updateLayers();
      }
    );

    displaycontrolservice.selecteddistricts$.subscribe(districts => {
      this.selecteddistricts = districts;
      this.geolayers = [];
      var districtsgeojson = L.geoJSON(DISTRICTSDATA as any);
      districtsgeojson.eachLayer(layer => {
        layer.options.color =
          DISTRICT_COLORS[layer.feature.properties.spatial_alias];
        layer.options.fillOpacity = 0;
        layer.options.opacity = 0.0;
        if (
          _.find(
            this.selecteddistricts,
            d => d == layer.feature.properties.spatial_alias
          ) === undefined
        ) {
          layer.on({
            click: e => {
              this.zone.run(() => {
                var selecteddistricts_copy = _.cloneDeep(
                  this.selecteddistricts
                );
                selecteddistricts_copy.push(
                  e.target.feature.properties.spatial_alias
                );
                this.displaycontrolservice.changeSelectedDistricts(
                  selecteddistricts_copy
                );
              });
            }
          });
        } else {
          layer.on({
            click: e => {
              this.zone.run(() => {
                var selecteddistricts_copy = _.cloneDeep(
                  this.selecteddistricts
                );
                _.remove(
                  selecteddistricts_copy,
                  x => x == layer.feature.properties.spatial_alias
                );
                this.displaycontrolservice.changeSelectedDistricts(
                  selecteddistricts_copy
                );
              });
            }
          });

          layer.options.opacity = 0.8;
        }
        this.geolayers.push(layer);
      });
      this.updateLayers();
    });

    displaycontrolservice.selectedhospitals$.subscribe(hospitals => {
      this.selectedhospitals = hospitals;
      this.hospgeolayers = [];
      var hospitalgeojson = L.geoJSON(dataprocessing.getvoronoihospitals());
      hospitalgeojson.eachLayer(layer => {
        layer.options.color = HOSPITAL_COLORS[layer.feature.properties.name];
        layer.options.fillOpacity = 0;
        layer.options.opacity = 0.0;
        if (
          _.find(
            this.selectedhospitals,
            d => d == layer.feature.properties.name
          ) === undefined
        ) {
          layer.on({
            click: e => {
              this.zone.run(() => {
                var selectedhospitals_copy = _.cloneDeep(
                  this.selectedhospitals
                );
                selectedhospitals_copy.push(e.target.feature.properties.name);
                this.displaycontrolservice.changeSelectedHospitals(
                  selectedhospitals_copy
                );
              });
            }
          });
        } else {
          layer.on({
            click: e => {
              this.zone.run(() => {
                var selectedhospitals_copy = _.cloneDeep(
                  this.selectedhospitals
                );
                _.remove(
                  selectedhospitals_copy,
                  x => x == layer.feature.properties.name
                );
                this.displaycontrolservice.changeSelectedHospitals(
                  selectedhospitals_copy
                );
              });
            }
          });

          layer.options.opacity = 0.7;
        }
        this.hospgeolayers.push(layer);
      });
      this.updateLayers();
    });
  }

  onMapReady(map) {
    map.scrollWheelZoom.disable();
  }

  ngAfterViewInit() {
    this.primaryColor = getComputedStyle(this.primary.nativeElement).color;
    this.secondaryColor = getComputedStyle(this.secondary.nativeElement).color;
  }

  changeHeatmap(heatcoordinates: number[][]): void {
    this.heatmapdata.data = [];
    for (var index in heatcoordinates) {
      this.heatmapdata.data.push({
        lat: heatcoordinates[index][1],
        lng: heatcoordinates[index][0],
        count: 0.1
      });
    }
    this.heatmaplayer.setData(this.heatmapdata);
  }

  updateLayers() {
    this.layers = [];
    if (this.heatmapactive) {
      this.layers.push(this.heatmaplayer);
    }
    if (this.choroplethactive) {
      if (this.choroplethmode_isdistrict) {
        this.layers = this.layers.concat(this.distchorolayers);
      } else {
        this.layers = this.layers.concat(this.hospchorolayers);
      }
    }
    if (this.selectactive) {
      if (this.choroplethmode_isdistrict) {
        this.layers = this.layers.concat(this.geolayers);
      } else {
        this.layers = this.layers.concat(this.hospgeolayers);
      }
    }
    this.layertoggle = !this.layertoggle;
  }
}
