import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {/* Http,*/ Headers, RequestOptions, Response } from '@angular/http';

import { DaterangepickerConfig } from 'ng2-daterangepicker';
import { Daterangepicker } from 'ng2-daterangepicker';

import { NavService } from '../../../services/nav.service';
import { AuthenticatedHttpService } from '../../../services/authenticatedHttpService';

import {debugLog, debugLogGroup} from '../../../utils';

@Component({
  selector: 'app-kpi-manager',
  templateUrl: './kpi-manager.component.html',
  styleUrls: ['./kpi-manager.component.css']
})
export class KpiManagerComponent implements OnInit {
    DEBUG : boolean = true;
    API_URL : string = "http://localhost:8000/api/";
    //API_URL : string = "http://37.59.31.134:8001/api/";

    kpis = [];

    constructor(
        private http: AuthenticatedHttpService,
        protected activatedRoute : ActivatedRoute,
        public navService : NavService,
    ) { }

    ngOnInit() {
        this.getKpis();
    }

    /**
     * Retrieves JWT token from localStorage and returns it if available. For use in HTTP requests
     * @method jwt
     * @return {[type]} [description]
     */
    private jwt() {
        // create authorization header with jwt token
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.token) {
            let headers = new Headers({ 'Authorization': 'JWT ' + currentUser.token });
            return new RequestOptions({ headers: headers });
        }
    }

    getKpis(){
        return this.http.get(this.API_URL+"kpis-full/", this.jwt())
           .toPromise()
           .then(response => {
               debugLogGroup(this.DEBUG, ["Promise result received for Kpi-manager.getKpis()",
                   response.json()]);
                this.kpis = response.json();
           })
           .catch(error => {
               console.error("PROMISE REJECTED : could not get data from api in kpi manager for kpis");
               console.log("error : "+error.json().detail);
               console.log(error.json());
           //    this.router.navigate(['/login'], { queryParams: { returnUrl : window.location.pathname }});
               return [];
           });
    }

} 
