import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {/* Http,*/ Headers, RequestOptions, Response } from '@angular/http';

import { DaterangepickerConfig } from 'ng2-daterangepicker';
import { Daterangepicker } from 'ng2-daterangepicker';

import { Angular2Csv } from 'angular2-csv/Angular2-csv';

import { NavService } from '../../../services/nav.service';
import { AuthenticatedHttpService } from '../../../services/authenticatedHttpService';

import {debugLog, debugLogGroup, intersection} from '../../../utils';

@Component({
  selector: 'app-kpi-manager',
  templateUrl: './kpi-manager.component.html',
  styleUrls: ['./kpi-manager.component.css']
})
export class KpiManagerComponent implements OnInit {
    DEBUG : boolean = true;
    API_URL : string = "http://localhost:8000/api/";
    //API_URL : string = "http://dagobert.blizzard.pixelforest.io/api/";
    //API_URL : string = "https://clovis.blizzard.pixelforest.io/api/";
    objectKeys = Object.keys;

    //If set to false, nothing checked will display no result
    NO_CHECKED_MEANS_UNFILTERED = true;
    EXCLUDE_NOT_DISPLAYED_KPIS = false;

    kpis = [];
    kpi_filtered_data = [];

    globalTags = [];
    kpiTagsDetails= [];

    kpi_filters = [
        {
            'machine_name':'brand',
            'name':'Brand',
            'checkbox':true,
            'attribute_from_kpi':(kpi)=>{ return kpi['product']['brand']; },
            'id_from_attribute':(attr)=>{ return attr['id']; },
            'name_from_attribute':(attr)=>{ return attr['name']; },
            'priority' : 1,
        },
        {
            'machine_name':'product',
            'name':'Product',
            'checkbox':true,
            'attribute_from_kpi':(kpi)=>{ return kpi['product']; },
            'id_from_attribute':(attr)=>{ return attr['id']; },
            'name_from_attribute':(attr)=>{ return attr['name']; },
            'priority' : 2,
        },
        {
            'machine_name':'kpi_action',
            'name':'KPI action',
            'checkbox':true,
            'attribute_from_kpi':(kpi)=>{ return kpi['kpi_action']; },
            'id_from_attribute':(attr)=>{ return attr['id']; },
            'name_from_attribute':(attr)=>{ return attr['action']; },
            'priority' : 3,
        },
        {
            'machine_name':'metacampaign',
            'name':'Metacampaign',
            'checkbox':true,
            'multiple':true,
            'attribute_from_kpi':(kpi)=>{ return kpi['metacampaigns']; },
            'id_from_attribute':(attr)=>{ return attr['api_id']; },
            'name_from_attribute':(attr)=>{ return attr['api_name']; },
            'priority' : 4,
        },
        {
            'name':'Creation date',
            'daterange':true,
            'attribute_from_kpi':(kpi)=>{ return kpi['creation_date']; },
            'id_from_attribute':null,
            'name_from_attribute':null,
        }
    ]

    daterange_options;
    dateRange : {startDate, endDate};
    //kpi_filters = [];

    sort_columns = {
        'id' : { 'getOrderField' : (kpi) => { return kpi["id"]; }, 'order' : "", "type" : "numberSort" },
        'brandName' : { 'getOrderField' : (kpi) => { return kpi["product"]["brand"]["name"]; }, 'order' : "", "type" : "stringSort" },
        'productName' : { 'getOrderField' : (kpi) => { return kpi["product"]["name"]; }, 'order' : "", "type" : "stringSort" },
        'creationDate' : { 'getOrderField' : (kpi) => { return kpi["creation_date"]; }, 'order' : "", "type" : "dateSort" },
        'name' : { 'getOrderField' : (kpi) => { return kpi["name"]; }, 'order' : "", "type" : "stringSort" },
        'kpiActionName' : { 'getOrderField' : (kpi) => { return kpi["kpi_action"]['action']; }, 'order' : "", "type" : "stringSort" },
        'lastAddOrRemovalTagDate' : { 'getOrderField' : (kpi) => { if(kpi["tag_link_editions"]){ return kpi["tag_link_editions"]["action_time"];} else{return 0} }, 'order' : "", "type" : "dateSort" },
    }

    /******************/
    filtersChips:Object = {}
    activeFiltersChips:Object = {}
    /******************/

    selectedTabIndex:number=0

    tagsTabExpanded(){
        alert("expanded")
    }

    constructor(
        private http: AuthenticatedHttpService,
        protected activatedRoute : ActivatedRoute,
        public navService : NavService,
    ) { }

    ngOnInit() {
        //Get kpis + use retrieved values to initiate values, chips and active chips objects
        this.getKpis();
        this.getTags();
        this.getKpisTagsDetails();
        this.dateRange = this.initDefaultDateRange();
        let today = new Date();
        this.daterange_options = {
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

    }

    initDefaultDateRange():any{
        let days = 86400000;
        let today = Date.now();
        return {
            //TODO : remettre dates par défaut
            startDate : new Date(today - (3100*days)),
            //startDate : new Date("2016-01-01"),
            endDate : new Date(today - (1*days)),
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

    getKpis(){
        return this.http.get(this.API_URL+"kpis-full/", this.jwt())
           .toPromise()
           .then(response => {
               debugLogGroup(this.DEBUG, ["Promise result received for Kpi-manager.getKpis()",
                   response.json()]);
                this.kpis = response.json();
                //Convert dates
                this.kpis.map(kpi=>{
                    kpi['creation_date'] = new Date(kpi['creation_date']);
                    if(kpi['tag_link_editions']){
                        kpi['tag_link_editions']['action_time'] = new Date(kpi['tag_link_editions']['action_time']);
                    }
                });
                this.kpi_filtered_data = this.kpis;
                this.kpi_filtered_data.map(kpi=>{
                    kpi["checked"]=false;
                })
                //Init values for filters and corresponding chips
                this.initAllAvailableValuesForFilters();
                debugLogGroup(this.DEBUG, ["Kpis, kpi_filtered_data", this.kpis, this.kpi_filtered_data])
           })
           .catch(error => {
               console.error("PROMISE REJECTED : could not get data from api in kpi manager for kpis");
               console.log("error : "+error.json().detail);
               console.log(error.json());
           //    this.router.navigate(['/login'], { queryParams: { returnUrl : window.location.pathname }});
               return [];
           });
    }

    getKpisTagsDetails(){
        return this.http.get(this.API_URL+"kpis-tags-details/", this.jwt())
           .toPromise()
           .then(response => {
               debugLogGroup(this.DEBUG, ["Promise result received for Kpi-manager.getKpisTagsDetails()",
                   response.json()]);
                this.kpiTagsDetails = response.json();
           })
           .catch(error => {
               console.error("PROMISE REJECTED : could not get data from api in kpi manager for kpisTagsDetails");
               console.log("error : "+error.json().detail);
               console.log(error.json());
           //    this.router.navigate(['/login'], { queryParams: { returnUrl : window.location.pathname }});
               return [];
           });
    }

    getTags(){
        return this.http.get(this.API_URL+"global-tags-full/", this.jwt())
           .toPromise()
           .then(response => {
               debugLogGroup(this.DEBUG, ["Promise result received for Kpi-manager.getTags()",
                   response.json()]);
                this.globalTags = response.json();
                //Convert dates
                this.globalTags.map(tag=>{
                    tag['publication_date'] = new Date(tag['publication_date']);
                    if(tag['retired_date']){
                        tag['retired_date'] = new Date(tag['retired_date']);
                    }
                });
                debugLogGroup(this.DEBUG, ["Globaltags :",
                    this.globalTags]);
           })
           .catch(error => {
               console.error("PROMISE REJECTED : could not get data from api in kpi manager for kpis");
               console.log("error : "+error.json().detail);
               console.log(error.json());
           //    this.router.navigate(['/login'], { queryParams: { returnUrl : window.location.pathname }});
               return [];
           });
    }

    initAvailableValuesForFilter(filter){
        let attributes_only_array = [];
        //"Unpack" multiple values received by the endpoint as arrays of attributes
        if(filter["checkbox"]){
            if(filter["multiple"]){
                //console.log("multiple for "+filter['name']);

                //this.kpi_filtered_data.filter(kpi=>{ return this.isInFilterConditions(kpi) }).map(kpi=>{ filter.attribute_from_kpi(kpi).map(e=>{ attributes_only_array.push(e) }) });
                this.kpi_filtered_data.map(kpi=>{
                    if(this.isInFilterConditions(kpi)){
                        filter.attribute_from_kpi(kpi).map(e=>{ attributes_only_array.push(e) })
                    }
                });

            }else{
                //Use kpi_filtered_data to get attributes, checking "isInFilterConditions" to get "filtered filters"
                attributes_only_array = this.kpi_filtered_data.map(kpi=>{
                    if(this.isInFilterConditions(kpi)){
                        return filter.attribute_from_kpi(kpi);
                    }
                }).filter(attr => { return typeof attr != 'undefined' });
                console.warn("toto5")
                console.warn(attributes_only_array)
            }
        } else if(filter["daterange"]){
            //Define first and last date from filtered data
            /*let sortedCreationDateValues = this.kpi_filtered_data.map(kpi=>{
                if(this.isInFilterConditions(kpi)){
                    return filter.attribute_from_kpi(kpi);
                }
            }).filter(attr => { return typeof attr != 'undefined' }).sort(function(a,b){
              return a - b;
            });
            console.log(sortedCreationDateValues)
            this.dateRange.startDate = sortedCreationDateValues[0]
            this.daterange_options.startDate = this.dateRange.startDate;
            this.dateRange.endDate = sortedCreationDateValues[sortedCreationDateValues.length-1]
            this.daterange_options.endDate = this.dateRange.endDate;*/
        }else{
            console.error("Filter not recognized :");
            console.error(filter);
        }

        let unique_attributes = attributes_only_array.filter((attr, index, self)=>{
            let first_occurence_id_in_array = attributes_only_array.findIndex(
                attr2=>{ return filter.id_from_attribute(attr2) === filter.id_from_attribute(attr)}
            );
            return first_occurence_id_in_array === index;
        });

        //Add a "checked" attribute if not present
        unique_attributes.map(e=>{ if(typeof e["checked"] == 'undefined'){e["checked"] = false;} })

        return unique_attributes;
    }

    //Init values for filters and corresponding chips
    initAllAvailableValuesForFilters(){
        console.warn("REGENERATING FILTERS ON BASE OF : ")
        console.log(this.kpi_filtered_data)
        this.kpi_filters.map(f => {
            let availableValuesForFilter = this.initAvailableValuesForFilter(f);
            f["values"] = availableValuesForFilter;

            //Init chips : create tempo empty array, fill it with names only and push it in filtersChips corresponding value
            this.initKpisChipsValues(f, availableValuesForFilter);
        })
        console.log("Generated filter values :");
        console.log(this.kpi_filters);
        console.log("Generated chips values for filters :");
        console.log(this.filtersChips);
    }

    initKpisChipsValues(filter, availableValuesForFilter){
        //Init chips : create tempo empty array, fill it with names only and push it in filtersChips corresponding value
        let availableChipsForFilter = [];
        availableValuesForFilter.map(v=>{ availableChipsForFilter.push(filter['name_from_attribute'](v)); })
        this.filtersChips[filter['machine_name']] = availableChipsForFilter;
        //Init active filters chips : insert an empty array for each machine_name key
        this.activeFiltersChips[filter['machine_name']] = [];
    }

    /*Refresh available values for filters, following a tunnel : the filter with lowest priority value drives the available values of all lower priority filters.
    Date range is man aged separately*/
    refreshFiltersConditionally(maxFilterNumber){
        console.warn("updating filters condinitonnally, maximum : "+maxFilterNumber)
        this.kpi_filters.map(f => {
            if(f['priority'] && f['priority'] > maxFilterNumber){
                let availableValuesForFilter = this.initAvailableValuesForFilter(f)
                f["values"] = availableValuesForFilter;
                //Init chips : create tempo empty array, fill it with names only and push it in filtersChips corresponding value
                this.initKpisChipsValues(f, availableValuesForFilter);
            }
        })

        console.log("Generated filter values :");
        console.log(this.kpi_filters);
    }

    addFilterChip(chip,filterMachineName):void{
        debugLogGroup(this.DEBUG, [
            "Form Data Filters : add chip",
            chip,
            "to",
            filterMachineName,
            "via",
            this.kpi_filters
        ]);
        //Find correct filter
        let one_kpi_filter = this.kpi_filters.find(f=>{return f['machine_name'] == filterMachineName});
        //Find correct value based on name from attribute function
        let one_value = one_kpi_filter['values'].find(val=>{ return one_kpi_filter['name_from_attribute'](val) == chip});
        //Check it
        one_value["checked"] = true;
        //Refresh conditionnally other filters
        this.refreshFiltersConditionally(one_kpi_filter['priority'])
    }

    removeFilterChip(chip,filterMachineName):void{
        debugLogGroup(this.DEBUG, [
            "Form Data Filters : remove chip",
            chip,
            "to",
            filterMachineName,
            "via",
            this.kpi_filters
        ]);
        //Find correct filter
        let one_kpi_filter = this.kpi_filters.find(f=>{return f['machine_name'] == filterMachineName});
        //Find correct value based on name from attribute function
        let one_value = one_kpi_filter['values'].find(val=>{ return one_kpi_filter['name_from_attribute'](val) == chip});
        //Uncheck it
        one_value["checked"] = false;
        this.refreshFiltersConditionally(one_kpi_filter['priority'])
    }

    dateChanged(value){
        //Refresh filters
        //this.initAllAvailableValuesForFilters();
        //Update dates
        this.dateRange = {
            startDate : new Date(value.start),
            endDate : new Date(value.end),
        };
        debugLog(this.DEBUG, "New daterange : "+this.dateRange.startDate+" - "+this.dateRange.endDate);
    }

    /*refreshAllAvailableFiltersValues(filterName){
        this.kpi_filters.map(f => {
            if(f["name"] != filterName){
                f["values"] = this.initAvailableValuesForFilter(f);
            }
        })
    }*/

    isInFilterConditions(kpi){
        //Initial value of display of this kpi line
        let is_displayed = true;
        //Go through all filters
        this.kpi_filters.map(filter=>{
            //Skip completely filtering if filter['values'] is undefined (means values of filters haven't been retrieved yet)
            if(filter['checkbox']==true){
                if(filter['values']){
                    //Get valid ids from filters (ones that are markes as "checked")
                    let valid_ids = filter['values'].filter(value_attr=>{
                        return value_attr['checked']
                    }).map(value_attr=>{
                        return filter.id_from_attribute(value_attr);
                    })

                    if(filter['multiple']){
                        //Get array of valid ids
                        let attribute_id_array = filter.attribute_from_kpi(kpi).map(e=>{return filter.id_from_attribute(e); })
                        //If list of valid ids empty (==nothing checked), dont impact filtering [depends on option]
                        if(valid_ids.length == 0 && this.NO_CHECKED_MEANS_UNFILTERED ){
                            //If no valid ids (nothing checked) AND option is true, do nothing (keep status without checking presence of valid filter values for this filter)
                        }else{
                            if( !valid_ids.some(id => attribute_id_array.includes(id) ) ){ is_displayed = false; }
                        }
                    }else{
                        //Get id
                        let attribute_id = filter.id_from_attribute(filter.attribute_from_kpi(kpi));
                        //If list of valid ids empty (==nothing checked), dont impact filtering [depends on option]
                        if(valid_ids.length == 0 && this.NO_CHECKED_MEANS_UNFILTERED ){
                            //If no valid ids (nothing checked) AND option is true, do nothing (keep status without checking presence of valid filter values for this filter)
                        }else{
                            if(valid_ids.indexOf(attribute_id) == -1){ is_displayed = false; }
                        }
                    }
                }
            }else if(filter["daterange"]){
                if(this.dateRange.startDate - filter.attribute_from_kpi(kpi) > 0 || filter.attribute_from_kpi(kpi) - this.dateRange.endDate > 0 ){ is_displayed = false; }
            }else{
                console.error("Filter not recognized :");
                console.error(filter);
            }
        });
        //console.warn(is_displayed)
        return is_displayed;
    }

    isTagInSelectedKpis(tag){
        let selected_kpis = this.kpi_filtered_data.map(kpi=>{
            if(kpi['checked'] && (!this.EXCLUDE_NOT_DISPLAYED_KPIS || this.isInFilterConditions(kpi))) {
                return kpi['id'];
            }
        }).filter(attr => { return typeof attr != 'undefined' });
        if(intersection(selected_kpis,tag['kpis']).length > 0 ){ return true; } else { return false; }
        /*if(selected_kpis.length > 0){
            console.warn("----");
            console.warn(selected_kpis)
        }*/
    }

    /*filterData(){
        let checked_values = {};
        this.kpi_filters.forEach(filter=>{

        })

        this.kpi_filtered_data = this.kpis.filter(kpi => {
            isChecked = false;
            this.kpi_filters.map(filter=>{
                let
            });
        })

    }*/

    sortKpis(sortColumn){
        if(sortColumn["type"]=="numberSort" || sortColumn["type"]=="dateSort"){
            if(sortColumn["order"] == "" || sortColumn["order"] == "desc" ){
                this.kpi_filtered_data.sort((kpi1,kpi2)=>{ return sortColumn['getOrderField'](kpi1) - sortColumn['getOrderField'](kpi2); });
                sortColumn["order"] = "asc";
            }else if(sortColumn["order"] == "asc"){
                this.kpi_filtered_data.sort((kpi1,kpi2)=>{ return sortColumn['getOrderField'](kpi2) - sortColumn['getOrderField'](kpi1); });
                sortColumn["order"] = "desc";
            }else{
                console.error("Unknown value for order of column (accepted : '', 'asc' and 'desc')");
            }
        }else if(sortColumn["type"]=="stringSort"){
            if(sortColumn["order"] == "" || sortColumn["order"] == "desc" ){
                this.kpi_filtered_data.sort((kpi1,kpi2)=>{
                    if( sortColumn['getOrderField'](kpi1) < sortColumn['getOrderField'](kpi2)){return -1};
                    if( sortColumn['getOrderField'](kpi1) > sortColumn['getOrderField'](kpi2)){return 1};
                    return 0;
                });
                sortColumn["order"] = "asc";
            }else if(sortColumn["order"] == "asc"){
                this.kpi_filtered_data.sort((kpi1,kpi2)=>{
                    if( sortColumn['getOrderField'](kpi2) < sortColumn['getOrderField'](kpi1)){return -1};
                    if( sortColumn['getOrderField'](kpi2) > sortColumn['getOrderField'](kpi1)){return 1};
                    return 0;
                });
                sortColumn["order"] = "desc";
            }else{
                console.error("Unknown value for order of column (accepted : '', 'asc' and 'desc')");
            }
        }/*else if(sortColumn["type"]=="dateSort"){
            if(sortColumn["order"] == "" || sortColumn["order"] == "desc" ){
                this.kpi_filtered_data.sort((kpi1,kpi2)=>{ return sortColumn['getOrderField'](kpi1) - sortColumn['getOrderField'](kpi2); });
                sortColumn["order"] = "asc";
            }else if(sortColumn["order"] == "asc"){
                this.kpi_filtered_data.sort((kpi1,kpi2)=>{ return sortColumn['getOrderField'](kpi2) - sortColumn['getOrderField'](kpi1); });
                sortColumn["order"] = "desc";
            }else{
                console.error("Unknown value for order of column (accepted : '', 'asc' and 'desc')");
            }
        }*/

        console.warn(this.sort_columns)
    }

    selectAllVisibleKpis(){
        this.kpi_filtered_data.map(kpi=>{
            if(this.isInFilterConditions(kpi)){
                kpi['checked'] = true;
            }
        });
    }

    clearAllCheckedKpis(){
        this.kpi_filtered_data.map(kpi=>{
            kpi['checked'] = false;
        });
    }

    selectAllFilter(filter){
        filter['values'].map(v=>{
            v["checked"]=true;
            this.activeFiltersChips[filter['machine_name']].push(filter['name_from_attribute'](v));
        })
        this.refreshFiltersConditionally(filter['priority']);
    }

    clearAllFilter(filter){
        filter['values'].map(v=>{
            v["checked"]=false;
        })
        this.activeFiltersChips[filter['machine_name']] = [];
        this.refreshFiltersConditionally(filter['priority']);
    }

    clearAllCheckboxTabs(){
        this.kpi_filters.map(f=>{
            if(f['checkbox']){
                this.clearAllFilter(f);
            }
        });
    }

    getNumberOfCheckedValues(filter){
        if(filter["values"]){
            return filter["values"].filter(v=>{ return v.checked }).length;
        }else{
            return 0;
        }
    }

    getNumberOfCheckedKpis(){
        return this.kpi_filtered_data.filter(kpi=>{ return kpi['checked'] }).length;
    }

    getFilterLabel(filter){
        if(filter["checkbox"]){
            return filter["name"]+" ("+this.getNumberOfCheckedValues(filter)+")"
        }
        if(filter["daterange"]){
            return filter["name"];
        }
    }

    //dec . sep , en fr dec , sep ;
    exportKpiToCSV(separator, decimal){
        let dataToExport = [];
        let valid_kpis = this.kpi_filtered_data.filter( kpi => { return this.isInFilterConditions(kpi) } );
        valid_kpis.map(kpi=>{
            let line = {};
            line["id"] = kpi["id"];
            line["name"] = kpi["name"];
            line["description"] = kpi["description"];
            line["product"] = kpi["product"]["name"];
            line["kpi_action"] = kpi["kpi_action"]["action"];
            line["creation_date"] = kpi["creation_date"];
            line["metacampaigns"] = "";
            kpi["metacampaigns"].map(metac=>{ line["metacampaigns"] += metac["api_name"] +"("+metac["api_id"]+")"+ " / " })
            if(kpi["tag_link_editions"]){
                line["last_tag_edition"] = kpi["tag_link_editions"]["action_time"];
            }else{
                line["last_tag_edition"] = "None";
            }
            dataToExport.push(line);
        })

        new Angular2Csv(dataToExport, "Test", { fieldSeparator : separator, decimalseparator : decimal, headers: ["Id","Name","Description","Product","Kpi Action","Creation date","Metacampaigns","Date of last tag add/removal"] } );
    }

    exportTagsToCSV(separator, decimal){
        console.warn("---");
        console.warn(this.globalTags)
        let dataToExport = [];
        let valid_tags = this.globalTags.filter( tag => { return this.isTagInSelectedKpis(tag) } );
        valid_tags.map(tag=>{
            let line = {};
            line["id"] = tag["id"];
            line["name"] = tag["name"];
            line["description"] = tag["description"];
            line["publication_date"] = tag["publication_date"];
            line["retired_date"] = tag["retired_date"];
            line["to_be_removed"] = tag["to_be_removed"];
            line["is_removed"] = tag["is_removed"];
            line["is_app"] = tag["is_app"];
            line["is_global"] = tag["is_global"];
            line["is_piggybacker"] = tag["is_piggybacker"];
            dataToExport.push(line);
        })

        new Angular2Csv(dataToExport, "Test", { fieldSeparator : separator, decimalseparator : decimal, headers: ["Id","Name","Description","Publication date","Retired date","To be removed","Is removed","Is app","Is global","Is piggybacker"] } );
    }

}
