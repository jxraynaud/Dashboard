import { Injectable } from '@angular/core';
import { /*Http,*/ Headers, Response } from '@angular/http';

import { AuthenticatedHttpService } from './authenticatedHttpService';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import appConfig from '../app.config.json';


@Injectable()
export class AuthenticationService {
    constructor(
        //private http: Http,
        private http: AuthenticatedHttpService,
    ) { }

    login(username: string, password: string) {
        return this.http.post(appConfig.authentication.url + appConfig.authentication.endpoint, { username: username, password: password })
            .map((response: Response) => {
                // login successful if there's a jwt token in the response
                let user = response.json();
                if (user && user.token) {
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('currentUser', JSON.stringify(user));
                }
            });
    }

    logout() {
        console.log("logout() called!")
        // remove user from local storage to log user out
        localStorage.removeItem('currentUser');
    }
}
