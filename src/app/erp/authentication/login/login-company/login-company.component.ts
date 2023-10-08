import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from 'src/app/shared/common-services/user.service';
import { UserLoginService } from '../../services/user-login-service'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GeneralConfigurationServiceProxy } from 'src/app/erp/Accounting/services/general-configurations.services';
import { FiscalPeriodServiceProxy } from 'src/app/erp/Accounting/services/fiscal-period.services';
import { DateConverterService } from 'src/app/shared/services/date-services/date-converter.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login-company',
  templateUrl: './login-company.component.html',
  styleUrls: ['./login-company.component.scss']
})
export class LoginCompanyComponent implements OnInit {
  @Input() userName;
  @Input() password;
  @Input() companies;
  public show: boolean = false;
  public loginForm = this.fb.group({
    userName: [''],
    password: [''],
    companyId: ['', [Validators.required]],
    branchId: ['', [Validators.required]],
  });
  public errorMessage: any;
  // authService: any;
  public showLoader: boolean = false;
  currentSystemLanguage = 'en';
  companiesList: any;
  branchesList: any;
  facialPeriodId: any;
  fromDateOfFacialPeriod: any;
  toDateOfFacialPeriod: any;
  subsList: Subscription[] = [];

  constructor(private fb: FormBuilder, public authService: UserLoginService,
    private modelService: NgbModal,
    private generalConfigurationService: GeneralConfigurationServiceProxy,
    private fiscalPeriodService: FiscalPeriodServiceProxy,
    private dateConverterService: DateConverterService,
    public router: Router, private userService: UserService, private translate: TranslateService) {
    
    this.currentSystemLanguage = this.userService.getCurrentLanguage();
    this.translate.use(this.currentSystemLanguage);
    this.userService.setLanguage(this.currentSystemLanguage)
    if (this.currentSystemLanguage === 'ar') {
      document.getElementsByTagName("html")[0].setAttribute("dir", "rtl");
    }
    else {
      document.getElementsByTagName("html")[0].setAttribute("dir", "ltr");
    }

  }

  ngOnInit() {
    
    //   this.companiesList = this.companies;
    this.getCompanies();
    this.userService.removeToken();
    this.userService.removeRefreshToken();
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

    this.loginForm.value.userName = this.userName;
    this.loginForm.value.password = this.password;
    let sub = this.authService.UserLoginCompany(this.loginForm.value).subscribe(
      next => {


        console.log(next);

        if (next.success == true) {

          //   this.translate.use("en");
          let jwt = next.response.token;
          let jwtData = jwt.split('.')[1]
          let decodedJwtJsonData = window.atob(jwtData)
          let decodedJwtData = JSON.parse(decodedJwtJsonData)
          this.userService.setToken(jwt.toString());
          let Role = decodedJwtData.role;

          localStorage.setItem("userId", decodedJwtData.userLoginId)
          this.userService.setUserName(decodedJwtData.fullName)
          this.userService.setBranchId(this.loginForm.value.branchId)
          this.userService.setCompanyId(this.loginForm.value.companyId)
          // this.getGeneralConfigurationsOfAccountingPeriod()
          this.modelService.dismissAll();
          if (next.response.user.loginCount == null || next.response.user.loginCount == 0) {
            window.location.replace('authentication/add-password?email=' + next.response.user.email);
          }
          else {
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
    window.location.reload();
  }
  getGeneralConfigurationsOfAccountingPeriod() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.generalConfigurationService.getGeneralConfiguration(6).subscribe({
        next: (res: any) => {

          console.log('result data getbyid', res);
          if (res.response.value > 0) {

            this.facialPeriodId = res.response.value;
            this.getfiscalPeriodById(this.facialPeriodId);
          }


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
  getfiscalPeriodById(id: any) {
    return new Promise<void>((resolve, reject) => {
      let sub = this.fiscalPeriodService.getFiscalPeriod(id).subscribe({
        next: (res: any) => {

          console.log('result data getbyid', res);
          this.fromDateOfFacialPeriod = this.dateConverterService.getDateForCalender(res.response.fromDate);
          this.toDateOfFacialPeriod = this.dateConverterService.getDateForCalender(res.response.toDate);
          localStorage.setItem("fromDateOfFacialPeriod", this.fromDateOfFacialPeriod)
          localStorage.setItem("toDateOfFacialPeriod", this.toDateOfFacialPeriod)

          //formatDate(Date.parse(res.response.fromDate)),
          // this.selectedToDate=formatDate(Date.parse(res.response.toDate)),


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
}
