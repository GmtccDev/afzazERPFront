import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { CODE_REQUIRED_VALIDATORS, NAME_REQUIRED_VALIDATORS, REQUIRED_VALIDATORS } from '../../../../../shared/constants/input-validators';
import { ToolbarPath } from '../../../../../shared/interfaces/toolbar-path';
import { SharedService } from '../../../../../shared/common-services/shared-service';
import { TranslateService } from '@ngx-translate/core';
import { ToolbarData } from '../../../../../shared/interfaces/toolbar-data';
import { ToolbarActions } from '../../../../../shared/enum/toolbar-actions';
import { navigateUrl } from '../../../../../shared/helper/helper-url';
import { AccountDto, DeleteAccountCommand, DeleteListAccountCommand } from '../../../models/account';
import { AccountServiceProxy } from '../../../services/account.services';
import { CompanyDto } from 'src/app/erp/master-codes/models/company';
import { CostCenterDto } from '../../../models/cost-Center';
import { PublicService } from 'src/app/shared/services/public.service';
import { SubscriptionService } from 'src/app/shared/components/layout/subscription/services/subscription.services';
import { GeneralConfigurationServiceProxy } from '../../../services/general-configurations.services';
import { ICustomEnum } from 'src/app/shared/interfaces/ICustom-enum';
import { AccountClassificationsArEnum, AccountClassificationsEnum, convertEnumToArray } from 'src/app/shared/constants/enumrators/enums';
import { ModuleType } from '../../../models/general-configurations';
import { NotificationService } from 'src/app/shared/common-services/notification.service';

@Component({
  selector: 'app-add-edit-account',
  templateUrl: './add-edit-account.component.html',
  styleUrls: ['./add-edit-account.component.scss']
})
export class AddEditAccountComponent implements OnInit {
  //#region Main Declarations
  accountForm!: FormGroup;
  accountClassificationsEnum: ICustomEnum[] = [];

  sub: any;
  url: any;
  id: any = 0;
  currnetUrl;
  public show: boolean = false;
  lang = localStorage.getItem("language")
  addUrl: string = '/accounting-master-codes/account/add-account';
  addParentUrl: string = '/accounting-master-codes/account/add-account/';
  updateUrl: string = '/accounting-master-codes/account/update-account/';
  listUrl: string = '/accounting-master-codes/account';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.account"),
    componentAdd: '',

  };
  response: any;
  errorMessage = '';
  errorClass = '';
  submited: boolean = false;
  accountList: AccountDto[] = [];
  showSearchModal = false;
  showSearchModalCompany = false;
  showSearchModalCostCenter = false;
  showSearchModalCurrency = false;
  showSearchModalAccountGroup = false;

  parentId: any;

  companyList: CompanyDto[] = [];
  costCenterList: CostCenterDto[] = [];

  routeApi = 'Account/get-ddl?'
  routeCompanyApi = 'Company/get-ddl?'
  routeCostCenterApi = 'CostCenter/get-ddl?'
  routeCurrencyApi = "Currency/get-ddl?"
  routeAccountGroupApi = "AccountGroup/get-ddl?"
  routeAccountClassificationApi = "AccountClassification/get-ddl?"
  currencyList: any;
  accountGroupList: any;
  accountClassificationListOfIncomeStatement: any;
  accountTypeList: { nameAr: string; nameEn: string; value: any; }[];
  budgetList: { nameAr: string; nameEn: string; value: any; }[];
  isMultiCompanies = true;
  isMultiCurrency = true;
  isLeafAccount: any;

  constructor(
    private accountService: AccountServiceProxy,
    private publicService: PublicService,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private sharedServices: SharedService, private translate: TranslateService,
    public subscriptionService: SubscriptionService,
    private generalConfigurationService: GeneralConfigurationServiceProxy,
    private notificationService: NotificationService

  ) {
    this.defineaccountForm();
  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {

    // this.defineGridColumn();
    this.spinner.show();
    this.getAccountClassifications();
    this.getAccountType();
    this.getAccountGroup();

    Promise.all([this.getLastSubscription(), this.getGeneralConfiguration(), this.getAccount(), this.getCostCenter()
      , this.getAccountClassificationsForIncomeStatement()
    ])
      .then(a => {

        this.getRouteData();
        this.currnetUrl = this.router.url;
        if (this.currnetUrl == this.addUrl) {
          this.getaccountCode();
        }
        this.spinner.hide();

        this.changePath();
        this.listenToClickedButton();
        // this.sharedServices.changeButton({ action: 'List' } as ToolbarData);
        // this.sharedServices.changeToolbarPath(this.toolbarPathData);
      }).catch(err => {
        this.spinner.hide();
      })




  }
  getRouteData() {
    let sub = this.route.params.subscribe((params) => {

      if (params['id'] != null) {
        this.id = params['id'];

        if (this.id) {
          this.getaccountById(this.id).then(a => {
            this.spinner.hide();
            this.sharedServices.changeButton({ action: 'Update',submitMode:false } as ToolbarData);

          }).catch(err => {
            this.spinner.hide();

          });

        }
        else {
          this.sharedServices.changeButton({ action: 'New' } as ToolbarData);
          this.spinner.hide();
        }
      }
      else {
        this.spinner.hide();
        this.sharedServices.changeButton({ action: 'New' } as ToolbarData);
      }
      if (params['parentId'] != null) {
        this.parentId = params['parentId'];

        this.getaccountCode();
        this.url = this.router.url.split('/')[2];
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

  //#region Subscriptionss

  //#endregion

  //#region  State Management
  //#endregion

  //#region Basic Data
  ///Geting form dropdown list data
  defineaccountForm() {
    this.accountForm = this.fb.group({
      id: null,
      nameAr: NAME_REQUIRED_VALIDATORS,
      nameEn: NAME_REQUIRED_VALIDATORS,
      code: CODE_REQUIRED_VALIDATORS,
      isActive: true,
      isLeafAccount: false,
      parentId: null,
      companyId: null,
      // openBalanceDebit: null,
      // openBalanceCredit: null,
      debitLimit: null,
      creditLimit: null,
      taxNumber: null,
      currencyId: null,
      costCenterId: null,
      accountGroupId: null,
      accountType: REQUIRED_VALIDATORS,
      budget: null,
      accountClassificationId: REQUIRED_VALIDATORS,
      accountClassificationIdOfIncomeStatement: null,

      noteNotActive: null

    });

  }
  getLastSubscription() {
    return new Promise<void>((resolve, reject) => {

      let sub = this.subscriptionService.getLastSubscription().subscribe(
        next => {
          resolve();

          if (next.success == true) {

            if (next.response != null) {
              this.isMultiCompanies = next.response.multiCompanies;
              if (this.isMultiCompanies) {
                this.getCompanies();
              }
              //MultiCompanies
            }


          }
        },
        error => {
          // reject(err);


        }
      )
      this.subsList.push(sub);

    });


  }
  getGeneralConfiguration() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.generalConfigurationService.allGeneralConfiguration(ModuleType.Accounting, undefined, undefined, undefined, undefined, undefined).subscribe({
        next: (res) => {
          resolve();

          this.toolbarPathData.componentList = this.translate.instant("component-names.account");
          if (res.success) {

            if (res.response.result.items.length > 0) {
              this.isMultiCurrency = res.response.result.items.find(c => c.id == 2).value == "true" ? true : false;
              if (this.isMultiCurrency) {
                this.getCurrency();
              }
            }


          }



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
  getAccount() {
    return new Promise<void>((resolve, reject) => {

      let sub = this.accountService.getDdl().subscribe({
        next: (res) => {

          if (res.success) {
            this.accountList = res.response;

          }
          if (this.parentId != undefined || this.parentId != null) {
            this.accountForm.controls.parentId.setValue((this.parentId));
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
  getCompanies() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeCompanyApi).subscribe({
        next: (res) => {

          if (res.success) {
            this.companyList = res.response;

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
  getCostCenter() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeCostCenterApi).subscribe({
        next: (res) => {

          if (res.success) {
            this.costCenterList = res.response;

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
  getCurrency() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeCurrencyApi).subscribe({
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
  getAccountGroup() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeAccountGroupApi).subscribe({
        next: (res) => {

          if (res.success) {

            this.accountGroupList = res.response;

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
  getAccountClassificationsForIncomeStatement() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeAccountClassificationApi).subscribe({
        next: (res) => {

          if (res.success) {
            this.accountClassificationListOfIncomeStatement = res.response;

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
  getAccountClassifications() {
    if (this.lang == 'en') {
      this.accountClassificationsEnum = convertEnumToArray(AccountClassificationsEnum);
    }
    else {
      this.accountClassificationsEnum = convertEnumToArray(AccountClassificationsArEnum);

    }
  }
  //#endregion

  //#region CRUD Operations
  getaccountById(id: any) {

    return new Promise<void>((resolve, reject) => {
      let sub = this.accountService.getAccount(id).subscribe({
        next: (res: any) => {
          resolve();

          this.accountForm.setValue({

            id: res.response?.id,
            nameAr: res.response?.nameAr,
            nameEn: res.response?.nameEn,
            code: res.response?.code,
            isActive: res.response?.isActive,
            isLeafAccount: res.response?.isLeafAccount,
            parentId: res.response?.parentId,
            companyId: res.response?.companyId,
            //  openBalanceDebit: res.response?.openBalanceDebit,
            // openBalanceCredit: res.response?.openBalanceCredit,
            debitLimit: res.response?.debitLimit,
            creditLimit: res.response?.creditLimit,
            taxNumber: res.response?.taxNumber,
            currencyId: res.response?.currencyId,
            costCenterId: res.response?.costCenterId,
            accountGroupId: res.response?.accountGroupId,
            accountType: res.response?.accountType,
            budget: res.response?.budget,
            accountClassificationId: res.response?.accountClassificationId,
            accountClassificationIdOfIncomeStatement: res.response?.accountClassificationIdOfIncomeStatement,
            noteNotActive: res.response?.noteNotActive,

          });
          this.isLeafAccount = res.response?.isLeafAccount;
          console.log(
            'this.accountForm.value set value',
            this.accountForm.value
          );
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
  onChange(event: any) {

    this.accountService.getAccount(event).subscribe(res1 => {


      this.accountForm.patchValue({


        isActive: res1.response?.isActive,
        isLeafAccount: res1.response?.isLeafAccount,

        companyId: res1.response?.companyId,


        currencyId: res1.response?.currencyId,
        costCenterId: res1.response?.costCenterId,
        accountGroupId: res1.response?.accountGroupId,
        accountType: res1.response?.accountType,

        accountClassificationId: res1.response?.accountClassificationId,
        accountClassificationIdOfIncomeStatement: res1.response?.accountClassificationIdOfIncomeStatement,
        budget: res1.response?.budget,
        noteNotActive: res1.response?.noteNotActive,

      });
      this.accountForm.get('budget').disable();
      this.accountForm.get('accountClassificationIdOfIncomeStatement').disable();
      this.accountForm.get('accountType').disable();

      console.log(
        'this.accountForm.value set value',
        this.accountForm.value
      );
    })
  }
  getaccountCode() {

    return new Promise<void>((resolve, reject) => {

      let sub = this.accountService.getLastCode(this.parentId).subscribe({

        next: (res: any) => {

          this.toolbarPathData.componentList = this.translate.instant("component-names.account");

          this.accountForm.patchValue({
            code: res.response
          });
          if (this.parentId != undefined || this.parentId != null) {
            this.accountForm.controls.parentId.setValue((this.parentId));

            this.accountService.getAccount(this.parentId).subscribe(res1 => {


              this.accountForm.patchValue({


                isActive: res1.response?.isActive,
                isLeafAccount: false,

                companyId: res1.response?.companyId,


                currencyId: res1.response?.currencyId,
                costCenterId: res1.response?.costCenterId,
                accountGroupId: res1.response?.accountGroupId,
                accountType: res1.response?.accountType,

                accountClassificationId: res1.response?.accountClassificationId,
                accountClassificationIdOfIncomeStatement: res1.response?.accountClassificationIdOfIncomeStatement,
                budget: res1.response?.budget,
                noteNotActive: res1.response?.noteNotActive,

              });
              this.accountForm.get('budget').disable();
              this.accountForm.get('accountClassificationIdOfIncomeStatement').disable();
              this.accountForm.get('accountType').disable();

              console.log(
                'this.accountForm.value set value',
                this.accountForm.value
              );
            })

          }

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
    return this.accountForm.controls;
  }


  //#endregion
  //#region Tabulator
  subsList: Subscription[] = [];
  currentBtnResult;
  listenToClickedButton() {
    let sub = this.sharedServices.getClickedbutton().subscribe({
      next: (currentBtn: ToolbarData) => {
        currentBtn;

        if (currentBtn != null) {
          if (currentBtn.action == ToolbarActions.List) {
            this.sharedServices.changeToolbarPath({
              listPath: this.listUrl,
            } as ToolbarPath);
            this.router.navigate([this.listUrl]);
          } else if (currentBtn.action == ToolbarActions.Save) {
            this.onSave();
          } else if (currentBtn.action == ToolbarActions.New || this.currnetUrl == this.addParentUrl) {
            this.toolbarPathData.componentAdd = 'Add account';
            if (this.accountForm.value.code != null) {
              this.getaccountCode()
            }
            this.defineaccountForm();
            this.sharedServices.changeToolbarPath(this.toolbarPathData);
          } else if (currentBtn.action == ToolbarActions.Update && currentBtn.submitMode) {
            this.onUpdate();
          }
        }
      },
    });
    this.subsList.push(sub);
  }
  changePath() {
    this.sharedServices.changeToolbarPath(this.toolbarPathData);
  }
  confirmSave() {
    var entity = new AccountDto();
    entity = this.accountForm.getRawValue();
          
    if (this.accountForm.value.isLeafAccount == true && this.accountForm.value.parentId == null) {
      this.notificationService.error("من فضلك ادخل الاب");
      this.spinner.hide();
      return;
    }
   // this.checkParentAccount()
    return new Promise<void>((resolve, reject) => {
      let sub = this.accountService.createAccount(entity).subscribe({
        next: (result: any) => {
          this.spinner.show();
          this.response = { ...result.response };
          this.defineaccountForm();

          this.submited = false;
          this.spinner.hide();

          navigateUrl(this.listUrl, this.router);
        },
        error: (err: any) => {
          reject(err);
          this.spinner.hide();
        },
        complete: () => {
          this.spinner.hide();
          //console.log('complete');
        },
      });
      this.subsList.push(sub);

    });
  }
  onSave() {
    if (this.accountForm.valid) {
      this.spinner.show();
      this.confirmSave().then(a => {
        this.spinner.hide();

      }).catch(e => {
        this.spinner.hide();
      });

    } else {

      return this.accountForm.markAllAsTouched();
    }
  }
  confirmUpdate() {
    var entity = new AccountDto();
    this.accountForm.value.id = this.id;
    entity = this.accountForm.getRawValue();;
    entity.id = this.id;
    if (this.accountForm.value.isLeafAccount == true && this.accountForm.value.parentId == null) {
      this.notificationService.error("من فضلك ادخل الاب");
      this.spinner.hide();
      return;
    }
    return new Promise<void>((resolve, reject) => {

      let sub = this.accountService.updateAccount(entity).subscribe({
        next: (result: any) => {
          this.spinner.show();
          this.response = { ...result.response };
          this.defineaccountForm();
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
    if (this.accountForm.valid) {

      this.spinner.show();
      this.confirmUpdate().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });

    }

    else {

      return this.accountForm.markAllAsTouched();
    }
  }
  getAccountType() {
    this.accountTypeList = [
      { nameAr: 'قائمة الدخل', nameEn: 'Income Statement', value: 1 },
      { nameAr: 'الميزانية', nameEn: 'Budget', value: 2 }
    ];
    this.budgetList = [
      { nameAr: ' الأصول ', nameEn: 'Assets', value: 1 },
      { nameAr: 'الخصوم', nameEn: 'Liabilities', value: 2 }
    ];
  }
  onSelectCompany(event) {
    this.accountForm.controls.companyId.setValue(event.id);
    this.showSearchModalCompany = false;
  }
  onSelectAccount(event) {

    this.accountForm.controls.parentId.setValue(event.id);
    this.showSearchModal = false;
  }
  onSelectAccountGroup(event) {
    this.accountForm.controls.accountGroupId.setValue(event.id);
    this.showSearchModalAccountGroup = false;
  }
  onSelectCurrency(event) {
    this.accountForm.controls.currencyId.setValue(event.id);
    this.showSearchModalCurrency = false;
  }
  onSelectCostCenter(event) {
    this.accountForm.controls.costCenterId.setValue(event.id);
    this.showSearchModalCostCenter = false;
  }
  checkAccount(id, event) {
    let sub = this.accountService.checkAccount(id).subscribe({

      next: (result: any) => {

        var parentId = this.accountForm?.value?.parentId;
        if (result.response == false) {
          this.accountForm.controls.isLeafAccount.setValue((this.isLeafAccount));
        }
        else if (result.response == true) {
          this.accountForm.controls.isLeafAccount.setValue((event.target.checked));
        }
        console.log(result);


      },
      error: (err: any) => {
        //   reject(err);
        console.log(err);
      },
      complete: () => {
        //console.log('complete');
      },
    });
  }
  checkParentAccount() {
    let sub = this.accountService.checkAccount(this.accountForm?.value?.parentId).subscribe({

      next: (result: any) => {
      
     
        if (result.response == false) {
        this.errorMessage=this.translate.instant('canChangeToParent');
        this.notificationService.error( this.errorMessage);
        }
        else if (result.response == true) {
        
        }
        console.log(result);


      },
      error: (err: any) => {
        //   reject(err);
        console.log(err);
      },
      complete: () => {
        //console.log('complete');
      },
    });
  }
  onChangeLeaf(event) {

    if (this.id && this.currnetUrl.includes(this.updateUrl)) {
      var entity = new DeleteAccountCommand();
      entity.id = this.id;

      this.checkAccount(entity, event);
      console.log(entity);
      // this.accountForm.controls.isLeafAccount.setValue((event.target));
    }
  }
  onAccountTypeChange(event: any) {
    
    // access the selected value using event
    const selectedValue = event;
    if (event == 2) {
      this.accountForm.get('budget')?.setValidators([Validators.required]);
      this.accountForm.get('accountClassificationIdOfIncomeStatement')?.clearValidators();
      this.accountForm.get('budget')?.updateValueAndValidity();
      this.accountForm.get('accountClassificationIdOfIncomeStatement')?.updateValueAndValidity();
    }
    else  if (event == 1){
      this.accountForm.get('accountClassificationIdOfIncomeStatement')?.setValidators([Validators.required]);
      this.accountForm.get('budget')?.clearValidators();
      this.accountForm.get('accountClassificationIdOfIncomeStatement')?.updateValueAndValidity();
      this.accountForm.get('budget')?.updateValueAndValidity();

    }
    // perform additional actions on change if needed
  }
}

