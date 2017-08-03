import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@angular/material';

import { CovalentCoreModule } from '@covalent/core';

import { Daterangepicker } from 'ng2-daterangepicker';

import { ReportingRoutingModule } from './reporting-routing.module'
import { ReportingComponent } from './reporting.component';

@NgModule({
  imports: [
    CommonModule,
    CovalentCoreModule,
    ReportingRoutingModule,
    MaterialModule,
    Daterangepicker,
  ],
  declarations: [ReportingComponent]
})
export class ReportingModule { }
