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

    @Input() activeDimensionsWithIdColumns : ITdDataTableColumn[];
    @Input() activeDimensionsWithoutIdColumns : ITdDataTableColumn[];
    @Input() activeMetricsColumns : ITdDataTableColumn[];
    @Input() filteredData : Array<{}>;

    constructor(
        private dataService : DataService,
        private configService : ConfigService,
    ) {
    }

    ngOnInit() {    }


}
