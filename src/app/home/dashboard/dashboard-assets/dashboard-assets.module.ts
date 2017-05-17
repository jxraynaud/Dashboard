import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@angular/material';

import { CovalentCoreModule } from '@covalent/core';
import { CovalentDataTableModule } from '@covalent/core';

import { Daterangepicker } from 'ng2-daterangepicker';

import { DatavizChartComponent } from './dataviz-chart/dataviz-chart.component';
import { DatavizDatatableComponent } from './dataviz-datatable/dataviz-datatable.component';
import { DatavizMapComponent } from './dataviz-map/dataviz-map.component';
import { FormDataFiltersComponent } from './form-data-filters/form-data-filters.component';
import { FormDataRequestComponent } from './form-data-request/form-data-request.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';


@NgModule({
  imports: [
    CommonModule,
    CovalentCoreModule,
    CovalentDataTableModule,
    MaterialModule,
    Daterangepicker,
    NgxChartsModule,
  ],
  declarations: [
      DatavizChartComponent,
      DatavizDatatableComponent,
      DatavizMapComponent,
      FormDataFiltersComponent,
      FormDataRequestComponent,
  ],
  exports:[
      DatavizChartComponent,
      DatavizDatatableComponent,
      DatavizMapComponent,
      FormDataFiltersComponent,
      FormDataRequestComponent,
  ]
})
export class DashboardAssetsModule { }
