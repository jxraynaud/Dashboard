import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FraudDetectorComponent } from './fraud-detector.component';

const fraudDetectorRoutes : Routes = [
    {
        path:'',
        component: FraudDetectorComponent,
    }
];
@NgModule({
    imports: [
        RouterModule.forChild(fraudDetectorRoutes)
    ],
    exports: [
        RouterModule
    ]
})
export class FraudDetectorRoutingModule {}
