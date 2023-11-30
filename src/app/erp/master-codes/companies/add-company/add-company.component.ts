import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SharedService } from '../../../../shared/common-services/shared-service';
import { ToolbarPath } from '../../../../shared/interfaces/toolbar-path';
import { NgxSpinnerService } from 'ngx-spinner';
import { CODE_REQUIRED_VALIDATORS, EMAIL_VALIDATORS, NAME_REQUIRED_VALIDATORS, PHONE_VALIDATORS } from '../../../../shared/constants/input-validators';
import { Subscription } from 'rxjs';
import { ToolbarData } from '../../../../shared/interfaces/toolbar-data';
import { ToolbarActions } from '../../../../shared/enum/toolbar-actions';
import { navigateUrl } from '../../../../shared/helper/helper-url';
import { CompanyServiceProxy } from '../../services/company.service'
import { CompanyDto, CreateCompanyCommand, EditCompanyCommand } from '../../models/company';
import { CountryServiceProxy } from '../../../master-codes/services/country.servies';
import { CountryDto } from '../../../master-codes/models/country';
import { CurrencyServiceProxy } from '../../../master-codes/services/currency.servies';
import { CurrencyDto } from '../../models/currency';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-add-company',
  templateUrl: './add-company.component.html',
  styleUrls: ['./add-company.component.scss']
})
export class AddCompanyComponent implements OnInit {
  //#region Main Declarations
  companyForm!: FormGroup;
  sub: any;
  url: any;
  id: any = 0;
  currnetUrl;
  public show: boolean = false;
  lang = localStorage.getItem("language")
  company: CompanyDto[] = [];
  addUrl: string = '/master-codes/companies/add-company';
  updateUrl: string = '/master-codes/companies/update-company/';
  listUrl: string = '/master-codes/companies';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.company"),
    componentAdd: '',

  };
  response: any;
  errorMessage = '';
  errorClass = '';
  submited: boolean = false;
  countriesList: CountryDto[] = [];
  currencyList: CurrencyDto[] = [];
  files: any;
  logoPath: string;
  fullPathUpdate: string;
  logo: any;
  constructor(
    private countryService: CountryServiceProxy,
    private currencyService: CurrencyServiceProxy,
    private companyService: CompanyServiceProxy,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private SharedServices: SharedService, private translate: TranslateService,
    private cd: ChangeDetectorRef

  ) {
    this.defineCompanyForm();
  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    this.spinner.show();
    Promise.all([
      this.getCountries(),
      this.getCurrencies()

    ]).then(a => {

      this.getRouteData();
      this.changePath();
      this.listenToClickedButton();
      this.currnetUrl = this.router.url;
      if (this.currnetUrl == this.addUrl) {
        this.getCompanyCode();
      }
      this.spinner.hide();
    }).catch(err => {

      this.spinner.hide();
    });



  }

  //#endregion
  getRouteData() {
    let sub = this.route.params.subscribe((params) => {
      if (params['id'] != null) {
        this.id = params['id'];

        if (this.id) {
          this.getCompanyById(this.id).then(a => {
            this.SharedServices.changeButton({ action: 'Update',submitMode:false } as ToolbarData);
            this.spinner.hide();

          }).catch(err => {
            this.spinner.hide();

          });
        }
        else {
          this.SharedServices.changeButton({ action: 'New' } as ToolbarData);
          this.spinner.hide();
        }
      }
      else {
        this.SharedServices.changeButton({ action: 'New' } as ToolbarData);
        this.spinner.hide();
      }
    });
    this.subsList.push(sub);
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

  //#region Authentications

  //#endregion

  //#region Subscriptionss

  //#endregion

  //#region  State Management
  //#endregion

  //#region Basic Data
  ///Geting form dropdown list data
  defineCompanyForm() {
    this.companyForm = this.fb.group({
      id: 0,
      nameAr: NAME_REQUIRED_VALIDATORS,
      nameEn: null,
      code: CODE_REQUIRED_VALIDATORS,
      isActive: true,
      email: EMAIL_VALIDATORS,
      phoneNumber: PHONE_VALIDATORS,
      countryId: null,
      currencyId: null,
      motherCompany: false,
      useHijri: false,
      webSite: null,
      address: null,
      commercialRegistrationNo:null,
      mailBox:null,
      mobileNumber:PHONE_VALIDATORS,
      taxNumber:null,
      zipCode:null,
      // logo: null,

      // applications: ""
    });

  }
  getCountries() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.countryService.getDdl().subscribe({
        next: (res) => {

          if (res.success) {
            this.countriesList = res.response;

          }


          resolve();

        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {
          //console.log('complete');
        },
      });

      this.subsList.push(sub);
    });

  }
  getCurrencies() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.currencyService.getDdl().subscribe({
        next: (res) => {

          if (res.success) {
            this.currencyList = res.response;

          }


          resolve();

        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {
          //console.log('complete');
        },
      });

      this.subsList.push(sub);
    });

  }

  //#endregion

  //#region CRUD Operations
  getCompanyById(id: any) {
    return new Promise<void>((resolve, reject) => {
      let sub = this.companyService.getCompany(id).subscribe({
        next: (res: any) => {
          resolve();
          if (res.response.logo)
            this.logoPath = environment.apiUrl + "/wwwroot/Uploads/Company/" + res.response.logo;
          this.companyForm.setValue({
            id: res.response?.id,
            nameAr: res.response?.nameAr,
            nameEn: res.response?.nameEn,
            code: res.response?.code,
            isActive: res.response?.isActive,
            email: res.response?.email,
            phoneNumber: res.response?.phoneNumber,
            countryId: res.response?.countryId,
            currencyId: res.response?.currencyId,
            motherCompany: res.response?.motherCompany,
            useHijri: res.response?.useHijri,
            webSite: res.response?.webSite,
            address: res.response?.address,
            commercialRegistrationNo:res.response?.commercialRegistrationNo,
            mailBox:res.response?.mailBox,
            mobileNumber:res.response?.mobileNumber,
            taxNumber:res.response?.taxNumber,
            zipCode:res.response?.zipCode,
            // logo: res.response?.logo,


          });


        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {
          //console.log('complete');
        },
      });
      this.subsList.push(sub);

    });
  }
  showPassword() {
    this.show = !this.show;
  }
  getCompanyCode() {
    return new Promise<void>((resolve, reject) => {

      let sub = this.companyService.getLastCode().subscribe({

        next: (res: any) => {

          this.toolbarPathData.componentList = this.translate.instant("component-names.company");
          this.companyForm.patchValue({
            code: res.response
          });

        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {
          //console.log('complete');
        },
      });
      this.subsList.push(sub);


    });
  }
  //#endregion

  //#region Helper Functions

  get f(): { [key: string]: AbstractControl } {
    return this.companyForm.controls;
  }


  //#endregion
  //#region Tabulator
  subsList: Subscription[] = [];
  currentBtnResult;
  listenToClickedButton() {
    let sub = this.SharedServices.getClickedbutton().subscribe({
      next: (currentBtn: ToolbarData) => {
        currentBtn;

        if (currentBtn != null) {
          if (currentBtn.action == ToolbarActions.List) {
            this.SharedServices.changeToolbarPath({
              listPath: this.listUrl,
            } as ToolbarPath);
            this.router.navigate([this.listUrl]);
          } else if (currentBtn.action == ToolbarActions.Save) {
            this.onSave();
          } else if (currentBtn.action == ToolbarActions.New) {
            this.toolbarPathData.componentAdd = this.translate.instant("company.add-company");
            if (this.companyForm.value.code != null) {
              this.getCompanyCode()
            }
            this.defineCompanyForm();
            this.SharedServices.changeToolbarPath(this.toolbarPathData);
          }else if (currentBtn.action == ToolbarActions.Update && currentBtn.submitMode) {
            this.onUpdate();
          }
          else if (currentBtn.action == ToolbarActions.Copy) {
           this.getCompanyCode();
          }
        }
      },
    });
    this.subsList.push(sub);
  }
  changePath() {
    this.SharedServices.changeToolbarPath(this.toolbarPathData);
  }
  confirmSave() {
    var entity = new CreateCompanyCommand();

    return new Promise<void>((resolve, reject) => {
      entity = this.companyForm.value;
      entity.logo = this.logo;
      let sub = this.companyService.createCompany(entity).subscribe({
        next: (result: any) => {
          this.spinner.show();
          this.response = { ...result.response };
          this.defineCompanyForm();
          this.submited = false;
          this.spinner.hide();

          navigateUrl(this.listUrl, this.router);
        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {
          //console.log('complete');
        },
      });
      this.subsList.push(sub);

    });
  }
  onSave() {
    if (this.companyForm.valid) {
      this.spinner.show();
      this.confirmSave().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });

    } else {

      return this.companyForm.markAllAsTouched();
    }
  }
  confirmUpdate() {
    var entity = new EditCompanyCommand();
    this.companyForm.value.id = this.id;
    entity = this.companyForm.value;
    entity.id = this.id;
    entity.logo = this.logo;
    return new Promise<void>((resolve, reject) => {
      let sub = this.companyService.updateCompany(entity).subscribe({
        next: (result: any) => {
          this.spinner.show();
          this.response = { ...result.response };
          this.defineCompanyForm();
          this.submited = false;
          this.spinner.hide();
          navigateUrl(this.listUrl, this.router);
        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {
          //console.log('complete');
        },
      });
      this.subsList.push(sub);

    });

  }

  onUpdate() {
    if (this.companyForm.valid) {
      this.spinner.show();
      this.confirmUpdate().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });


    }

    else {

      return this.companyForm.markAllAsTouched();
    }
  }
  onFileChange(event) {
    let reader = new FileReader();

    if (event.target.files && event.target.files.length) {
      this.files = event.target.files;
      this.upload(this.files);
      reader.onload = () => {
        this.cd.markForCheck();
      };
      this.cd.markForCheck();
    }
  }

  upload(files) {
    if (files != null) {
      if (files.length === 0)
        return;
      const formData = new FormData();
      for (let file of files) {
        formData.append(file.name, file);
      }

      let sub = this.companyService.uploadFile(formData).subscribe((res: any) => {

        this.logoPath = environment.apiUrl + "/wwwroot/Uploads/Company/" + res.response;
        this.logo = res.response;
      })
      this.subsList.push(sub);


    }
  }



}

