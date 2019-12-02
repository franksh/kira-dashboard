var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatGridListModule, MatCardModule, MatMenuModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatSelectModule, MatTableModule, MatPaginatorModule, MatSortModule, MatCheckboxModule, MatDividerModule, MatListModule, MatButtonToggleModule, MatToolbarModule, MatExpansionModule, MatSliderModule, MatProgressSpinnerModule, MatInputModule, MatProgressBarModule, } from "@angular/material";
import { LayoutModule } from "@angular/cdk/layout";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { LeafletModule } from "@asymmetrik/ngx-leaflet";
import { PlotlyModule } from "angular-plotly.js";
import { Ng5SliderModule } from 'ng5-slider';
import { AppComponent } from "./app.component";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { MapDisplayComponent } from "./map-display/map-display.component";
import { DisplayControlComponent } from "./display-control/display-control.component";
import { TableDistrictsComponent } from "./table-districts/table-districts.component";
import { TimecoursePlotComponent } from "./timecourse-plot/timecourse-plot.component";
import { TimecoursePlotIndividualComponent } from "./timecourse-plot-individual/timecourse-plot-individual.component";
import { HttpModule } from "@angular/http";
import { HeaderInfoComponent } from "./header-info/header-info.component";
import { ProgressSpinnerComponent } from "./progress-spinner/progress-spinner.component";
var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        NgModule({
            declarations: [
                AppComponent,
                DashboardComponent,
                MapDisplayComponent,
                DisplayControlComponent,
                TableDistrictsComponent,
                TimecoursePlotComponent,
                TimecoursePlotIndividualComponent,
                HeaderInfoComponent,
                ProgressSpinnerComponent
            ],
            imports: [
                BrowserModule,
                HttpModule,
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
                MatDividerModule,
                MatListModule,
                MatButtonToggleModule,
                MatToolbarModule,
                MatExpansionModule,
                MatProgressSpinnerModule,
                PlotlyModule,
                LeafletModule.forRoot(),
                Ng5SliderModule,
                MatInputModule,
                MatProgressBarModule,
            ],
            providers: [],
            bootstrap: [AppComponent]
        })
    ], AppModule);
    return AppModule;
}());
export { AppModule };
//# sourceMappingURL=app.module.js.map