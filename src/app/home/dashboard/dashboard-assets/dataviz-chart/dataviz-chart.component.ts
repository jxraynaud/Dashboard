import { Component, OnInit, Input, OnChanges, SimpleChange } from '@angular/core';
import { DataService } from '../../services/data.service'

import {
    TdDataTableService,
    TdDataTableSortingOrder,
    ITdDataTableSortChangeEvent,
    ITdDataTableColumn,
    IPageChangeEvent } from '@covalent/core';

import { debugLog, debugLogGroup } from '../../../../utils';

import { groupBy } from '../../libs/groupby';

@Component({
    selector: 'app-dataviz-chart',
    templateUrl: './dataviz-chart.component.html',
    styleUrls: ['./dataviz-chart.component.css']
})
export class DatavizChartComponent implements OnInit {

    DEBUG: boolean = true;

    @Input() filteredData : Array<{}>;
    private aggregatedFilteredData : Array<{}>;

    @Input() activeDimensionsWithIdColumns : ITdDataTableColumn[] = [];
    @Input() activeDimensionsWithoutIdColumns : ITdDataTableColumn[] = [];
    @Input() activeStaticMetricsColumns : ITdDataTableColumn[] = [];
    @Input() additiveMetricsList : Array<string>;
    @Input() availableGroupByFields = [];
    @Input() aggregateCriterias: string[];
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

    // graph data:
    single: any[] = [];
    multi: any[] = [];

    // type of chart:
    @Input() timeSerieChart: boolean = false;
    @Input() numberCardChart: boolean = false;
    @Input() histogramChart: boolean = false;

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
        this.aggregatedFilteredData = groupBy(
            this.filteredData,
            this.aggregateCriterias,
            this.additiveMetricsList,
            function(){},
            this.filtersDimensionMapping,
            this.config);

        debugLogGroup(this.DEBUG, ["Dataviz-chart Component: changes detected on data", this.aggregatedFilteredData])
    }

    buildChart(): void {

    }

}
