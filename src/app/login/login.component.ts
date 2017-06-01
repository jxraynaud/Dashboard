import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { TdLoadingService } from '@covalent/core';

import 'rxjs/add/observable/throw';


import { AuthenticationService } from '../services/authentication.service';
import { AlertService } from '../services/alert.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

    model : any = {};
    returnUrl: string;
    returnUrlParams : Object;

    constructor(
        private route:ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService,
        private alertService: AlertService,
    ) { }

    ngOnInit() {
        // reset login status
        //this.authenticationService.logout();

        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'].split("?")[0] || '/';
        this.returnUrlParams = this.getQueryParamsObject(this.route.snapshot.queryParams['returnUrl']);
    }

    login(): void {
        this.authenticationService.login(this.model.username, this.model.password)
            .subscribe(
                data => {
                    this.router.navigate([this.returnUrl], { queryParams: this.returnUrlParams } );
                },
                error => {
                    this.alertService.error(error._body);
                }
            );
    }

    getQueryParamsObject(url){
        let paramsArray = url.split("?")[1].split("&");
        let paramsObject = {};
        paramsArray.map(e=>{
            let key = e.split("=")[0];
            let value = e.split("=")[1];
            paramsObject[key]=value;
        })
        return paramsObject;
    }
}
