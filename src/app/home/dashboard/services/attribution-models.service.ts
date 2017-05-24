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
export class AttributionModelsService {
    DEBUG : boolean = false;
    //private debugLog(str){ this.DEBUG && console.log(str); }

    /*defaultRequestParams = [{
        "start_date": new Date(Date.now() - 31*24*3600*1000),
        "end_date":  new Date(Date.now() - 1*24*3600*1000),
        "attribution_model" : [2,5]
    }];*/

    //TODO : typer
    //dataRequestParamsBehaviorSubject = new BehaviorSubject(this.defaultRequestParams);
    attributionModelsMappingBehaviorSubject = new BehaviorSubject([]);

    constructor(
        private http: Http,
        private router: Router,
        private configService : ConfigService,
    ) {
        this.configService.configBehaviorSubject.subscribe({
                next : (config) => {
                    debugLogGroup(this.DEBUG,[
                        "AttributionModelsService : subscription to config triggered",
                        "with value [config] :",
                        config]);

                    if(Object.keys(config).length === 0 && config.constructor === Object){
                        console.warn("---!!!--- Config empty (normal at first pass)");
                    }else{
                            debugLogGroup(this.DEBUG, ["AttributionModelsService : Trying to get data from API for attribution models with params [config, dataRequestParams]:",
                                config
                            ]);
                            //Send empty data to trigger loading gif
                            this.getAllAttributionModels(config).then(response => {
                                this.attributionModelsMappingBehaviorSubject.next(response);
                            });
                    }
                },
                error : (err) => console.error(err),
            });
    }

    /**
    * Make a reqest to the API and return a Promise for the set of all Advertisers
    * @method getAll
    * @return {Promise} Promise for the list of all the Advertisers from the API
    */
    getAllAttributionModels(config):Promise<[{}]> {
        return this.http.get(config.api_url + config.attribution_models_endpoint, this.jwt())
            .toPromise()
            .then(response => {
                debugLogGroup(this.DEBUG, ["AttributionModelsService : Promise result received for AttributionModelsService.getAll()",
                    response.json()]);
                return response.json();
            })
            .catch(error => {
                console.error("PROMISE REJECTED : could not get data from api in dataRequest with "+config.api_url + config.api_endpoint);
                console.error("Params in error :");
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
}
