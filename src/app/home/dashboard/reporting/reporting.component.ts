import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {/* Http,*/ Headers, RequestOptions, Response } from '@angular/http';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/toPromise';

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
    //API_URL : string = "http://localhost:8000/api/";
    API_URL : string = "http://37.59.31.134:8001/api/";

    /*Theoretically could be any value to max number of attribution models requested,
    * but keep in mind UI has 1 problem : when maximum reached, chip field goes into readonly mode
    * => can't delete ONE chip, only use clear button to clear all choices.
    * => probably will never need to be more than one, or just no limitation...
    */
    MAXIMUM_ATTRIBUTION_MODELS = 100;
    @ViewChild('attributionModelsChoice') attributionModelsChoice;
    attributionModelsChoiceDisabled : boolean = false;

    openedNav : boolean = false;

    report_responses : {}[] = [];
    form_errors = [];
    request_to_send = {};
    reporting_id_to_watch : number;
    generation_in_progress : boolean = false;
    local_id_request = 0;

    // Define the needed attributes
    private _selectedDateRange : {startDate, endDate};
    get selected_dateRange(){
        return this._selectedDateRange;
    }
    set selected_dateRange(newDateRange){
        this._selectedDateRange = newDateRange;
    }
    date_options;

    metacampaigns = [];
    metacampaignsLoading = false;
    selected_metacampaign : number;
    selected_metacampaign_item : {};
    parameters_ok : boolean = false;

    customKpis : boolean = false;
    kpis = [];
    kpisChips = [];
    activeKpisChips = [];
    activeKpisItems = [];

    dataByTag : boolean = false;

    separatePostImpPostClick : boolean = true;
    csvFormatEn : boolean = true;
    addIdColumn : boolean = false;
    certifiedConversionsOnly : boolean = true;

    conversionsGroupingTypes = [{id:1, name:"No breakdown per date or week"},{id:2, name:"By Week"},{id:3, name:"By Day"}];
    groupConversionsBy:number = 3;

    attributionModels = [];
    attributionModelsChips = [];
    activeAttributionModelsChips = [];
    activeAttributionModelsItems = [];

    constructor(
        private http: AuthenticatedHttpService,
        protected activatedRoute : ActivatedRoute,
        public navService : NavService,
    ) {
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

        this.getKPIs().then(response=>{
            this.kpis = response;
            this.kpisChips = this.kpis.map(e=>{return e['api_name']});
        });

        this.getAttributionModels().then(response=>{
            this.attributionModels = response;
            this.attributionModelsChips = this.attributionModels.map(e=>{return e['name']});
        })

        console.warn(this.selected_dateRange['startDate'])
        let startDate = this.selected_dateRange['startDate'];
        let endDate = this.selected_dateRange['endDate'];
        this.getMetacampaignsForDaterange(startDate, endDate).then(response=>{
            console.warn("response unsorted");
            console.warn(response);
            this.metacampaigns = this.sortMetacampaigns(response);
            console.warn("response sorted");
            console.warn(this.metacampaigns)
            this.metacampaignsLoading = false;
            /*this.metacampaigns = this.sortMetacampaigns(response);
            this.metacampaignsLoading = false;*/
        });
    }

    ngAfterContentChecked(){
        /*TODO : is it the best solution ? without this
        with check_parameters_ok() directly in the template, generates
        an ExpressionChangedAfterItHasBeenCheckedError*/
        this.check_parameters_ok();
    }

    initDefaultDateRange():any{
        let days = 86400000;
        let today = Date.now();
        return {
            //TODO : remettre dates par défaut
            startDate : this.generateDateYYYYMMDD(new Date(today - (7*days))),
            //startDate : new Date("2016-01-01"),
            endDate : this.generateDateYYYYMMDD(new Date(today - (1*days))),
            //endDate : new Date("2016-03-01"),
        };
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

    getMetacampaignsForDaterange(startDate, endDate){
        this.metacampaignsLoading = true;
        delete this.selected_metacampaign;
        this.metacampaigns = [];
        console.warn(this.jwt().headers)
        debugLogGroup(this.DEBUG, ["Requesting for metacampaigns list", {startDate : startDate, endDate : endDate}])
        return this.http.post(this.API_URL+"metacampaign_reporting_list/", {startDate : startDate, endDate : endDate}, this.jwt())
           .toPromise()
           .then(response => {
               debugLogGroup(this.DEBUG, ["Promise result received for ReportingComponent.getMetacampaigns()",
                   response.json()]);
                return response.json()
           })
           .catch(error => {
               console.error("PROMISE REJECTED : could not get data from api in reporting section ");
               console.log("error : "+error.json().detail);
               console.log(error.json());
           //    this.router.navigate(['/login'], { queryParams: { returnUrl : window.location.pathname }});
               return [];
           });
    }

    /*********Kpis********/
    getKPIs(){
        return this.http.get(this.API_URL+"kpis/", this.jwt())
           .toPromise()
           .then(response => {
               debugLogGroup(this.DEBUG, ["Promise result received for ReportingComponent.getKpis()",
                   response.json()]);
               return response.json();
           })
           .catch(error => {
               console.error("PROMISE REJECTED : could not get KPIs data from api in reporting section");
               console.log("error : "+error.json().detail);
               console.log(error.json());
           //    this.router.navigate(['/login'], { queryParams: { returnUrl : window.location.pathname }});
               return [];
           });
    }

    addActiveStandardChip(itemName, itemsArray, activeItemsArray){
        let itemToAdd = itemsArray.find(i=>{ return i["api_name"] == itemName });
        activeItemsArray.push( itemToAdd );
        debugLogGroup(this.DEBUG, ["Adding item "+itemName+" to active, result :", activeItemsArray]);
    }

    removeActiveStandardChip(itemName, activeItemsArray){
        let itemIndexToRemove = activeItemsArray.findIndex(i=>{ return i["api_name"] == itemName })
        console.warn(itemIndexToRemove)
        activeItemsArray.splice(itemIndexToRemove,1);
        debugLogGroup(this.DEBUG, ["Removing item "+itemName+" from active, result :", activeItemsArray]);
    }

    /*******Attribution models********/
    getAttributionModels(){
        return this.http.get(this.API_URL+"attribution-models/", this.jwt())
           .toPromise()
           .then(response => {
               debugLogGroup(this.DEBUG, ["Promise result received for ReportingComponent.getAttributionModels()",
                   response.json()]);
               return response.json();
           })
           .catch(error => {
               console.error("PROMISE REJECTED : could not get Attribution Models data from api in reporting section");
               console.log("error : "+error.json().detail);
               console.log(error.json());
           //    this.router.navigate(['/login'], { queryParams: { returnUrl : window.location.pathname }});
               return [];
           });
    }

    addActiveAttributionModelChip(itemName){
        let AMToAdd = this.attributionModels.find(i=>{ return i["name"] == itemName });
        this.activeAttributionModelsItems.push( AMToAdd );
        debugLogGroup(this.DEBUG, ["Adding item "+itemName+" to active, result :", this.activeAttributionModelsItems]);
    }

    noMoreAttributionModels(){
        if(this.activeAttributionModelsChips.length != this.activeAttributionModelsItems.length){
            console.error("this.activeAttributionModelsChips.length NOT EQUAL to this.activeAttributionModelsItems.length, it chouldbe. See for a bug with clearAttributionModelsChips()")
        }
        if(this.activeAttributionModelsItems.length >= this.MAXIMUM_ATTRIBUTION_MODELS){
            return true;
        }else{
            return false;
        }
    }

    clearAttributionModelsChips(){
        console.warn("CLEAR");
        this.activeAttributionModelsChips = [];
        this.activeAttributionModelsItems = []
    }

    removeActiveAttributionModelChip(itemName, activeItemsArray){
        let AMIndexToRemove = this.activeAttributionModelsItems.findIndex(i=>{ return i["name"] == itemName })
        console.warn(AMIndexToRemove)
        this.activeAttributionModelsItems.splice(AMIndexToRemove,1);
        debugLogGroup(this.DEBUG, ["Removing item "+itemName+" from active, result :", this.activeAttributionModelsItems]);
    }

    changeMetacampaign(event){
        this.selected_metacampaign_item = this.metacampaigns.find(
            m=>{ return m["ad__placement__campaign__metacampaign__id"] == event; }
        );
        debugLogGroup(this.DEBUG, ["Changed metacampaign [this.selected_metacampaign_item] :", this.selected_metacampaign_item]);
    }

    generateDateYYYYMMDD(date){
        let d = new Date(date);
        let month = ("0"+(d.getMonth()+1)).slice(-2);
        let day = ("0"+d.getDate()).slice(-2);
        return d.getFullYear()+"-"+month+"-"+day;
    }

    sortMetacampaigns(unsorted){
        console.warn("-----")
        console.warn(unsorted)
        if(unsorted.length>0){
            unsorted = unsorted.sort(
                                (mc1,mc2)=>{

                                    let comparison = 0;
                                    if(mc1.ad__placement__campaign__metacampaign__name && mc2.ad__placement__campaign__metacampaign__name){
                                        const mc1_name = mc1.ad__placement__campaign__metacampaign__name.toUpperCase();
                                        const mc2_name = mc2.ad__placement__campaign__metacampaign__name.toUpperCase();
                                         if (mc1_name > mc2_name) {
                                           comparison = 1;
                                         } else if (mc1_name < mc2_name) {
                                           comparison = -1;
                                        }
                                    }
                                    return comparison;
                                });
        }
        return unsorted;
    }

    public selectedDate(value: any):void {
        //triggers setter of selected_dateRange attribute
        let startDate = this.generateDateYYYYMMDD(new Date(value.start));
        let endDate = this.generateDateYYYYMMDD(new Date(value.end));

        this.selected_dateRange = {
            startDate : startDate,
            endDate : endDate,
        };

        debugLog(this.DEBUG, "New daterange : "+startDate+" - "+endDate);

        this.getMetacampaignsForDaterange(startDate, endDate).then(response=>{
            console.warn("response unsorted");
            console.warn(response);
            this.metacampaigns = this.sortMetacampaigns(response);
            console.warn("response sorted");
            console.warn(this.metacampaigns)
            this.metacampaignsLoading = false;
        });
    }

    check_parameters_ok(){
        this.form_errors = [];

        if(!this.selected_dateRange.startDate
            || !this.selected_dateRange.endDate
            || !this.selected_metacampaign
            || (this.customKpis && this.activeKpisItems.length == 0)
            || this.activeAttributionModelsItems.length == 0
        ){
            if(    !this.selected_dateRange.startDate){ this.form_errors.push("Define Start date"); }
            if(    !this.selected_dateRange.endDate){ this.form_errors.push("Define End date"); }
            if(    !this.selected_metacampaign){ this.form_errors.push("Choose a Metacampaign"); }
            if(    (this.customKpis && this.activeKpisItems.length == 0)){ this.form_errors.push('Define list of Custom kpis or choose "Standard KPIs"'); }
            if(    this.activeAttributionModelsItems.length == 0){ this.form_errors.push("Choose an Attribution Model"); }
            //return false
            this.parameters_ok = false;
        }
        else {
            //return true;
            this.parameters_ok = true;
        }
    }

    test(){
        console.warn("oo");
    }

    generateReport(){
        delete this.reporting_id_to_watch;
        this.generation_in_progress = true;

        console.warn("Generating report for metacampaign ID "+this.selected_metacampaign);

        this.request_to_send = {
            'startDate' : this.selected_dateRange.startDate,
            'endDate' : this.selected_dateRange.endDate,
            'metacampaign' : this.selected_metacampaign_item,
            'custom_kpis' : this.customKpis,
            'data_by_tag' : this.dataByTag,
            'separate_post_imp_post_click' : this.separatePostImpPostClick,
            'csv_en' : this.csvFormatEn,
            'id_column' : this.addIdColumn,
            'conversions_grouping' : this.groupConversionsBy,
            'certified_conv_only' : this.certifiedConversionsOnly,
            'attribution_models' : this.activeAttributionModelsItems
        };

        if(this.customKpis){
            this.request_to_send['selected_kpis'] = this.activeKpisItems;
        }

        debugLogGroup( this.DEBUG, ["Preparing to send report parameters to API : ", this.request_to_send]);
        //Display request as waiting by pushing info to report_responses
        this.local_id_request++;
        this.report_responses.push(
            {
             "local_id_request":this.local_id_request,
             "requested_date":Date.now(),
             "startDate":this.selected_dateRange.startDate,
             "endDate":this.selected_dateRange.endDate,
             "campaign_name":this.selected_metacampaign_item['ad__placement__campaign__metacampaign__name'],
             "generated":false,
        });

        this.http.post(this.API_URL+"metacampaign_reporting/", this.request_to_send, this.jwt())
           .toPromise()
           .then(response => {
                debugLogGroup(this.DEBUG, ["Promise result received for DataRequestService.getAll()",
                   response.json()]);
                this.reporting_id_to_watch = response.json()["report_id"];
                this.watch_report_from_api(this.local_id_request);

               console.warn(this.report_responses);
           })
           .catch(error => {
               console.error("PROMISE REJECTED : could not get data from api in reporting section ");
               console.log("error : "+error.detail);
               console.log(error);
           //    this.router.navigate(['/login'], { queryParams: { returnUrl : window.location.pathname }});
               return [];
           });
    }

    watch_report_from_api(local_id_request){
        let tryNumber = 0;
        let newFile = "";
        let report_generated = 0;
        console.log("Try number "+tryNumber)
        var watch_report_loop = setInterval(()=>{
            tryNumber++;
            console.log("Try number "+tryNumber)

            this.http.post(this.API_URL+"watch_report_generation/", { "id_to_watch" : this.reporting_id_to_watch }, this.jwt())
               .toPromise()
               .then(response => {
                    debugLogGroup(this.DEBUG, ["Promise result received for DataRequestService.watch_report_from_api()",
                       response.json()]);

                    report_generated = response.json()["generated"];

                    if(report_generated){
                        var url_assets_file = response.json()["file"].replace("/var/www/FraudDetector/newmecblizzardtools/assets","http://37.59.31.134:8001/static")
                        var file_name_array = response.json()["file"].split("/");
                        var file_name = file_name_array[file_name_array.length -1];
                        console.warn(file_name)
                        let current_report = this.report_responses.find(r=>{ return r["local_id_request"] == local_id_request});

                        current_report["url"] = url_assets_file;
                        current_report["warnings"] = response.json()["warnings"].split("//").filter(i => i);
                        current_report["warnings_r"] = response.json()["warnings_r"].split("\n").filter(i => i);
                        current_report["file_name"] = file_name;
                        current_report["generation_duration"] = (Date.now() - current_report["requested_date"])/1000;
                        current_report["generated"]=true;
                        if(file_name)
                            { current_report["in_error"] = false; }
                        else{ current_report["in_error"] = true; }
                        /*this.report_responses.push(
                            {"url" : url_assets_file,
                             "startDate":this.selected_dateRange.startDate,
                             "endDate":this.selected_dateRange.endDate,
                             "campaign_name":this.selected_metacampaign_item['ad__placement__campaign__metacampaign__name'],
                             "warnings" : response.json()["warnings"].split("//").filter(i => i),
                             "warnings_r" : response.json()["warnings_r"].split("\n").filter(i => i),
                             "file_name" : file_name,
                        });*/
                        this.generation_in_progress = false;

                        debugLog(this.DEBUG,"File generated OK");
                        clearInterval(watch_report_loop);
                    }
               })
               .catch(error => {
                   console.error("PROMISE REJECTED : error in watching report generation from api");
                   console.log("error : "+error.detail);
                   console.log(error);
                   return [];
               });

        },1000)
    }

}
