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
    API_URL : string = "http://dagobert.blizzard.pixelforest.io/api/";
    //API_URL : string = "https://clovis.blizzard.pixelforest.io/api/";

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
    //generation_in_progress : boolean = false;
    nb_files_in_generation : number = 0;
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
    parameters_ok : boolean = false;

    metacampaignsChips = [];
    activeMetacampaignsChips = [];
    activeMetacampaignsItems = [];

    customKpis : boolean = false;
    kpis = [];
    kpisLoading : boolean = false;
    kpisChips = [];
    activeKpisChips = [];
    activeKpisItems = [];

    dataByTag : boolean = false;

    separatePostImpPostClick : boolean = true;
    csvFormatEn : boolean = true;
    addIdColumn : boolean = false;
    certifiedConversionsOnly : boolean = false;

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

        this.getAttributionModels().then(response=>{
            this.attributionModels = response;
            this.attributionModelsChips = this.attributionModels.map(e=>{return e['name']});
            let defaultAttributionModel = this.attributionModels.find(e=>{return e['is_default_model']});
            //Add to active attributino model chips and toitems (TODO :see if there id an api on widget to add directly as if it was a user action)
            this.activeAttributionModelsChips = [defaultAttributionModel['name']];
            this.addActiveAttributionModelChip(defaultAttributionModel['name']);
        })

        console.warn(this.selected_dateRange['startDate'])
        let startDate = this.selected_dateRange['startDate'];
        let endDate = this.selected_dateRange['endDate'];
        this.getMetacampaignsForDaterange(startDate, endDate).then(response=>{
            this.metacampaignsLoading = false;
        });

        this.getKPIs(startDate, endDate).then(response=>{
            this.kpisLoading = false;
            //this.kpis = response;
            //this.kpisChips = this.kpis.map(e=>{return e['api_name']});
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
        this.activeMetacampaignsChips = [];
        this.metacampaigns = [];
        this.metacampaignsChips = [];
        console.warn(this.jwt().headers)
        debugLogGroup(this.DEBUG, ["Requesting for metacampaigns list", {startDate : startDate, endDate : endDate}])
        return this.http.post(this.API_URL+"metacampaign_reporting_list/", {startDate : startDate, endDate : endDate}, this.jwt())
           .toPromise()
           .then(response => {
               debugLogGroup(this.DEBUG, ["Promise result received for ReportingComponent.getMetacampaigns()",
                   response.json()]);
                this.metacampaigns = response.json();
                this.metacampaignsChips = this.metacampaigns.map(m=>{return m['ad__placement__campaign__metacampaign__name']});
                this.metacampaignsChips.sort();
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

    addActiveMetacampaignChip(itemName){
        let MetacToAdd = this.metacampaigns.find(m=>{ return m["ad__placement__campaign__metacampaign__name"] == itemName });
        this.activeMetacampaignsItems.push( MetacToAdd );
        debugLogGroup(this.DEBUG, ["Adding item "+itemName+" to active metacmpaigns, result :", this.activeMetacampaignsItems]);
    }

    removeActiveMetacampaignsChip(itemName, activeItemsArray){
        let MetacIndexToRemove = this.activeMetacampaignsItems.findIndex(i=>{ return i["ad__placement__campaign__metacampaign__name"] == itemName })
        console.warn(MetacIndexToRemove)
        this.activeMetacampaignsItems.splice(MetacIndexToRemove,1);
        debugLogGroup(this.DEBUG, ["Removing item "+itemName+" from active metacmpaigns items, result :", this.activeMetacampaignsItems]);
    }

    /*********Kpis********/
    getKPIs(startDate, endDate){
        this.kpisLoading = true;
        this.activeKpisChips = [];
        this.kpis = [];
        this.kpisChips = [];
        return this.http.post(this.API_URL+"kpi_reporting_list/", {startDate : startDate, endDate : endDate}, this.jwt())
           .toPromise()
           .then(response => {
               debugLogGroup(this.DEBUG, ["Promise result received for ReportingComponent.getKpis()",
                   response.json()]);
                   this.kpis = response.json();
                   this.kpisChips = this.kpis.map(e=>{return e['api_name']});
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
        console.warn("CLEAR ATTRIBUTION MODELS");
        this.activeAttributionModelsChips = [];
        this.activeAttributionModelsItems = []
    }

    /*clearMetacampaignsChips(){
        console.warn("CLEAR METACAMPAIGNS");
        this.activeMetacampaignsChips = [];
        this.activeMetacampaignsItems = []
    }*/

    removeActiveAttributionModelChip(itemName, activeItemsArray){
        let AMIndexToRemove = this.activeAttributionModelsItems.findIndex(i=>{ return i["name"] == itemName })
        console.warn(AMIndexToRemove)
        this.activeAttributionModelsItems.splice(AMIndexToRemove,1);
        debugLogGroup(this.DEBUG, ["Removing item "+itemName+" from active, result :", this.activeAttributionModelsItems]);
    }

    generateDateYYYYMMDD(date){
        let d = new Date(date);
        let month = ("0"+(d.getMonth()+1)).slice(-2);
        let day = ("0"+d.getDate()).slice(-2);
        return d.getFullYear()+"-"+month+"-"+day;
    }

    /*sortMetacampaigns(unsorted){
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
    }*/

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
            //console.warn("response unsorted");
            //console.warn(response);
            /*this.metacampaigns = response;
            this.metacampaignsChips = response.map(m=>{return m['ad__placement__campaign__metacampaign__name']});*/
            //console.warn("response sorted");
            console.warn(this.metacampaignsChips)
            this.metacampaignsLoading = false;
        });

        this.getKPIs(startDate,endDate).then(response=>{
            this.kpisLoading = false;
        });
    }

    check_parameters_ok(){
        this.form_errors = [];

        if(!this.selected_dateRange.startDate
            || !this.selected_dateRange.endDate
            || this.activeMetacampaignsItems.length == 0
            || (this.customKpis && this.activeKpisItems.length == 0)
            || this.activeAttributionModelsItems.length == 0
        ){
            if(    !this.selected_dateRange.startDate){ this.form_errors.push("Define Start date"); }
            if(    !this.selected_dateRange.endDate){ this.form_errors.push("Define End date"); }
            if(    this.activeMetacampaignsItems.length == 0 ){ this.form_errors.push("Choose at least one Metacampaign"); }
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

    generateAllReports(){
        console.warn("Incrementing nb_files_in_generation "+this.nb_files_in_generation);
        for(let metacampaignToRequest of this.activeMetacampaignsItems){
            this.generateReport(metacampaignToRequest);
        }
    }

    generateReport(selected_metacampaign_item){
        this.nb_files_in_generation++

        console.warn("Generating report for metacampaign ID "+selected_metacampaign_item['ad__placement__campaign__metacampaign__name']);

        this.request_to_send = {
            'startDate' : this.selected_dateRange.startDate,
            'endDate' : this.selected_dateRange.endDate,
            'metacampaign' : selected_metacampaign_item,
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
        /*Store local id inside function to cover for multiple metacampaigns requested :
        without that, this.local_id_request is incremented N times (N being the number of different metacampaigns requested) in parallel,
        ==> watch_report_from_api returns file ref N times for the same local_id, and so only the last one is displayed
        */
        let local_id_request_to_watch = this.local_id_request;
        this.report_responses.push(
            {
             "local_id_request":this.local_id_request,
             "requested_date":Date.now(),
             "startDate":this.selected_dateRange.startDate,
             "endDate":this.selected_dateRange.endDate,
             //"campaign_name":this.selected_metacampaign_item['ad__placement__campaign__metacampaign__name'],
             "campaign_name":selected_metacampaign_item['ad__placement__campaign__metacampaign__name'],
             "generated":false,
        });

        this.http.post(this.API_URL+"metacampaign_reporting/", this.request_to_send, this.jwt())
           .toPromise()
           .then(response => {
                debugLogGroup(this.DEBUG, ["Promise result received for DataRequestService.getAll()",
                   response.json()]);
                let reporting_id_to_watch = response.json()["report_id"];
                this.watch_report_from_api(local_id_request_to_watch, reporting_id_to_watch);

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

    watch_report_from_api(local_id_request, reporting_id_to_watch){
        let tryNumber = 0;
        let newFile = "";
        let report_generated = 0;
        console.log("Try number "+tryNumber)
        var watch_report_loop = setInterval(()=>{
            tryNumber++;
            console.log("Try number "+tryNumber)

            this.http.post(this.API_URL+"watch_report_generation/", { "id_to_watch" : reporting_id_to_watch }, this.jwt())
               .toPromise()
               .then(response => {
                    debugLogGroup(this.DEBUG, ["Promise result received for DataRequestService.watch_report_from_api()",
                       response.json()]);

                    report_generated = response.json()["generated"];

                    if(report_generated){
                        var url_assets_file = response.json()["file"].replace("/var/www/FraudDetector/newmecblizzardtools/assets","http://dagobert.blizzard.pixelforest.io/static")
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
                        //this.generation_in_progress = false;
                        this.nb_files_in_generation--;
                        console.warn("Decrementing nb_files_in_generation "+this.nb_files_in_generation);

                        debugLog(this.DEBUG,"File generated OK for local id "+local_id_request);
                        console.warn(this.report_responses);
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

    urlCleanFromServerFolders(url){
        if(url){
            return url.replace("/var/www/dashboard.blizzard.pixelforest.io","")
        }
    }

}
