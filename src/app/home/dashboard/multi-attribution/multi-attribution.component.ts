import { Component, OnInit } from '@angular/core';

import {
    TdDataTableService,
    TdDataTableSortingOrder,
    ITdDataTableSortChangeEvent,
    ITdDataTableColumn,
    IPageChangeEvent } from '@covalent/core';

import { Subscription } from 'rxjs/Subscription';

import { DataService } from '../services/data.service'
import { DataFiltersService } from '../services/data-filters.service'
import { ConfigService } from '../services/config.service';

import {debugLog, debugWarn, debugLogGroup} from '../../../utils';

import viewConfig from './view.config.json';

@Component({
  selector: 'app-multi-attribution',
  templateUrl: './multi-attribution.component.html',
  styleUrls: ['./multi-attribution.component.css']
})
export class MultiAttributionComponent implements OnInit {
    DEBUG : boolean = true;

    //Attributes used for template structure
    openedNav = true;
    activeView = "overview";
    viewsList=[
        {
            name : "overview",
            menuText : "Overview view",
            description: "Overview blabla",
            icon: "view_compact"
        },
        {
            name : "bykpiview",
            menuText : "View 2 - by KPI",
            description: "By KPI View example",
            icon: "business"
        }
    ]


    activeDimensions : string[] = ['advertiser_id','partner_id','kpi_id','metacampaign_id',/*'falseDimension'*/];
    activeDimensionsWithIdColumns : ITdDataTableColumn[];
    activeDimensionsWithoutIdColumns : ITdDataTableColumn[];

    activeStaticMetrics : string[] = [/*'falseMetric',*/'conversion_date'];
    activeStaticMetricsColumns : ITdDataTableColumn[];
    dynamicMetricsColumns : ITdDataTableColumn[];

    //Concat of static and dynamic metrics to be passed to inputs
    metricsColumns : ITdDataTableColumn[];

    filteredData : Array<{}>;

    //TODO : destroy subscription at the end
    filteredDataBehaviorSubjectSubscription : Subscription;
    configBehaviorSubjectSubscription : Subscription;

    constructor(
        private configService : ConfigService,
        private dataService : DataService,
        private dataFiltersService : DataFiltersService) {
            this.configService.setConfigFile(viewConfig);

            this.filteredDataBehaviorSubjectSubscription = this.dataService.filteredDataBehaviorSubject.subscribe({
                next : (filteredData) => {
                    if(filteredData.length > 0){
                        debugLogGroup(this.DEBUG,["Overview Component : this.dataService.filteredDataBehaviorSubject subscription triggered with value [filteredData] :",
                            "Injected in filteredData attribute",
                            filteredData]);
                        this.filteredData = filteredData;
                        this.dynamicMetricsColumns = this.generateDynamicMetricsColumnsListsObjects(filteredData);
                        this.rebuildMetricsColumns();
                    }else{
                        debugWarn(this.DEBUG,"Overview Component : this.dataService.filteredDataBehaviorSubject subscription triggered. filteredData empty, not doing anything.");
                    }
                },
                error : (err) => console.error(err),
            });

            this.configBehaviorSubjectSubscription = this.configService.configBehaviorSubject.subscribe({
                next : (configData) => {
                    debugLogGroup(this.DEBUG,["Overview Component : this.configService.configBehaviorSubject subscription triggered with value [config] for generating list of columns in datatable :",
                        configData,
                        "List of active columns : ",
                        this.activeDimensions
                    ]);
                    this.activeDimensionsWithIdColumns = this.generateDimensionColumnsListsObject(configData['available_dimensions'], this.activeDimensions).withIdColumns;
                    this.activeDimensionsWithoutIdColumns = this.generateDimensionColumnsListsObject(configData['available_dimensions'], this.activeDimensions).withoutIdColumns;
                    this.activeStaticMetricsColumns = this.generateStaticMetricsColumnsListsObject(configData['available_static_metrics'], this.activeStaticMetrics);
                    this.rebuildMetricsColumns();
                },
                error : (err) => console.error(err),
            });
    }

    ngOnInit() {
    }

    /**
     * Generates 2 things : list of columns with id columns and list of columns without id columns
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

    /* Infer dynamic columns from data : function specific to mult-attribution.
     * [TODO] new function for new data report
     * @method generateDynamicMetricsColumnsListsObjects
     * @param  {[type]}                                  data : data output from the api
     * @return {[type]}                                       array of columns for dynamic metrics
     */
    private generateDynamicMetricsColumnsListsObjects(data){
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
            });
        }
        return activeDynamicMetricsColumnsTemp;
    }

    /**
     * Rebuild global metrics array from static (calculated from config) and dynamic (inferred from data by custom function)
     * @method rebuildMetricsColumns
     * @return {[type]}              [description]
     */
    private rebuildMetricsColumns(){
        if(this.activeStaticMetricsColumns !== undefined && this.dynamicMetricsColumns !== undefined){
            this.metricsColumns = this.activeStaticMetricsColumns.concat(this.dynamicMetricsColumns);
            debugLogGroup(this.DEBUG,["Building metrics column set from static metrics and dynamic metrics, resulting in [this.metricColumns] :",this.metricsColumns]);
        }else if(this.activeStaticMetricsColumns !== undefined){
            debugLog(this.DEBUG, "Multi attribution dynamic metrics : no data, fallback to static columns only (normal at first pass)");
            this.metricsColumns = this.activeStaticMetricsColumns;
        }
    }
}
