import { Component, OnInit } from '@angular/core';
import { DataFiltersService } from '../../services/data-filters.service';

import { Subscription } from 'rxjs/Subscription';

import {debugLog, debugLogGroup} from '../../../../utils';

@Component({
  selector: 'app-form-data-filters',
  templateUrl: './form-data-filters.component.html',
  styleUrls: ['./form-data-filters.component.css']
})
export class FormDataFiltersComponent implements OnInit {
    DEBUG: boolean = true;

    dimensionFilters : Object;
    dimensionfiltersMapping : Object;

    filtersCombinedSubscription : Subscription;

    constructor(private dataFiltersService : DataFiltersService) {
        this.filtersCombinedSubscription = this.dataFiltersService.filtersDimensionBehaviorSubject
            .combineLatest(this.dataFiltersService.filtersDimensionMappingBehaviorSubject)
            .subscribe(
                {
                    next : (latestValues) => {
                        this.dimensionFilters = latestValues[0];
                        this.dimensionfiltersMapping = latestValues[1];
                    },
                    error : (err) => console.error(err),
                }
            );
    }

    ngOnInit() {
    }

    updateFilters(event,filterElemId,filterType){
        if(event.checked == true){
            if(this.dimensionFilters[filterType].checked.indexOf(parseInt(filterElemId))==-1){
                debugLog(this.DEBUG,"Form-data-filters Component : Adding "+filterType+" of id "+filterElemId);
                this.dimensionFilters[filterType].checked.push(parseInt(filterElemId));
            }
        }else{
            debugLog(this.DEBUG,"Form-data-filters Component : Removing "+filterType+" of id "+filterElemId);
            let toRemoveIndex = this.dimensionFilters[filterType].checked.indexOf(parseInt(filterElemId));
            if (toRemoveIndex > -1) {
                this.dimensionFilters[filterType].checked.splice(toRemoveIndex, 1);
            }
        }
        this.dataFiltersService.filtersDimensionBehaviorSubject.next(this.dimensionFilters);

    }

}
