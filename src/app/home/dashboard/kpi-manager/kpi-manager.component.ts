import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {/* Http,*/ Headers, RequestOptions, Response } from '@angular/http';

import { DaterangepickerConfig } from 'ng2-daterangepicker';
import { Daterangepicker } from 'ng2-daterangepicker';

import { NavService } from '../../../services/nav.service';
import { AuthenticatedHttpService } from '../../../services/authenticatedHttpService';

import {debugLog, debugLogGroup} from '../../../utils';

@Component({
  selector: 'app-kpi-manager',
  templateUrl: './kpi-manager.component.html',
  styleUrls: ['./kpi-manager.component.css']
})
export class KpiManagerComponent implements OnInit {
    DEBUG : boolean = true;
    API_URL : string = "http://localhost:8000/api/";
    //API_URL : string = "http://37.59.31.134:8001/api/";

    //If set to false, nothing checked will display no result
    NO_CHECKED_MEANS_UNFILTERED = true;

    kpis = [];
    kpi_filtered_data = [];

    kpi_filters = [
        {
            'name':'Brand',
            'attribute_from_kpi':(kpi)=>{ return kpi['product']['brand']; },
            'id_from_attribute':(attr)=>{ return attr['id']; },
            'name_from_attribute':(attr)=>{ return attr['name']; }
        },
        {
            'name':'Product',
            'attribute_from_kpi':(kpi)=>{ return kpi['product']; },
            'id_from_attribute':(attr)=>{ return attr['id']; },
            'name_from_attribute':(attr)=>{ return attr['name']; }
        },
        {
            'name':'KPI action',
            'attribute_from_kpi':(kpi)=>{ return kpi['kpi_action']; },
            'id_from_attribute':(attr)=>{ return attr['id']; },
            'name_from_attribute':(attr)=>{ return attr['action']; }
        },
        {
            'name':'Metacampaign',
            'multiple':true,
            'attribute_from_kpi':(kpi)=>{ return kpi['metacampaigns']; },
            'id_from_attribute':(attr)=>{ return attr['api_id']; },
            'name_from_attribute':(attr)=>{ return attr['api_name']; }
        }
    ]

    //kpi_filters = [];

    constructor(
        private http: AuthenticatedHttpService,
        protected activatedRoute : ActivatedRoute,
        public navService : NavService,
    ) { }

    ngOnInit() {
        this.getKpis();
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
                this.initAllAvailableValuesForFilters();
                console.warn(this.kpis)
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
        if(filter["multiple"]){
            //console.log("multiple for "+filter['name']);

            //this.kpi_filtered_data.filter(kpi=>{ return this.isInFilterConditions(kpi) }).map(kpi=>{ filter.attribute_from_kpi(kpi).map(e=>{ attributes_only_array.push(e) }) });
            this.kpi_filtered_data.map(kpi=>{
                if(this.isInFilterConditions(kpi)){
                    filter.attribute_from_kpi(kpi).map(e=>{ console.warn("toto5"); attributes_only_array.push(e) })
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

    initAllAvailableValuesForFilters(){
        console.warn("REGENERATING FILTERS ON BASE OF : ")
        console.log(this.kpi_filtered_data)
        this.kpi_filters.map(f => {
            f["values"] = this.initAvailableValuesForFilter(f);
        })
        console.log("Generated filter values :");
        console.log(this.kpi_filters);
    }

    isInFilterConditions(kpi){
        //Initial value of display of this kpi line
        let is_displayed = true;
        //Go through all filters
        this.kpi_filters.map(filter=>{
            //Skip completely filtering if filter['values'] is undefined (means values of filters haven't been retrieved yet)
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
        });
        //console.warn(is_displayed)
        return is_displayed;
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

    testFilters(){
        console.log("Filter values");
        console.log(this.kpi_filters)
    }
}
