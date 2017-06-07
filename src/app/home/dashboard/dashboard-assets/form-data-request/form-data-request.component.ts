import { Component, OnInit, Input, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { DataRequestService } from '../../services/data-request.service';

import { DaterangepickerConfig } from 'ng2-daterangepicker';
import { Daterangepicker } from 'ng2-daterangepicker';

import {debugLog, debugWarn, debugLogGroup} from '../../../../utils';

@Component({
  selector: 'app-form-data-request',
  templateUrl: './form-data-request.component.html',
  styleUrls: ['./form-data-request.component.css']
})
export class FormDataRequestComponent implements OnInit, OnChanges {
    DEBUG : boolean = false;
    @Input() defaultSelectedAttributionModel_s; /*: /*number | number[];*/
    @Input() isAttributionModelMultiple : boolean;
    @Input() attributionModelsMapping : Array<Object>;
    lessThan2Selectedmodels:boolean;
    @ViewChild('expansionRequestParams') expansionRequestParams

    //For multiple models
    attributionModelsChipList=[];
    activeAttributionModelsChipList=[];

    // Define the needed attributes
    private _dateRange : {startDate, endDate};
    get dateRange(){
        return this._dateRange;
    }
    set dateRange(newDateRange){
        this._dateRange = newDateRange;
        debugLogGroup(this.DEBUG,["Setter from dateRange attributes triggers data recalculation",this.dateRange]);
        this.sendDataRequestParams(this.dateRange.startDate,this.dateRange.endDate,this.selectedAttributionModel_s)
    }

    private _selectedAttributionModel_s : any; // TODO get default from api
    set selectedAttributionModel_s(newAttribModel){
        console.log("SETTER ATTRIBUTION MODEL ID SERVICE");
        console.log(newAttribModel);
        this._selectedAttributionModel_s = newAttribModel;
        //If multiple attribution models needed : check there's more than one selected
        if(this.isAttributionModelMultiple){
            //Trigger recalculation only if 2 or more models
            if(this.selectedAttributionModel_s.length > 1){
                this.lessThan2Selectedmodels = false;
                debugLog(this.DEBUG, "Setter from attribution model triggers data recalculation");
                this.sendDataRequestParams(this.dateRange.startDate,this.dateRange.endDate,this.selectedAttributionModel_s)

            }else{
                this.lessThan2Selectedmodels = true;
            }
        }else{
            debugLog(this.DEBUG, "Setter from attribution model triggers data recalculation");
            this.sendDataRequestParams(this.dateRange.startDate,this.dateRange.endDate,this.selectedAttributionModel_s)
        }
    }
    get selectedAttributionModel_s(){
        //console.log("GETTER ATTRIBUTION MODEL ID SERVICE");
        return this._selectedAttributionModel_s;
    }

    public options;

    private
    constructor(private dataRequestService : DataRequestService/*, private options: DaterangepickerConfig*/) { }

    ngOnInit() {
        debugLogGroup(this.DEBUG, ["Form Data Request component : Attribution models mapping",this.attributionModelsMapping]);
        //let a = this.expansionRequestParams.close();
        this.dateRange = this.initDefaultDateRange();
        this.selectedAttributionModel_s = this.defaultSelectedAttributionModel_s;
        let today = new Date();
        this.options = {
            locale: { format: 'DD-MM-YYYY' },
            alwaysShowCalendars: true,
            startDate : this.dateRange.startDate,
            endDate : this.dateRange.endDate,
            ranges: {
                    "Today": [
                        today,
                        today,
                    ],
                    "Yesterday": [
                        new Date().setDate(today.getDate()-1),
                        new Date().setDate(today.getDate()-1),
                    ],
                    "Last 7 Days": [
                        new Date().setDate(today.getDate()-7),
                        today
                    ],
                    "Last 30 Days": [
                        new Date().setDate(today.getDate()-30),
                        today
                    ],
                    "Last 90 days": [
                        new Date().setDate(today.getDate()-90),
                        today
                    ],
                },
        };
        debugLog(this.DEBUG, "----FILTERS COMPONENT INITIALIZED----");
    }

    ngOnChanges(changes: SimpleChanges){
        //console.log(changes)
        //Update models mapping
        if(changes.attributionModelsMapping && changes.attributionModelsMapping.currentValue.length>0){
                this.attributionModelsChipList = changes.attributionModelsMapping.currentValue.map((e)=>{ return e.name });
        }

        //TOCHECK : changes checked for the 3 possibilities (both change together, default value changes and mapping already set, mapping changes and default values already set)
        //If both models mapping and default models in change simultaneously change using the new values
        if( changes.defaultSelectedAttributionModel_s && changes.defaultSelectedAttributionModel_s.currentValue.length>0
            && changes.attributionModelsMapping && changes.attributionModelsMapping.currentValue.length>0
        ){
                this.activeAttributionModelsChipList = changes.attributionModelsMapping.currentValue
                    .filter((e)=>{ return changes.defaultSelectedAttributionModel_s.currentValue.indexOf(e.id) != -1 })
                    .map((f)=>{ return f.name });
                console.log(changes.defaultSelectedAttributionModel_s)
                console.log(changes)
        }else
        //If default values changes and attribution models mapping already set
        if( changes.defaultSelectedAttributionModel_s && changes.defaultSelectedAttributionModel_s.currentValue.length>0
            && this.attributionModelsMapping && this.attributionModelsMapping.length>0
        ){
                this.activeAttributionModelsChipList = this.attributionModelsMapping
                    .filter((e)=>{ return changes.defaultSelectedAttributionModel_s.currentValue.indexOf(e['id']) != -1 })
                    .map((f)=>{ return f['name'] });
                console.log(changes.defaultSelectedAttributionModel_s)
                console.log(changes)
        }else
        //if attributionModelsMapping changes and default values already set
        if( this.defaultSelectedAttributionModel_s && this.defaultSelectedAttributionModel_s.length>0
            && changes.attributionModelsMapping && changes.attributionModelsMapping.currentValue.length>0
        ){
                this.activeAttributionModelsChipList = changes.attributionModelsMapping.currentValue
                    .filter((e)=>{ return this.defaultSelectedAttributionModel_s.indexOf(e.id) != -1 })
                    .map((f)=>{ return f.name });
                console.log(this.defaultSelectedAttributionModel_s)
                console.log(changes)
        }
    }

    // Associated methods
    initDefaultDateRange():any{
        let days = 86400000;
        let today = Date.now();
        return {
            //TODO : remettre dates par défaut
            startDate : new Date(today - (60*days)),
            //startDate : new Date("2016-01-01"),
            endDate : new Date(today - (30*days)),
            //endDate : new Date("2016-03-01"),
        };
    }

    public selectedDate(value: any):void {
        //triggers setter of dateRange attribute
        this.dateRange = {
            startDate : new Date(value.start),
            endDate : new Date(value.end),
        };
        debugLog(this.DEBUG, "New daterange : "+this.dateRange.startDate+" - "+this.dateRange.endDate);
    }

    /**
     *    [updateActiveModelsOnChipsChange description]
     *    TOCHECK : !! selectedAttributionModel_s can't be edited in place otherwise setter won't be triggered
     *    @method updateActiveModelsOnChipsChange
     *    @param  {[type]}                        modelName [description]
     *    @return {[type]}                        [description]
     */
    public updateActiveModelsOnChipsChange(modelName){
        let tempoSelectedAttributionModel_s = [];
        //Process list of active models to get ids in right order
        this.activeAttributionModelsChipList.map(activeElemName =>{
            tempoSelectedAttributionModel_s.push(this.attributionModelsMapping.find(elem=>{ return elem["name"] == activeElemName })["id"]);
        });
        this.selectedAttributionModel_s = tempoSelectedAttributionModel_s;
    }

    public changeModel(value):void {
        console.log("MODEL");
        console.log(parseInt(value));
        //Goes through setter which triggers recalulation of data
        this.selectedAttributionModel_s = parseInt(value);
        debugLog(this.DEBUG, "New model : "+parseInt(value));
    }

/**
 *    Adds or removes element from selectedAttributionModel_s
 *    tempoModelsArray is needed because deep modification of object won't trigger setter
 *    @method changeModelsMultiple
 *    @param  {[type]}             event [description]
 *    @param  {[type]}             model [description]
 */
/*    public changeModelsMultiple(event,model):void{
        if(event.checked == true){
            //Create array if it doesn't exist
            if(this.selectedAttributionModel_s){
                let tempoModelsArray = this.selectedAttributionModel_s;
                tempoModelsArray.push(model);
                this.selectedAttributionModel_s = tempoModelsArray;
            }else{
                this.selectedAttributionModel_s = [model];
            }
        }else{
            let toRemoveIndex = this.selectedAttributionModel_s.indexOf(model);
            if (toRemoveIndex > -1) {
                let tempoModelsArray = this.selectedAttributionModel_s;
                tempoModelsArray.splice(toRemoveIndex, 1);
                this.selectedAttributionModel_s = tempoModelsArray;
            }
        }
            console.log(event);
            console.log(model);
            console.log(this.selectedAttributionModel_s);
    }*/

    private sendDataRequestParams(startDate,endDate,selectedAttributionModel_s){
        if(startDate && endDate && selectedAttributionModel_s){
            this.dataRequestService.dataRequestParamsBehaviorSubject.next(
                [{
                    "start_date" : new Date(startDate),
                    "end_date" : new Date(endDate),
                    "attribution_model" : selectedAttributionModel_s
                }]
            );
        }
    }

}
