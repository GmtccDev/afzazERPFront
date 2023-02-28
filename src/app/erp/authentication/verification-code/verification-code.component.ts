import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from 'src/app/shared/common-services/user.service';
import { CustomerServiceProxy } from '../../security/services/customer-service';
@Component({
	selector: 'app-verification-code',
	templateUrl: './verification-code.component.html',
	styleUrls: ['./verification-code.component.scss']
})
export class VerificationCodeComponent implements OnInit {
	verifyCodeForm: FormGroup;
	currentSystemLanguage: string;
  
	constructor(private fb: FormBuilder, private route: ActivatedRoute, private userService: CustomerServiceProxy,
	  public router: Router,  private userServiceInfo: UserService,private translate:TranslateService) 
	  {
		
		this.currentSystemLanguage = this.userServiceInfo.getCurrentSystemLanguage();
		this.translate.use(this.currentSystemLanguage);
		if (this.currentSystemLanguage === 'ar') {
		  document.getElementsByTagName("html")[0].setAttribute("dir", "rtl");
		}
		else {
		  document.getElementsByTagName("html")[0].setAttribute("dir", "ltr");
		}
	  }
  
	ngOnInit(): void {
	  this.initForm();
	}
	
	initForm(): void {
	
	  
	  this.verifyCodeForm = this.fb.group({
		email:this.route.snapshot .queryParams['email'],
		code: ['', [Validators.required, Validators.minLength(8)]],
	  }
	  );
	}
  
	get f() { return this.verifyCodeForm.controls; }
  
	onSubmit() {
	  
	  this.userService.verifyCode(this.verifyCodeForm.getRawValue())
		.subscribe(res => {
		  if (res.success) {
  
		   
			this.verifyCodeForm.reset();
		 
			this.router.navigate(['/authentication/login']);
		  } 
		},
		  (err) => {
			console.log(err)
		  
		  }
		);
	}
  
}  