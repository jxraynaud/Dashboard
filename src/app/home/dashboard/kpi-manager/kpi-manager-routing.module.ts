import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { KpiManagerComponent } from './kpi-manager.component';

const kpiManagerRoutes: Routes = [
  {
    path: '',
    component: KpiManagerComponent,
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
    RouterModule.forChild(kpiManagerRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class KpiManagerRoutingModule { } 
