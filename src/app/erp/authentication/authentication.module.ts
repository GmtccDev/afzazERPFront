import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthenticationRoutingModule } from './authentication-routing.module';
import { AuthenticationComponent } from './authentication.component';

import { UserLoginService } from './services/user-login-service';
import { LoginComponent } from './login/login.component';
import { VerificationCodeComponent } from './verification-code/verification-code.component';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { RouterModule } from '@angular/router';
import { AddNewPasswordComponent } from './add-new-password/add-new-password.component';



@NgModule({
	declarations: [

		AuthenticationComponent,

		LoginComponent,
		VerificationCodeComponent,
		AddNewPasswordComponent,



	],
	entryComponents: [
		AuthenticationComponent
	],
	imports: [
		CommonModule,
		FormsModule,
		NgbModule,
		ReactiveFormsModule,
		AngularMultiSelectModule,
		SharedModule, AuthenticationRoutingModule,
	],
	providers: [UserLoginService]
})
export class AuthenticationModule { }
