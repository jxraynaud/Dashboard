import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-subview-base',
  templateUrl: './subview-base.component.html',
  styleUrls: ['./subview-base.component.css']
})
export class SubviewBaseComponent implements OnInit {

    @Output() clickFilter = new EventEmitter();

    constructor() { }

    ngOnInit() {
    }

    histogramClickFilter(event){
        this.clickFilter.emit(event);
    }

}
