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
    @Input() dimensionColumns : Array<{}>;

    constructor(
        private _dataTableService: TdDataTableService) {
    }

    ngOnInit() {
    }

}
