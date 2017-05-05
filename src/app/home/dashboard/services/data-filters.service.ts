import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';

import { BehaviorSubject }  from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';

import { ConfigService } from './config.service';
import { DataRequestService } from './data-request.service';

import {debugLog, debugLogGroup} from '../../../utils';

@Injectable()
export class DataFiltersService {
    DEBUG: boolean = true;
    //private debugLog(str){ this.DEBUG && console.log(str); }
    //private debugLogGroup(strArray){ if(this.DEBUG){ for(let e in strArray){ e == '0' ? console.groupCollapsed(strArray[e]):console.log(strArray[e]) ;} console.groupEnd() } }

    checkedDimensions = {};

    //TODO : typer
    filtersDimensionBehaviorSubject = new BehaviorSubject({});
    filtersDimensionMappingBehaviorSubject = new BehaviorSubject({});

    //TODO : destroy subscription at the end
    requestDimensionMappingBehaviorSubjectSubscription : Subscription;
    rawDataBehaviorSubjectSubscription : Subscription;

    constructor(
        private http: Http,
        private dataRequestService: DataRequestService,
        private configService : ConfigService,
    ) {
        this.requestDimensionMappingBehaviorSubjectSubscription = this.dataRequestService.requestDimensionMappingBehaviorSubject.combineLatest(
            this.configService.configBehaviorSubject,
        ).subscribe({
            next : (latestValues) => {
                let dimensions = latestValues[0];
                let config = latestValues[1];
                debugLogGroup(this.DEBUG,["DataFiltersService : this.dataRequestService.requestDimensionMappingBehaviorSubject triggered for subscribers :",
                    "filtersDimensionMappingBehaviorSubject",
                    "with values [dimensions, config] :",
                    dimensions,
                    config
                ]);
                if(Object.keys(config).length > 0){
                    let aggregatedDimensionsObjectPromise = this.getAllDimensionsItemLists(config,dimensions);
                    aggregatedDimensionsObjectPromise.then(
                        dimensionsObject => {
                            debugLogGroup(this.DEBUG,["DataFiltersService : Pushing result (all dimensions) to this.filtersDimensionMappingBehaviorSubject : [dimensionsObject]",
                                dimensionsObject, "of length", Object.keys(dimensionsObject).length
                            ]);
                            this.filtersDimensionMappingBehaviorSubject.next(dimensionsObject)
                        }
                    );
                }
            },
            error : (err) => console.error(err),
        });

        this.rawDataBehaviorSubjectSubscription = this.dataRequestService.rawDataBehaviorSubject.combineLatest(
            this.dataRequestService.requestDimensionMappingBehaviorSubject,
        ).subscribe({
            next : (latestValues) => {
                let data = latestValues[0];
                let dimensions = latestValues[1];
                debugLogGroup(this.DEBUG,["DataFiltersService : this.dataRequestService.rawDataBehaviorSubject triggered for subscribers :",
                    "filtersDimensionBehaviorSubject",
                    "with value :",
                    data]);

                //Map on the dimensions (lis tof used dimensions) to find for each dimension a list of unique id from the data
                let dimensionsFilters = {};
                dimensions.map((dim)=>{
                    let singleDimension = [];
                    data.map((e)=>{
                        if(singleDimension.indexOf(e[dim.data_id_column_name]) == -1){
                            singleDimension.push(e[dim.data_id_column_name]);
                        }
                    });
                    let singleDimensionCheckedList = this.checkedDimensions[dim.data_id_column_name] ? this.checkedDimensions[dim.data_id_column_name] : []
                    dimensionsFilters[dim.data_id_column_name] = { "active" : singleDimension, "checked" : singleDimensionCheckedList };
                });

                debugLogGroup(this.DEBUG,["DataFiltersService :  Calculated list of available / checked filters to be pushed to this.filtersDimensionBehaviorSubject : ",
                    dimensionsFilters
                ]);
                this.filtersDimensionBehaviorSubject.next(dimensionsFilters);
            },
            error : (err) => console.error(err),
        });
        debugLog(this.DEBUG,"---DataFiltersService instanciated---");
    }

    private jwt() {
        // create authorization header with jwt token
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.token) {
            let headers = new Headers({ 'Authorization': 'JWT ' + currentUser.token });
            return new RequestOptions({ headers: headers });
        }
    }

    //Used to get each dimension's items when mapping on list of available dimensions
    private getSingleDimensionItemList(config, dimension){
        return this.http.get(config.api_url + dimension.api_endpoint, this.jwt())
            .toPromise()
            .then( response => {
                    let dimensionArray = [];
                    response.json().map((e)=>{ dimensionArray[e.api_id] = e.api_name});
                    return dimensionArray;
                }
            )
            .catch(error => {
                console.error("PROMISE REJECTED : could not get data for dimensions 1");
                console.log("error : "+error.json().detail);
                console.log(error.json());
            //    this.router.navigate(['/login'], { queryParams: { returnUrl : window.location.pathname }});
                return [];
            });
    }

    private getAllDimensionsItemLists(config,dimensionsList){
        let dimensionsObject = {};
        let dimensionsPromiseList = dimensionsList.map((e)=>{
            debugLog(this.DEBUG,"Calling this.getSingleDimension on dimension "+e.data_id_column_name);
            return this.getSingleDimensionItemList(config,e)
                /*.then( response => {
                    dimensionsObject[e.data_id_column_name] = response;
                })
                .catch(error => {
                    console.error("PROMISE REJECTED : could not get data for dimensions 2");
                    console.log("error : "+error.json().detail);
                    console.log(error.json());
                    //this.router.navigate(['/login'], { queryParams: { returnUrl : window.location.pathname }});
                });*/
        });
        return Promise.all(dimensionsPromiseList)
            .then( responses => {
                //Map on dim list, based on same order of responses than order of dimensionsList
                let dimensionsPromiseResponsesList = dimensionsList.map((e,index)=>{
                    dimensionsObject[e.data_id_column_name] = responses[index];
                });
                return dimensionsObject;
            })
            .catch(error => {
                console.error("PROMISE REJECTED : could not get data for dimensions 2");
                console.log("error : "+error.json().detail);
                console.log(error.json());
                return {};
            });

    }

    filterDataByMultipleDimensions(rawData,filtersDimension){
        debugLogGroup(this.DEBUG,["DataFiltersService : Filtering data [rawData,filtersDimension]",
                  rawData,
                  filtersDimension
              ]);
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
                    "    DataFiltersService : "+checked.length+" values checked for ["+attributeColName+"] resulting in "+filteredData.length+" results",
                    "Checked elements ids : ",
                    checked,
                    "Resulting filteredData : ",
                    filteredData
                 ]);
        }
        return filteredData;
    }
}
