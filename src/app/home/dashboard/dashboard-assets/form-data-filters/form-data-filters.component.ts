import { Component, OnInit, OnChanges, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { DataFiltersService } from '../../services/data-filters.service';

import { Subscription } from 'rxjs/Subscription';

import {debugLog, debugLogGroup} from '../../../../utils';

@Component({
  selector: 'app-form-data-filters',
  templateUrl: './form-data-filters.component.html',
  styleUrls: ['./form-data-filters.component.css']
})
export class FormDataFiltersComponent implements OnInit, OnChanges {
    DEBUG : boolean = false;

    @Input() dimensionFilters : Object;
    @Input() dimensionfiltersMapping : Object;
    @Input() dimensionsConfig : Array<Object>;

    @Output() filtersUpdated = new EventEmitter();

    filtersCombinedSubscription : Subscription;

    filtersChips:Object;
    activeFiltersChips:Object;

    constructor() {}

    ngOnInit() {
        //console.log("dimensionFilters");
        //console.log(this.dimensionFilters);
        //this.filtersModels =
    }

    /*TODO : NgOnChanges doesn't trigger every time dimensionFilters is pushed by fraud detector component
    (in this.valuesToInputSubscription : this.filtersDimensions = filtersDimensions;), specially when
    modification comes from new values being pushed by this.updateFilters(false,chipId,filterType ( : this.filtersUpdated.emit(dimTempo) )
    */
    ngOnChanges(changes : SimpleChanges){
        console.log("NGONCAHNGES");
        console.log(changes);
        if(changes.dimensionFilters){
            debugLog(this.DEBUG,"Ng On Changes dimensionFilters");
            //Update active chips by matching ids to names
            this.activeFiltersChips = this.generateActiveFiltersChipsFromDimensionsArray(changes.dimensionFilters.currentValue,this.dimensionfiltersMapping);

            this.filtersUpdated.emit(changes.dimensionFilters.currentValue)
            console.log(changes.dimensionFilters);
        }

        if(changes.dimensionfiltersMapping){
            debugLogGroup(this.DEBUG,["Ng On Changes dimensionfiltersMapping",changes.dimensionfiltersMapping]);
            //this.filtersChips = changes.dimensionfiltersMapping.currentValue
            this.activeFiltersChips = {};
            Object.keys(changes.dimensionfiltersMapping.currentValue).map(e=>{
                if(!this.activeFiltersChips[e]){
                    this.activeFiltersChips[e]=[];
                }
            });
        }

        //When Mapping OR Dimenson filters change, filter available filter chips depending on active filters from dimensionFilters
        if(changes.dimensionFilters || changes.dimensionfiltersMapping ){
            let tempoDimensionFilters = changes.dimensionFilters?changes.dimensionFilters.currentValue:this.dimensionFilters;
            let tempoDimensionFilterMapping = changes.dimensionfiltersMapping?changes.dimensionfiltersMapping.currentValue:this.dimensionfiltersMapping;
            console.warn("DIM");
            console.log(tempoDimensionFilters);
            if(tempoDimensionFilters && tempoDimensionFilterMapping){
                debugLog(this.DEBUG,"Dimensions Filters OR DimensionsFilterMapping change");
                //Update available chips by matching ids to names
                if(Object.keys(tempoDimensionFilterMapping).length>0){
                    this.filtersChips = this.generateAvailableFiltersChipsFromDimensionsArray(tempoDimensionFilters,tempoDimensionFilterMapping);
                }
            }
        }
    }

    generateActiveFiltersChipsFromDimensionsArray(dimensionsArray,filtersMappingObject){
        let newActiveFiltersChips = {};
        Object.keys(dimensionsArray).map(key=>{
                newActiveFiltersChips[key]=[];
                dimensionsArray[key].checked.map(elemId=>{
                    newActiveFiltersChips[key].push(this.mapIdToChipName(elemId,key,filtersMappingObject));
                })
        });
        return newActiveFiltersChips;
    }

    generateAvailableFiltersChipsFromDimensionsArray(dimensionsArray,filtersMappingObject){
        console.warn("DIM ARRAY");
        console.log(dimensionsArray);
        let newAvailableFiltersChips = {};
        Object.keys(dimensionsArray).map(key=>{
                newAvailableFiltersChips[key]=[];
                dimensionsArray[key].active.map(elemId=>{
                    newAvailableFiltersChips[key].push(this.mapIdToChipName(elemId,key,filtersMappingObject));
                })
        });
        console.warn("lll");
        console.log(newAvailableFiltersChips);
        return newAvailableFiltersChips;
    }


    dimensionNameFromIdColLabel(dimensionDataIdColName){
        return this.dimensionsConfig.filter(e=>{ return e['data_id_column_name'] == dimensionDataIdColName })[0]['label'];
    }

    addFilterChip(chip,filterType):void{
        debugLogGroup(this.DEBUG, [
            "Form Data Filters : add chip",
            chip,
            "to",
            filterType,
            "via mapping",
            this.dimensionfiltersMapping
        ]);
        let chipId = this.mapChipToId(chip,filterType);
        this.updateFilters(true,chipId,filterType);
    }

    removeFilterChip(chip,filterType):void{
        debugLogGroup(this.DEBUG, [
            "Form Data Filters : remove chip",
            chip,
            "to",
            filterType,
            "via mapping",
            this.dimensionfiltersMapping
        ]);
        let chipId = this.mapChipToId(chip,filterType);
        this.updateFilters(false,chipId,filterType);
    }

    mapChipToId(chipName,filterType):number{
        return this.dimensionfiltersMapping[filterType].findIndex(e=>{ return e==chipName })
    }

    mapIdToChipName(id,filterType,filtersMappingObject):string{
        return filtersMappingObject[filterType][id];
    }

    /**
     *    UpdateFilters adds or removes (dpeending on toCheck parameter) a single filter form specified filter type and triggers event for updating filters
     *    @method updateFilters
     *    @param  {[type]}      toCheck      boolean : true means action to add filter to active ones, false means to remove it
     *    @param  {[type]}      filterElemId id of the filter elementto add or remove
     *    @param  {[type]}      filterType   name of the fitler type (ex : kpi_id); to be used as key in the dilensions object
     */
    updateFilters(toCheck,filterElemId,filterType):void{
        let dimTempo = this.dimensionFilters;
        if(toCheck == true){
            if(this.dimensionFilters[filterType].checked.indexOf(parseInt(filterElemId))==-1){
                debugLog(this.DEBUG,"Form-data-filters Component : Adding "+filterType+" of id "+filterElemId);
                //this.dimensionFilters[filterType].checked.push(parseInt(filterElemId));
                dimTempo[filterType].checked.push(parseInt(filterElemId));
            }
        }else{
            debugLog(this.DEBUG,"Form-data-filters Component : Removing "+filterType+" of id "+filterElemId);
            let toRemoveIndex = this.dimensionFilters[filterType].checked.indexOf(parseInt(filterElemId));
            if (toRemoveIndex > -1) {
                //this.dimensionFilters[filterType].checked.splice(toRemoveIndex, 1);
                dimTempo[filterType].checked.splice(toRemoveIndex, 1);
            }
        }
        //Send the event for updating filters
        //this.filtersUpdated.emit(this.dimensionFilters);
        this.filtersUpdated.emit(dimTempo);

        //console.log("Searching for "+filterElemId+" in");
        //console.log(this.dimensionFilters[filterType].checked.indexOf(parseInt(filterElemId)));
    }

    isNoFilterChecked(filterType){
        return this.dimensionFilters[filterType].checked && this.dimensionFilters[filterType].checked.length > 0
    }

    isNoFilterCheckedAll(){
        let noFilterChecked = true;
        Object.keys(this.dimensionfiltersMapping).map(filterType=>{ if(this.isNoFilterChecked(filterType)){ noFilterChecked = false } });
        return noFilterChecked;
    }

    /*isChecked(filterElemId,filterType){
        return this.dimensionFilters[filterType]['checked'].indexOf(parseInt(filterElemId)) != -1;
    }*/


}
