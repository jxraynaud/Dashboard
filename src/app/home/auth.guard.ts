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
    DEBUG : boolean = false;
    private debugLog(str){ this.DEBUG && console.log(str); }

    constructor(
        private router: Router,
    ) { }

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> | Promise<boolean> | boolean {
        this.debugLog("Starting auth guard");
        if (localStorage.getItem('currentUser')) {
            // logged in so return true
            let user = JSON.parse(localStorage.getItem('currentUser'));
            let exp_timestamp = JSON.parse(atob(user.token.split('.')[1])).exp;
            this.debugLog("Time out datetime:");
            this.debugLog(new Date(exp_timestamp*1000) );
            this.debugLog("Current datetime:");
            this.debugLog(new Date());
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
        this.debugLog("canActivateChild fired");
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
