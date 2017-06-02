import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import {
    TdDataTableService,
    TdDataTableSortingOrder,
    ITdDataTableSortChangeEvent,
    ITdDataTableColumn,
    IPageChangeEvent } from '@covalent/core';

import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs';

import { NavService } from '../../../services/nav.service'

import { DataService } from '../services/data.service';
import { DataFiltersService } from '../services/data-filters.service';
import { ConfigService } from '../services/config.service';
import { DataRequestService } from '../services/data-request.service';
import { AttributionModelsService } from '../services/attribution-models.service';

import {debugLog, debugWarn, debugLogGroup} from '../../../utils';

import viewConfig from './view.config.json';
@Component({
  selector: 'app-view-base',
  templateUrl: './view-base.component.html',
  styleUrls: ['./view-base.component.css']
})
export class ViewBaseComponent implements OnInit {
    DEBUG : boolean = true;

    //Attributes used for template structure
    openedNav = true;

    filteredData : Array<{}>;
    filtersDimensions : Object;
    filtersDimensionMapping;
    config;
    dimensionsConfigElem;
    attributionModelsMapping : Array<{}>;

    requestParams : {};

    activeDimensions : string[] = ['advertiser_id','partner_id','kpi_id','metacampaign_id',/*'falseDimension'*/];
    activeDimensionsWithIdColumns : ITdDataTableColumn[];
    activeDimensionsWithoutIdColumns : ITdDataTableColumn[];

    activeStaticMetrics : string[] = [];
    activeStaticMetricsColumns : ITdDataTableColumn[];

    dynamicMetricsColumns : ITdDataTableColumn[];

    activeCalculatedMetrics : string[] = [];
    calculatedMetricsColumns : ITdDataTableColumn[];

    //Concat of static and dynamic metrics to be passed to inputs
    metricsColumns : ITdDataTableColumn[];

    //List of additive metrics columns for groupby function by their key name (string) : intermediary values static and dynamic because static is calculated
    // at reception of config BehaviorSubject, chereas dynamic is calculated in generateDynamicMetricsColumnsListsObjects.
    // => the 2 are concat in rebuildColumns() to make additiveMetricsList
    dynamicAdditiveMetricsList : Array<string>;
    staticAdditiveMetricsList : string[];
    calculatedAdditiveMetricsList : string[];
    additiveMetricsList : Array<string>;

    //Setting to pipe from config to the views to define if the attribution model parameter of the api is simple (number) or multiple (array)
    isAttributionModelMultiple : boolean;

    //TODO : destroy subscriptions at the end
    filteredDataBehaviorSubjectSubscription : Subscription;
    configBehaviorSubjectSubscription : Subscription;
    valuesToInputSubscription : Subscription;
    currentTriggered : string = "";

    constructor(
        protected activatedRoute : ActivatedRoute,
        public navService : NavService,
        protected configService : ConfigService,
        protected dataService : DataService,
        protected dataFiltersService : DataFiltersService,
        protected dataRequestService : DataRequestService,
        protected attributionModelsService : AttributionModelsService,
    ) {
        this.navService.opened = this.openedNav;
    }

    ngOnInit() {
    }

}
