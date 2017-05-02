import { Injectable, Inject } from '@angular/core';
import { InjectionToken } from '@angular/core';

@Injectable()
export class DataService {
    DEBUG: boolean = false;
    private debugLog(str){ this.DEBUG && console.log(str); }

    constructor(
        private viewConfig : any
    ) {
            console.log("Data service instanciated with : ");
            console.log(viewConfig);
      }

}

export function dataServiceFactory(configObject) {
  return () => new DataService(configObject);
}
