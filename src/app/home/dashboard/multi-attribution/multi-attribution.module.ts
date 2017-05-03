import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InjectionToken } from '@angular/core';

import { MultiAttributionRoutingModule} from './multi-attribution-routing.module'

import { DashboardAssetsModule } from '../dashboard-assets/dashboard-assets.module';

import { MultiAttributionComponent } from './multi-attribution.component';
import { OverviewComponent } from './overview/overview.component';

import { DataRequestService } from '../services/data-request.service';
import { DataFiltersService } from '../services/data-filters.service';
import { DataService } from '../services/data.service';
//import { dataServiceFactory } from '../services/data.service';
//import { dataServiceProvider } from '../services/data.service.provider';
import { ConfigService } from '../services/config.service';

import viewConfig from './view.config.json';
//Methode 5 :
export const VIEW_CONFIG = new InjectionToken<any>('test');

@NgModule({
    imports: [
        CommonModule,
        MultiAttributionRoutingModule,
        DashboardAssetsModule,
    ],
    declarations: [
        MultiAttributionComponent,
        OverviewComponent,
    ],
    providers: [
        DataRequestService,
        DataFiltersService,
        ConfigService,
        DataService,
//Methode 5 : factory from service class
        //{ provide: VIEW_CONFIG, useValue: viewConfig },
        //{ provide : DataService, useFactory: dataServiceFactory, deps : [VIEW_CONFIG], multi: true },
        //dataServiceProvider,

    ],
})

export class MultiAttributionModule { }
