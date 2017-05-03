import { Component, OnInit } from '@angular/core';

import { DataService } from '../services/data.service'
import { DataFiltersService } from '../services/data-filters.service'
import { ConfigService } from '../services/config.service';

import viewConfig from './view.config.json';

@Component({
  selector: 'app-multi-attribution',
  templateUrl: './multi-attribution.component.html',
  styleUrls: ['./multi-attribution.component.css']
})
export class MultiAttributionComponent implements OnInit {

    constructor(
        private configService : ConfigService,
        private dataService : DataService,
        private dataFiltersService : DataFiltersService) {
            this.configService.setConfigFile(viewConfig);
    }

    ngOnInit() {
    }

}
