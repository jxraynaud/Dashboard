import { Injectable, Inject } from '@angular/core';
import { InjectionToken } from '@angular/core';

import { BehaviorSubject }  from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';

import { DataRequestService } from './data-request.service';
import { DataFiltersService } from './data-filters.service';

import {debugLog, debugLogGroup} from '../../../utils';

@Injectable()
export class DataService {
    DEBUG: boolean = false;
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

                        debugLogGroup(this.DEBUG,["DataService : combined subscription triggered :",
                            "For subscriber : filteredDataBehaviorSubject (TODO)",
                            "with values [rawData, filtersDimension, fitersDimensionMapping] :",
                            rawData,
                            filtersDimension,
                            filtersDimensionMapping]);

                            //Generating filteredData
                            let filteredData = rawData;
                            //Filter data for each filter criteria:
                            for(let attributeColName in filtersDimension){
                                let checked = filtersDimension[attributeColName].checked;
                                //TODO : DELETE IN PROD
                                checked = filtersDimension[attributeColName].active.slice(2,10);
                                //Do not filter if nothing checked
                                if(checked.length > 0){
                                    filteredData = filteredData.filter((dataLine)=>{;
                                        return checked.indexOf(dataLine[attributeColName]) != -1;
                                    });
                                }
                                debugLogGroup(this.DEBUG,[
                                        "DataService : "+checked.length+" values checked for ["+attributeColName+"] resulting in "+filteredData.length+" results",
                                        "Checked : ",
                                        checked,
                                        "FilteredData : ",
                                        filteredData
                                     ]);
                            }
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
