import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';

import {
    TdDataTableService,
    TdDataTableSortingOrder,
    ITdDataTableSortChangeEvent,
    ITdDataTableColumn,
    IPageChangeEvent } from '@covalent/core';

import {debugLog, debugLogGroup} from '../../../../utils';

@Component({
  selector: 'app-dataviz-datatable',
  templateUrl: './dataviz-datatable.component.html',
  styleUrls: ['./dataviz-datatable.component.css']
})
export class DatavizDatatableComponent implements OnInit, OnChanges {
    DEBUG: boolean = true;

    @Input() filteredData : Array<{}>;
    private aggregatedFilteredData : Array<{}>;

    @Input() activeDimensionsWithIdColumns : ITdDataTableColumn[] = [];
    @Input() activeDimensionsWithoutIdColumns : ITdDataTableColumn[] = [];
    @Input() activeMetricsColumns : ITdDataTableColumn[] = [];

    //Columns that represent an id. To be used by the "show ids" column
    private withIdColumns : ITdDataTableColumn[];
    private withoutIdColumns : ITdDataTableColumn[];
    public columns : ITdDataTableColumn[];

    displayIdsInDatatable:boolean = true;

    public filteredByDataTableData: any[];
    public filteredTotal: number;
    //
    searchTerm: string = '';
    fromRow: number = 1;
    currentPage: number = 1;
    pageSize: number = 10;
    @Input() sortBy: string;
    sortOrder: TdDataTableSortingOrder = TdDataTableSortingOrder.Descending;
    //
    //@Input() activeGroupByFields : string[]=[];
    //@Input() availableGroupByFields : string[];
    //@Input() defaultGroupByFields : string[];
    @ViewChild('pagingBar') pagingBar

    //displayIdsInDatatable : boolean = false;

    constructor(
        private _dataTableService: TdDataTableService) {
    }


    ngOnInit() {
        //Initiate activegroupbyfields to default value given in input
        //this.activeGroupByFields=this.defaultGroupByFields;
        debugLogGroup(this.DEBUG,
            ["Dataviz Datatable initialized with Inputs [activeDimensionsWithIdColumns,activeDimensionsWithoutIdColumns,activeMetricsColumns]",
            this.activeDimensionsWithIdColumns, this.activeDimensionsWithoutIdColumns, this.activeMetricsColumns
            ]
        );
        console.log(this.activeMetricsColumns);
        this.rebuildColumns();
    }

    ngOnChanges(changes: SimpleChanges){
        //if(changes.activeDimensionsWithIdColumns !== undefined){
            debugLogGroup(this.DEBUG,["Dataviz-datatable Component : changes detected on columns",
            "New columns [activeDimensionsWithIdColumns,activeDimensionsWithoutIdColumns,activeMetricsColumns]:",
            this.activeDimensionsWithIdColumns, this.activeDimensionsWithoutIdColumns, this.activeMetricsColumns
            ]);
            this.rebuildColumns();
            this.filter();
        //}
    }

    toggleIdColumns(){
        this.displayIdsInDatatable = !this.displayIdsInDatatable;
        if(this.displayIdsInDatatable == true){
            this.columns = this.withIdColumns;
        }else{
            this.columns = this.withoutIdColumns;
        }
    }

    rebuildColumns(){
        //Concatenate constant columns (defined above) with dynamic columns
        this.withIdColumns = this.activeDimensionsWithIdColumns.concat(this.activeMetricsColumns);
        this.withoutIdColumns = this.activeDimensionsWithoutIdColumns.concat(this.activeMetricsColumns);
        //Put columns depending of "display ids" (displayIdsInDatatable) toggle option
        if(this.displayIdsInDatatable == true){
            this.columns = this.withIdColumns;
        }else{
            this.columns = this.withoutIdColumns;
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
        if(this.filteredData){
            let newData: any[] = this.filteredData;
            newData = this._dataTableService.filterData(newData, this.searchTerm, true);
            this.filteredTotal = newData.length;
            newData = this._dataTableService.sortData(newData, this.sortBy, this.sortOrder);
            newData = this._dataTableService.pageData(newData, this.fromRow, this.currentPage * this.pageSize);
            this.filteredByDataTableData = newData;
        }
    }

}
