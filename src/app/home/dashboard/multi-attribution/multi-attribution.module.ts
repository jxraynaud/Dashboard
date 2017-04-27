import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MultiAttributionRoutingModule} from './multi-attribution-routing.module'

import { MultiAttributionComponent } from './multi-attribution.component';
import { OverviewComponent } from './overview/overview.component';

@NgModule({
    imports: [
        CommonModule,
        MultiAttributionRoutingModule,
    ],
    declarations: [
        MultiAttributionComponent,
        OverviewComponent,
    ]
})

export class MultiAttributionModule { }
