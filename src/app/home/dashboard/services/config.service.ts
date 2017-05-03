import { Injectable, Inject } from '@angular/core';

import { BehaviorSubject }    from 'rxjs/BehaviorSubject';

@Injectable()
export class ConfigService {
    DEBUG: boolean = true;
    private debugLog(str){ this.DEBUG && console.log(str); }

    configBehaviorSubject = new BehaviorSubject<{}>({});

    constructor() {

    }

    setConfigFile(configJson:{}){
        this.configBehaviorSubject.next(configJson);
    }


}
