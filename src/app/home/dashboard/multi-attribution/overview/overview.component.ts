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
    DEBUG : boolean = true;

    //Unnamed yet filtered data (to be named by dataviz)
    @Input() filteredData : Array<{}>;
    @Input() activeDimensionsWithIdColumns : ITdDataTableColumn[];
    @Input() activeDimensionsWithoutIdColumns : ITdDataTableColumn[];
    @Input() activeStaticMetricsColumns : ITdDataTableColumn[];
    @Input() additiveMetricsList : Array<string>;
    @Input() filtersDimensionMapping;
    @Input() config;

    constructor(
        private dataService : DataService,
        private configService : ConfigService,
    ) {
    }

    ngOnInit() {    }


}
