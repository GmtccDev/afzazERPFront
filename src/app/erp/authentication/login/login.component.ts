import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from 'src/app/shared/common-services/user.service';
import { UserLoginService } from '../services/user-login-service'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LoginCompanyComponent } from './login-company/login-company.component';
import { Subscription } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { NotificationsAlertsService } from 'src/app/shared/common-services/notifications-alerts.service';
import { NotificationService } from 'src/app/shared/common-services/notification.service';
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
    dataBaseName: null
  });
  public errorMessage: any;
  // authService: any;
  public showLoader: boolean = false;
  currentSystemLanguage = 'en';
  companiesList: any;
  branchesList: any;
  subsList: Subscription[] = [];
  url: string;
  subDomain: string;
  dataBaseName: any;
  parts: string[];

  // public authService: AuthService,
  constructor(private fb: FormBuilder, public authService: UserLoginService,
    private modelService: NgbModal,
    private spinner: NgxSpinnerService, private notificationService: NotificationService,
    public router: Router, private userService: UserService, private translate: TranslateService) {

    this.currentSystemLanguage = this.userService.getCurrentSystemLanguage();
    this.userService.setCurrentLanguage(this.currentSystemLanguage);
    this.translate.use(this.currentSystemLanguage);
    if (this.currentSystemLanguage === 'ar') {
      document.getElementsByTagName("html")[0].setAttribute("dir", "rtl");
    }
    else {
      document.getElementsByTagName("html")[0].setAttribute("dir", "ltr");
    }

  }

  ngOnInit() {
    
    this.url = window.location.pathname;
   this.parts = this.url.split('/'); // Split the URL by "/"
    this.subDomain = this.parts[1]+"/"+this.parts[2]; // Get the second part (index 1) from the resulting array
   
    this.spinner.show();
    Promise.all([ this.getCustomer()])
      .then(a => {this.getCompanies()
        this.userService.logout();
        this.spinner.hide();

      }).catch(err => {
        this.spinner.hide();
      })

  }
  //#region ngOnDestroy
  ngOnDestroy() {
    this.subsList.forEach((s) => {
      if (s) {
        s.unsubscribe();
      }
    });
  }
  //#endregion
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
      this.subsList.push(sub);



    });

  }
  getCustomer() {
    return new Promise<void>((resolve, reject) => {

      let sub = this.authService.getCustomer(this.parts[2]).subscribe({
        next: (res) => {
          debugger
          if (res.success) {

            this.dataBaseName = res.response.databaseName;
            this.userService.setSubDomain(this.subDomain);
          }


          resolve();

        },
        error: (err: any) => {
          reject(err);
          this.notificationService.error("الدومين غير صحيح")

        },
        complete: () => {
          console.log('complete');
        },
      });
      this.subsList.push(sub);



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
      this.subsList.push(sub);



    });

  }

  // Simple Login
  login() {
    // this.router.navigate(['/dashboard/default']);
    // if (this.loginForm.value.userName == "admin" && this.loginForm.value.password == "admin") {

    // }
    this.loginForm.value.dataBaseName = this.dataBaseName
    let sub = this.authService.UserLoginLogin(this.loginForm.value).subscribe(
      next => {


        console.log(next);

        if (next.success == true) {

          //   this.translate.use("en");
          // let jwt = next.response.token;
          // let jwtData = jwt.split('.')[1]
          // let decodedJwtJsonData = window.atob(jwtData)
          // let decodedJwtData = JSON.parse(decodedJwtJsonData)
          // this.userService.setToken(jwt.toString());
          // let Role = decodedJwtData.role;
          // 
          // localStorage.setItem("userName",decodedJwtData.fullName)

          const modalRef = this.modelService.open(LoginCompanyComponent);

          modalRef.componentInstance.name = 'World';
          modalRef.componentInstance.userName = this.loginForm.value.userName;
          modalRef.componentInstance.password = this.loginForm.value.password;
          modalRef.componentInstance.companies = next.response.companies;
          modalRef.componentInstance.branches = next.response.branches;
          modalRef.result.then((result) => {
            if (result) {


              if (next.response.user.loginCount == null || next.response.user.loginCount == 0) {
                window.location.replace('authentication/add-password?email=' + next.response.user.email);
              }
              else {
                //   this.router.navigate(['/dashboard/default']);
              const  subdomain=localStorage.getItem('subDomain');
                this.router.navigate([subdomain+'/Subscription']);
              }
              this.modelService.dismissAll();
            }
          });
          //   if( next.response.user.loginCount==null ||next.response.user.loginCount==0){
          //     window.location.replace('authentication/add-password?email='+next.response.user.email);
          //   }
          //   else{
          //  //   this.router.navigate(['/dashboard/default']);
          //  this.router.navigate(['/Subscription']);
          //   }

        }
      },
      error => {

        this.showLoader = false;
        console.log(error)

      }
    )
    this.subsList.push(sub);


  }
  logout() {
    this.userService.logout();
  }
  isLoggedIn() {
    return this.userService.isLoggedIn();
  }
  changeLanguage(language: string) {
    this.userService.setLanguage(language);
    this.userService.setCurrentLanguage(language);
    window.location.reload();
  }
}
