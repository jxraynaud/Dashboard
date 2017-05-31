import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Router} from '@angular/router';

import { BehaviorSubject }    from 'rxjs/BehaviorSubject';
import { Subject }    from 'rxjs/Subject';
import { Subscription }   from 'rxjs/Subscription';
import 'rxjs/add/operator/combineLatest'
import 'rxjs/add/operator/toPromise';

import { ConfigService } from './config.service';

import {debugLog, debugLogGroup} from '../../../utils';

@Injectable()
export class DataRequestService {
    DEBUG : boolean = true;
    //private debugLog(str){ this.DEBUG && console.log(str); }

    /*defaultRequestParams = [{
        "start_date": new Date(Date.now() - 31*24*3600*1000),
        "end_date":  new Date(Date.now() - 1*24*3600*1000),
        "attribution_model" : [2,5]
    }];*/

    //TODO : typer
    //dataRequestParamsBehaviorSubject = new BehaviorSubject(this.defaultRequestParams);
    dataRequestParamsBehaviorSubject = new Subject();
    rawDataBehaviorSubject = new BehaviorSubject([]);
    requestDimensionMappingBehaviorSubject = new BehaviorSubject([]);

    //TODO : destroy subscription at the end
    dataRequestBehaviorSubjectSubscription : Subscription;

    constructor(
        private http: Http,
        private router: Router,
        private configService : ConfigService,
    ) {
        this.dataRequestBehaviorSubjectSubscription = this.dataRequestParamsBehaviorSubject.combineLatest(
            this.configService.configBehaviorSubject,
        ).subscribe({
            next : (latestValues) => {
                let dataRequestParams = latestValues[0];
                let config = latestValues[1];
                debugLogGroup(this.DEBUG,[
                    "DataRequestService : combined subscription triggered for subscribers :",
                    "rawDataBehaviorSubject",
                    "with values [dataRequestParams, config] :",
                    dataRequestParams,
                    config]);
                if(Object.keys(config).length === 0 && config.constructor === Object){
                    this.rawDataBehaviorSubject.next([]);
                    console.warn("---!!!--- Config empty");
                }else{
                        debugLogGroup(this.DEBUG, ["DataRequestService : Trying to get data from API with params [config, dataRequestParams]:",
                            config,
                            dataRequestParams]);
                        //Send empty data to trigger loading gif
                        this.rawDataBehaviorSubject.next([]);

                        //Deep copy of data Request Params with date transformed to string to avoid date time + GMT => takes one day before because of 00:00 GMT+1
                        let formattedDataRequestParams =[]
                        formattedDataRequestParams.push({});
                        formattedDataRequestParams[0].attribution_model = dataRequestParams[0].attribution_model;
                        formattedDataRequestParams[0].start_date = dataRequestParams[0].start_date.toLocaleDateString();
                        formattedDataRequestParams[0].end_date = dataRequestParams[0].end_date.toLocaleDateString();

                        this.getAll(config, formattedDataRequestParams).then(response => {
                            this.requestDimensionMappingBehaviorSubject.next(this.mapDimensionFromRawData(response, config));
                            this.rawDataBehaviorSubject.next(response);
                        });
                }
            },
            error : (err) => console.error(err),
        });

        debugLog(this.DEBUG, "---DataRequestService instanciated---");
    }

    /**
    * Make a reqest to the API and return a Promise for the set of all Advertisers
    * @method getAll
    * @return {Promise} Promise for the list of all the Advertisers from the API
    */
    getAll(config, dataRequestParams):Promise<[{}]> {
        //console.log(dataRequestParams[0]['end_date'].toLocaleDateString())
        return this.http.post(config.api_url + config.api_endpoint, dataRequestParams, this.jwt())
            .toPromise()
            .then(response => {
                debugLogGroup(this.DEBUG, ["Promise result received for DataRequestService.getAll()",
                    response.json()]);
                return response.json();
            })
            .catch(error => {
                console.error("PROMISE REJECTED : could not get data from api in dataRequest with "+config.api_url + config.api_endpoint);
                console.error("Params in error :");
                console.error(dataRequestParams);
                console.error(config.api_url);
                console.log("error : "+error.json().detail);
                console.log(error.json());
            //    this.router.navigate(['/login'], { queryParams: { returnUrl : window.location.pathname }});
                return [];
            });
    }


    /**
     * Retrieves JWT token from localStorage and returns it if available. For use in HTTP requests
     * @method jwt
     * @return {[type]} [description]
     */
    private jwt() {
        // create authorization header with jwt token
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.token) {
            let headers = new Headers({ 'Authorization': 'JWT ' + currentUser.token });
            return new RequestOptions({ headers: headers });
        }
    }

    mapDimensionFromRawData(rawData, config){
        debugLogGroup(this.DEBUG,["Data Request Service : Calling mapDimensionFromRawData with (rawData, config)", rawData, config])
        let dimensions = config.available_dimensions.map(dimension => {
            if(Object.keys(rawData[0]).indexOf(dimension.data_id_column_name) != -1){
                return(dimension)
            }
        });
        debugLogGroup(this.DEBUG, [
            "DataRequestService : mapDimensionFromRawData on rawData",
            Object.keys(rawData[0]),
            "Resulting in [dimensions] : ",
            dimensions,
        ]);
        //debugLog(this.DEBUG, dimensions);
        return dimensions
    }
}
