import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '@angular/material';
/*import { MdChip, MdDialogRef, MdDialog, MdDialogConfig,
     MdSidenav, MdIconRegistry } from "@angular/material";*/

import { CovalentCoreModule } from '@covalent/core';

import { Daterangepicker } from 'ng2-daterangepicker';

import { KpiManagerComponent } from './kpi-manager.component';
import { KpiManagerRoutingModule } from './kpi-manager-routing.module'

//import {TableModule} from 'primeng/table';

@NgModule({
  imports: [
    CommonModule,
    CovalentCoreModule,
    MaterialModule,
    Daterangepicker,
    KpiManagerRoutingModule,
    //TableModule,
  ],
  declarations: [KpiManagerComponent]
})
export class KpiManagerModule { }
