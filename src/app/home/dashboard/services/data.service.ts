import { Injectable, Inject } from '@angular/core';
import { InjectionToken } from '@angular/core';

import { BehaviorSubject }  from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';

import { DataRequestService } from './data-request.service';
import { DataFiltersService } from './data-filters.service';

@Injectable()
export class DataService {
    DEBUG: boolean = true;
    private debugLog(str){ this.DEBUG && console.log(str); }

    //TODO : typer
    filteredDataBehaviorSubject = new BehaviorSubject<Array<{}>>([]);

    constructor(
        //public viewConfig : any,
        private dataRequestService: DataRequestService,
        private dataFiltersService : DataFiltersService,
    ) {
            console.log("---Data service instanciated----");
      }

}

//export let dataServiceFactory = (configObject/*, dataRequestService, dataFiltersService*/) => {
//    console.log("TEST");
    //return () => new DataService(configObject/*, dataRequestService, dataFiltersService*/);
//    return new DataService(configObject/*, dataRequestService, dataFiltersService*/);
//}
