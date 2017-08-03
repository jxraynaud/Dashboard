import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {/* Http,*/ Headers, RequestOptions, Response } from '@angular/http';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { DaterangepickerConfig } from 'ng2-daterangepicker';
import { Daterangepicker } from 'ng2-daterangepicker';

import { NavService } from '../../../services/nav.service';
import { AuthenticatedHttpService } from '../../../services/authenticatedHttpService';

import {debugLog, debugLogGroup} from '../../../utils';

@Component({
  selector: 'app-reporting',
  templateUrl: './reporting.component.html',
  styleUrls: ['./reporting.component.css']
})
export class ReportingComponent implements OnInit {
    DEBUG : boolean = true;
    API_URL : string = "http://localhost:8000/api/";

    openedNav : boolean = false;

    metacampaigns = [];
    selected_metacampaign : number;

    // Define the needed attributes
    private _selectedDateRange : {startDate, endDate};
    get selected_dateRange(){
        return this._selectedDateRange;
    }
    set selected_dateRange(newDateRange){
        this._selectedDateRange = newDateRange;
    }

    date_options;

    report_responses : {}[] = [];

    constructor(
        private http: AuthenticatedHttpService,
        protected activatedRoute : ActivatedRoute,
        public navService : NavService,
    ) {
        this.initSubscriptions();
    }

    ngOnInit() {
        this.selected_dateRange = this.initDefaultDateRange();
        let today = new Date();
        this.date_options = {
            locale: { format: 'DD-MM-YYYY' },
            alwaysShowCalendars: true,
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
    }

    initDefaultDateRange():any{
        let days = 86400000;
        let today = Date.now();
        return {
            //TODO : remettre dates par défaut
            startDate : new Date(today - (31*days)),
            //startDate : new Date("2016-01-01"),
            endDate : new Date(today - (1*days)),
            //endDate : new Date("2016-03-01"),
        };
    }

    initSubscriptions(){
        this.getMetacampaigns().then(response=>{
            this.metacampaigns = response;
        })
    }

    getMetacampaigns(){
        console.warn(this.jwt().headers)
        return this.http.get(this.API_URL+"metacampaigns/", this.jwt())
           .toPromise()
           .then(response => {
               debugLogGroup(this.DEBUG, ["Promise result received for ReportingComponent.getMetacampaigns()",
                   response.json()]);
               return response.json();
           })
           .catch(error => {
               console.error("PROMISE REJECTED : could not get data from api in reporting section ");
               console.log("error : "+error.json().detail);
               console.log(error.json());
           //    this.router.navigate(['/login'], { queryParams: { returnUrl : window.location.pathname }});
               return [];
           });
    }

    changeMetacampaign(event){
        //console.warn("TEST");
    }

    public selectedDate(value: any):void {
        //triggers setter of selected_dateRange attribute
        this.selected_dateRange = {
            startDate : new Date(value.start),
            endDate : new Date(value.end),
        };
        debugLog(this.DEBUG, "New daterange : "+this.selected_dateRange.startDate+" - "+this.selected_dateRange.endDate);
    }

    generateReport(){
        console.warn("Generating report for metacampaign ID "+this.selected_metacampaign);

        this.http.post(this.API_URL+"metacampaign_reporting/", { "metacampaign":this.selected_metacampaign, "dateRange":this.selected_dateRange }, this.jwt())
           .toPromise()
           .then(response => {
               debugLogGroup(this.DEBUG, ["Promise result received for DataRequestService.getAll()",
                   response.json()]);
               this.report_responses.push(
                   {"url" : response.json(),
                    "startDate":this.selected_dateRange.startDate,
                    "endDate":this.selected_dateRange.endDate,
                    "campaign_name":this.metacampaigns.filter((c)=>{return c.api_id==this.selected_metacampaign;})[0]['api_name']
                });
               console.warn(this.report_responses);
           })
           .catch(error => {
               console.error("PROMISE REJECTED : could not get data from api in reporting section ");
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
