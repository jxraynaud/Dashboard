import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ReportingComponent } from './reporting.component';

const reportingRoutes: Routes = [
  {
    path: '',
    component: ReportingComponent,
    /*children: [
      {
        component: OverviewComponent,
        path: '',
    },*/
    /*  {
        component: FraudDetectorComponent,
        path: 'fraud-detector',
      }, {
        component: MultiAttributionComponent,
        path: 'multi-attribution',
      }, {
        component: ReportingComponent,
        path: 'reporting',
    }*/
    /*]*/
  },
];
@NgModule({
  imports: [
    RouterModule.forChild(reportingRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class ReportingRoutingModule { }
