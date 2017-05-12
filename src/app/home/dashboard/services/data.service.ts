import { Injectable, Inject } from '@angular/core';
import { InjectionToken } from '@angular/core';

import { BehaviorSubject }  from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';

import { DataRequestService } from './data-request.service';
import { DataFiltersService } from './data-filters.service';
import { ConfigService } from './config.service';

import {debugLog, debugWarn, debugLogGroup} from '../../../utils';

@Injectable()
export class DataService {
    DEBUG: boolean = true;
    //private debugLog(str){ this.DEBUG && console.log(str) }
    //private debugLogGroup(strArray){ if(this.DEBUG){ for(let e in strArray){ e == '0' ? console.groupCollapsed(strArray[e]):console.log(strArray[e]) ;} console.groupEnd() } }

    //TODO : typer
    filteredDataBehaviorSubject = new BehaviorSubject<Array<{}>>([]);

    //TODO : destroy subscription at the end
    rawDataBehaviorSubjectSubscription : Subscription;

    constructor(
        //public viewConfig : any,
        private configService : ConfigService,
        private dataRequestService: DataRequestService,
        private dataFiltersService : DataFiltersService,
    ) {
            this.rawDataBehaviorSubjectSubscription = this.dataRequestService.rawDataBehaviorSubject.combineLatest(
                this.dataFiltersService.filtersDimensionBehaviorSubject,
                this.dataFiltersService.filtersDimensionMappingBehaviorSubject,
                this.configService.configBehaviorSubject,
            ).subscribe(
                {
                    next : (latestValues) => {
                        let rawData = latestValues[0];
                        let filtersDimension = latestValues[1];
                        let filtersDimensionMapping = latestValues[2];
                        let config = latestValues[3];

                        debugLogGroup(this.DEBUG,["DataService : combined subscription on (dataRequestService.rawDataBehaviorSubject, dataFiltersService.filtersDimensionBehaviorSubject, dataFiltersService.filtersDimensionMappingBehaviorSubject, configService.configBehaviorSubject) triggered :",
                            "For subscriber : filteredDataBehaviorSubject (TODO)",
                            "with values [rawData, filtersDimension, fitersDimensionMapping, configService] :",
                            rawData,
                            filtersDimension,
                            filtersDimensionMapping,
                            config
                        ]);

                            let filteredData = this.dataFiltersService.filterDataByMultipleDimensions(rawData,filtersDimension);

                            this.filteredDataBehaviorSubject.next(filteredData);
                    },
                    error : (err) => console.error(err),
                }
            );
            debugLog(this.DEBUG,"---Data service instanciated----");
      }

}

//export let dataServiceFactory = (configObject/*, dataRequestService, dataFiltersService*/) => {
//    console.log("TEST");
    //return () => new DataService(configObject/*, dataRequestService, dataFiltersService*/);
//    return new DataService(configObject/*, dataRequestService, dataFiltersService*/);
//}
