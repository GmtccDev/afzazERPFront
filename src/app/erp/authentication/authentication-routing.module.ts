import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthenticationComponent } from './authentication.component';
import { LoginComponent } from './login/login.component';
import { VerificationCodeComponent } from './verification-code/verification-code.component';
import { AddNewPasswordComponent } from './add-new-password/add-new-password.component';



const routes: Routes = [
	{
		path: '',
		children: [

			{
				path: 'login',
				component: LoginComponent
			},
			{
				path: 'verification-code',
				component: VerificationCodeComponent
			},

			{
				path: 'add-password',
				component: AddNewPasswordComponent,
			
			},


		]
	},

];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class AuthenticationRoutingModule { }
