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
    rawDataBehaviorSubjectSubscription : Subscription;

    constructor(
        //public viewConfig : any,
        private dataRequestService: DataRequestService,
        private dataFiltersService : DataFiltersService,
    ) {
            this.rawDataBehaviorSubjectSubscription = this.dataRequestService.rawDataBehaviorSubject.combineLatest(
                this.dataFiltersService.filtersDimensionBehaviorSubject,
                this.dataFiltersService.filtersDimensionMappingBehaviorSubject,
            ).subscribe(
                {
                    next : (latestValues) => {
                        let rawData = latestValues[0];
                        let filtersDimension = latestValues[1];
                        let filtersDimensionMapping = latestValues[2];

                        debugLogGroup(this.DEBUG,["DataService : combined subscription on (dataRequestService.rawDataBehaviorSubject, dataFiltersService.filtersDimensionBehaviorSubject, dataFiltersService.filtersDimensionMappingBehaviorSubject) triggered :",
                            "For subscriber : filteredDataBehaviorSubject (TODO)",
                            "with values [rawData, filtersDimension, fitersDimensionMapping] :",
                            rawData,
                            filtersDimension,
                            filtersDimensionMapping]);

                            //Data mapped with their name column : for each element and each column fin name if present in config
                            let namedRawData = rawData;
                            namedRawData.map((e)=>{
                                //console.log("-------------------");
                                //console.log(filtersDimensionMapping);
                                //console.log(filtersDimensionMapping);
                                if(Object.keys(filtersDimensionMapping).length === 0){
                                    //console.warn("FILTERS DIMENSION MAPPING EMPTY");
                                    //console.warn(filtersDimensionMapping);
                                }else{
                                    //console.warn(Object.keys(filtersDimensionMapping).length);
                                }
                                for(let attributeColName in filtersDimensionMapping){
                                    //console.log(attributeColName);
                                    //console.log(filtersDimensionMapping);
                                }
                            });

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
