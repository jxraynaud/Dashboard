import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

//import { MultiAttributionModule } from 

import { DashboardComponent } from './dashboard.component';
import { DefaultComponent } from './default/default.component'
/*import { FraudDetectorComponent } from './fraud-detector/fraud-detector.component';
import { MultiAttributionComponent } from './multi-attribution/multi-attribution.component'
import { ReportingComponent } from './reporting/reporting.component'*/

import { AuthGuard } from '../auth.guard';

const dashboardRoutes: Routes = [
    {
        path: '',
        canActivate: [AuthGuard],
        component: DashboardComponent,
        children: [
          // This is the default route for somebody who goes to home.
            {
                path: '',
                canActivate: [AuthGuard],
                component: DefaultComponent
            },
            {
                path: 'multi-attribution',
                canActivateChild: [AuthGuard],
                loadChildren: './multi-attribution/multi-attribution.module#MultiAttributionModule'
            },
        ]
    }
];
@NgModule({
  imports: [
    RouterModule.forChild(dashboardRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class DashboardRoutingModule { }
