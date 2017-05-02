import { Injectable } from '@angular/core';

import { BehaviorSubject }    from 'rxjs/BehaviorSubject';
import { Subscription }   from 'rxjs/Subscription';

@Injectable()
export class DataRequestService {
    DEBUG: boolean = false;
    private debugLog(str){ this.DEBUG && console.log(str); }

    //TODO : typer
    dataRequestBehaviorSubject = new BehaviorSubject([]);
    rawDataBehaviorSubject = new BehaviorSubject([]);
    //Used as flag to trigger recalculation
    dimensionReloaBehaviorSubject = new BehaviorSubject('');
    requestDimensionMappingBehaviorSubject = new BehaviorSubject([]);

    //TODO : destroy subscription at the end
    dataRequestBehaviorSubjectSubscription : Subscription;
    dimensionReloaBehaviorSubjectSubscription : Subscription;

    constructor() {
        this.dataRequestBehaviorSubjectSubscription = this.dataRequestBehaviorSubject.subscribe({
            next : (data) => {
                this.debugLog("dataRequestBehaviorSubject triggered for subscribers :");
                this.debugLog("rawDataBehaviorSubject (TODO)");
                this.debugLog("with value :");
                this.debugLog(data);
                //this.rawDataBehaviorSubject.next(data);
            },
            error : (err) => console.error(err),
        });

        this.dimensionReloaBehaviorSubjectSubscription = this.dimensionReloaBehaviorSubject.subscribe({
            next : (data) => {
                this.debugLog("dimensionReloaBehaviorSubject triggered for subscribers :");
                this.debugLog("requestDimensionMappingBehaviorSubject (TODO)");
                this.debugLog("with value :");this.debugLog(data);
                //this.requestDimensionMappingBehaviorSubject.next([]);
            },
            error : (err) => console.error(err),
        });
    }

}
