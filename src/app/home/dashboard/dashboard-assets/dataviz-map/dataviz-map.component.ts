import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service'

@Component({
  selector: 'app-dataviz-map',
  templateUrl: './dataviz-map.component.html',
  styleUrls: ['./dataviz-map.component.css']
})
export class DatavizMapComponent implements OnInit {

  constructor(private dataService : DataService) { }

  ngOnInit() {
  }

}
