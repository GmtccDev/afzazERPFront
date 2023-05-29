import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from 'src/app/shared/common-services/user.service';
import { UserLoginService } from '../services/user-login-service'
import { CompanyServiceProxy } from '../../master-codes/services/company.service';
import { BranchServiceProxy } from '../../master-codes/services/branch.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public show: boolean = false;
  public loginForm = this.fb.group({
    userName: ['', [Validators.required]],
    password: ['', Validators.required],
    companyId: ['', [Validators.required]],
    branchId:['', [Validators.required]],
  });
  public errorMessage: any;
  // authService: any;
  public showLoader: boolean = false;
  currentSystemLanguage = 'en';
  companiesList: any;
  branchesList: any;
  // public authService: AuthService,
  constructor(private fb: FormBuilder, public authService: UserLoginService,

    
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
    this.getCompanies();
    this.userService.logout();
  }

  showPassword() {
    this.show = !this.show;
  }
  getCompanies() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.authService.getDdl().subscribe({
        next: (res) => {

          if (res.success) {
            this.companiesList = res.response;

          }


          resolve();

        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {
          console.log('complete');
        },
      });

     
    });

  }
  onChangeCompany(values) {
   
    return new Promise<void>((resolve, reject) => {

      let sub = this.authService.getDdlWithCompanies(values).subscribe({
        next: (res) => {

          if (res.success) {
            

            this.branchesList = res.response;
           


          }


          resolve();

        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {
          console.log('complete');
        },
      });

    
    });

  }

  // Simple Login
  login() {
    // this.router.navigate(['/dashboard/default']);
    // if (this.loginForm.value.userName == "admin" && this.loginForm.value.password == "admin") {

    // }

    this.authService.UserLoginLogin(this.loginForm.value).subscribe(
      next => {

        
        console.log(next);

        if (next.success == true) {
          debugger
       //   this.translate.use("en");
          let jwt = next.response.token;
          let jwtData = jwt.split('.')[1]
          let decodedJwtJsonData = window.atob(jwtData)
          let decodedJwtData = JSON.parse(decodedJwtJsonData)
          this.userService.setToken(jwt.toString());
          let Role = decodedJwtData.role;
          debugger
          localStorage.setItem("userName",decodedJwtData.fullName)
          localStorage.setItem("branchId",this.loginForm.value.branchId)
          localStorage.setItem("companyId",this.loginForm.value.companyId)

          if( next.response.user.loginCount==null ||next.response.user.loginCount==0){
            window.location.replace('authentication/add-password?email='+next.response.user.email);
          }
          else{
         //   this.router.navigate(['/dashboard/default']);
         this.router.navigate(['/Subscription']);
          }
         
        }
      },
      error => {
        
        this.showLoader = false;
        console.log(error)

      }
    )

  }
  logout() {
    this.userService.logout();
  }
  isLoggedIn() {
    return this.userService.isLoggedIn();
  }
  changeLanguage(language: string) {
    this.userService.setLanguage(language);
    window.location.reload();
  }
}
