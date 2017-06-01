import { Component, OnInit, Input, OnChanges, SimpleChange } from '@angular/core';
import { DataService } from '../../services/data.service'

import {
    ITdDataTableSortChangeEvent,
    ITdDataTableColumn,
    IPageChangeEvent } from '@covalent/core';

import { debugLog, debugLogGroup, debugWarn } from '../../../../utils';

import { groupBy } from '../../libs/groupby';

@Component({
    selector: 'app-dataviz-chart',
    templateUrl: './dataviz-chart.component.html',
    styleUrls: ['./dataviz-chart.component.css']
})
export class DatavizChartComponent implements OnInit {

    DEBUG : boolean = false;

    @Input() filteredData : Array<{}>;
    private aggregatedFilteredData : Array<{}>;

    @Input() activeDimensionsWithIdColumns : ITdDataTableColumn[] = [];
    @Input() activeDimensionsWithoutIdColumns : ITdDataTableColumn[] = [];
    @Input() activeStaticMetricsColumns : ITdDataTableColumn[] = [];
    @Input() additiveMetricsList : Array<string>;
    @Input() availableGroupByFields = [];
    @Input() aggregateCriteria: string;
    @Input() chartTitle: string;

    //Columns that represent an id. To be used by the "show ids" column
    private withIdColumns : ITdDataTableColumn[];
    private withoutIdColumns : ITdDataTableColumn[];
    public columns : ITdDataTableColumn[];

    public filteredByDataTableData: any[];
    public filteredTotal: number;

    // config and dimension mapping
    @Input() filtersDimensionMapping;
    @Input() config;
    @Input() requestParams : {};

    // graph data:
    single: any[] = [];
    multi: any[] = [];

    // type of chart:
    @Input() chartType:string;
    timeSerieChart: boolean = false;
    numberCardChart: boolean = false;
    histogramChart: boolean = false;

    // graph options:
    showXAxis: boolean = true;
    showYAxis: boolean = true;
    gradient: boolean = true;
    showLegend: boolean = true;
    showXAxisLabel: boolean = true;
    @Input() xAxisLabel: string = '';
    showYAxisLabel: boolean = true;
    @Input() yAxisLabel: string = '';
    colorScheme: any = {
      domain: ['#1565C0', '#03A9F4', '#1976D2', '#039BE5', '#00BCD4', '#FB8C00', '#FFA726', '#FFCC80', '#FFECB3'],
    };
    autoScale: boolean = false;

    constructor() {
    }

    ngOnInit() {
        debugLogGroup(this.DEBUG,
            ["Dataviz Chart initialized with Inputs [activeDimensionsWithIdColumns,activeDimensionsWithoutIdColumns,activeStaticMetricsColumns]",
            this.activeDimensionsWithIdColumns, this.activeDimensionsWithoutIdColumns, this.activeStaticMetricsColumns
            ]
        );
    }

    ngOnChanges(changes: SimpleChange) {
        debugLogGroup(this.DEBUG,["Dataviz-chart Component : changes detected on columns",
        "New columns [activeDimensionsWithIdColumns,activeDimensionsWithoutIdColumns,activeStaticMetricsColumns]:",
        this.activeDimensionsWithIdColumns, this.activeDimensionsWithoutIdColumns, this.activeStaticMetricsColumns
        ]);
        this.aggregateData();
        this.buildChart();

    }

    aggregateData(): void {
        debugLogGroup(this.DEBUG,["Charts: filteredData",
        this.filteredData]);
        this.aggregatedFilteredData = groupBy(
            this.filteredData,
            [this.aggregateCriteria],
            this.additiveMetricsList,
            function(){},
            this.filtersDimensionMapping,
            this.config);

        debugLogGroup(this.DEBUG, ["Dataviz-chart Component: changes detected on data", this.aggregatedFilteredData])
    }

    buildChart(): void {
        if(this.aggregatedFilteredData.length > 0
            && this.config.available_dimensions.length > 0
            && this.activeStaticMetricsColumns.length >  0
            /*&& this.aggregatedFilteredData[0][this.config.available_dimensions[0].data_name_column_name]*/
        ) {
            // First we need to get the list of the metrics to use.
            // We don't include metrics used in criteria
            let current_metrics = this.activeStaticMetricsColumns.filter(metric => {
                if(metric.name !== this.aggregateCriteria) {
                    return Object.keys(this.aggregatedFilteredData[0]).indexOf(metric.name) != -1
                } else {
                    return false;
                }

            });
            switch(this.chartType) {
                case 'timeserie':
                    // first we need to complete the data for any missing date.
                    debugLogGroup(this.DEBUG,["building time series",
                    "aggregatedFilteredData",
                    this.aggregatedFilteredData,
                    "request params",
                    this.requestParams]);
                    // to achaive this objective, we need to get an array with all the dates:
                    let completeDateArray = this.getDates(
                        this.requestParams[0].start_date,
                        this.requestParams[0].end_date);
                    // then we want to have the list of the date in the dataset.
                    let dataDateArray = this.getUniqueList(
                        this.aggregatedFilteredData,
                        this.aggregateCriteria)
                    // we complete the data with the missing dates, adding 0 value for each metric
                    completeDateArray.map(date => {
                        if (dataDateArray.indexOf(date) === -1) {
                            let missing_date_row = {};
                            missing_date_row[this.aggregateCriteria]=date;
                            current_metrics.map(metric => {
                                missing_date_row[metric.name] = 0;
                            })
                            this.aggregatedFilteredData.push(missing_date_row);
                        }
                    });
                    // Now we can transform the data into the proper form to get plotted.
                    let timeData = [];
                    current_metrics.map(metric => {
                        let obj = {
                            "name": metric.label,
                        };
                        obj["series"] = this.aggregatedFilteredData.map(row => {
                            return({
                                "name": new Date(row[this.aggregateCriteria]),
                                "value": row[metric.name],
                            })
                        });
                        timeData.push(obj);
                    })
                    // update the data and draw the graph.
                    debugLogGroup(this.DEBUG,["timeData",
                    timeData]);
                    this.multi = timeData;
                    this.timeSerieChart = true;
                break;
                case 'number-card':
                    this.numberCardChart = true;
                break;
                case 'histogram':
                    // Then we need to get the dimension name
                    let dimension_name = this.config.available_dimensions.filter(dimension => {
                        return dimension.data_id_column_name === this.aggregateCriteria
                    })[0].data_name_column_name
                    console.warn("testing "+dimension_name)
                    console.warn(this.aggregatedFilteredData[0])
                    /*Test that the dimension_name of the aggregate criteria is present in filteredData, to avoid trying to build graph before the names are fetched for the dimensions (would create an error the first time filteredData is sent to component, before names are fetched)*/
                    if(this.aggregatedFilteredData[0][dimension_name]){
                        // Now we map reformat the new data Object
                        let chartData = this.aggregatedFilteredData.map((row,index) => {
                            console.log(row);
                            console.log(dimension_name);
                            console.log(row[dimension_name]);
                            let obj = {
                                "name": row[dimension_name]?row[dimension_name]:"Noname"
                            }
                            obj["series"] = current_metrics.map(metric => {
                                return({
                                    "name": metric.label,
                                    "value": row[metric.name]
                                })
                            })
                            return obj;
                        });
                        this.multi = chartData;
                        this.histogramChart = true;
                    }
                break;
            }
        }else{
            debugWarn(this.DEBUG,"Error :");
            debugLogGroup(this.DEBUG,[
                "Error in this.aggregatedFilteredData.length > 0",
                "OR this.config.available_dimensions.length > 0",
                "OR this.activeStaticMetricsColumns.length >  0",
                "OR this.aggregatedFilteredData[0][this.config.available_dimensions[0].data_name_column_name]",
                "(with this.config.available_dimensions[0].data_name_column_name = "+this.config.available_dimensions[0].data_name_column_name+")",
                "this.aggregatedFilteredData :",
                this.aggregatedFilteredData,
                "this.config.available_dimensions :",
                this.config.available_dimensions,
                "this.activeStaticMetricsColumns :",
                this.activeStaticMetricsColumns,
                "this.aggregatedFilteredData[0] :",
                this.aggregatedFilteredData[0],
            ])
        }
    }

    getUniqueList(objectsArray, property){
        return objectsArray.map(function(e){ return e[property]; })
        .filter(function(elem, index, array){
            return array.indexOf(elem) === index
        });
    }

    getDates(start_date, stop_date) : Date[] {
        start_date.setTime(start_date.getTime() + 60*60*1000);
        let dateArray = [];
        for (var d = new Date(start_date); d <= stop_date; d.setDate(d.getDate() + 1)) {
            dateArray.push(new Date(d));
        }
        return dateArray.map((date) => { return date.toISOString().slice(0, 10);});
    }
}
