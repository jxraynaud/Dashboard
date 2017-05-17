import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { DataRequestService } from '../../services/data-request.service';

import { DaterangepickerConfig } from 'ng2-daterangepicker';
import { Daterangepicker } from 'ng2-daterangepicker';

import {debugLog, debugWarn, debugLogGroup} from '../../../../utils';

@Component({
  selector: 'app-form-data-request',
  templateUrl: './form-data-request.component.html',
  styleUrls: ['./form-data-request.component.css']
})
export class FormDataRequestComponent implements OnInit {
    DEBUG: boolean = true;
    @Input() defaultSelectedAttributionModel_s : number | number[];
    @Input() isAttributionModelMultiple : boolean;
    lessThan2Selectedmodels:boolean;
    @ViewChild('expansionRequestParams') expansionRequestParams

    // Define the needed attributes
    private _dateRange : {startDate, endDate};
    get dateRange(){
        return this._dateRange;
    }
    set dateRange(newDateRange){
        this._dateRange = newDateRange;
        debugLog(this.DEBUG,"Setter from dateRange attributes triggers data recalculation");
        this.sendDataRequestParams(this.dateRange.startDate,this.dateRange.endDate,this.selectedAttributionModel_s)
    }
    //TODO : rendre dynamique
    private _attributionModels = [2,5,11];
    // Associated getter and setters
    get attributionModels(){ return this._attributionModels}
    set attributionModels(val){ debugLog(this.DEBUG, "SETTER ATTRIBUTION MODEL"); this._attributionModels = val; }

    private _selectedAttributionModel_s : any; // TODO get default from api
    set selectedAttributionModel_s(newAttribModel){
        console.log("SETTER ATTRIBUTION MODEL ID SERVICE");
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
        console.log("--------------");
        let a = this.expansionRequestParams.close();
        console.log(a);
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

    // Associated methods
    initDefaultDateRange():any{
        let days = 86400000;
        let today = Date.now();
        return {
            //TODO : remettre dates par défaut
            //startDate : new Date(today - (8*days)),
            startDate : new Date("2016-01-01"),
            //endDate : new Date(today - (1*days)),
            endDate : new Date("2016-03-01"),
        };
    }

    public selectedDate(value: any):void {
        //triggers setter of dateRange attribute
        this.dateRange ={
            startDate : new Date(value.start),
            endDate : new Date(value.end),
        };
        debugLog(this.DEBUG, "New daterange : "+this.dateRange.startDate+" - "+this.dateRange.endDate);
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
    public changeModelsMultiple(event,model):void{
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
    }

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
