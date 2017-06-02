import { Component, OnInit, Input } from '@angular/core';

import {
    TdDataTableService,
    TdDataTableSortingOrder,
    ITdDataTableSortChangeEvent,
    ITdDataTableColumn,
    IPageChangeEvent } from '@covalent/core';

import { Subscription } from 'rxjs/Subscription';

import { DataService } from '../../services/data.service';
import { ConfigService } from '../../services/config.service';

import {debugLog, debugWarn, debugLogGroup} from '../../../../utils';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit {
    DEBUG : boolean = false;

    //Unnamed yet filtered data (to be named by dataviz)
    @Input() filteredData : Array<{}>;
    @Input() activeDimensionsWithIdColumns : ITdDataTableColumn[];
    @Input() activeDimensionsWithoutIdColumns : ITdDataTableColumn[];
    @Input() activeStaticMetricsColumns : ITdDataTableColumn[];
    @Input() activeCalculatedMetrics : string[];
    @Input() additiveMetricsList : Array<string>;
    @Input() filtersDimensionMapping;
    @Input() config;
    @Input() requestParams : {};
     //Setting to pipe to the views to define if the attribution model parameter of the api is simple (number) or multiple (array)
    @Input() isAttributionModelMultiple : boolean;

    constructor() { }

    ngOnInit() {
    }

}
