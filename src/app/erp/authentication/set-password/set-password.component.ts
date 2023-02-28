import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { UserLoginService } from '../services/user-login-service';
@Component({
	selector: 'app-set-password',
	templateUrl: './set-password.component.html',
	styleUrls: ['./set-password.component.scss']
})
export class SetPasswordComponent implements OnInit {

	public show: boolean = false;
	public SetPasswordForm = this.fb.group({
		userName: [, [Validators.required]],
		password: [, Validators.required]
	});
	public errorMessage: any;
	// authService: any;
	public showLoader: boolean = false;
	// public authService: AuthService,
	constructor(private fb: FormBuilder, public authService: UserLoginService, public router: Router) {

	}

	ngOnInit() {
	}

	showPassword() {
		this.show = !this.show;
	}

	// Simple SetPassword
	SetPassword() {


	}

}
