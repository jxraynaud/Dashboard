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

import { NavService } from '../../../services/nav.service'

import { DataService } from '../services/data.service';
import { DataFiltersService } from '../services/data-filters.service';
import { ConfigService } from '../services/config.service';
import { DataRequestService } from '../services/data-request.service';
import { AttributionModelsService } from '../services/attribution-models.service';

import {debugLog, debugWarn, debugLogGroup} from '../../../utils';

//import viewConfig from './view.config.json';
@Component({
  selector: 'app-view-base',
  templateUrl: './view-base.component.html',
  styleUrls: ['./view-base.component.css']
})
export class ViewBaseComponent implements OnInit {
    DEBUG : boolean = false;
    SUBCLASSNAME : string;

    //Attributes used for template structure
    openedNav : boolean = true;

    filteredData : Array<{}>;
    filtersDimensions : Object;
    filtersDimensionMapping;
    config;
    dimensionsConfigElem;
    attributionModelsMapping : Array<{}>;

    requestParams : {};

    activeDimensions : string[] = ['advertiser_id','partner_id','kpi_id','metacampaign_id',/*'falseDimension'*/];
    activeDimensionsWithIdColumns : ITdDataTableColumn[];
    activeDimensionsWithoutIdColumns : ITdDataTableColumn[];

    activeStaticMetrics : string[] = [];
    activeStaticMetricsColumns : ITdDataTableColumn[];

    dynamicMetricsColumns : ITdDataTableColumn[];

    activeCalculatedMetrics : string[] = [];
    calculatedMetricsColumns : ITdDataTableColumn[];

    //Concat of static and dynamic metrics to be passed to inputs
    metricsColumns : ITdDataTableColumn[];

    //List of additive metrics columns for groupby function by their key name (string) : intermediary values static and dynamic because static is calculated
    // at reception of config BehaviorSubject, chereas dynamic is calculated in generateDynamicMetricsColumnsListsObjects.
    // => the 2 are concat in rebuildColumns() to make additiveMetricsList
    dynamicAdditiveMetricsList : Array<string>;
    staticAdditiveMetricsList : string[];
    calculatedAdditiveMetricsList : string[];
    additiveMetricsList : Array<string>;

    //Setting to pipe from config to the views to define if the attribution model parameter of the api is simple (number) or multiple (array)
    isAttributionModelMultiple : boolean;

    //TODO : destroy subscriptions at the end
    filteredDataBehaviorSubjectSubscription : Subscription;
    configBehaviorSubjectSubscription : Subscription;
    valuesToInputSubscription : Subscription;
    currentTriggered : string = "";

    constructor(
        protected activatedRoute : ActivatedRoute,
        public navService : NavService,
        protected configService : ConfigService,
        protected dataService : DataService,
        protected dataFiltersService : DataFiltersService,
        protected dataRequestService : DataRequestService,
        protected attributionModelsService : AttributionModelsService,
    ) {
        console.warn(this.openedNav)
    }


    initSubscriptions(){
        console.warn(this.openedNav)

        /*
        * Subscribe to dataRequestService to get the request parameters
        */
        this.dataRequestService.dataRequestParamsBehaviorSubject.subscribe({
            next : (requestParams) => {
                this.requestParams = requestParams
            }
        });

        /** Subscribe to dataService.filteredDataBehaviorSubject and this.configService.configBehaviorSubject, to generate Dynamic Metrics Columns each time filteredData arrives
         * Sets attributes :
         *  - dynamicMetricsColumns : dynamic metrics inferred from data by funtion generateDynamicMetricsColumnsListsObjects [function specific to view multi-attribution]
         *  Through rebuildColumns
         *  - metricsColumns : obect containing columns for metrics (static and dynamic if any)
         *  - additiveMetricsList : list of addivtive metrics (by string), dynamic coming from dynamicAdditiveMetricsList [generated in generateDynamicMetricsColumnsListsObjects],
         *  and static coming from staticAdditiveMetricsList [set in configBehaviorSubjectSubscription (subscription to configService.configBehaviorSubject)]
         *  - this.dimensionsConfigElem
         *  - this.activeDimensionsWithIdColumns & this.activeDimensionsWithoutIdColumns
         *  - this.activeStaticMetricsColumns
         *  - this.calculatedMetricsColumns
         *
         *  - this.staticAdditiveMetricsList
         *  - this.calculatedAdditiveMetricsList
         *  - this.isAttributionModelMultiple
         */
        this.filteredDataBehaviorSubjectSubscription = this.dataService.filteredDataBehaviorSubject.combineLatest(this.configService.configBehaviorSubject).subscribe({
            next : (latestValues) => {
                let filteredData = latestValues[0];
                let configData = latestValues[1];

                if(filteredData.length > 0){
                    debugLogGroup(this.DEBUG,[this.SUBCLASSNAME+"this.dataService.filteredDataBehaviorSubject combined with this.configService.configBehaviorSubject subscription triggered with value [filteredData, configData] :",
                        filteredData,
                        configData,
                    ]);


                    this.rebuildColumns(configData, filteredData);

                }else{
                    debugWarn(this.DEBUG,this.SUBCLASSNAME+"this.dataService.filteredDataBehaviorSubject subscription triggered. filteredData empty, not doing anything.");
                }
            },
            error : (err) => console.error(err),
        });

        /**    Subscribe to dataService.filteredDataBehaviorSubject, this.dataFiltersService.filtersDimensionBehaviorSubject, dataFiltersService.filtersDimensionMappingBehaviorSubject,
         *     configService.configBehaviorSubject and this.attributionModelsService.attributionModelsMappingBehaviorSubject
         *
         *    Subscription to configService.configBehaviorSubject to generate dimensions columns and static metrics columns + define from config list of static additive metrics
          *     Sets attributes :
          *  - activeDimensionsWithIdColumns : list of all dimensions columns without Id columns
          *  - activeDimensionsWithoutIdColumns : list of all dimensions columns with Id columns (used to alternate on a toggle between with id and without id)
          *  - activeStaticMetricsColumns : static metrics columns taken straight from config file
          *  - staticAdditiveMetricsList : list of additive Metrics form the static ones, taken from the is_additive parameter in view.config.json
          *  - isAttributionModelMultiple : defines if atribution model is multiple ( [1,3] ) or simple (number) for the api endpoint
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

                    debugLogGroup(this.DEBUG,[this.SUBCLASSNAME+"combined subscription on (dataService.filteredDataBehaviorSubject, dataFiltersService.filtersDimensionBehaviorSubject, dataFiltersService.filtersDimensionMappingBehaviorSubject, configService.configBehaviorSubject, this.attributionModelsService.attributionModelsMappingBehaviorSubject) triggered :",
                        "First calculate and push calculated columns in filteredData",
                        "Then push into inputs to allow name processing in dataviz",
                        "with values [filteredData, filtersDimensionMapping, filtersDimensionMapping, config, attributionModelsMapping] :",
                        filteredData,
                        filtersDimensions,
                        filtersDimensionMapping,
                        configData,
                        attributionModelsMapping,
                    ]);

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
        this.navService.opened = this.openedNav;
    }

    /*Triggers when event bubbles from dattaviz chart through subview*/
    clickFilter(event){
        let tempoFilters = Object.assign({},this.filtersDimensions);
        tempoFilters[event.filterType].checked = [this.mapFilterNameToId(event.name,event.filterType)];
        this.filtersDimensions = tempoFilters;
    }

    mapFilterNameToId(name,filterType):number{
        return this.filtersDimensionMapping[filterType].findIndex(e=>{ return e==name })
    }

    /** Generates 2 things : list of columns with id columns and list of columns without id columns
     * @method generateDimensionColumnsListsObject
     * @param  {[type]}                            availableDimensions [description]
     * @return {{withIdColumns:[],withoutIdColumns:[]}}     Object containing both with id and withoutIds columns
     */
    protected generateDimensionColumnsListsObject(availableDimensions,activeDimensions):{withIdColumns:ITdDataTableColumn[], withoutIdColumns:ITdDataTableColumn[]}{
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
                    debugWarn(this.DEBUG,this.SUBCLASSNAME+singleActiveDimension.data_id_column_name+" has no indicated human readable column in config file. Skipping name column.")
                }
            }
        });
        debugLogGroup(this.DEBUG,[
            this.SUBCLASSNAME+"Calculated list of columns depending on list of active columns and list of available columns, returning both with and without id columns [ withIdColumns,withoutIdColumns ]:",
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
    protected generateStaticMetricsColumnsListsObject(availableMetrics,activeStaticMetrics):ITdDataTableColumn[]{
        debugLog(this.DEBUG,this.SUBCLASSNAME+"calling generateStaticMetricsColumnsListsObject")
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

    /** Infer dynamic columns from data : function used mainly in multi-attribution.
     * [TODO] new function for new data report
     * @method generateDynamicMetricsColumnsListsObjects
     * @param  {[type]}                                  data : data output from the api
     * @return {[type]}                                       array of columns for dynamic metrics
     **/
    protected generateDynamicMetricsColumnsListsObjects(data):ITdDataTableColumn[]{
        debugLog(this.DEBUG,this.SUBCLASSNAME+"calling generateDynamicMetricsColumnsListsObjects")
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
     *    @method addCalculatedMetricsColumns
     *    @param  {[type]}                                availableMetrics    list of all available calculated metrics (usually found in config file)
     *    @param  {[type]}                                activeStaticMetrics list of active calculated metrics (manually added to view file)
     *    @param  {[type]}                    filteredData               [description]
          @param  {[type]}                    metricsColumnsBase        metrics columns up to now. Will add columns to the object before returning it
     *    @return {ITdDataTableColumn[]}                  list of calculated metrics columns
     */
    protected addCalculatedMetricsColumns(availableCalculatedMetrics,activeCalculatedMetrics, filteredData, metricsColumnsBase):ITdDataTableColumn[]{
        debugLog(this.DEBUG,this.SUBCLASSNAME+"calling addCalculatedMetricsColumns")
        //Make a shallow copy of metricsColumnsBase
        let augmentedMetricsColumnsList = metricsColumnsBase.slice();

        activeCalculatedMetrics.map((metricName)=>{
            let singleActiveCalculatedMetric = availableCalculatedMetrics.filter((e)=>{ return e.column_name == metricName});

            if(singleActiveCalculatedMetric.length==0){
                //Error catch : if an unavailable metric was listed, skip it.
                console.error('"'+metricName+'" is not an available metric in view.config.json file for '+this.SUBCLASSNAME+'. Metric ignored. See list of available dimensions : ',[availableCalculatedMetrics[0]]);
            }else{
                //Filter first and only element returned by filter
                singleActiveCalculatedMetric = singleActiveCalculatedMetric[0];

                switch(singleActiveCalculatedMetric.column_name){
                    case "percent_certified" : augmentedMetricsColumnsList = this.addCalculatedMetricsCols_baseSingle(singleActiveCalculatedMetric, augmentedMetricsColumnsList); break;
                    case "multi_attrib_comparison" : augmentedMetricsColumnsList = this.addCalculatedMetricsCols_attributionModelsComparison(singleActiveCalculatedMetric, filteredData, augmentedMetricsColumnsList); break;
                    default : console.error(this.SUBCLASSNAME+" calculated metric '"+singleActiveCalculatedMetric.column_name+"' not declared in view-base component's switch statement : column can't be added to datatable. Please declare.");
                }
                debugLogGroup(true, [this.SUBCLASSNAME+" added column(s) of calculated data for "+singleActiveCalculatedMetric.column_name+", new metrics: ",augmentedMetricsColumnsList]);
            }
        });

        return augmentedMetricsColumnsList;
    }

    /**
     *    [addCalculatedMetricsCols_baseSingle description]
     *    @method returns column object for simple calculated metric : one column composed from name & label taken from config
     *    @param  {[type]}                         singleActiveCalculatedMetric [description]
     *    @return {[type]}                         [description]
     */
    addCalculatedMetricsCols_baseSingle(singleActiveCalculatedMetric, augmentedMetricsColumnsList){
        return augmentedMetricsColumnsList.concat( [{
            name : singleActiveCalculatedMetric.column_name,
            label : singleActiveCalculatedMetric.label,
            numeric : true
        }] );
    }

    addCalculatedMetricsCols_attributionModelsComparison(singleActiveCalculatedMetric, filteredData, augmentedMetricsColumnsList){
        //Make a shallow copy of the metrics column list at start
        let newMetricsList = augmentedMetricsColumnsList.slice();

        if(filteredData){
            let singleData = filteredData[0];
            let conversionsCols = [];

            //Create ordered list of columns depending on *ordernumber* in dataKey
            Object.keys(singleData).map((dataKey) => {
                //If column name starts with "conversions "
                if(dataKey.split(" ")[0]=="conversions"){
                    let colOrder = dataKey.split("*")[1];
                    conversionsCols[colOrder]=dataKey;
                }
            });

            //Isolate first column (to compare to) and other columns
            let firstConvCol = conversionsCols[0];
            let conversionsColsWithoutFirst = conversionsCols.slice(1);

            conversionsColsWithoutFirst.map(col=>{
                //Find index of compared column to add it just after
                let indexOfConversionCol = Object.keys(newMetricsList).find(index=>{
                    return newMetricsList[index].name == col;
                })
                //Index to use to add % column = index of conversion column +1
                let indexToAddTo = parseInt(indexOfConversionCol)+1

                //Insert at the right place (after conversion column)
                let colToAdd = {
                    name : "MA_comparison_"+col.split("*").slice(0,1).concat(col.split("*").slice(2)).join("")+"__"+firstConvCol.split("*").slice(0,1).concat(firstConvCol.split("*").slice(2)).join(""),
                    label : "%",
                    tooltip : "% "+col.split("*").slice(0,1).concat(col.split("*").slice(2)).join("")+" compared to "+firstConvCol.split("*").slice(0,1).concat(firstConvCol.split("*").slice(2)).join(""),
                    numeric : true
                }
                newMetricsList.splice(indexToAddTo,0,colToAdd);
                console.warn(augmentedMetricsColumnsList);

            });

        }
        return newMetricsList;
    }

    /** Rebuild global metrics array from static (calculated from config) and dynamic (inferred from data by custom function)
     * @method rebuildColumns
     * @return {[type]}              [description]
     */
    protected rebuildColumns(configData, filteredData){
        debugLog(this.DEBUG,this.SUBCLASSNAME+"calling rebuildColumns");

        //this.dynamicMetricsColumns = this.generateDynamicMetricsColumnsListsObjects(filteredData);

        //Throw an arror if no dimension available
        if( !configData['available_dimensions'] || configData['available_dimensions'].length == 0 ){ throw new Error(this.SUBCLASSNAME+'No "available_dimensions in view.config.json file !"');}

        this.dimensionsConfigElem = configData['available_dimensions'];
        let dimensionColumnsListsObject = this.generateDimensionColumnsListsObject(configData['available_dimensions'], this.activeDimensions);
        this.activeDimensionsWithIdColumns = dimensionColumnsListsObject.withIdColumns;
        this.activeDimensionsWithoutIdColumns = dimensionColumnsListsObject.withoutIdColumns;

        //Calculate static and dynamic columns
        this.activeStaticMetricsColumns = this.generateStaticMetricsColumnsListsObject(configData['available_static_metrics'], this.activeStaticMetrics);
        this.dynamicMetricsColumns = this.generateDynamicMetricsColumnsListsObjects(filteredData);

        //If static & dynamic not empty concat, else take only static, else empty array
         if(this.activeStaticMetricsColumns !== undefined && this.dynamicMetricsColumns !== undefined && this.dynamicMetricsColumns.length > 0){
             this.metricsColumns = this.activeStaticMetricsColumns.concat(this.dynamicMetricsColumns);
             debugLogGroup(this.DEBUG,[this.SUBCLASSNAME+"Building metrics column set from static metrics and dynamic metrics, resulting in [this.metricColumns] :",
             this.metricsColumns]);
         }else if(this.activeStaticMetricsColumns !== undefined){
             debugLog(this.DEBUG, this.SUBCLASSNAME+"dynamic metrics : no data, fallback to static columns only (normal at first pass)");
             this.metricsColumns = this.activeStaticMetricsColumns;
         }else{
             this.metricsColumns = []
         }

         debugLogGroup(this.DEBUG,["static metrics",
            this.activeStaticMetricsColumns,
            "dynamic metrics",
            this.dynamicMetricsColumns,
        ]);

        //Calculated Metrics calculates using base of columns, to be able to insert columns between dynamic cols
        //this.calculatedMetricsColumns = this.generateCalculatedMetricsColumnsListsObject(configData['available_calculated_metrics'], this.activeCalculatedMetrics, filteredData);
        this.metricsColumns = this.addCalculatedMetricsColumns(configData['available_calculated_metrics'], this.activeCalculatedMetrics, filteredData, this.metricsColumns);

        //Add calculated to metric columns if not empty
        /*if(this.calculatedMetricsColumns !==undefined && this.calculatedMetricsColumns.length > 0){
            debugLogGroup(this.DEBUG,[
                this.SUBCLASSNAME+"adding calculated metrics columns : ",
                this.calculatedMetricsColumns
            ])
            this.metricsColumns = this.metricsColumns.concat(this.calculatedMetricsColumns);
        }*/


        //Define list of additive metrics
        this.staticAdditiveMetricsList = configData['available_static_metrics'].filter((e)=>{ return e.is_additive }).map((e)=>{ return e.data_id_column_name });
        this.calculatedAdditiveMetricsList = configData['available_calculated_metrics'].filter((e)=>{ return e.is_additive }).map((e)=>{ return e.column_name });

        this.isAttributionModelMultiple = configData['is_attribution_model_multiple'];

        /*debugLogGroup(this.DEBUG,["static metrics",
           this.activeStaticMetricsColumns,
           "dyn metrics",
           this.dynamicMetricsColumns,
           "calculated metrics",
           this.calculatedMetricsColumns,
       ]);*/

        debugLogGroup(this.DEBUG,[
            this.SUBCLASSNAME+"list of metrics columns (static + dynamic + calculated) : ",
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
            this.SUBCLASSNAME+"list of additive metrics for groupBy : ",
            this.additiveMetricsList
        ])
    }

    filtersUpdated(filters){
        debugLog(this.DEBUG,this.SUBCLASSNAME+"calling filtersUpdated")
        debugLogGroup(this.DEBUG, [this.SUBCLASSNAME+"triggering output event updatedfilters from filter component with value [filters]",filters]);
        this.dataFiltersService.filtersDimensionBehaviorSubject.next(filters);
    }

}
