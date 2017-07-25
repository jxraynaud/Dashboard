import { Injectable } from '@angular/core';
import { /*Http,*/ Headers, RequestOptions, Response } from '@angular/http';

import { AuthenticatedHttpService } from './authenticatedHttpService';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import appConfig from '../app.config.json';

@Injectable()
export class ChangePasswordService {

    constructor(
        private http: AuthenticatedHttpService,
    ) { }

    changePassword(oldPassword:string, newPassword:string, confirmNewPassword:string){
        return this.http.post(appConfig.passwordChange.url + appConfig.passwordChange.endpoint, { new_password1 : newPassword, new_password2 : confirmNewPassword, old_password : oldPassword }, this.jwt())
            .map((response: Response) => {
                return response.json();
            });
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


}
