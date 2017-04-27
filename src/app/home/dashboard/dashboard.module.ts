import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CovalentCoreModule } from '@covalent/core';
import { CovalentHighlightModule } from '@covalent/highlight';
import { CovalentDataTableModule } from '@covalent/core';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { MultiAttributionModule } from './multi-attribution/multi-attribution.module';

import { DashboardComponent } from './dashboard.component';
import { DefaultComponent } from './default/default.component';
import { DatavizDatatableComponent } from './dataviz-datatable/dataviz-datatable.component';
import { DatavizChartComponent } from './dataviz-chart/dataviz-chart.component';
import { DatavizMapComponent } from './dataviz-map/dataviz-map.component';
import { FormDataRequestComponent } from './form-data-request/form-data-request.component';
import { FormDataFiltersComponent } from './form-data-filters/form-data-filters.component';







/*
import { DatePickerModule } from 'ng2-datepicker';
import { NgDateRangePickerModule } from 'ng-daterangepicker';
import { Daterangepicker } from 'ng2-daterangepicker';
import { FdGroupbyDatatableComponent } from './fd-groupby-datatable/fd-groupby-datatable.component';
import { MaGroupbyDatatableComponent } from './ma-groupby-datatable/ma-groupby-datatable.component';
import { FdTimeserieNgxComponent } from './fd-timeserie-ngx/fd-timeserie-ngx.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
*/



@NgModule({
    imports: [
        CommonModule,
        CovalentCoreModule,
        CovalentHighlightModule,
        DashboardRoutingModule,
        CovalentDataTableModule.forRoot(),
    ],
    declarations: [
        DashboardComponent,
        DefaultComponent,
        DatavizDatatableComponent,
        DatavizChartComponent,
        DatavizMapComponent,
        FormDataRequestComponent,
        FormDataFiltersComponent,
    ],
    providers: [
    ]
})
export class DashboardModule {
 }
