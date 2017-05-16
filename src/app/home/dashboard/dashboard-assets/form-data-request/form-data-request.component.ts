import { Component, OnInit, Input } from '@angular/core';
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
    @Input() isAttributionModelMultiple : boolean;

    // Define the needed attributes
    private _dateRange : {startDate, endDate};
    get dateRange(){
        return this._dateRange;
    }
    set dateRange(newDateRange){
        this._dateRange = newDateRange;
        debugLog(this.DEBUG,"Setter from dateRange attributes triggers data recalculation");
        //if(this.selectedAttributionModelId){
            this.dataRequestService.dataRequestParamsBehaviorSubject.next(
                [{
                    "start_date" : this.dateRange.startDate,
                    "end_date" : this.dateRange.endDate,
                    "attribution_model" : this.selectedAttributionModel_s
                }]
            );
        //}
    }

    private _attributionModels;
    // Associated getter and setters
    get attributionModels(){ return this._attributionModels}
    set attributionModels(val){ debugLog(this.DEBUG, "SETTER ATTRIBUTION MODEL"); this._attributionModels = val; }

    private _selectedAttributionModel_s : any; // TODO get default from api
    set selectedAttributionModel_s(val){
        console.log("SETTER ATTRIBUTION MODEL ID SERVICE");
        //Attribute
        if(this.isAttributionModelMultiple){
            //TODO : virer le 5
            this._selectedAttributionModel_s = val;
        }else{
            this._selectedAttributionModel_s = [val,11];
        }

        debugLog(this.DEBUG, "Setter from attribution model triggers data recalculation");
        this.dataRequestService.dataRequestParamsBehaviorSubject.next(
            [{
                "start_date" : new Date(this.dateRange.startDate),
                "end_date" : new Date(this.dateRange.endDate),
                "attribution_model" : [this.selectedAttributionModel_s,11]
            }]
        );
    }
    get selectedAttributionModel_s(){
        //console.log("GETTER ATTRIBUTION MODEL ID SERVICE");
        return this._selectedAttributionModel_s;
    }

    private
    constructor(private dataRequestService : DataRequestService, private options: DaterangepickerConfig) { }

    ngOnInit() {
        this.dateRange = this.initDefaultDateRange()
        let today = new Date();
        this.options.settings = {
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


}
