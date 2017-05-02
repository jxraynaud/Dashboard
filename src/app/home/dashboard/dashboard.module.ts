import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CovalentCoreModule } from '@covalent/core';
import { CovalentHighlightModule } from '@covalent/highlight';
import { CovalentDataTableModule } from '@covalent/core';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { MultiAttributionModule } from './multi-attribution/multi-attribution.module';

import { DashboardComponent } from './dashboard.component';
import { DefaultComponent } from './default/default.component';
import { DashboardAssetsModule } from './dashboard-assets/dashboard-assets.module';


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
        DashboardAssetsModule,
    ],
    declarations: [
        DashboardComponent,
        DefaultComponent,
    ],
    providers: [
    ]
})
export class DashboardModule {
 }
