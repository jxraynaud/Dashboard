import { Injectable, Inject } from '@angular/core';
import { InjectionToken } from '@angular/core';

import { BehaviorSubject }  from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';

import { DataRequestService } from './data-request.service';
import { DataFiltersService } from './data-filters.service';

import {debugLog, debugLogGroup} from '../../../utils';

@Injectable()
export class DataService {
    DEBUG: boolean = true;
    //private debugLog(str){ this.DEBUG && console.log(str) }
    //private debugLogGroup(strArray){ if(this.DEBUG){ for(let e in strArray){ e == '0' ? console.groupCollapsed(strArray[e]):console.log(strArray[e]) ;} console.groupEnd() } }

    //TODO : typer
    filteredDataBehaviorSubject = new BehaviorSubject<Array<{}>>([]);

    //TODO : destroy subscription at the end
    filteredDataBehaviorSubjectSubscription : Subscription;

    constructor(
        //public viewConfig : any,
        private dataRequestService: DataRequestService,
        private dataFiltersService : DataFiltersService,
    ) {
            this.filteredDataBehaviorSubjectSubscription = this.dataRequestService.rawDataBehaviorSubject.combineLatest(
                this.dataFiltersService.filtersDimensionBehaviorSubject,
                this.dataFiltersService.filtersDimensionMappingBehaviorSubject,
            ).subscribe(
                {
                    next : (latestValues) => {
                        let rawData = latestValues[0];
                        let filtersDimension = latestValues[1];
                        let filtersDimensionMapping = latestValues[2];

                        debugLogGroup(this.DEBUG,["DataService : combined subscription triggered :",
                            "For subscriber : filteredDataBehaviorSubject (TODO)",
                            "with values [rawData, filtersDimension, fitersDimensionMapping] :",
                            rawData,
                            filtersDimension,
                            filtersDimensionMapping]);

                    },
                    error : (err) => console.error(err),
                }
            );
            console.log("---Data service instanciated----");
      }

}

//export let dataServiceFactory = (configObject/*, dataRequestService, dataFiltersService*/) => {
//    console.log("TEST");
    //return () => new DataService(configObject/*, dataRequestService, dataFiltersService*/);
//    return new DataService(configObject/*, dataRequestService, dataFiltersService*/);
//}
