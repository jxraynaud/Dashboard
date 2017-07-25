import { Injectable } from '@angular/core';
import { /*Http,*/ Headers, Response } from '@angular/http';

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
        return this.http.post(appConfig.passwordChange.url + appConfig.passwordChange.endpoint, { new_password1 : newPassword, new_password2 : confirmNewPassword, old_password : oldPassword })
            .map((response: Response) => {
                console.log(response)
            });
    }

}
