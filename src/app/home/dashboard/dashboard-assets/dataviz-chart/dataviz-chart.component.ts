import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service'

@Component({
  selector: 'app-dataviz-chart',
  templateUrl: './dataviz-chart.component.html',
  styleUrls: ['./dataviz-chart.component.css']
})
export class DatavizChartComponent implements OnInit {

  constructor(private dataService : DataService) { }

  ngOnInit() {
  }

}
