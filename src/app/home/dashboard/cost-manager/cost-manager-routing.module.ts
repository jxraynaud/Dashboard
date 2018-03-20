import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CostManagerComponent } from './cost-manager.component';

const costManagerRoutes: Routes = [
  {
    path: '',
    component: CostManagerComponent,
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
    RouterModule.forChild(costManagerRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class CostManagerRoutingModule { } 
