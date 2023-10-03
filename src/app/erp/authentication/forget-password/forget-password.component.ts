import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from 'src/app/shared/common-services/user.service';
import { UserServiceProxy } from '../../security/services/user-service';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.scss']
})
export class ForgetPasswordComponent implements OnInit {

  public show: boolean = false;
  public forgetForm = this.fb.group({
    email: ['', [Validators.required]]
  });
  public errorMessage: any;
  // authService: any;
  public showLoader: boolean = false;
  currentSystemLanguage = 'en';
  // public authService: AuthService,
  constructor(private fb: FormBuilder, public authService: UserServiceProxy,
    
     public router: Router,  private userService: UserService,private translate:TranslateService) {
      
      this.currentSystemLanguage = this.userService.getCurrentSystemLanguage();
      this.translate.use(this.currentSystemLanguage);
      if (this.currentSystemLanguage === 'ar') {
        document.getElementsByTagName("html")[0].setAttribute("dir", "rtl");
      }
      else {
        document.getElementsByTagName("html")[0].setAttribute("dir", "ltr");
      }
  
  }

  ngOnInit() {
   
  }

  showPassword() {
    this.show = !this.show;
  }

  // Simple Login
  login() {
  
    this.authService.forgetPassword(this.forgetForm.value).subscribe(
      next => {

        
        console.log(next);

        if (next.success == true) {
          
     
        }
      },
      error => {
        
        this.showLoader = false;
        console.log(error)

      }
    )

  }
  logout() {
    this.router.navigate(['/authentication/login'])
  }
  isLoggedIn() {
    return this.userService.isLoggedIn();
  }
  changeLanguage(language: string) {
    this.userService.setLanguage(language);
    window.location.reload();
  }
}
