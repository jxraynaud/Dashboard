import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';

import { BehaviorSubject }  from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';

import { ConfigService } from './config.service';
import { DataRequestService } from './data-request.service';

@Injectable()
export class DataFiltersService {
    DEBUG: boolean = true;
    private debugLog(str){ this.DEBUG && console.log(str); }

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
                this.debugLog("DataFiltersService : this.dataRequestService.requestDimensionMappingBehaviorSubject triggered for subscribers :");
                this.debugLog("filtersDimensionMappingBehaviorSubject");
                this.debugLog("with values [dimensions,config] :");
                this.debugLog(dimensions);
                this.debugLog(config);
                if(Object.keys(config).length > 0){
                    let dimensionsObject = this.getAllDimensionsItemLists(config,dimensions);
                    this.debugLog("Pushing result (all dimensions) to this.filtersDimensionMappingBehaviorSubject : ");
                    this.debugLog(dimensionsObject);
                    this.filtersDimensionMappingBehaviorSubject.next(dimensionsObject);
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
                this.debugLog("DataFiltersService : this.dataRequestService.rawDataBehaviorSubject triggered for subscribers :");
                this.debugLog("filtersDimensionBehaviorSubject");
                this.debugLog("with value :");
                this.debugLog(data);

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

                this.debugLog("DataFiltersService :  Calculated list of available / checked filters to be pushed to this.filtersDimensionBehaviorSubject : ");
                this.debugLog(dimensionsFilters);
                this.filtersDimensionBehaviorSubject.next(dimensionsFilters);
            },
            error : (err) => console.error(err),
        });
        this.debugLog("---DataFiltersService instanciated---");
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
        dimensionsList.map((e)=>{
            this.debugLog("Calling this.getSingleDimension on dimension "+e.data_id_column_name);
            this.getSingleDimensionItemList(config,e)
                .then( response => {
                    dimensionsObject[e.data_id_column_name] = response;
                })
                .catch(error => {
                    console.error("PROMISE REJECTED : could not get data for dimensions 2");
                    console.log("error : "+error.json().detail);
                    console.log(error.json());
                    //this.router.navigate(['/login'], { queryParams: { returnUrl : window.location.pathname }});
                });
        });
        return  dimensionsObject;
    }
}
