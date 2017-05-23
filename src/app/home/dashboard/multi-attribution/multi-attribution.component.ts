import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import {
    TdDataTableService,
    TdDataTableSortingOrder,
    ITdDataTableSortChangeEvent,
    ITdDataTableColumn,
    IPageChangeEvent } from '@covalent/core';

import { Subscription } from 'rxjs/Subscription';

import { NavService } from '../../../services/nav.service';
import { DataService } from '../services/data.service';
import { DataFiltersService } from '../services/data-filters.service';
import { ConfigService } from '../services/config.service';
import { DataRequestService } from '../services/data-request.service';
import { AttributionModelsService } from '../services/attribution-models.service';

import {debugLog, debugWarn, debugLogGroup} from '../../../utils';

import viewConfig from './view.config.json';

@Component({
  selector: 'app-multi-attribution',
  templateUrl: './multi-attribution.component.html',
  styleUrls: ['./multi-attribution.component.css']
})
export class MultiAttributionComponent implements OnInit {
    DEBUG : boolean = false;

    //Attributes used for template structure
    openedNav = true;
    //activeView = "overview";
    /*viewsList=[
        {
            name : "overview",
            menuText : "Overview view",
            description: "Daily conversions",
            icon: "view_compact"
        },
        {
            name : "bykpiview",
            menuText : "by KPI",
            description: "By KPI and Campaigns",
            icon: "business"
        }
    ]*/
    //Unnamed filtered data
    //Data for Inputs
    filteredData : Array<{}>;
    filtersDimensions : Object;
    filtersDimensionMapping;
    config;
    attributionModelsMapping : Array<{}>;

    requestParams : {};
    activeDimensions : string[] = ['advertiser_id','partner_id','kpi_id','metacampaign_id',/*'falseDimension'*/];
    activeDimensionsWithIdColumns : ITdDataTableColumn[];
    activeDimensionsWithoutIdColumns : ITdDataTableColumn[];

    activeStaticMetrics : string[] = [/*'falseMetric',*/'conversion_date'];
    activeStaticMetricsColumns : ITdDataTableColumn[];
    dynamicMetricsColumns : ITdDataTableColumn[];

    //Concat of static and dynamic metrics to be passed to inputs
    metricsColumns : ITdDataTableColumn[];
    //List of additive metrics columns for groupby function by their key name (string) : intermediary values static and dynamic because static is calculated
    // at reception of config BehaviorSubject, chereas dynamic is calculated in generateDynamicMetricsColumnsListsObjects.
    // => the 2 are concat in rebuildColumns() to make additiveMetricsList
    dynamicAdditiveMetricsList : Array<string>;
    staticAdditiveMetricsList : Array<string>;
    additiveMetricsList : Array<string>;

    //Setting to pipe from config to the views to define if the attribution model parameter of the api is simple (number) or multiple (array)
    isAttributionModelMultiple : boolean;

    //TODO : destroy subscription at the end
    filteredDataBehaviorSubjectSubscription : Subscription;
    configBehaviorSubjectSubscription : Subscription;
    valuesToInputSubscription : Subscription;

    constructor(
        private activatedRoute : ActivatedRoute,
        private navService : NavService,
        private configService : ConfigService,
        private dataService : DataService,
        private dataFiltersService : DataFiltersService,
        private dataRequestService : DataRequestService,
        private attributionModelsService : AttributionModelsService,
    ) {
            this.navService.opened = true;

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
                        debugLogGroup(this.DEBUG,["Overview Component : this.dataService.filteredDataBehaviorSubject subscription triggered with value [filteredData] :",
                            "Injected in filteredData attribute",
                            filteredData]);
                        this.dynamicMetricsColumns = this.generateDynamicMetricsColumnsListsObjects(filteredData);
                        this.rebuildMetricsColumns();
                    }else{
                        debugWarn(this.DEBUG,"Overview Component : this.dataService.filteredDataBehaviorSubject subscription triggered. filteredData empty, not doing anything.");
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
                    debugLogGroup(this.DEBUG,["Overview Component : this.configService.configBehaviorSubject subscription triggered with value [config] for generating list of columns in datatable :",
                        configData,
                        "List of active columns : ",
                        this.activeDimensions
                    ]);
                    let dimensionColumnsListsObject = this.generateDimensionColumnsListsObject(configData['available_dimensions'], this.activeDimensions);
                    this.activeDimensionsWithIdColumns = dimensionColumnsListsObject.withIdColumns;
                    this.activeDimensionsWithoutIdColumns = dimensionColumnsListsObject.withoutIdColumns;
                    this.activeStaticMetricsColumns = this.generateStaticMetricsColumnsListsObject(configData['available_static_metrics'], this.activeStaticMetrics);
                    //Define list of additive metrics
                    this.staticAdditiveMetricsList = configData['available_static_metrics'].filter((e)=>{ return e.is_additive }).map((e)=>{ return e.data_id_column_name });
                    this.rebuildMetricsColumns();
                    this.isAttributionModelMultiple = configData['is_attribution_model_multiple'];
                },
                error : (err) => console.error(err),
            });

            /**    Subscribe to dataService.filteredDataBehaviorSubject, dataFiltersService.filtersDimensionMappingBehaviorSubject,
             *     configService.configBehaviorSubject and this.attributionModelsService.attributionModelsMappingBehaviorSubject
             */
            this.valuesToInputSubscription = this.dataService.filteredDataBehaviorSubject.combineLatest(
                this.dataFiltersService.filtersDimensionBehaviorSubject,
                this.dataFiltersService.filtersDimensionMappingBehaviorSubject,
                this.configService.configBehaviorSubject,
                this.attributionModelsService.attributionModelsMappingBehaviorSubject,
            ).subscribe(
                {
                    next : (latestValues) => {
                        let filteredData = latestValues[0];
                        let filtersDimensions = latestValues[1];
                        let filtersDimensionMapping = latestValues[2];
                        let config = latestValues[3];
                        let attributionModelsMapping = latestValues[4]

                        debugLogGroup(this.DEBUG,["Multi-Attribution Component : combined subscription on (dataService.filteredDataBehaviorSubject, dataFiltersService.filtersDimensionMappingBehaviorSubject, configService.configBehaviorSubject) triggered :",
                            "For pushing into inputs to allow name processing in dataviz",
                            "with values [filteredData,  fitersDimensionMapping, config, attributionModelsMapping] :",
                            filteredData,
                            filtersDimensionMapping,
                            config,
                            attributionModelsMapping
                        ]);

                        this.filteredData = filteredData;
                        this.filtersDimensions = filtersDimensions;
                        this.filtersDimensionMapping = filtersDimensionMapping;
                        this.config = config;
                        this.attributionModelsMapping = attributionModelsMapping
                    },
                    error : (err) => console.error(err),
                }
            );
    }

    ngOnInit() {
        if(this.activatedRoute.snapshot.queryParams["view"]){
            let viewParam = this.activatedRoute.snapshot.queryParams["view"];
            debugWarn(this.DEBUG, "Multi attribution : Switching by query parameters to view "+viewParam);
            this.navService.activeViews.multiattribution = viewParam;
        }
    }

    /** Generates 2 things : list of columns with id columns and list of columns without id columns
     * @method generateDimensionColumnsListsObject
     * @param  {[type]}                            availableDimensions [description]
     * @return {{withIdColumns:[],withoutIdColumns:[]}}     Object containing both with id and withoutIds columns
     */
    private generateDimensionColumnsListsObject(availableDimensions,activeDimensions):{withIdColumns:ITdDataTableColumn[], withoutIdColumns:ITdDataTableColumn[]}{
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
                    debugWarn(this.DEBUG,"OverviewComponent : "+singleActiveDimension.data_id_column_name+" has no indicated human readable column in config file. Skipping name column.")
                }
            }
        });
        debugLogGroup(this.DEBUG,[
            "Overview component : Calculated list of columns depending on list of active columns and list of available columns, returning both with and without id columns [ withIdColumns,withoutIdColumns ]:",
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

    /** Rebuild global metrics array from static (calculated from config) and dynamic (inferred from data by custom function)
     * @method rebuildMetricsColumns
     * @return {[type]}              [description]
     */
    private rebuildMetricsColumns(){
        if(this.activeStaticMetricsColumns !== undefined && this.dynamicMetricsColumns !== undefined){
            this.metricsColumns = this.activeStaticMetricsColumns.concat(this.dynamicMetricsColumns);
            debugLogGroup(this.DEBUG,["Multi attribution : Building metrics column set from static metrics and dynamic metrics, resulting in [this.metricColumns] :",
            this.metricsColumns]);
        }else if(this.activeStaticMetricsColumns !== undefined){
            debugLog(this.DEBUG, "Multi attribution dynamic metrics : no data, fallback to static columns only (normal at first pass)");
            this.metricsColumns = this.activeStaticMetricsColumns;
        }
        if(this.dynamicAdditiveMetricsList !== undefined){
            this.additiveMetricsList = this.dynamicAdditiveMetricsList.concat(this.staticAdditiveMetricsList);
        }else{
            //Fallback on additive only if dynamic metrics not ready
            this.additiveMetricsList = this.staticAdditiveMetricsList
        }
        debugLogGroup(this.DEBUG,[
            "Multi-attribution Component : list of additive metrics for groupBy : ",
            this.additiveMetricsList
        ])
    }

    filtersUpdated(filters){
        debugLogGroup(this.DEBUG, ["FraudDetecor Component : triggering output event updatedfilters from filter component with value [filters]",filters]);
        this.dataFiltersService.filtersDimensionBehaviorSubject.next(filters);
    }
}
