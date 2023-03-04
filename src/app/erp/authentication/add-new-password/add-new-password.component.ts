import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from 'src/app/shared/common-services/user.service';
import { UserServiceProxy } from '../../security/services/user-service';

@Component({
  selector: 'app-add-new-password',
  templateUrl: './add-new-password.component.html',
  styleUrls: ['./add-new-password.component.scss']
})
export class AddNewPasswordComponent implements OnInit {
  passForm: FormGroup;
  currentSystemLanguage: string;

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private userService: UserServiceProxy,
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
   email=''
  initForm(): void {
  
    
    this.passForm = this.fb.group({
      email:this.route.snapshot.queryParams['email'],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmNewPassword: ['', [Validators.required, Validators.minLength(8)]]
    },
      { validator: this.doesPasswordsMatch('newPassword', 'confirmNewPassword') }
    );
  }

  get f() { return this.passForm.controls; }

  onSubmit() {
    
    this.userService.addPassWord(this.passForm.getRawValue())
      .subscribe(res => {
        if (res.success) {

         
          this.passForm.reset();
       
          this.router.navigate(['/authentication/login']);
        } 
      },
        (err) => {
          console.log(err)
        
        }
      );
  }


  doesPasswordsMatch(passwordKey: string, passwordConfirmationKey: string) {
    return (group: FormGroup) => {
      let passwordInput = group.controls[passwordKey],
        passwordConfirmationInput = group.controls[passwordConfirmationKey];
      if (passwordInput.value !== passwordConfirmationInput.value) {
        return passwordConfirmationInput.setErrors({ notEquivalent: true })
      }
      else {
        return passwordConfirmationInput.setErrors(null);
      }
    }
  }
}