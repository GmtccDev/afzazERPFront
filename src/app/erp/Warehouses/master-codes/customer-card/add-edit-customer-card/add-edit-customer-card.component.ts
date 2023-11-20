import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { CODE_REQUIRED_VALIDATORS, PHONE_VALIDATORS, REQUIRED_VALIDATORS } from '../../../../../shared/constants/input-validators';
import { ToolbarPath } from '../../../../../shared/interfaces/toolbar-path';
import { SharedService } from '../../../../../shared/common-services/shared-service';
import { TranslateService } from '@ngx-translate/core';
import { ToolbarData } from '../../../../../shared/interfaces/toolbar-data';
import { ToolbarActions } from '../../../../../shared/enum/toolbar-actions';
import { navigateUrl } from '../../../../../shared/helper/helper-url';
import { PublicService } from '../../../../../shared/services/public.service';
import { CustomerCardDto } from '../../../models/customer-card';
import { CustomerCardServiceProxy } from '../../../Services/customer-card.service';
import { CountryDto } from '../../../../master-codes/models/country';
import { CountryServiceProxy } from '../../../../master-codes/services/country.servies';
import { AccountClassificationsEnum } from 'src/app/shared/constants/enumrators/enums';


@Component({
  selector: 'app-add-edit-customer-card',
  templateUrl: './add-edit-customer-card.component.html',
  styleUrls: ['./add-edit-customer-card.component.scss']
})
export class AddEditCustomerCardComponent implements OnInit {
  //#region Main Declarations
  customerCardForm!: FormGroup;
  companyId: any = localStorage.getItem("companyId");
  branchId: any = localStorage.getItem("branchId");
  id: any = 0;
  currnetUrl;
  lang: any = localStorage.getItem("language")
  routeClientAccountApi = 'Account/GetLeafAccounts?AccountClassificationId=' + AccountClassificationsEnum.Client
  clientAccountsList: any;
  routeApiCountry = 'Country/get-ddl?'
  countriesList: CountryDto[] = [];
  customerCard: CustomerCardDto[] = [];
  addUrl: string = '/warehouses-master-codes/customerCard/add-customerCard';
  updateUrl: string = '/warehouses-master-codes/customerCard/update-customerCard/';
  listUrl: string = '/warehouses-master-codes/customerCard';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.customer-card"),
    componentAdd: '',

  };
  response: any;
  errorMessage = '';
  errorClass = '';
  submited: boolean = false;
  showSearchCustomerAccountModal = false;

  constructor(
    private customerCardService: CustomerCardServiceProxy,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private sharedService: SharedService, private translate: TranslateService,
    private publicService: PublicService,
    private countryService: CountryServiceProxy,



  ) {
    this.defineCustomerCardForm();
  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    this.spinner.show();
    Promise.all([
      this.getClientAccounts(),
      this.getCountries()


    ]).then(a => {
      this.getRouteData();
      this.currnetUrl = this.router.url;
      if (this.currnetUrl == this.addUrl) {
        this.getCustomerCardCode();
      }
      this.changePath();
      this.listenToClickedButton();
    }).catch((err) => {

      this.spinner.hide();
    })

  }
  getRouteData() {
    let sub = this.route.params.subscribe((params) => {
      if (params['id'] != null) {
        this.id = +params['id'];
        if (this.id > 0) {
          this.getCustomerCardById(this.id).then(a => {
            this.spinner.hide();

          }).catch(err => {
            this.spinner.hide();

          });


        }
        else {
          this.sharedService.changeButton({ action: 'New' } as ToolbarData);
          this.spinner.hide();
        }
      }
      else {
        this.spinner.hide();
        this.sharedService.changeButton({ action: 'New' } as ToolbarData);
      }
    });
    this.subsList.push(sub);

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

  //#region Permissions

  //#endregion

  //#region  State Management
  //#endregion

  //#region Basic Data
  ///Geting form dropdown list data
  defineCustomerCardForm() {
    this.customerCardForm = this.fb.group({
      id: 0,
      companyId: this.companyId,
      branchId: this.branchId,
      code: CODE_REQUIRED_VALIDATORS,
      nameAr: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50)])],
      nameEn: '',
      address: REQUIRED_VALIDATORS,
      isActive: true,
      phone: PHONE_VALIDATORS,
      fax: '',
      email: '',
      taxNumber:'',
      postalCode:'',
      mailBox:'',
      creditLimit:'',
      initialBalance:'',
      responsiblePerson: REQUIRED_VALIDATORS,
      accountId: REQUIRED_VALIDATORS,
      countryId: ''
     
    }

    );


  }

  //#endregion

  //#region CRUD Operations
  getCustomerCardById(id: any) {
    return new Promise<void>((resolve, reject) => {
      let sub = this.customerCardService.getCustomerCard(id).subscribe({
        next: (res: any) => {
          resolve();
          this.customerCardForm.setValue({
            id: res.response?.id,
            companyId: res.response?.companyId,
            branchId: res.response?.branchId,
            code: res.response?.code,
            nameAr: res.response?.nameAr,
            nameEn: res.response?.nameEn,
            address: res.response?.address,
            phone: res.response?.phone,
            fax: res.response?.fax,
            email: res.response?.email,
            taxNumber: res.response?.taxNumber,
            postalCode: res.response?.postalCode,
            mailBox: res.response?.mailBox,
            creditLimit: res.response?.creditLimit,
            initialBalance: res.response?.initialBalance,
            responsiblePerson: res.response?.responsiblePerson,
            accountId: res.response?.accountId,
            countryId: res.response?.countryId,
            isActive: res.response?.isActive,

          });


        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {
        },
      });
      this.subsList.push(sub);

    });
  }
  getCustomerCardCode() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.customerCardService.getLastCode().subscribe({
        next: (res: any) => {
          this.toolbarPathData.componentList = this.translate.instant("component-names.customer-card");
          this.customerCardForm.patchValue({
            code: res.response
          });

        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {
        },
      });
      this.subsList.push(sub);

    });

  }
  getClientAccounts() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeClientAccountApi).subscribe({
        next: (res) => {

          if (res.success) {
            this.clientAccountsList = res.response;

          }

          resolve();

        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {
        },
      });

      this.subsList.push(sub);
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
        },
      });

      this.subsList.push(sub);
    });

  }
  //#endregion

  //#region Helper Functions

  get f(): { [key: string]: AbstractControl } {
    return this.customerCardForm.controls;
  }


  //#endregion
  //#region Tabulator
  subsList: Subscription[] = [];
  currentBtnResult;
  listenToClickedButton() {
    let sub = this.sharedService.getClickedbutton().subscribe({
      next: (currentBtn: ToolbarData) => {
        currentBtn;

        if (currentBtn != null) {
          if (currentBtn.action == ToolbarActions.List) {
            this.sharedService.changeToolbarPath({
              listPath: this.listUrl,
            } as ToolbarPath);
            this.router.navigate([this.listUrl]);
          } else if (currentBtn.action == ToolbarActions.Save) {
            this.onSave();
          } else if (currentBtn.action == ToolbarActions.New) {
            this.toolbarPathData.componentAdd = this.translate.instant('component-names.add-customer-card');
            if (this.customerCardForm.value.code != null) {
              this.getCustomerCardCode()
            }
            this.defineCustomerCardForm();
            this.sharedService.changeToolbarPath(this.toolbarPathData);
          } else if (currentBtn.action == ToolbarActions.Update && currentBtn.submitMode) {
            this.onUpdate();
          }
          else if (currentBtn.action == ToolbarActions.Copy) {
            this.getCustomerCardCode();
          }
        }
      },
    });
    this.subsList.push(sub);
  }
  changePath() {
    this.sharedService.changeToolbarPath(this.toolbarPathData);
  }
  confirmSave() {
    var inputDto = new CustomerCardDto()
    return new Promise<void>((resolve, reject) => {
      inputDto = this.customerCardForm.value;
      let sub = this.customerCardService.createCustomerCard(inputDto).subscribe({
        next: (result: any) => {
          this.response = { ...result.response };
          this.defineCustomerCardForm();
          this.submited = false;

          navigateUrl(this.listUrl, this.router);
        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {
        },
      });
      this.subsList.push(sub);

    });
  }
  onSave() {
    if (this.customerCardForm.valid) {
      this.spinner.show();
      this.confirmSave().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });

    } else {

      return this.customerCardForm.markAllAsTouched();
    }
  }
  confirmUpdate() {
    var inputDto = new CustomerCardDto()
    return new Promise<void>((resolve, reject) => {
      inputDto = this.customerCardForm.value;
      inputDto.id = this.id;

      let sub = this.customerCardService.updateCustomerCard(inputDto).subscribe({
        next: (result: any) => {
          this.response = { ...result.response };
          this.defineCustomerCardForm();
          this.submited = false;
          navigateUrl(this.listUrl, this.router);
        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {
        },
      });
      this.subsList.push(sub);

    });
  }

  onUpdate() {

    if (this.customerCardForm.valid) {
      this.spinner.show();
      this.confirmUpdate().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });
    }
    else {
      return this.customerCardForm.markAllAsTouched();

    }
  }
  onSelectCustomerAccount(event) {
    this.customerCardForm.controls.accountId.setValue(event.id);
    this.showSearchCustomerAccountModal = false;
  }


}

//#endregion


