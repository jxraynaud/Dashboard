import { Injectable } from '@angular/core';
import {
  Router,
  Route,
  CanActivate,
  CanActivateChild,
  CanLoad,
  ActivatedRouteSnapshot,
  RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {

    constructor(
        private router: Router,
    ) { }

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> | Promise<boolean> | boolean {
        console.log("Starting auth guard");
        if (localStorage.getItem('currentUser')) {
            // logged in so return true
            let user = JSON.parse(localStorage.getItem('currentUser'));
            let exp_timestamp = JSON.parse(atob(user.token.split('.')[1])).exp;
            console.log("Time out datetime:");
            console.log(new Date(exp_timestamp*1000) );
            console.log("Current datetime:");
            console.log(new Date());
            if (new Date(exp_timestamp*1000) > new Date()) {
                return true;
            }
        }
        // not logged or expired timestamp in so redirect to login page with the return url
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
        return false;
    }

    canActivateChild(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> | Promise<boolean> | boolean {
        console.log("canActivateChild fired");
        return this.canActivate(route, state);
    }

    canLoad(route: Route): boolean {
        if (localStorage.getItem('currentUser')) {
            // logged in so return true
            return true;
        }
        return false;
    }
}
