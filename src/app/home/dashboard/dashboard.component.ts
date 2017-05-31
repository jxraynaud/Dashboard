import { Component, OnInit, ViewChild } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { ConfigService } from './services/config.service';
import { NavService } from '../../services/nav.service';

import viewConfig from './dashboard.config.json';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {

    config : Object;

    //TODO : destroy subscription at the end
    configBehaviorSubjectSubscription : Subscription;

    constructor(
        private configService : ConfigService,
        public navService : NavService) {
            this.configService.setConfigFile(viewConfig);
            this.configBehaviorSubjectSubscription = this.configService.configBehaviorSubject.subscribe({
                next : (config) => {
                    this.config = config;
                },
                error : (err) => console.error(err),
            });
            //console.warn("config");
        }

    ngOnInit() {
        this.navService.opened=false;
    }

}
