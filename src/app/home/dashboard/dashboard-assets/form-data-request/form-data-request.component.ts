import { Component, OnInit } from '@angular/core';
import { DataRequestService } from '../../services/data-request.service';

@Component({
  selector: 'app-form-data-request',
  templateUrl: './form-data-request.component.html',
  styleUrls: ['./form-data-request.component.css']
})
export class FormDataRequestComponent implements OnInit {

  constructor(private dataRequestService : DataRequestService) { }

  ngOnInit() {
  }

}
