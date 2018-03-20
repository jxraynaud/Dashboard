import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '@angular/material';

import { CovalentCoreModule } from '@covalent/core';

import { FileUploadModule } from 'ng2-file-upload';
import { PapaParseModule } from 'ngx-papaparse';

import { CostManagerComponent } from './cost-manager.component';
import { CostManagerRoutingModule } from './cost-manager-routing.module';

@NgModule({
  imports: [
    CommonModule,
    CovalentCoreModule,
    MaterialModule,
    FileUploadModule,
    PapaParseModule,
    CostManagerRoutingModule,
  ],
  declarations: [CostManagerComponent]
})
export class CostManagerModule { }
