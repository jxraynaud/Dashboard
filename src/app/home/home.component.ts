import { Component, HostBinding, OnInit } from '@angular/core';

import { fadeAnimation } from '../app.animations';

import { DashboardComponent } from './dashboard/dashboard.component';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [fadeAnimation],
})
export class HomeComponent implements OnInit {
    @HostBinding('@routeAnimation') routeAnimation: boolean = true;
    @HostBinding('class.td-route-animation') classAnimation: boolean = true;

    updates: Object[] = [{
        description: 'File Input component',
        icon: 'space_bar',
        route: 'components/file-input',
        title: 'New component',
        },
    ];



    constructor() {
    }

    ngOnInit(): void {

    }
}
