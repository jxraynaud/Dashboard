import { Component, OnInit, Input } from '@angular/core';

import { NumberCardComponent } from '@swimlane/ngx-charts';
import {
    TdDataTableService,
    TdDataTableSortingOrder,
    ITdDataTableSortChangeEvent,
    ITdDataTableColumn,
    IPageChangeEvent } from '@covalent/core';

import {debugLog, debugWarn, debugLogGroup} from '../../../../utils';

@Component({
  selector: 'app-bypartnerview',
  templateUrl: './bypartnerview.component.html',
  styleUrls: ['./bypartnerview.component.css']
})
export class BypartnerviewComponent implements OnInit {
    DEBUG : boolean = false;

    viewTitle : string = "Multi Attributions Models by KPI"

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
