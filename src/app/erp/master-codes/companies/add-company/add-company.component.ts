import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SharedService } from '../../../../shared/common-services/shared-service';
import { ToolbarPath } from '../../../../shared/interfaces/toolbar-path';
import { NgxSpinnerService } from 'ngx-spinner';
import { CODE_REQUIRED_VALIDATORS, EMAIL_VALIDATORS, NAME_REQUIRED_VALIDATORS, PHONE_VALIDATORS, REQUIRED_VALIDATORS } from '../../../../shared/constants/input-validators';
import { Subscription } from 'rxjs';
import { ToolbarData } from '../../../../shared/interfaces/toolbar-data';
import { ToolbarActions } from '../../../../shared/enum/toolbar-actions';
import { navigateUrl } from '../../../../shared/helper/helper-url';
import { CompanyServiceProxy } from '../../services/company.service'
import { CompanyDto, CreateCompanyCommand, EditCompanyCommand } from '../../models/company';
import { CountryServiceProxy } from '../../../master-codes/services/country.servies';
import { CountryDto } from '../../../master-codes/models/country';
import { CurrencyServiceProxy } from '../../../master-codes/services/currency.servies';
import * as Tabulator from 'tabulator-tables/dist/js/tabulator';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MessageModalComponent } from 'src/app/shared/components/message-modal/message-modal.component';
import format from 'date-fns/format';
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
  Response: any;
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
    private modelService: NgbModal,
    private cd: ChangeDetectorRef

  ) {
    this.definecompanyForm();
  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {

    this.getCountries();
    this.getCurrencies();
    this.currnetUrl = this.router.url;
    this.listenToClickedButton();
    this.changePath();
    if (this.currnetUrl == this.addUrl) {
      this.getcompanyCode();
    }
    this.sub = this.route.params.subscribe((params) => {
      if (params['id'] != null) {
        this.id = params['id'];

        if (this.id) {
          this.getcompanyById(this.id);
        }
        this.url = this.router.url.split('/')[2];
      }
    });
  }

  //#endregion

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
  definecompanyForm() {
    this.companyForm = this.fb.group({
      id: 0,
      nameAr: NAME_REQUIRED_VALIDATORS,
      nameEn: NAME_REQUIRED_VALIDATORS,
      code: CODE_REQUIRED_VALIDATORS,
      isActive: true,
      email: EMAIL_VALIDATORS,
      phoneNumber: null,
      countryId: REQUIRED_VALIDATORS,
      currencyId: null,
      motherCompany: false,
      useHijri: false,
      logoPath: null,

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
          console.log('complete');
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
          console.log('complete');
        },
      });

      this.subsList.push(sub);
    });

  }

  //#endregion

  //#region CRUD Operations
  getcompanyById(id: any) {

    const promise = new Promise<void>((resolve, reject) => {
      this.companyService.getCompany(id).subscribe({
        next: (res: any) => {
          this.logoPath = environment.apiUrl + "/wwwroot/Uploads/Company/" + res.response.logo;
          console.log('result data getbyid', res);
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
            logo: res.response?.logo,


          });

          console.log(
            'this.companyForm.value set value',
            this.companyForm.value
          );
        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {
          console.log('complete');
        },
      });
    });
    return promise;
  }
  showPassword() {
    this.show = !this.show;
  }
  getcompanyCode() {
    const promise = new Promise<void>((resolve, reject) => {

      this.companyService.getLastCode().subscribe({

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
          console.log('complete');
        },
      });
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
            this.toolbarPathData.componentAdd = 'Add company';
            this.definecompanyForm();
            this.SharedServices.changeToolbarPath(this.toolbarPathData);
          } else if (currentBtn.action == ToolbarActions.Update) {
            this.onUpdate();
          }
        }
      },
    });
    this.subsList.push(sub);
  }
  changePath() {
    this.SharedServices.changeToolbarPath(this.toolbarPathData);
  }
  onSave() {
    var entity = new CreateCompanyCommand();
    if (this.companyForm.valid) {
      const promise = new Promise<void>((resolve, reject) => {
        entity.inputDto = this.companyForm.value;
        entity.inputDto.logo == this.logo;
        this.companyService.createCompany(entity).subscribe({
          next: (result: any) => {
            this.spinner.show();
            console.log('result dataaddData ', result);
            this.Response = { ...result.response };
            this.definecompanyForm();

            this.submited = false;
            setTimeout(() => {
              this.spinner.hide();

              navigateUrl(this.listUrl, this.router);
            }, 1000);
          },
          error: (err: any) => {
            reject(err);
          },
          complete: () => {
            console.log('complete');
          },
        });
      });
      return promise;

    } else {

      //  return this.companyForm.markAllAsTouched();
    }
  }


  onUpdate() {
    var entity = new EditCompanyCommand();
    if (this.companyForm.valid) {

      this.companyForm.value.id = this.id;
      entity.inputDto = this.companyForm.value;
      entity.inputDto.id = this.id;
      entity.inputDto.logo == this.logo;
      console.log("this.VendorCommissionsForm.value", this.companyForm.value)
      const promise = new Promise<void>((resolve, reject) => {

        this.companyService.updateCompany(entity).subscribe({
          next: (result: any) => {
            this.spinner.show();
            console.log('result update ', result);
            this.Response = { ...result.response };
            this.definecompanyForm();
            this.submited = false;
            setTimeout(() => {
              this.spinner.hide();

              navigateUrl(this.listUrl, this.router);
            }, 1000);
          },
          error: (err: any) => {
            reject(err);
          },
          complete: () => {
            console.log('complete');
          },
        });
      });
      return promise;
    }

    else {

      // return this.companyForm.markAllAsTouched();
    }
  }
  onFileChange(event) {
    debugger;
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
  onFileChangeUpdate(event) {
    debugger;
    let reader = new FileReader();

    if (event.target.files && event.target.files.length) {
      this.files = event.target.files;
      this.uploadUpdate(this.files);
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

      this.companyService.uploadFile(formData).subscribe((res: any) => {
        console.log("res", res);
        debugger;
        this.logoPath = environment.apiUrl + "/wwwroot/Uploads/Company/" + res.response;
        this.logo = res.response;
      })

    }
  }

  uploadUpdate(files) {
    if (files != null) {
      if (files.length === 0)
        return;
      const formData = new FormData();
      for (let file of files) {
        formData.append(file.name, file);
      }

      this.companyService.uploadFile(formData).subscribe((res: any) => {
        console.log("res", res);
        debugger;
    
        this.logoPath = environment.apiUrl + "/wwwroot/Uploads/Company/" + res.response;
        this.logo = res.response;
      })

    }
  }

}

