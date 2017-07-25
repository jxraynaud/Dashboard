import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';

import {
    TdDataTableService,
    TdDataTableSortingOrder,
    ITdDataTableSortChangeEvent,
    ITdDataTableColumn,
    IPageChangeEvent } from '@covalent/core';

import { Angular2Csv } from 'angular2-csv/Angular2-csv';

import { debugLog, debugLogGroup } from '../../../../utils';
import { groupBy } from '../../libs/groupby';

@Component({
  selector: 'app-dataviz-datatable',
  templateUrl: './dataviz-datatable.component.html',
  styleUrls: ['./dataviz-datatable.component.css']
})
export class DatavizDatatableComponent implements OnInit, OnChanges {
    DEBUG : boolean = false;

    @Input() filteredData : Array<{}>;
    private aggregatedFilteredData : Array<{}>;

    @Input() activeDimensionsWithIdColumns : ITdDataTableColumn[] = [];
    @Input() activeDimensionsWithoutIdColumns : ITdDataTableColumn[] = [];
    @Input() activeStaticMetricsColumns : ITdDataTableColumn[] = [];
    @Input() activeCalculatedMetrics : string[];
    @Input() additiveMetricsList : Array<string>;
    @Input() availableGroupByFields = [];

    //Columns that represent an id. To be used by the "show ids" column
    private withIdColumns : ITdDataTableColumn[];
    private withoutIdColumns : ITdDataTableColumn[];
    public columns : ITdDataTableColumn[];

    public filteredByDataTableData: any[];
    //For CSV, filled in parallel to filteredByDataTableData
    public filteredUnpagedData: any[];
    public filteredTotal: number;

    searchTerm: string = '';
    fromRow: number = 1;
    currentPage: number = 1;
    @Input() sortBy: string;
    sortOrder: TdDataTableSortingOrder = TdDataTableSortingOrder.Descending;

    csv_isComma = true;
    csv_isSimpleQuotes = false;
    csv_isDecimalComma = false;
    csv_pagedData = false;
    csv_displayOptions = false;

    //Facultative inputs
    @Input() pageSizes = [10, 50, 100, 150, 200];
    @Input() pageSize: number = 10;
    @Input() displayIdsInDatatable:boolean = true;
    @Input() aggregateCriterias: string[];
    @Input() filtersDimensionMapping;
    @Input() config;

    //
    //@Input() activeGroupByFields : string[]=[];
    //@Input() availableGroupByFields : string[];
    //@Input() defaultGroupByFields : string[];
    @ViewChild('pagingBar') pagingBar

    //displayIdsInDatatable : boolean = false;

    constructor(
        private _dataTableService: TdDataTableService) {
    }

    generateCSV(){
        let csvOptions = {
            fieldSeparator: this.csv_isComma?",":";",
            quoteStrings: this.csv_isSimpleQuotes?"'":'"',
            decimalseparator: this.csv_isDecimalComma?",":".",
            showLabels: true,
            showTitle: false
          };

        if(this.csv_pagedData){
            new Angular2Csv(this.filteredByDataTableData, 'Clovis_report', csvOptions);
        }else{
            console.log(this.filteredUnpagedData)
            new Angular2Csv(this.filteredUnpagedData, 'Clovis_report', csvOptions);
        }
    }

    ngOnInit() {
        //Initiate activegroupbyfields to default value given in input
        //this.activeGroupByFields=this.defaultGroupByFields;
        debugLogGroup(this.DEBUG,
            ["Dataviz Datatable initialized with Inputs [activeDimensionsWithIdColumns,activeDimensionsWithoutIdColumns,activeStaticMetricsColumns]",
            this.activeDimensionsWithIdColumns, this.activeDimensionsWithoutIdColumns, this.activeStaticMetricsColumns
            ]
        );
        this.rebuildColumns();
    }

    ngOnChanges(changes: SimpleChanges){
        //if(changes.activeDimensionsWithIdColumns !== undefined){
            debugLogGroup(this.DEBUG,["Dataviz-datatable Component : changes detected on columns",
            "New columns [activeDimensionsWithIdColumns,activeDimensionsWithoutIdColumns,activeStaticMetricsColumns]:",
            this.activeDimensionsWithIdColumns, this.activeDimensionsWithoutIdColumns, this.activeStaticMetricsColumns
            ]);
            this.aggregateData();
            this.rebuildColumns();
            this.filter();
        //}
    }

    aggregateData(): void {
        this.aggregatedFilteredData = groupBy(
            this.filteredData,
            this.aggregateCriterias,
            this.additiveMetricsList,
            function(){},
            this.activeCalculatedMetrics,
            this.filtersDimensionMapping,
            this.config);
    }

    toggleIdColumns(){
        this.displayIdsInDatatable = !this.displayIdsInDatatable;
        if(this.displayIdsInDatatable == true){
            this.columns = this.withIdColumns;
        }else{
            this.columns = this.withoutIdColumns;
        }
    }

    /**
     *    Rebuilds columns :
     *    1-Concatenates dimensions and metrics columns
     *    2-Filters columns to data present in the data (mapped from row 0 of data)
     *    3-Sets columns to with or without id depending on displayIdsInDatatable parameter
     *    @method rebuildColumns
     *    @return {[type]}       [description]
     */
    rebuildColumns(){
        if(this.activeDimensionsWithIdColumns && this.activeDimensionsWithoutIdColumns){
            //Concatenate constant columns (defined above) with dynamic columns
            this.withIdColumns = this.activeDimensionsWithIdColumns.concat(this.activeStaticMetricsColumns);
            this.withoutIdColumns = this.activeDimensionsWithoutIdColumns.concat(this.activeStaticMetricsColumns);

            //Filter to keep only columns present in data (changes dependign on groupBy)
            if(this.aggregatedFilteredData[0]){
                //Keys present in the data
                let dataKeys = Object.keys(this.aggregatedFilteredData[0]);
                //Filter to keep only columns that have an index in dataKeys (list of keys present in data)
                this.withIdColumns = this.withIdColumns.filter((col)=>{ return dataKeys.indexOf(col.name)!=-1 });
                this.withoutIdColumns = this.withoutIdColumns.filter((col)=>{ return dataKeys.indexOf(col.name)!=-1 });

                //Put columns depending of "display ids" (displayIdsInDatatable) toggle option
                //(Inside aggegatedFiltredData test to avoid columns flash before/after groupby)
                if(this.displayIdsInDatatable == true){
                    this.columns = this.withIdColumns;
                }else{
                    this.columns = this.withoutIdColumns;
                }
            }
        }
    }

    sort(sortEvent: ITdDataTableSortChangeEvent): void {
        this.sortBy = sortEvent.name;
        this.sortOrder = sortEvent.order;
        this.filter();
    }

    search(searchTerm: string): void {
        this.searchTerm = searchTerm;
        this.pagingBar.navigateToPage(1);
        this.filter();
    }

    page(pagingEvent: IPageChangeEvent): void {
        this.fromRow = pagingEvent.fromRow;
        this.currentPage = pagingEvent.page;
        this.pageSize = pagingEvent.pageSize;
        this.filter();
    }

    filter(): void {
        //First input of filtereddata is empty, then filter is triggered in ngonchange
        if(this.aggregatedFilteredData.length>0){
            let newData: any[] = this.aggregatedFilteredData;
            newData = this._dataTableService.filterData(newData, this.searchTerm, true);
            this.filteredTotal = newData.length;
            newData = this._dataTableService.sortData(newData, this.sortBy, this.sortOrder);
            //For CSV
            this.filteredUnpagedData = newData.slice();
            newData = this._dataTableService.pageData(newData, this.fromRow, this.currentPage * this.pageSize);
            this.filteredByDataTableData = newData;
        }
    }

    changeGroupByCriteria(){
        this.aggregateData();
        this.rebuildColumns();
        this.filter();
    }

}
