import { Injectable } from '@angular/core';


@Injectable()
export class NavService {

    opened: boolean = false;
    private navMode="push";
    private navPosition="left";
    private navAutoCollapse="";

    toggleSidebar() {
      this.opened = !this.opened;
    }

    activeViews = {
        frauddetector : "overview",
        multiattribution : "overview",
    }

    //Has to be bound to onOpened and onClosed because (openedChange) event trigger
    //when automatically closes (when screen too small) => "maximum call stack exceeded"
    onNavToggle($event){
        window.dispatchEvent(new Event('resize'));
    }

    constructor() { }


}
