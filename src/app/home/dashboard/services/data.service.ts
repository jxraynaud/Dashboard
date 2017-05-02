import { Injectable, Inject } from '@angular/core';
import { InjectionToken } from '@angular/core';

//Methode 1 : injection without ''
//export const VIEW_CONFIG = new InjectionToken<any>('test2');
//Methode 2 : injection with '' : nothing
//Methode 3 : factory : nothing


@Injectable()
export class DataService {
    DEBUG: boolean = false;
    private debugLog(str){ this.DEBUG && console.log(str); }

    constructor(
        //Methode 1 : injection without ''
        //@Inject(VIEW_CONFIG) private viewConfig : any,

        ////Methode 2 : injection with ''
        //@Inject('VIEW_CONFIG') private viewConfig : any

        //Methode 3/4 : factory
        private viewConfig : any
    ) {

      }

}
