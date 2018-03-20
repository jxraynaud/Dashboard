import { Component, OnInit, ViewChild } from '@angular/core';
import {/* Http,*/ Headers, RequestOptions, Response } from '@angular/http';
import { AuthenticatedHttpService } from '../../../services/authenticatedHttpService';

import { FileUploader } from 'ng2-file-upload';
import { PapaParseService } from 'ngx-papaparse';
import { Angular2Csv } from 'angular2-csv/Angular2-csv';

import {debugLog, debugLogGroup} from '../../../utils';

@Component({
  selector: 'app-cost-manager',
  templateUrl: './cost-manager.component.html',
  styleUrls: ['./cost-manager.component.css']
})
export class CostManagerComponent implements OnInit{
    DEBUG : boolean = true;
    API_URL : string = "http://localhost:8000/api/";
    //API_URL : string = "https://clovis.blizzard.pixelforest.io/api/";

    @ViewChild('step2') step2;
    @ViewChild('step3') step3;
    @ViewChild('step4') step4;
    @ViewChild('fileInput') fileInput;

    placements;

    uploader: FileUploader = new FileUploader({}); //Empty options to avoid having a target URL
    is_file:boolean=false;
    file_name:string;
    reader: FileReader = new FileReader();
    data:string;
    parsedData:Array<string>=[];
    data_to_send = [];
    errors:Array<string>=[];
    APIresponse=[]
    awaiting_api_response:boolean=false;

    //Successive tests
    //ok_columns:boolean = false;
    ok_for_upload:boolean = false;

    headers=["date","placement_id",
            "publisher_name","publisher_campaign_name","country","placement","targeting","creative","device","conversions",
            "impressions_delivered","clicks_generated","publisher_total_media_cost","engagements","video_viewed","video_viewed_25","video_viewed_50","video_viewed_75","video_viewed_100"]

    sample_data=[
        /*{
            date:"Date",
            placement_id:"Numbers only (optional)",
            publisher_name:"Text (must be exact)",
            publisher_campaign_name:"Text (optional)",
            country:"Text (optional)",
            placement:"Text (optional)",
            targeting:"Text (optional)",
            creative:"Text (optional)",
            device:"Text (optional)",
            conversions:"Number of conversions (optional)",
            impressions_delivered:"Numbers only (optional)",
            clicks_generated:"Numbers only (optional)",
            publisher_total_media_cost:"Numbers only, no currency sign (optional)",
            engagements:"Numbers only (optional)",
            video_viewed:"Numbers only (optional)",
            video_viewed_25:"Numbers only (optional)",
            video_viewed_50:"Numbers only (optional)",
            video_viewed_75:"Numbers only (optional)",
            video_viewed_100:"Numbers only (optional)"
        },*/
        {
            date:"25/12/2017",
            placement_id:123456,
            publisher_name:"Erad",
            publisher_campaign_name:"OVERWATCH WINTER SALE",
            country:"Russia",
            placement:"RU_X_Video_OW_Active",
            targeting:"Prospection",
            creative:"Video 30\"",
            device:"Desktop + Mobile",
            conversions:36,
            impressions_delivered:17000,
            clicks_generated:2300,
            publisher_total_media_cost:5000,
            engagements:0,
            video_viewed:6500,
            video_viewed_25:6000,
            video_viewed_50:5200,
            video_viewed_75:4800,
            video_viewed_100:4000
        },
        {
            date:"25/12/2017",
            placement_id:123456,
            publisher_name:"Erad",
            publisher_campaign_name:"",
            country:"",
            placement:"",
            targeting:"",
            creative:"",
            device:"",
            conversions:"",
            impressions_delivered:"",
            clicks_generated:"",
            publisher_total_media_cost:"",
            engagements:"",
            video_viewed:"",
            video_viewed_25:"",
            video_viewed_50:"",
            video_viewed_75:"",
            video_viewed_100:""
        }
    ]

    constructor(
        private http: AuthenticatedHttpService,
        private papaparse: PapaParseService
    ) { }

    ngOnInit() {
        this.getPlacements();
        this.reader.onload = (ev: any) => {
            console.warn("GO reader")
            this.parsedData = null;
            this.data=ev.target.result;
            this.errors=[]
            this.papaparse.parse(this.data,{
                header:true,
                dynamicTyping:true,
                skipEmptyLines:true,
                complete: (results, file) => {
                    console.log('Parsed, results: ', results, "data  :", this.parsedData);
                    this.parsedData = results.data;
                    console.log("Data  :", this.parsedData);
                    this.goToConsistencyCheck()
                },
                error: (error, file) =>{
                    console.log("Error parsing file :")
                    console.error(error)
                }
            });
            console.log(this.data);
        };
        this.uploader.onAfterAddingFile = (fileItem: any) => {
            this.is_file=true;
            this.file_name = fileItem._file.name
            //this.file_name = "pp"
            this.reader.readAsText(fileItem._file);
        };
    }

    /**
     * Retrieves JWT token from localStorage and returns it if available. For use in HTTP requests
     * @method jwt
     * @return {[type]} [description]
     */
    private jwt() {
        console.log("jwt");
        // create authorization header with jwt token
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.token) {
            let headers = new Headers({ 'Authorization': 'JWT ' + currentUser.token });
            return new RequestOptions({ headers: headers });
        }
    }

    getPlacements(){
        console.log("Starting fetch of placements")
        return this.http.get(this.API_URL+"placements/", this.jwt())
           .toPromise()
           .then(response => {
               debugLogGroup(this.DEBUG, ["Promise result received for cost-manager.getPlacements()",
                   response.json()]);
                this.placements = response.json();
                //Convert dates
                /*this.kpis.map(kpi=>{
                    kpi['creation_date'] = new Date(kpi['creation_date']);
                    if(kpi['tag_link_editions']){
                        kpi['tag_link_editions']['action_time'] = new Date(kpi['tag_link_editions']['action_time']);
                    }
                });
                this.kpi_filtered_data = this.kpis;
                this.kpi_filtered_data.map(kpi=>{
                    kpi["checked"]=false;
                })*/
                //Init values for filters and corresponding chips
                /*this.initAllAvailableValuesForFilters();
                debugLogGroup(this.DEBUG, ["Kpis, kpi_filtered_data", this.kpis, this.kpi_filtered_data])*/
           })
           .catch(error => {
               console.error("PROMISE REJECTED : could not get data from api in cost manager for placements");
               console.log("error : "+error.json().detail);
               console.log(error.json());
           //    this.router.navigate(['/login'], { queryParams: { returnUrl : window.location.pathname }});
               return [];
           });
    }

    //cleanTestsAndErrors(){}

    /*testApi(){
        this.http.post(this.API_URL+"bulk_publishercostinfo/",{data:
            [{
                "date" : "2018-01-12", "placement" : 24079234, "partner" : 123, "placement_name" : "NAME2",
            },
            {
                "date" : "2018-01-13", "placement" : 24079234, "partner" : 123, "placement_name" : "NAME",
            }]}
            , this.jwt())
          .toPromise()
          .then(response => {
              debugLogGroup(this.DEBUG, ["Promise result received for CostManagerComponent.testApi()",
                  response.json()]);
          })
          .catch(error => {
              console.error("PROMISE REJECTED : could not get data from api in reporting section ");
              console.log("error : "+error.json().detail);
              console.log(error.json());
          //    this.router.navigate(['/login'], { queryParams: { returnUrl : window.location.pathname }});
              return [];
          });
    }*/

    getSample(){
        new Angular2Csv(this.sample_data, 'sample_costs_data',
         {
             fieldSeparator:";",
             showLabels:true,
             headers: ["date","placement_id",
                     "publisher_name","publisher_campaign_name","country","placement","targeting","creative","device","conversions",
                     "impressions_delivered","clicks_generated","publisher_total_media_cost","engagements","video_viewed","video_viewed_25","video_viewed_50","video_viewed_75","video_viewed_100"]
          });
        this.goToToFileUpload
    }

    skipSample(){
        debugLog(this.DEBUG,"---Skip sample, go to step 2 (Upload)---")
        this.step2.active = true;
    }

    goToToFileUpload(){
        debugLog(this.DEBUG,"---Sample downloaded, go to step 2 (Upload)---")
        this.step2.active = true;
    }

    goToConsistencyCheck(){
        debugLog(this.DEBUG,"---File uploaded, go to step 3 (Consistency check)---")
        this.step3.disabled=false;
        this.step3.active=true;
    }

    backToStep2(){
        debugLog(this.DEBUG,"---Go back to uploading a new file---")
        //console.warn("Input values",this.fileInput.nativeElement.files);
        this.cleanAll();
        this.step2.active = true;
    }

    goToApiUpload(){
        debugLog(this.DEBUG,"---File successfully checked, go to API upload---")
        console.log(this.ok_for_upload, this.data_to_send)
        this.step4.disabled=false;
        this.step4.active=true;
    }

    cleanAll(){
        this.file_name="";
        this.is_file=false;
        this.fileInput.nativeElement.value="";
        this.data="";
        this.parsedData=[];
        /*this.data_to_send = [];*/
        this.errors = [];
        this.step4.disabled=true;
        this.step4.active=false;
        this.step3.disabled=true;
        this.step3.active=false;

    }

    consistencyChecks(){
        let test_1_ok_columns = false;
        let test_2_partner_names = false;

        debugLogGroup(this.DEBUG,["Starting consistency checks for data (paarsedData, placements)",this.parsedData,this.placements])
        debugLog(this.DEBUG,"Checking partner name")

        //Check columns
        debugLog(this.DEBUG, "Checking keys (column names)");
        let dataKeys = Object.keys(this.parsedData[0]);
        //Use a temp variable to assure this.ok_columns is false at start, only pass it to true after tests are completed and successful
        let tests_1_columns_result = true;
        dataKeys.map(k=>{
            if(this.headers.indexOf(k) == -1){
                tests_1_columns_result = false;
                this.errors.push("Column from file not in required template : "+k)
            }
        });
        this.headers.map(h=>{
            if(dataKeys.indexOf(h) == -1){
                tests_1_columns_result = false;
                this.errors.push("Required column from template not in file : "+h)
            }
        })

        //Validation of step 1
        test_1_ok_columns = tests_1_columns_result;

        //Line by line tests
        if(test_1_ok_columns){
            let tests_placement_name = true;
            this.parsedData.map(line=>{
                let line_ok = true;

                //Check partner name
                let placement = this.placements.find(p=>{ return p["sizmek_id"] == line["placement_id"] })
                if(line['publisher_name'] != placement["partner_name"]){
                    line_ok = false;
                    tests_placement_name = false;
                    console.warn("!!!")
                    this.errors.push("Placement "+line["placement_id"]+" : Publisher name ("+line['publisher_name']+") not consistent with partner name from DB ("+placement["partner_name"]+") for this placement")
                }else{
                    //if not different, change key to make it API compatible
                    line['partner']=placement['partner_id']
                }

                //Other tests ??

                if(line_ok){
                    this.makeDataLineApiCompatible(line);
                    this.data_to_send.push(line)
                }
            })
            //Validation of step 2
            test_2_partner_names=tests_placement_name;
        }

        //Global validation depending on each steps
        this.ok_for_upload = test_2_partner_names

        //At the end : go to upload if no errors
        if(this.errors.length==0){
            this.goToApiUpload();
        }
    }

    makeDataLineApiCompatible(line){
        console.log(line);

        line['date']=this.dateFormatConversion(line['date']);

        line['placement_name']=line['placement'];
        //delete line['placement_name'];

        line['placement']=line['placement_id'];
        delete line['placement_id'];

        delete line['publisher_name'];

        line["conversions"]=parseFloat(line["conversions"]);
        line["publisher_total_media_cost"]=parseFloat(line["publisher_total_media_cost"]);

        line["clicks_generated"]=parseInt(line["clicks_generated"]);
        line["engagements"]=parseInt(line["engagements"]);
        line["impressions_delivered"]=parseInt(line["impressions_delivered"]);
        line["video_viewed"]=parseInt(line["video_viewed"]);
        line["video_viewed_25"]=parseInt(line["video_viewed_25"]);
        line["video_viewed_50"]=parseInt(line["video_viewed_50"]);
        line["video_viewed_75"]=parseInt(line["video_viewed_75"]);
        line["video_viewed_100"]=parseInt(line["video_viewed_100"]);

        console.log("--Making line API compatible")
        console.log(line);
        console.log(this.parsedData);
        console.log(this.data_to_send);
    }

    dateFormatConversion(dateStr){
        let dateSplit = dateStr.split("/");
        //return new Date(parseInt(dateSplit[2]),parseInt(dateSplit[1]),parseInt(dateSplit[0]))
        return dateSplit[2]+"-"+dateSplit[1]+"-"+dateSplit[0];
    }

    sendToApi(){
        this.awaiting_api_response=true;
        this.http.post(this.API_URL+"bulk_publishercostinfo/",
            {data:this.data_to_send},
            this.jwt())
          .toPromise()
          .then(response => {
                debugLogGroup(this.DEBUG, ["Promise result received for CostManagerComponent.testApi()",
                  response.json()]);
                this.APIresponse = response.json();
                this.awaiting_api_response=false;
          })
          .catch(error => {
              console.error("PROMISE REJECTED : could not get data from api in reporting section ");
              console.log("error : "+error.json().detail);
              console.log(error.json());
          //    this.router.navigate(['/login'], { queryParams: { returnUrl : window.location.pathname }});
              return [];
          });
    }

    getCostLineForPk(placementPk,date){
        //console.warn(this.data_to_send)
        //console.warn(date)
        //console.warn(placementPk)
        //console.warn(this.data_to_send.find(d=>{ if(d['date']==date && d['placement']==placementPk){ return true }else{ return false } }))
        return this.data_to_send.find(d=>{ if(d['date']==date && d['placement']==placementPk){ return true }else{ return false } })
    }
}
