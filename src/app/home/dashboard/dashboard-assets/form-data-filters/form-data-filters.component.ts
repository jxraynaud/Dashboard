import { Component, OnInit } from '@angular/core';
import { DataFiltersService } from '../../services/data-filters.service';

import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-form-data-filters',
  templateUrl: './form-data-filters.component.html',
  styleUrls: ['./form-data-filters.component.css']
})
export class FormDataFiltersComponent implements OnInit {

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
            if(this.dimensionFilters[filterType].checked.indexOf(filterElemId)==-1){
                this.dimensionFilters[filterType].checked.push(parseInt(filterElemId));
            }
        }else{
            console.warn("Removing"+filterElemId);
            console.warn(this.dimensionFilters[filterType].checked);
            let toRemoveIndex = this.dimensionFilters[filterType].checked.indexOf(filterElemId);
            console.warn(toRemoveIndex);
            if (toRemoveIndex > -1) {
                this.dimensionFilters[filterType].checked.splice(toRemoveIndex, 1);
            }
        }
        console.warn("TEST");
        console.warn("sending");
        console.warn(filterElemId);
        console.warn(filterType);
        console.warn(this.dimensionFilters);
        this.dataFiltersService.filtersDimensionBehaviorSubject.next(this.dimensionFilters);

    }

}
