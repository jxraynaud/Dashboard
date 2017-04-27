import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MultiAttributionComponent } from './multi-attribution.component';
import { OverviewComponent} from './overview/overview.component';

const multiAttributionRoutes: Routes = [
  {  
    path: '',
    component: MultiAttributionComponent,
    children: [
      {
        component: OverviewComponent,
        path: '',
      },
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
    ]
  },
];
@NgModule({
  imports: [
    RouterModule.forChild(multiAttributionRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class MultiAttributionRoutingModule { }
