import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DatavizChartComponent } from './dataviz-chart/dataviz-chart.component';
import { DatavizDatatableComponent } from './dataviz-datatable/dataviz-datatable.component';
import { DatavizMapComponent } from './dataviz-map/dataviz-map.component';
import { FormDataFiltersComponent } from './form-data-filters/form-data-filters.component';
import { FormDataRequestComponent } from './form-data-request/form-data-request.component';


@NgModule({
  imports: [
    CommonModule
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
