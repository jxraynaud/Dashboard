import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';

import { CovalentCoreModule } from '@covalent/core';
import { CovalentHighlightModule } from '@covalent/highlight';
import { CovalentDataTableModule } from '@covalent/core';

import { MultiAttributionModule } from './multi-attribution/multi-attribution.module';
import { DashboardComponent } from './dashboard.component';
//import { FraudDetectorComponent } from './fraud-detector/fraud-detector.component';
//import { MultiAttributionComponent } from './multi-attribution/multi-attribution.component';
import { DefaultComponent } from './default/default.component';
//import { ReportingComponent } from './reporting/reporting.component';

/*import { FilterService } from './services/filter-service';
import { RequestFraudDataService } from './services/request-fraud-data-services';
import { DataFaudDetectorService } from './services/data-fraud-detector.service';
import { MultiAttributionDataService } from './services/multi-attribution-data.service'
import { AdvertiserService,
        PartnerService,
        KpiService,
        MetaCampaignService,
        AttributionModelService,
    } from '../_services/index';

import { FiltersComponent } from './filters/filters.component';
import { DatePickerModule } from 'ng2-datepicker';
import { NgDateRangePickerModule } from 'ng-daterangepicker';
import { Daterangepicker } from 'ng2-daterangepicker';
import { FdGroupbyDatatableComponent } from './fd-groupby-datatable/fd-groupby-datatable.component';
import { MaGroupbyDatatableComponent } from './ma-groupby-datatable/ma-groupby-datatable.component';
import { FdTimeserieNgxComponent } from './fd-timeserie-ngx/fd-timeserie-ngx.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';*/



@NgModule({
  imports: [
    CommonModule,
    CovalentCoreModule,
    CovalentHighlightModule,
    DashboardRoutingModule,
    //MultiAttributionModule,
    CovalentDataTableModule.forRoot(),
    /*DatePickerModule,
    NgDateRangePickerModule,
    Daterangepicker,
    NgxChartsModule,*/
  ],
  declarations: [
    DashboardComponent,
    DefaultComponent,
    /*FraudDetectorComponent,
    MultiAttributionComponent,*/
    /*ReportingComponent,
    FiltersComponent,
    FdGroupbyDatatableComponent,
    MaGroupbyDatatableComponent,
    FdTimeserieNgxComponent,*/
  ],
  providers: [
    /*FilterService,
    AdvertiserService,
    PartnerService,
    KpiService,
    MetaCampaignService,
    DataFaudDetectorService,
    AttributionModelService,
    RequestFraudDataService,*/
  ]
})
export class DashboardModule {
 }
