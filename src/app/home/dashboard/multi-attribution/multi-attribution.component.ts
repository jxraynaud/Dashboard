import { Component, OnInit } from '@angular/core';

import { DataService } from '../services/data.service'

@Component({
  selector: 'app-multi-attribution',
  templateUrl: './multi-attribution.component.html',
  styleUrls: ['./multi-attribution.component.css']
})
export class MultiAttributionComponent implements OnInit {

  constructor(public dataService : DataService) { }

  ngOnInit() {
  }

}
