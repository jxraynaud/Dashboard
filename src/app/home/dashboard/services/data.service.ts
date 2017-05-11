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
    DEBUG: boolean = false;
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

                            //Data mapped with their name column : for each element and each column fin name if present in config
                            let namedRawData;
                            if(Object.keys(filtersDimensionMapping).length != 0){
                                namedRawData = this.mapDataNames(rawData,filtersDimensionMapping,config);
                                //console.log(namedRawData);
                            }else{
                                debugWarn(this.DEBUG, "DataService : filtersDimensionMapping empty : doing nothing.");
                            }

                            let filteredData = this.dataFiltersService.filterDataByMultipleDimensions(rawData,filtersDimension);

                            this.filteredDataBehaviorSubject.next(filteredData);
                    },
                    error : (err) => console.error(err),
                }
            );
            debugLog(this.DEBUG,"---Data service instanciated----");
      }

      /**
       * Map raw objects to add, for each dimension that has a data_name_column_name in config, a new key found in
       * the config at data_name_column_name, with as value the verbose name found in the mapping object filtersDimensionMapping
       * @method mapDataNames
       * @param  {[type]}     rawDataToMapForNames    Raw data with only ids but no names
       * @param  {[type]}     filtersDimensionMapping Object with a key per dimension,
       * each containing an array of type dimElem[id]=dimElemName to associate the dimension elem's id to its name
       * Ex : Object {kpi_id: Array(37), partner_id: Array(163), advertiser_id: Array(149097), metacampaign_id: Array(96)}
       * Extract of an item :
       * advertiser_id:Array(149097)
            50427:"France"
            50624:"United Kingdom"
            50625:"Global"
            50626:"Germany"
            ...
       * @param  {[type]}     config                  standard config object
       * @return {[type]} rawData with everything that came in the parameter rawDataToMapForNames,
       * plus a new key in each object (found with getNameColumnLabelFromIdColumnLabel) containing the corresponding human readable name.
       */
      private mapDataNames(rawDataToMapForNames,filtersDimensionMapping,config){
          debugLogGroup(this.DEBUG,["DataService : Mapping rawData to add names [rawData,filtersDimensionMapping, config]",
                    rawDataToMapForNames,
                    filtersDimensionMapping,
                    config
                ]);
          return rawDataToMapForNames.map((dataRow)=>{
              for(let dimensionIdColumnLabel in filtersDimensionMapping){
                  //Test : data_name_column_name that are set to "false" are not mapped.
                  let dimensionNameColumnLabel = this.getNameColumnLabelFromIdColumnLabel(dimensionIdColumnLabel,config);
                  if(dimensionNameColumnLabel){
                      //ID found in dataRow with as key the label of the Id column
                      let dimensionElemId = dataRow[dimensionIdColumnLabel];
                      //Name of the element from the mappgin array
                      let dimensionElemName = filtersDimensionMapping[dimensionIdColumnLabel][dimensionElemId];
                      //Insert the correct nam at the correct key
                      dataRow[dimensionNameColumnLabel]=dimensionElemName;
                  }
              }
              return dataRow;
          });
      }

      /**
       * Returns the "name" column label found in the config at available_dimensions.data_name_column_name,
       * from the "id" column label found in the same config at available_dimensions.data_id_column_name
       * @method getNameColumnLabelFromIdColumnLabel
       * @param  {string}                            dimensionIdColumLabel label of the id column (Ex : partner_id)
       * @param  {configObject}                            config                standard config object
       * @return {string}             Label of the Name column for the item.
       */
      getNameColumnLabelFromIdColumnLabel(dimensionIdColumLabel,config){
          //Get dimension details for name column identifier
          let dimensionDetails = config["available_dimensions"].filter((dim)=>{
              return dim.data_id_column_name == dimensionIdColumLabel;
          });
          //Find first and only element of filter returned array
          dimensionDetails = dimensionDetails[0];

          return dimensionDetails.data_name_column_name;
      }
}

//export let dataServiceFactory = (configObject/*, dataRequestService, dataFiltersService*/) => {
//    console.log("TEST");
    //return () => new DataService(configObject/*, dataRequestService, dataFiltersService*/);
//    return new DataService(configObject/*, dataRequestService, dataFiltersService*/);
//}
