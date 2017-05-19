import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
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

    @Input() dimensionFilters : Object;
    @Input() dimensionfiltersMapping : Object;

    @Output() filtersUpdated = new EventEmitter();

    filtersCombinedSubscription : Subscription;

    constructor() {}

    ngOnInit() {
    }

    updateFilters(toCheck,filterElemId,filterType){
        if(toCheck == true){
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
        //Send the event for updating filters
        this.filtersUpdated.emit(this.dimensionFilters);
        console.log("Searching for "+filterElemId+" in");
        console.log(this.dimensionFilters[filterType].checked.indexOf(parseInt(filterElemId)));
    }

    isChecked(filterElemId,filterType){
        return this.dimensionFilters[filterType]['checked'].indexOf(parseInt(filterElemId)) != -1;
    }

    isNoFilterChecked(filterType){
        return this.dimensionFilters[filterType].checked && this.dimensionFilters[filterType].checked.length > 0
    }

    /*checkAllForType(filterType){
        console.warn(filterType);
        console.warn(this.dimensionFilters[filterType].checked);
        //console.warn(Object.keys(filterTypeArray));
        //this.dimensionFilters[filterType].checked

    }*/

}
