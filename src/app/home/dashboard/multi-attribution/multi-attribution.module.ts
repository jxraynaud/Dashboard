import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MultiAttributionRoutingModule} from './multi-attribution-routing.module'

import { MultiAttributionComponent } from './multi-attribution.component';
import { OverviewComponent } from './overview/overview.component';

import { DataRequestService } from '../services/data-request.service';
import { DataFiltersService } from '../services/data-filters.service';
import { DataService } from '../services/data.service';

@NgModule({
    imports: [
        CommonModule,
        MultiAttributionRoutingModule,
    ],
    declarations: [
        MultiAttributionComponent,
        OverviewComponent,
    ],
    providers: [
        DataRequestService,
        DataFiltersService,
        DataService,
    ],
})

export class MultiAttributionModule { }
