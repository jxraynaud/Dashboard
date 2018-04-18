import { Component, OnInit, ViewChild } from '@angular/core';
import {/* Http,*/ Headers, RequestOptions, Response } from '@angular/http';
import { AuthenticatedHttpService } from '../../../services/authenticatedHttpService';

import {
    TdDataTableService,
    TdDataTableSortingOrder,
    ITdDataTableSortChangeEvent,
    ITdDataTableColumn,
    IPageChangeEvent } from '@covalent/core';

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
    //API_URL : string = "http://localhost:8000/api/";
    API_URL : string = "http://dagobert.blizzard.pixelforest.io/api/";
    //API_URL : string = "https://clovis.blizzard.pixelforest.io/api/";

    @ViewChild('step2') step2;
    @ViewChild('step3') step3;
    @ViewChild('step4') step4;
    @ViewChild('fileInput') fileInput;

    placements;

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
    uploader: FileUploader = new FileUploader({}); //Empty options to avoid having a target URL
    is_file:boolean=false;
    file_name:string;
    reader: FileReader = new FileReader();

    /*Options*/
    separators=[
        {value: '/', viewValue: '/'},
        {value: '-', viewValue: '-'},
      ];
    selected_separator:string="/";
    date_formats=[
        {first:'YYYY', second:'MM', third:'DD', value: 'YYYYMMDD'},
        {first:'YYYY', second:'DD', third:'MM', value: 'YYYYDDMM'},
        {first:'DD', second:'MM', third:'YYYY', value: 'DDMMYYYY'},
        {first:'MM', second:'DD', third:'YYYY', value: 'MMDDYYYY'},
        {first:'MM', second:'DD', third:'', value: 'MMDD'},
        {first:'DD', second:'MM', third:'', value: 'DDMM'},
      ];
    selected_date_format:string='DDMMYYYY'
    /*decimals=[
        {value: ',', viewValue: ','},
        {value: '.', viewValue: '.'},
      ];
    selected_decimal:string=","*/

    data:string;
    parsedData:Array<string>=[];
    data_to_send = [];

    /*Info on file*/
    min_date:string;
    max_date:string;
    previz_active:boolean=false;
    previz_columns: ITdDataTableColumn[] = [
        { name: 'date',  label: 'date' },
        { name: 'placement_id',  label: 'Placement ID' },
        { name: 'publisher_name',  label: 'Publisher name' },
        { name: 'publisher_campaign_name',  label: 'Publisher Campaign Name' },
        { name: 'country',  label: 'Country' },
        { name: 'placement',  label: 'Placement' },
        { name: 'targeting',  label: 'Targeting' },
        { name: 'creative',  label: 'Creative' },
        { name: 'device',  label: 'Device' },
        { name: 'conversions',  label: 'Conversions' },
        { name: 'impressions_delivered',  label: 'Impressions delivered' },
        { name: 'clicks_generated',  label: 'Clicks generated' },
        { name: 'publisher_total_media_cost',  label: 'Publisher total media cost' },
        { name: 'video_viewed',  label: 'Video viewed' },
        { name: 'video_viewed_25',  label: 'Video viewed 25' },
        { name: 'video_viewed_50',  label: 'Video viewed 50' },
        { name: 'video_viewed_75',  label: 'Video viewed 75' },
        { name: 'video_viewed_100',  label: 'Video viewed 100' },
    ]
    pageSizes = [10, 50, 100, 150, 200];
    pageSize: number = 10;
    fromRow: number = 1;
    currentPage: number = 1;
    filteredByDataTableData: any[];

    page(pagingEvent: IPageChangeEvent): void {
        this.fromRow = pagingEvent.fromRow;
        this.currentPage = pagingEvent.page;
        this.pageSize = pagingEvent.pageSize;
        this.filter();
    }

    filter(): void {
        //First input of filtereddata is empty, then filter is triggered in ngonchange
        if(this.data_to_send.length>0){
            let newData: any[] = this.data_to_send;
            console.warn(newData)
            //newData = this._dataTableService.filterData(newData, this.searchTerm, true);
            //this.filteredTotal = newData.length;
            //newData = this._dataTableService.sortData(newData, this.sortBy, this.sortOrder);
            //For CSV
            //this.filteredUnpagedData = newData.slice();
            newData = this._dataTableService.pageData(newData, this.fromRow, this.currentPage * this.pageSize);
            this.filteredByDataTableData = newData;
        }
    }

    errors:Array<string>=[];
    blocking_errors:Array<string>=[];

    //Tests and data conformity functions
    /*List of the columns names to check identity with check_is_summable before summing with sumMetrics*/
    dimensions_to_be_identical:Array<string>=['publisher_name','publisher_campaign_name','country','placement_name','targeting','creative','device']
    /*List of metrics columns to sum for matching lines (same placement id + same date)*/
    summable_metrics:Array<string>=
            ['conversions',
            'impressions_delivered',
            'clicks_generated',
            'publisher_total_media_cost',
            'engagements','video_viewed','video_viewed_25','video_viewed_50','video_viewed_75','video_viewed_100']

    //ok_columns:boolean = false;
    //ok_for_upload:boolean = false;

    awaiting_api_response:boolean=false;
    APIresponse=[]

    //Couldn't manage to use it (consistencyChecks() runs it to true but change isn't impacted until the end of the file analysis ?!?)
    //flag_analyzing_consistency:boolean=false;

    constructor(
        private http: AuthenticatedHttpService,
        private papaparse: PapaParseService,
        private _dataTableService: TdDataTableService
    ) { }

    ngOnInit() {
        this.getPlacements();
        this.reader.onload = (ev: any) => {
            console.warn("GO reader")
            this.parsedData = null;
            this.data=ev.target.result;
            this.errors=[];
            this.blocking_errors=[];
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
            //console.log(this.data);
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

    getSample(){
        new Angular2Csv(this.sample_data, 'sample_costs_data',
         {
             fieldSeparator:";",
             showLabels:true,
             headers: ["date","placement_id",
                     "publisher_name","publisher_campaign_name","country","placement","targeting","creative","device","conversions",
                     "impressions_delivered","clicks_generated","publisher_total_media_cost","engagements","video_viewed","video_viewed_25","video_viewed_50","video_viewed_75","video_viewed_100"]
          });
        this.goToToFileUpload();
    }

    //Step changes
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
        console.log(this.data_to_send)
        this.step4.disabled=false;
        this.step4.active=true;
    }

    //Clean before reuploading a new file of data
    cleanAll(){
        this.file_name="";
        this.is_file=false;
        this.fileInput.nativeElement.value="";
        delete this.min_date;
        delete this.max_date;
        this.data="";
        this.parsedData=[];
        /*this.data_to_send = [];*/
        this.errors = [];
        this.blocking_errors = [];
        this.APIresponse = [];
        this.step4.disabled=true;
        this.step4.active=false;
        this.step3.disabled=true;
        this.step3.active=false;

    }

    testAndConvertData(){
        let consistency = this.consistencyChecks();
        console.log("------Global consistency tests : "+consistency)
        if(consistency){
            this.parsedData.map(line=>{
                this.push_or_sum_to_data_to_send(line);
            });

            //At the end : go to upload if no errors
            if(this.blocking_errors.length==0){
                console.log("Ok for all !")
                console.log(this.data_to_send)
                this.goToApiUpload();
            }else{
                console.log("Blocking errors remaining !")
                console.log(this.data_to_send)
            }
        }
    }

    consistencyCheck_columns(){
        let dataKeys = Object.keys(this.parsedData[0]);
        //Use a temp variable to assure this.ok_columns is false at start, only pass it to true after tests are completed and successful
        let columns_test = true;

        dataKeys.map(k=>{
            if(this.headers.indexOf(k) == -1){
                columns_test = false;
                this.blocking_errors.push("Column from file not in required template : "+k)
            }
        });
        this.headers.map(h=>{
            if(dataKeys.indexOf(h) == -1){
                columns_test = false;
                this.blocking_errors.push("Required column from template not in file : "+h)
            }
        })
        return columns_test;
    }

    consistencyCheck_byline_partnername(line){
        let this_test = true;
        let placement = this.placements.find(p=>{ return p["sizmek_id"] == line["placement_id"] })
        if(line['publisher_name'] != placement["partner_name"]){
            this_test=false;
            console.warn("!!!")
            this.blocking_errors.push("Placement "+line["placement_id"]+" : Publisher name ("+line['publisher_name']+") not consistent with partner name from DB ("+placement["partner_name"]+") for this placement")
        }else{
            //if not different, change key to make it API compatible
            line['partner']=placement['partner_id']
        }
        return this_test;
    }

    consistencyCheck_dateContinuity(){
        debugLog(this.DEBUG, "Checking date continuity");

        let ordered_unique_dates = this.parsedData.map(line=>{ return line["date"] }).filter((date,index,self)=>{ return self.indexOf(date)===index; }).sort();
        this.min_date=ordered_unique_dates[0];
        this.max_date=ordered_unique_dates[ordered_unique_dates.length-1];
        debugLog(this.DEBUG, "------Unique date list (min : "+this.min_date+" / max : "+this.max_date+" ) : "+ordered_unique_dates);

        //Create dates to loop on
        let dayInterval=1000*60*60*24
        let splitted_min = this.min_date.split("-");
        let splitted_max = this.max_date.split("-");
        let max_date_tempo = new Date(parseInt(splitted_max[0]),parseInt(splitted_max[1])-1,parseInt(splitted_max[2]));
        let complete_date_array = [];
        let current_date=new Date(parseInt(splitted_min[0]),parseInt(splitted_min[1])-1,parseInt(splitted_min[2]));

        //Loop and add a textual version of each date to an array
        while(current_date.getTime()<=max_date_tempo.getTime()){
            complete_date_array.push(current_date.getFullYear()+"-"+("0" + (current_date.getMonth()+1)).slice(-2)+"-"+("0" + current_date.getDate()).slice(-2));
            current_date = new Date(current_date.getTime() + dayInterval);
        }
        console.warn(complete_date_array)

        //Check every date of the list is in the array
        let all_dates_ok=true;
        complete_date_array.map(d=>{
            console.warn(d)
            console.warn("---")
            let is_in = ordered_unique_dates.indexOf(d)!=-1;
            if(!is_in){
                all_dates_ok=false;
                this.blocking_errors.push("Missing data for date (YYYY-MM-DD) : "+d);
            }
            return is_in;
        })

        return all_dates_ok;
    }


    consistencyChecks(){
        let global_tests_flag = true;

        debugLogGroup(this.DEBUG,["Starting consistency checks for data (parsedData, placements)",this.parsedData,this.placements])

        /*--------------------------------------------------------------------------
        --------------Global tests before data conversion to API format-------------
        --------------------------------------------------------------------------*/

        /*----------------1/Check columns----------------*/
        debugLog(this.DEBUG, "---Consistency tests : Checking column names");
        if(!this.consistencyCheck_columns()){
            global_tests_flag=false;
        }
        console.log("------Columns validity : "+global_tests_flag);

        console.log("Consistency tests : starting line-by-line tests and conversion");
        /*--------------------------------------------------------------------------
        -----------------------------Line by line tests-----------------------------
        --------------------------------------------------------------------------*/
        if(global_tests_flag){
            let loop_tests_flag = true;

            this.parsedData.map(line=>{
                let one_line_tests_flag = true;

                /*--------------------------------------------------------------------------
                ----------Line by line tests before data conversion to API format-----------
                --------------------------------------------------------------------------*/
                //1-Check partner name
                if(!this.consistencyCheck_byline_partnername(line)){
                    one_line_tests_flag = false;
                }

                /*--------------------------------------------------------------------------
                --If up to there OK, make conversions for API (dates, ints, floats, ...)----
                --------------------------------------------------------------------------*/
                if(one_line_tests_flag){
                    let line_conversion_return = this.makeDataLineApiCompatible(line);
                    if(line_conversion_return=="ERROR" || !this.testDateFormatAfterConversion(line["date"])){ console.error("Line_conversion_return = ERROR"); one_line_tests_flag=false; }
                }

                /*--------------------------------------------------------------------------
                ----------Line by line tests after data conversion to API format-----------
                --------------------------------------------------------------------------*/
                if(!one_line_tests_flag){
                    loop_tests_flag = false;
                }
            })
            //After loop finished, transfer result to global test flag (turns to false if loop failed, was by hypothesis true at the start of the if)
            global_tests_flag=loop_tests_flag;
            console.log("------Line by line tests finished, converted data: ",this.parsedData);
            console.log("------Consistency tests : line by line tests : "+global_tests_flag);
        }

        /*--------------------------------------------------------------------------
        --------------Global tests after data conversion to API format-------------
        --------------------------------------------------------------------------*/
        console.log("---Consistency tests : starting after-conversion tests");
        /*----------------1/Check columns----------------*/
        console.log("---Consistency tests : starting date continuity");
        if(!this.consistencyCheck_dateContinuity()){
            global_tests_flag=false;
        }
        console.log("------Date continuity : "+global_tests_flag);

        //Global return for validation depending on each steps
        return global_tests_flag;
    }

    makeDataLineApiCompatible(line){
        //console.log(line);
        //Stock date for use in error if necessary
        let date_before_test=line['date'];
        line['date']=this.dateFormatConversion(line['date']);
        if(line['date']=="ERROR"){
            //console.error("DATE FORMAT NOT RECOGNIZED, selected "+this.selected_date_format+" with separator "+this.selected_separator+" // Found : "+date_before_test);
            this.blocking_errors.push("DATE FORMAT NOT RECOGNIZED, selected "+this.selected_date_format+" with separator "+this.selected_separator+" // Found : "+date_before_test);
            return "ERROR";
        }

        line['placement_name']=line['placement'];
        //delete line['placement_name'];

        line['placement']=line['placement_id'];
        delete line['placement_id'];

        delete line['publisher_name'];

        line["conversions"]=this.cleanAndParseFloat(line["conversions"]);

        //let publisher_total_text = line["publisher_total_media_cost"];
        //let publisher_total_number = publisher_total_text.replace(/[^0-9,.]/g,"").replace((/,/g,"."))
        //line["publisher_total_media_cost"]=parseFloat(publisher_total_number);
        line["publisher_total_media_cost"]=this.cleanAndParseFloat(line["publisher_total_media_cost"]);

        line["clicks_generated"]=this.cleanAndParseInt(line["clicks_generated"]);
        line["engagements"]=this.cleanAndParseInt(line["engagements"]);
        line["impressions_delivered"]=this.cleanAndParseInt(line["impressions_delivered"]);
        line["video_viewed"]=this.cleanAndParseInt(line["video_viewed"]);
        line["video_viewed_25"]=this.cleanAndParseInt(line["video_viewed_25"]);
        line["video_viewed_50"]=this.cleanAndParseInt(line["video_viewed_50"]);
        line["video_viewed_75"]=this.cleanAndParseInt(line["video_viewed_75"]);
        line["video_viewed_100"]=this.cleanAndParseInt(line["video_viewed_100"]);

        //console.log("--Making line API compatible")
        //console.log(line);
        //console.log(this.parsedData);
        //console.log(this.data_to_send);
    }

    //Used in makeDataLineApiCompatible() for cleaning int formats (berk excel)
    cleanAndParseInt(strInt:string){
        if(strInt==""
        || strInt.toString().replace(/ /g,"")=="-"
        || strInt.toString().replace(/ /g,"")=="NA"
        || strInt.toString().replace(/ /g,"")=="N/A"
        || strInt.toString().replace(/ /g,"")=="na"
        || strInt.toString().replace(/ /g,"")=="n/a"
        ){
            return 0;
        }else{
            return parseInt(strInt.toString().replace(/[^0-9]/g,""));
        }
    }

    //Used in makeDataLineApiCompatible() for cleaning float formats (berk excel)
    cleanAndParseFloat(strFloatParam){
        let strFloat=strFloatParam.toString().replace(/ /g,"");

        if(strFloat==""
        || strFloat=="-"
        || strFloat=="NA"
        || strFloat=="N/A"
        || strFloat=="na"
        || strFloat=="n/a"
        ){
            return 0;
        }else{
            //Remove non numerical chars andcovnert , to . then parse to float
            return(parseFloat(strFloat.replace(/[^0-9,.]/g,"").replace(",",".")));
        }
    }

    //Used in makeDataLineApiCompatible() for cleaning date formats
    dateFormatConversion(dateStr){
        let dateSplit = dateStr.split(this.selected_separator);
        let today = new Date();

        let dateToReturn:string;
        switch(this.selected_date_format){//YYYYMMDD
            case "YYYYMMDD":
                dateToReturn = dateSplit[0]+"-"+dateSplit[1]+"-"+dateSplit[2];
                break;
            case "YYYYDDMM":
                dateToReturn = dateSplit[0]+"-"+dateSplit[2]+"-"+dateSplit[1];
                break;
            case "DDMMYYYY":
                dateToReturn = dateSplit[2]+"-"+dateSplit[1]+"-"+dateSplit[0];
                break;
            case "MMDDYYYY":
                dateToReturn = dateSplit[2]+"-"+dateSplit[0]+"-"+dateSplit[1];
                break;
            case "MMDD":
                dateToReturn = today.getFullYear()+"-"+dateSplit[0]+"-"+dateSplit[1];
                break;
            case "MMDD":
                dateToReturn = today.getFullYear()+"-"+dateSplit[1]+"-"+dateSplit[0];
                break;
            default:
                dateToReturn = "ERROR";
        }

        return dateToReturn

        //return dateSplit[2]+"-"+dateSplit[1]+"-"+dateSplit[0];
    }

    testDateFormatAfterConversion(date){
        //Match date to check (year in 4 digits format, then month (!!will not find error if month and day are permuted and no date is over 12))
        if(!date.match(/^20\d\d-(0[1-9]|1[012])-[0-9]{2}$/)){
            console.error("PROBLEM WITH DATE FORMAT, please uise on of the authorized date format or choose the right format in the options");
            this.blocking_errors.push("PROBLEM WITH DATE FORMAT, please use one of the authorized date format or choose the right format in the options");
            return false;
        }else{
            return true;
        }
    }

    push_or_sum_to_data_to_send(line){
        //console.warn("ttt")
        //console.warn(line);
        let identical_line = this.data_to_send.find(l=>{ return l['date']==line["date"] && l["placement"]==line["placement"]; });
        if(identical_line){
            console.warn("IDENTICAL, summing")
            //If lines are summable (if not there's a blocking error)
            if(this.check_is_summable(line, identical_line)){
                this.sumMetrics(line, identical_line);
                console.warn("SUMMED : ")
                console.log(identical_line)
            }
        }else{
            //If no identical line, jsut push
            this.data_to_send.push(line)
        }
    }

    /*Checks that 2 lines are summable */
    check_is_summable(line, identical_line){
        let ok=true;
        for(let dimName of this.dimensions_to_be_identical){
            if(line[dimName] != identical_line[dimName]){
                ok=false;
                this.blocking_errors.push("BLOCKING ERROR : placement "+line["placement"]+" for date "+line["date"]+" has 2 lines with different values for "+dimName+" ( "+line[dimName]+" != "+identical_line[dimName]+" )")
                console.error("BLOCKING ERROR : placement "+line["placement"]+" for date "+line["date"]+" has 2 lines with different values for "+dimName+" ( "+line[dimName]+" != "+identical_line[dimName]+" )")
            }
        }
        return ok;
    }

    sumMetrics(newline,identical_line){
        for(let metricName of this.summable_metrics){
            identical_line[metricName]=identical_line[metricName]+newline[metricName];
        }
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
        let line = this.data_to_send.find(d=>{ if(d['date']==date && d['placement']==placementPk){ return true }else{ return false } });
        if(line["placement_name"]==""){ line["placement_name"]=this.placements.find(p=>{return p["sizmek_id"]==line["placement"]})["sizmek_name"] }
        return line;
    }

    previsualizeData(){
        this.filter();
        this.previz_active=true;
    }
}
