import { Component, OnInit } from '@angular/core';
import { DataFiltersService } from '../../services/data-filters.service';

@Component({
  selector: 'app-form-data-filters',
  templateUrl: './form-data-filters.component.html',
  styleUrls: ['./form-data-filters.component.css']
})
export class FormDataFiltersComponent implements OnInit {

  constructor(private dataFiltersService : DataFiltersService) { }

  ngOnInit() {
  }

}
