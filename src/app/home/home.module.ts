import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CovalentCoreModule } from '@covalent/core';

import { HomeComponent } from './home.component';
import { DefaultComponent } from './default/default.component';
import { UserAccountComponent } from './user-account/user-account.component';

import { DashboardModule } from './dashboard/dashboard.module';

import { AuthGuard } from './auth.guard';

import { HomeRoutingModule } from './home-routing.module';

@NgModule({
    imports: [
        CommonModule,
        CovalentCoreModule,
        HomeRoutingModule,
    ],
    providers: [
        AuthGuard,
    ],
    declarations: [
        HomeComponent,
        DefaultComponent,
        UserAccountComponent,
    ]
})
export class HomeModule { }
