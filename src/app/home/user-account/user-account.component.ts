import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { TdLoadingService } from '@covalent/core';

import 'rxjs/add/observable/throw';

import { ChangePasswordService } from '../../services/change-password.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-user-account',
  templateUrl: './user-account.component.html',
  styleUrls: ['./user-account.component.css']
})
export class UserAccountComponent implements OnInit {

  model : any = {};

  constructor(
      private route : ActivatedRoute,
      private router : Router,
      private changePasswordService: ChangePasswordService,
      private alertService: AlertService,
  ) { }

  ngOnInit() {
  }

  changePassword():void{
      this.changePasswordService.changePassword(this.model.oldPassword, this.model.newPassword, this.model.confirmNewPassword)
          .subscribe(
              data => {
                  console.warn(data)
              },
              error => {
                  this.alertService.error(error._body);
              }
          );
  }

}
