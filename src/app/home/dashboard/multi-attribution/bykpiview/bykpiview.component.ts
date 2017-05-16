import { Component, OnInit, Input } from '@angular/core';

import {
    TdDataTableService,
    TdDataTableSortingOrder,
    ITdDataTableSortChangeEvent,
    ITdDataTableColumn,
    IPageChangeEvent } from '@covalent/core';

@Component({
  selector: 'app-bykpiview',
  templateUrl: './bykpiview.component.html',
  styleUrls: ['./bykpiview.component.css']
})
export class BykpiviewComponent implements OnInit {
    DEBUG : boolean = true;

    //Unnamed yet filtered data (to be named by dataviz)
    @Input() filteredData : Array<{}>;
    @Input() activeDimensionsWithIdColumns : ITdDataTableColumn[];
    @Input() activeDimensionsWithoutIdColumns : ITdDataTableColumn[];
    @Input() activeStaticMetricsColumns : ITdDataTableColumn[];
    @Input() additiveMetricsList : Array<string>;
    @Input() filtersDimensionMapping;
    @Input() config;
    //Setting to pipe to the views to define if the attribution model parameter of the api is simple (number) or multiple (array)
    @Input() isAttributionModelMultiple : boolean;

    constructor() { }

    ngOnInit() {
    }

}
