import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@angular/material';

import { FraudDetectorRoutingModule } from './fraud-detector-routing.module'
import { DashboardAssetsModule } from '../dashboard-assets/dashboard-assets.module';
import { FraudDetectorComponent } from './fraud-detector.component';

import { DataRequestService } from '../services/data-request.service';
import { DataFiltersService } from '../services/data-filters.service';
import { DataService } from '../services/data.service';
import { ConfigService } from '../services/config.service';

import viewConfig from './view.config.json';
import { OverviewComponent } from './overview/overview.component';
import { BykpiviewComponent } from './bykpiview/bykpiview.component';

@NgModule({
  imports: [
    CommonModule,
    FraudDetectorRoutingModule,
    DashboardAssetsModule,
    MaterialModule,
  ],
  declarations: [
      FraudDetectorComponent,
      OverviewComponent,
      BykpiviewComponent,
  ],
  providers: [
      DataRequestService,
      DataFiltersService,
      ConfigService,
      DataService,
  ]
})
export class FraudDetectorModule { }
