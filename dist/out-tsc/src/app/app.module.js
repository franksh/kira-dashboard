var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MatGridListModule, MatCardModule, MatMenuModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatSelectModule, MatTableModule, MatPaginatorModule, MatSortModule, MatCheckboxModule } from '@angular/material';
import { PlotlyModule } from 'angular-plotly.js';
import { LayoutModule } from '@angular/cdk/layout';
import { MapDisplayComponent } from './map-display/map-display.component';
import { SimControlComponent } from './sim-control/sim-control.component';
import { MatSliderModule } from '@angular/material';
import { SimulationResultComponent } from './simulation-result/simulation-result.component';
import { DisplayControlComponent } from './display-control/display-control.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DrawMapComponent } from './draw-map/draw-map.component';
import { TableDistrictsComponent } from './table-districts/table-districts.component';
import { TimecoursePlotComponent } from './timecourse-plot/timecourse-plot.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        NgModule({
            declarations: [
                AppComponent,
                DashboardComponent,
                MapDisplayComponent,
                SimControlComponent,
                SimulationResultComponent,
                DisplayControlComponent,
                DrawMapComponent,
                TableDistrictsComponent,
                TimecoursePlotComponent
            ],
            imports: [
                BrowserModule,
                BrowserAnimationsModule,
                MatGridListModule,
                MatCardModule,
                MatMenuModule,
                MatIconModule,
                MatButtonModule,
                MatSliderModule,
                LayoutModule,
                FormsModule,
                ReactiveFormsModule,
                MatFormFieldModule,
                MatSelectModule,
                MatTableModule,
                MatPaginatorModule,
                MatSortModule,
                MatCheckboxModule,
                PlotlyModule,
                LeafletModule.forRoot()
            ],
            providers: [],
            bootstrap: [AppComponent]
        })
    ], AppModule);
    return AppModule;
}());
export { AppModule };
//# sourceMappingURL=app.module.js.map