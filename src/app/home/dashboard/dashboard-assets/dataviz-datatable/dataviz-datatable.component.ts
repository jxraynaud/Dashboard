import { Component, OnInit, Input } from '@angular/core';

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
export class DatavizDatatableComponent implements OnInit {
    DEBUG: boolean = false;

    @Input() filteredData : Array<{}>;
    private aggregatedFilteredData : Array<{}>;

    @Input() dimensionColumnsWithId : ITdDataTableColumn[] = [];
    @Input() dimensionColumnsWithoutId : ITdDataTableColumn[] = [];
    //measuresColumns : ITdDataTableColumn[] = [];

    //Columns that represent an id. To be used by the "show ids" column
    //private withoutIdColumns : ITdDataTableColumn[] = [];
    //private withIdColumns : ITdDataTableColumn[] = [];

    //public columns : ITdDataTableColumn[] = [];

    //public filteredByDataTableData: any[];
    //public filteredTotal: number;
    //
    //searchTerm: string = '';
    //fromRow: number = 1;
    //currentPage: number = 1;
    //pageSize: number = 50;
    //sortBy: string = 'conversions';
    //sortOrder: TdDataTableSortingOrder = TdDataTableSortingOrder.Descending;
    //
    //@Input() activeGroupByFields : string[]=[];
    //@Input() availableGroupByFields : string[];
    //@Input() defaultGroupByFields : string[];
    //@ViewChild('pagingBar') pagingBar

    //displayIdsInDatatable : boolean = false;

    constructor(
        private _dataTableService: TdDataTableService) {
    }

    ngOnInit() {
    }

}
