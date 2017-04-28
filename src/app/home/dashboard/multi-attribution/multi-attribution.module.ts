import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InjectionToken } from '@angular/core';

import { MultiAttributionRoutingModule} from './multi-attribution-routing.module'

import { MultiAttributionComponent } from './multi-attribution.component';
import { OverviewComponent } from './overview/overview.component';

import { DataRequestService } from '../services/data-request.service';
import { DataFiltersService } from '../services/data-filters.service';
import { DataService } from '../services/data.service';

import viewConfig from './view.config.json';

//Methode 1 : injection without ''
//export const VIEW_CONFIG = new InjectionToken<any>('test');

//Methode 2 : injection with '' : nothing

//Methode 3 : factory
/*export let VIEW_CONFIG = new InjectionToken<any>('');
let dataServiceFactory = (configObject):DataService => { return new DataService(configObject) }*/

//Methode 4 : custom provider with direct value call to "new". Usable also with factory
//4B
//let dataServiceFactory = () => { return new DataService(viewConfig) }
//4C
//let dataServiceFactory = (configObject) => { return new DataService(configObject) }

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
//Methode 1 : injection without ''
        /*{ provide: VIEW_CONFIG, useValue: viewConfig },
        DataService,*/
//Meethode 2 : injection with ' '
        /*{ provide: 'VIEW_CONFIG', useValue: viewConfig },
        DataService,*/
//Methode 3 : factory
        /*{ provide: VIEW_CONFIG, useValue: viewConfig },
        {
            provide : DataService,
            useFactory : dataServiceFactory,
            deps : [VIEW_CONFIG]
        },*/
//Methode 4 : custom provider with direct value
        { provide: DataService, useValue : new DataService(viewConfig) },
//4B
        //{ provide: DataService, useValue : dataServiceFactory() },
//4C
        //{ provide: DataService, useValue : dataServiceFactory(viewConfig) },
    ],
})

export class MultiAttributionModule { }
