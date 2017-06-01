import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
//import { HttpModule } from '@angular/http';

import { Http } from '@angular/http';
import { AuthenticatedHttpService } from './services/authenticatedHttpService'
import { RouterModule }   from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { CovalentCoreModule } from '@covalent/core';
import { NavService } from './services/nav.service';

import { AppComponent } from './app.component';
import { MaterialModule } from '@angular/material';

import { HomeModule } from './home/home.module';
import { AppRoutingModule } from './app-routing.module';

import { LoginComponent } from './login/login.component';
import { NotFoundComponent } from './not-found/not-found.component';

import { AuthenticationService } from './services/authentication.service'
import { AlertService } from './services/alert.service';
import { AlertComponent } from './alert/alert.component'

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    NotFoundComponent,
    AlertComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    //HttpModule,
    CovalentCoreModule.forRoot(),
    MaterialModule,
    HomeModule,
    AppRoutingModule,
  ],
  providers: [
      //{ provide: Http, useClass: AuthenticatedHttpService },
      AuthenticatedHttpService,
      AuthenticationService,
      AlertService,
      NavService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
