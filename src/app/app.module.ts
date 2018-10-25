import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatGridListModule, 
  MatCardModule, 
  MatMenuModule, 
  MatIconModule, 
  MatButtonModule, 
  MatFormFieldModule, 
  MatSelectModule, 
  MatSelectTrigger, 
  MatTableModule,
  MatPaginatorModule,
  MatSortModule, 
  MatCheckboxModule, 
  MatDividerModule,
  MatListModule,
  MatButtonToggleModule,
  MatToolbarModule,
  MatExpansionModule,
  MatSliderModule
} from '@angular/material';
import { LayoutModule } from '@angular/cdk/layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import {PlotlyModule} from 'angular-plotly.js'

import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MapDisplayComponent } from './map-display/map-display.component';
import { DisplayControlComponent } from './display-control/display-control.component';
import { TableDistrictsComponent } from './table-districts/table-districts.component';
import { TimecoursePlotComponent } from './timecourse-plot/timecourse-plot.component';
import { TimecoursePlotIndividualComponent } from './timecourse-plot-individual/timecourse-plot-individual.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    MapDisplayComponent,
    DisplayControlComponent,
    TableDistrictsComponent,
    TimecoursePlotComponent,
    TimecoursePlotIndividualComponent
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
    MatDividerModule,
    MatListModule,
    MatButtonToggleModule,
    MatToolbarModule,
    MatExpansionModule,
    PlotlyModule,
    LeafletModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
