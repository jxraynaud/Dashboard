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

import { ViewBaseComponent } from '../view-base/view-base.component'

import { NavService } from '../../../services/nav.service'
import { DataService } from '../services/data.service';
import { DataFiltersService } from '../services/data-filters.service';
import { ConfigService } from '../services/config.service';
import { DataRequestService } from '../services/data-request.service';
import { AttributionModelsService } from '../services/attribution-models.service';

import {debugLog, debugWarn, debugLogGroup} from '../../../utils';

import viewConfig from './view.config.json';

@Component({
    selector: 'app-fraud-detector',
    templateUrl: './fraud-detector.component.html',
    styleUrls: ['./fraud-detector.component.css']
})
export class FraudDetectorComponent extends ViewBaseComponent implements OnInit{
    DEBUG : boolean = true;
    SUBCLASSNAME = "Fraud Detector component : "

    openedNav : boolean = true;

    //activeDimensions : string[] = ['advertiser_id','partner_id','kpi_id','metacampaign_id',/*'falseDimension'*/];

    activeStaticMetrics = ['conversion_date', 'conversions', 'certified_conversions'];

    activeCalculatedMetrics = ['percent_certified'];

    constructor(
        protected activatedRoute : ActivatedRoute,
        public navService : NavService,
        protected configService : ConfigService,
        protected dataService : DataService,
        protected dataFiltersService : DataFiltersService,
        protected dataRequestService : DataRequestService,
        protected attributionModelsService : AttributionModelsService,
    ) {
        super(activatedRoute,
            navService,
            configService,
            dataService,
            dataFiltersService,
            dataRequestService,
            attributionModelsService,
        )

        this.configService.setConfigFile(viewConfig);
        this.initSubscriptions();
    }

    ngOnInit() {
        super.ngOnInit();
        debugLog(this.DEBUG,this.SUBCLASSNAME+"calling ngOnInit");
        if(this.activatedRoute.snapshot.queryParams["view"]){
            let viewParam = this.activatedRoute.snapshot.queryParams["view"];
            debugWarn(this.DEBUG, this.SUBCLASSNAME+"Switching by query parameters to view "+viewParam);
            this.navService.activeViews.frauddetector = viewParam;
        }
    }

}
