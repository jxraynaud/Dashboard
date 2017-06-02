import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import {
    TdDataTableService,
    TdDataTableSortingOrder,
    ITdDataTableSortChangeEvent,
    ITdDataTableColumn,
    IPageChangeEvent } from '@covalent/core';

import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs';

import { ViewBaseComponent } from '../view-base/view-base.component'

import { NavService } from '../../../services/nav.service'
import { DataService } from '../services/data.service';
import { DataFiltersService } from '../services/data-filters.service';
import { ConfigService } from '../services/config.service';
import { DataRequestService } from '../services/data-request.service';
import { AttributionModelsService } from '../services/attribution-models.service';

import {debugLog, debugWarn, debugLogGroup} from '../../../utils';

import viewConfig from './view.config.json';

@Component({
    selector: 'app-fraud-detector',
    templateUrl: './fraud-detector.component.html',
    styleUrls: ['./fraud-detector.component.css']
})
export class FraudDetectorComponent extends ViewBaseComponent implements OnInit{
    DEBUG : boolean = false;


    //activeDimensions : string[] = ['advertiser_id','partner_id','kpi_id','metacampaign_id',/*'falseDimension'*/];

    activeStaticMetrics = ['conversion_date', 'conversions', 'certified_conversions'];

    activeCalculatedMetrics = ['percent_certified'];

    constructor(
        protected activatedRoute : ActivatedRoute,
        public navService : NavService,
        protected configService : ConfigService,
        protected dataService : DataService,
        protected dataFiltersService : DataFiltersService,
        protected dataRequestService : DataRequestService,
        protected attributionModelsService : AttributionModelsService,
    ) {
        super(activatedRoute,
            navService,
            configService,
            dataService,
            dataFiltersService,
            dataRequestService,
            attributionModelsService,
        )

        //this.navService.opened = this.openedNav;

        this.configService.setConfigFile(viewConfig);

        /*
        * Subscribe to dataRequestService to get the request parameters
        */
        this.dataRequestService.dataRequestParamsBehaviorSubject.subscribe({
            next : (requestParams) => {
                this.requestParams = requestParams
            }
        });

        /** Subscribe to dataService.filteredDataBehaviorSubject, to generate Dynamic Metrics Columns each time filteredData arrives
         * Sets attributes :
         *  - dynamicMetricsColumns : dynamic metrics inferred from data by funtion generateDynamicMetricsColumnsListsObjects [function specific to view multi-attribution]
         *  Through rebuildMetricsColumns
         *  - metricsColumns : obect containing columns for metrics (static and dynamic if any)
         *  - additiveMetricsList : list of addivtive metrics (by string), dynamic coming from dynamicAdditiveMetricsList [generated in generateDynamicMetricsColumnsListsObjects],
         *  and static coming from staticAdditiveMetricsList [set in configBehaviorSubjectSubscription (subscription to configService.configBehaviorSubject)]
         */
        this.filteredDataBehaviorSubjectSubscription = this.dataService.filteredDataBehaviorSubject.subscribe({
            next : (filteredData) => {
                if(filteredData.length > 0){
                    debugLogGroup(this.DEBUG,["Fraud Detector Component : this.dataService.filteredDataBehaviorSubject subscription triggered with value [filteredData] :",
                        "Injected in filteredData attribute",
                        filteredData]);
                    this.dynamicMetricsColumns = this.generateDynamicMetricsColumnsListsObjects(filteredData);
                    this.rebuildMetricsColumns();
                }else{
                    debugWarn(this.DEBUG,"Fraud Detector: this.dataService.filteredDataBehaviorSubject subscription triggered. filteredData empty, not doing anything.");
                }
            },
            error : (err) => console.error(err),
        });

        /** Subscribe to configService.configBehaviorSubject to generate dimensions columns and static metrics columns + define from config list of static additive metrics
         * Sets attributes :
         *  - activeDimensionsWithIdColumns : list of all dimensions columns without Id columns
         *  - activeDimensionsWithoutIdColumns : list of all dimensions columns with Id columns (used to alternate on a toggle between with id and without id)
         *  - activeStaticMetricsColumns : static metrics columns taken straight from config file
         *  - staticAdditiveMetricsList : list of additive Metrics form the static ones, taken from the is_additive parameter in view.config.json
         *  - isAttributionModelMultiple : defines if atribution model is multiple ( [1,3] ) or simple (number) for the api endpoint
         */
        this.configBehaviorSubjectSubscription = this.configService.configBehaviorSubject.subscribe({
            next : (configData) => {
                /*debugLogGroup(this.DEBUG,["Fraud Detector Component : this.configService.configBehaviorSubject subscription triggered with value [config] for generating list of columns in datatable :",
                    configData,
                    "List of active columns : ",
                    this.activeDimensions
                ]);
                if(!configData['available_dimensions']){ throw new Error('Fraud Detector : No "available_dimensions in view.config.json file !"'); }else{
                    this.dimensionsConfigElem = configData['available_dimensions'];
                    let dimensionColumnsListsObject = this.generateDimensionColumnsListsObject(configData['available_dimensions'], this.activeDimensions);
                    this.activeDimensionsWithIdColumns = dimensionColumnsListsObject.withIdColumns;
                    this.activeDimensionsWithoutIdColumns = dimensionColumnsListsObject.withoutIdColumns;
                    this.activeStaticMetricsColumns = this.generateStaticMetricsColumnsListsObject(configData['available_static_metrics'], this.activeStaticMetrics);
                    this.calculatedMetricsColumns = this.generateCalculatedMetricsColumnsListsObject(configData['available_calculated_metrics'], this.activeCalculatedMetrics);
                    //Define list of additive metrics*
                    //console.warn('pre filter')
                    //console.warn(this.staticAdditiveMetricsList)
                    //console.warn(configData['available_static_metrics'])
                    this.staticAdditiveMetricsList = configData['available_static_metrics'].filter((e)=>{ return e.is_additive }).map((e)=>{ return e.data_id_column_name });
                    this.calculatedAdditiveMetricsList = configData['available_calculated_metrics'].filter((e)=>{ return e.is_additive }).map((e)=>{ return e.column_name });
                    //console.warn("post filter")
                    //console.warn(this.staticAdditiveMetricsList)
                    this.rebuildMetricsColumns();
                    this.isAttributionModelMultiple = configData['is_attribution_model_multiple'];
                }*/
            },
            error : (err) => console.error(err),
        });

        /**    Subscribe to dataService.filteredDataBehaviorSubject, dataFiltersService.filtersDimensionMappingBehaviorSubject
         *     and configService.configBehaviorSubject
         */
        this.valuesToInputSubscription = Observable.combineLatest(
            this.dataService.filteredDataBehaviorSubject.do(() => { debugLog( this.DEBUG, 'filtered Data triggers combined subscription'); this.currentTriggered = "filteredData" }),
            this.dataFiltersService.filtersDimensionBehaviorSubject.do(() => { debugLog( this.DEBUG, 'filters Dimension triggers combined subscription'); this.currentTriggered = "filteredData" }),
            this.dataFiltersService.filtersDimensionMappingBehaviorSubject.do(() => { debugLog( this.DEBUG, 'filters Dimension Mapping triggers combined subscription'); this.currentTriggered = "filtersDimension" }),
            this.configService.configBehaviorSubject.do(() => { debugLog( this.DEBUG, 'configBehaviorSubject triggers combined subscription'); this.currentTriggered = "filtersDimensionMapping" }),
            this.attributionModelsService.attributionModelsMappingBehaviorSubject.do(() => { debugLog( this.DEBUG, 'attribution Models Mapping triggers combined subscription'); this.currentTriggered = "attributionModel" }),
        ).subscribe(
            {
                next : (latestValues) => {
                    let filteredData = latestValues[0];
                    let filtersDimensions = latestValues[1];
                    let filtersDimensionMapping = latestValues[2];
                    let configData = latestValues[3];
                    let attributionModelsMapping = latestValues[4]

                    debugLogGroup(this.DEBUG,["Fraud Detector : combined subscription on (dataService.filteredDataBehaviorSubject, dataFiltersService.filtersDimensionBehaviorSubject, dataFiltersService.filtersDimensionMappingBehaviorSubject, configService.configBehaviorSubject, this.attributionModelsService.attributionModelsMappingBehaviorSubject) triggered :",
                        "First calculate and push calculated columns in filteredData",
                        "Then push into inputs to allow name processing in dataviz",
                        "with values [filteredData, filtersDimensionMapping, filtersDimensionMapping, config, attributionModelsMapping] :",
                        filteredData,
                        filtersDimensions,
                        filtersDimensionMapping,
                        configData,
                        attributionModelsMapping,
                    ]);


                    debugLogGroup(this.DEBUG,["Fraud Detector Component : generating list of columns in datatable :",
                        configData,
                        "List of active columns : ",
                        this.activeDimensions
                    ]);
                    if(!configData['available_dimensions']){ throw new Error('Fraud Detector : No "available_dimensions in view.config.json file !"'); }else{
                        this.dimensionsConfigElem = configData['available_dimensions'];
                        let dimensionColumnsListsObject = this.generateDimensionColumnsListsObject(configData['available_dimensions'], this.activeDimensions);
                        this.activeDimensionsWithIdColumns = dimensionColumnsListsObject.withIdColumns;
                        this.activeDimensionsWithoutIdColumns = dimensionColumnsListsObject.withoutIdColumns;
                        this.activeStaticMetricsColumns = this.generateStaticMetricsColumnsListsObject(configData['available_static_metrics'], this.activeStaticMetrics);
                        this.calculatedMetricsColumns = this.generateCalculatedMetricsColumnsListsObject(configData['available_calculated_metrics'], this.activeCalculatedMetrics);
                        //Define list of additive metrics*
                        //console.warn('pre filter')
                        //console.warn(this.staticAdditiveMetricsList)
                        //console.warn(configData['available_static_metrics'])
                        this.staticAdditiveMetricsList = configData['available_static_metrics'].filter((e)=>{ return e.is_additive }).map((e)=>{ return e.data_id_column_name });
                        this.calculatedAdditiveMetricsList = configData['available_calculated_metrics'].filter((e)=>{ return e.is_additive }).map((e)=>{ return e.column_name });
                        //console.warn("post filter")
                        //console.warn(this.staticAdditiveMetricsList)
                        this.rebuildMetricsColumns();
                        this.isAttributionModelMultiple = configData['is_attribution_model_multiple'];
                    }
                    //console.warn(this.currentTriggered);
                    /*if(this.currentTriggered == "filteredData" && filteredData.length > 0){
                        //Calculate and push calculated columns to filtered dataService
                        let activeCalculatedDataConfig = configData['available_calculated_metrics'].filter((e)=>{ return this.activeCalculatedMetrics.indexOf(e.column_name) != -1 })

                        filteredData = this.dataService.addCalculatedColumnsToData(filteredData,activeCalculatedDataConfig);
                    }*/

                    this.filteredData = filteredData;
                    this.filtersDimensions = filtersDimensions;
                    this.filtersDimensionMapping = filtersDimensionMapping;
                    this.config = configData;
                    this.attributionModelsMapping = attributionModelsMapping
                },
                error : (err) => console.error(err),
            }
        );
    }

    ngOnInit() {
        debugLog(this.DEBUG,"Fraud Detector Component : calling ngOnInit");
        if(this.activatedRoute.snapshot.queryParams["view"]){
            let viewParam = this.activatedRoute.snapshot.queryParams["view"];
            debugWarn(this.DEBUG, "Fraud detector : Switching by query parameters to view "+viewParam);
            this.navService.activeViews.frauddetector = viewParam;
        }
    }

    /** Generates 2 things : list of columns with id columns and list of columns without id columns
     * @method generateDimensionColumnsListsObject
     * @param  {[type]}                            availableDimensions [description]
     * @return {{withIdColumns:[],withoutIdColumns:[]}}     Object containing both with id and withoutIds columns
     */

     private generateDimensionColumnsListsObject(availableDimensions,activeDimensions):{withIdColumns:ITdDataTableColumn[], withoutIdColumns:ITdDataTableColumn[]}{
         debugLog(this.DEBUG,"Fraud Detector Component : calling generateDimensionColumnsListsObject")
         //Creating empty arrays for column list
         let activeWithIdDimensionColumnsTemp = [];
         let activeWithoutIdDimensionColumnsTemp = [];

         activeDimensions.map((dimensionName)=>{
             let singleActiveDimension = availableDimensions.filter((e)=>{ return e.data_id_column_name == dimensionName});

             if(singleActiveDimension.length==0){
                 //Error catch : if an unavailable dimension was listed, skip it.
                 console.error('"'+dimensionName+'" is not an available dimension. Dimension ignored. See list of available dimensions : ',[availableDimensions[0]]);
             }else{
                 //Filter first and only element returned by filter
                 singleActiveDimension = singleActiveDimension[0];
                 //Create id column
                 let singleActiveDimensionIdColumn = {
                     name : singleActiveDimension.data_id_column_name,
                     label : singleActiveDimension.id_label,
                     numeric : true
                 };
                 //Pushing element in temporary column list
                 activeWithIdDimensionColumnsTemp.push(singleActiveDimensionIdColumn);

                 //Create name column if indicated in config file
                 if(singleActiveDimension.data_name_column_name){
                     let singleActiveDimensionNameColumn = {
                         name : singleActiveDimension.data_name_column_name,
                         label : singleActiveDimension.label,
                         numeric : singleActiveDimension.is_numeric
                     };
                     activeWithIdDimensionColumnsTemp.push(singleActiveDimensionNameColumn);
                     activeWithoutIdDimensionColumnsTemp.push(singleActiveDimensionNameColumn);
                 }else{
                     debugWarn(this.DEBUG,"Fraud Detector : "+singleActiveDimension.data_id_column_name+" has no indicated human readable column in config file. Skipping name column.")
                 }
             }
         });
         debugLogGroup(this.DEBUG,[
             "Fraud Detector : Calculated list of columns depending on list of active columns and list of available columns, returning both with and without id columns [ withIdColumns,withoutIdColumns ]:",
             activeWithIdDimensionColumnsTemp,
             activeWithoutIdDimensionColumnsTemp
         ]);
         return { withIdColumns:activeWithIdDimensionColumnsTemp, withoutIdColumns:activeWithoutIdDimensionColumnsTemp };
     }

     /**   Generates columns for static metrics
      *    @method generateStaticMetricsColumnsListsObject
      *    @param  {[type]}                                availableMetrics    list of all available metrics (usually found in config file)
      *    @param  {[type]}                                activeStaticMetrics list of active metrics (manually added to view file)
      *    @return {ITdDataTableColumn[]}                  list of static metrics columns
      */
     private generateStaticMetricsColumnsListsObject(availableMetrics,activeStaticMetrics):ITdDataTableColumn[]{
         debugLog(this.DEBUG,"Fraud Detector Component : calling generateStaticMetricsColumnsListsObject")
         //Creating empty arrays for column list
         let activeStaticMetricsColumnsTemp = [];
         activeStaticMetrics.map((metricName)=>{
             let singleActiveMetric = availableMetrics.filter((e)=>{ return e.data_id_column_name == metricName});

             if(singleActiveMetric.length==0){
                 //Error catch : if an unavailable metric was listed, skip it.
                 console.error('"'+metricName+'" is not an available metric. Metric ignored. See list of available dimensions : ',[availableMetrics[0]]);
             }else{
                 //Filter first and only element returned by filter
                 singleActiveMetric = singleActiveMetric[0];
                 //Create column
                 let singleActiveMetricColumn = {
                     name : singleActiveMetric.data_id_column_name,
                     label : singleActiveMetric.label,
                     numeric : true
                 };
                 //Pushing element in temporary column list
                 activeStaticMetricsColumnsTemp.push(singleActiveMetricColumn);
             }
         });

         return activeStaticMetricsColumnsTemp;
     }

     /** Infer dynamic columns from data : function specific to mult-attribution.
      * [TODO] new function for new data report
      * @method generateDynamicMetricsColumnsListsObjects
      * @param  {[type]}                                  data : data output from the api
      * @return {[type]}                                       array of columns for dynamic metrics
      **/
     private generateDynamicMetricsColumnsListsObjects(data):ITdDataTableColumn[]{
         debugLog(this.DEBUG,"Fraud Detector Component : calling generateDynamicMetricsColumnsListsObjects")
         //Reinitialize dynamic additive columns list
         this.dynamicAdditiveMetricsList = []

         //Creating empty arrays for column list
         let activeDynamicMetricsColumnsTemp = [];

         if(data){
             let singleData = data[0];
             let columnsToSort = [];
             //Create ordred list of columns depending on *ordernumber* in dataKey
             Object.keys(singleData).map((dataKey) => {
                 //If column name starts with "conversions "
                 if(dataKey.split(" ")[0]=="conversions"){
                     let colOrder = dataKey.split("*")[1];
                     //Remove *number* used for ordering
                     let dataKeyArray = dataKey.split("*");
                     dataKeyArray.splice(1,1);
                     //Join name without order number
                     let dataKeyWithoutNumber = dataKeyArray.join("");
                     columnsToSort[colOrder]={name:dataKey, label:dataKeyWithoutNumber};
                 }
             });
             columnsToSort.map((colInfos)=>{
                 //Create column
                 let singleDynamicMetricColumn = {
                     name : colInfos.name,
                     //As label, use column name with  uppercase for first letter
                     label : colInfos.label.charAt(0).toUpperCase() + colInfos.label.slice(1).toLowerCase(),
                     numeric : true
                 };
                 //Pushing element in temporary column list
                 activeDynamicMetricsColumnsTemp.push(singleDynamicMetricColumn);
                 //TODO FOR NEW VIEW : define which columns are additive
                 this.dynamicAdditiveMetricsList.push(colInfos.name);
             });
         }
         return activeDynamicMetricsColumnsTemp;
     }

     /**   Generates columns for calculated metrics
      *    @method generateCalculatedMetricsColumnsListsObject
      *    @param  {[type]}                                availableMetrics    list of all available calculated metrics (usually found in config file)
      *    @param  {[type]}                                activeStaticMetrics list of active calculated metrics (manually added to view file)
      *    @return {ITdDataTableColumn[]}                  list of calculated metrics columns
      */
     private generateCalculatedMetricsColumnsListsObject(availableCalculatedMetrics,activeCalculatedMetrics):ITdDataTableColumn[]{
         debugLog(this.DEBUG,"Fraud Detector Component : calling generateCalculatedMetricsColumnsListsObject")
         //Creating empty arrays for column list
         let activeCalculatedMetricsColumnsTemp = [];
         activeCalculatedMetrics.map((metricName)=>{
             let singleActiveCalculatedMetric = availableCalculatedMetrics.filter((e)=>{ return e.column_name == metricName});

             if(singleActiveCalculatedMetric.length==0){
                 //Error catch : if an unavailable metric was listed, skip it.
                 console.error('"'+metricName+'" is not an available metric. Metric ignored. See list of available dimensions : ',[availableCalculatedMetrics[0]]);
             }else{
                 //Filter first and only element returned by filter
                 singleActiveCalculatedMetric = singleActiveCalculatedMetric[0];
                 //Create column
                 let singleActiveMetricColumn = {
                     name : singleActiveCalculatedMetric.column_name,
                     label : singleActiveCalculatedMetric.label,
                     numeric : true
                 };
                 //Pushing element in temporary column list
                 activeCalculatedMetricsColumnsTemp.push(singleActiveMetricColumn);
             }
         });

         return activeCalculatedMetricsColumnsTemp;
     }


     /** Rebuild global metrics array from static (calculated from config) and dynamic (inferred from data by custom function)
      * @method rebuildMetricsColumns
      * @return {[type]}              [description]
      */
     private rebuildMetricsColumns(){
         debugLog(this.DEBUG,"Fraud Detector Component : calling rebuildMetricsColumns");
         debugLogGroup(this.DEBUG,["static metrics",
            this.activeStaticMetricsColumns,
            "dyn metrics",
            this.dynamicMetricsColumns,
            "calculated metrics",
            this.calculatedMetricsColumns,
        ]);
        //If static & dynamic not empty concat, else take only static, else empty array
         if(this.activeStaticMetricsColumns !== undefined && this.dynamicMetricsColumns !== undefined && this.dynamicMetricsColumns.length > 0){
             this.metricsColumns = this.activeStaticMetricsColumns.concat(this.dynamicMetricsColumns);
             debugLogGroup(this.DEBUG,["Fraud Detector: Building metrics column set from static metrics and dynamic metrics, resulting in [this.metricColumns] :",
             this.metricsColumns]);
         }else if(this.activeStaticMetricsColumns !== undefined){
             debugLog(this.DEBUG, "Fraud Detector dynamic metrics : no data, fallback to static columns only (normal at first pass)");
             this.metricsColumns = this.activeStaticMetricsColumns;
         }else{
             this.metricsColumns = []
         }
         //Add calculated to metric columns if not empty
         if(this.calculatedMetricsColumns !==undefined && this.calculatedMetricsColumns.length > 0){
             debugLogGroup(this.DEBUG,[
                 "Fraud Detector Component : adding calculated matrics columns : ",
                 this.calculatedMetricsColumns
             ])
             this.metricsColumns = this.metricsColumns.concat(this.calculatedMetricsColumns);
         }
         debugLogGroup(this.DEBUG,[
             "Fraud Detector Component : list of metrics columns (static + dynamic + calculated) : ",
             this.metricsColumns
         ])

         //Additive list
         if(this.dynamicAdditiveMetricsList !== undefined  && this.dynamicMetricsColumns.length > 0){
             this.additiveMetricsList = this.dynamicAdditiveMetricsList.concat(this.staticAdditiveMetricsList);
         }else{
             //Fallback on additive only if dynamic metrics not ready
             this.additiveMetricsList = this.staticAdditiveMetricsList
         }
         //Add additive calculated to additive list of columns if not empty
         if(this.calculatedAdditiveMetricsList != undefined && this.calculatedAdditiveMetricsList.length > 0){
             console.warn(this.calculatedAdditiveMetricsList);
             this.additiveMetricsList = this.additiveMetricsList.concat(this.calculatedAdditiveMetricsList);
         }

         debugLogGroup(this.DEBUG,[
             "Fraud Detector Component : list of additive metrics for groupBy : ",
             this.additiveMetricsList
         ])
     }

     //Output devents manaement functions
     filtersUpdated(filters){
         debugLog(this.DEBUG,"Fraud Detector Component : calling filtersUpdated")
         debugLogGroup(this.DEBUG, ["Fraud Detecor Component : triggering output event updatedfilters from filter component with value [filters]",filters]);
         this.dataFiltersService.filtersDimensionBehaviorSubject.next(filters);
         //console.log("tessst")
     }
}
