import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { CODE_REQUIRED_VALIDATORS, NAME_REQUIRED_VALIDATORS, REQUIRED_VALIDATORS } from '../../../../../shared/constants/input-validators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToolbarPath } from '../../../../../shared/interfaces/toolbar-path';
import { SharedService } from '../../../../../shared/common-services/shared-service';
import { TranslateService } from '@ngx-translate/core';
import { ToolbarData } from '../../../../../shared/interfaces/toolbar-data';
import { ToolbarActions } from '../../../../../shared/enum/toolbar-actions';
import { navigateUrl } from '../../../../../shared/helper/helper-url';
import { AccountDto, CreateAccountCommand, EditAccountCommand } from '../../../models/account';
import { AccountServiceProxy } from '../../../services/account.services';
import { CompanyDto } from 'src/app/erp/master-codes/models/company';
import { CostCenterDto } from '../../../models/cost-Center';
import { PublicService } from 'src/app/shared/services/public.service';
import { SubscriptionService } from 'src/app/shared/components/layout/subscription/services/subscription.services';
import { GeneralConfigurationServiceProxy } from '../../../services/general-configurations.services';
import { ICustomEnum } from 'src/app/shared/interfaces/ICustom-enum';
import { AccountClassificationsArEnum, AccountClassificationsEnum, convertEnumToArray } from 'src/app/shared/constants/enumrators/enums';
import { MessageModalComponent } from 'src/app/shared/components/message-modal/message-modal.component';

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

  constructor(
    private accountService: AccountServiceProxy,
    private publicService: PublicService,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private sharedServices: SharedService, private translate: TranslateService,
    private cd: ChangeDetectorRef,
    public subscriptionService: SubscriptionService,
    private generalConfigurationService: GeneralConfigurationServiceProxy,
    private modalService: NgbModal,

  ) {
    this.defineaccountForm();
  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    this.getLastSubscription();
    this.getGeneralConfiguration();
    this.getAccount();
    this.getAccountGroup();
    this.getCostCenter();
    this.getAccountClassifications();
    this.getAccountClassificationsForIncomeStatement();
    this.currnetUrl = this.router.url;
    this.listenToClickedButton();
    this.getAccountType();
    this.changePath();
    if (this.currnetUrl == this.addUrl) {
      this.getaccountCode();
    }

    this.sub = this.route.params.subscribe((params) => {
      if (params['id'] != null) {
        this.id = params['id'];

        if (this.id) {
          this.getaccountById(this.id);
        }
        this.url = this.router.url.split('/')[2];
      }
      if (params['parentId'] != null) {
        this.parentId = params['parentId'];

        this.getaccountCode();
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
  defineaccountForm() {
    this.accountForm = this.fb.group({
      id: null,
      nameAr: NAME_REQUIRED_VALIDATORS,
      nameEn: NAME_REQUIRED_VALIDATORS,
      code: CODE_REQUIRED_VALIDATORS,
      isActive: true,
      isLeafAccount: true,
      parentId: null,
      companyId: null,
      openBalanceDebit: null,
      openBalanceCredit: null,
      debitLimit: null,
      creditLimit: null,
      taxNumber: null,
      currencyId: null,
      costCenterId: null,
      accountGroupId: null,
      accountType: null,
      budget: null,
      accountClassificationId: REQUIRED_VALIDATORS,
      accountClassificationIdOfIncomeStatement: null,

      noteNotActive: null

    });

  }
  getLastSubscription() {

    this.subscriptionService.getLastSubscription().subscribe(
      next => {

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

        //this.showLoader = false;
        console.log(error)

      }
    )

  }
  getGeneralConfiguration() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.generalConfigurationService.allGeneralConfiguration(5, undefined, undefined, undefined, undefined, undefined).subscribe({
        next: (res) => {

          console.log(res);
          //let data =
          //   res.data.map((res: PeopleOfBenefitsVM[]) => {
          //   return res;
          // });
          this.toolbarPathData.componentList = this.translate.instant("component-names.companies");
          if (res.success) {

            if (res.response.items.length>0) {
              this.isMultiCurrency = res.response.items.find(c => c.id == 2).value == "true" ? true : false;
              if (this.isMultiCurrency) {
                this.getCurrency();
              }
            }


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
          console.log('complete');
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
          console.log('complete');
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
          console.log('complete');
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
          console.log('complete');
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
          console.log('complete');
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
          console.log('complete');
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

    const promise = new Promise<void>((resolve, reject) => {
      this.accountService.getAccount(id).subscribe({
        next: (res: any) => {

          this.accountForm.setValue({
            id: res.response?.id,
            nameAr: res.response?.nameAr,
            nameEn: res.response?.nameEn,
            code: res.response?.code,
            isActive: res.response?.isActive,
            isLeafAccount: res.response?.isLeafAccount,
            parentId: res.response?.parentId,
            companyId: res.response?.companyId,
            openBalanceDebit: res.response?.openBalanceDebit,
            openBalanceCredit: res.response?.openBalanceCredit,
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

          console.log(
            'this.accountForm.value set value',
            this.accountForm.value
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

  getaccountCode() {

    const promise = new Promise<void>((resolve, reject) => {

      this.accountService.getLastCode(this.parentId).subscribe({

        next: (res: any) => {

          this.toolbarPathData.componentList = this.translate.instant("component-names.account");
          this.accountForm.patchValue({
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
            this.defineaccountForm();
            this.sharedServices.changeToolbarPath(this.toolbarPathData);
          } else if (currentBtn.action == ToolbarActions.Update) {
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
  onSave() {
    var entity = new CreateAccountCommand();
    if (this.accountForm.valid) {
      const promise = new Promise<void>((resolve, reject) => {
        entity.inputDto = this.accountForm.value;

        this.accountService.createAccount(entity).subscribe({
          next: (result: any) => {
            this.spinner.show();
            console.log('result dataaddData ', result);
            this.response = { ...result.response };
            this.defineaccountForm();

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

      return this.accountForm.markAllAsTouched();
    }
  }


  onUpdate() {
    var entity = new EditAccountCommand();
    if (this.accountForm.valid) {

      this.accountForm.value.id = this.id;
      entity.inputDto = this.accountForm.value;
      entity.inputDto.id = this.id;

      console.log("this.VendorCommissionsForm.value", this.accountForm.value)
      const promise = new Promise<void>((resolve, reject) => {

        this.accountService.updateAccount(entity).subscribe({
          next: (result: any) => {
            this.spinner.show();
            console.log('result update ', result);
            this.response = { ...result.response };
            this.defineaccountForm();
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

      return this.accountForm.markAllAsTouched();
    }
  }
  getAccountType() {
    this.accountTypeList = [
      { nameAr: 'قائمة الدخل', nameEn: 'Income Statement', value: 1 },
      { nameAr: 'قائمة المركز المالى', nameEn: 'Budget', value: 2 }
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
  checkAccount(id) {
    let sub = this.accountService.checkAccount(id).subscribe(
      (resonse) => {

        //reloadPage()
        // this.getAccountes();

      });
  }
  onChangeLeaf(event) {
    
    if (!event.target.checked && this.id) {
      this.checkAccount(this.id);
    }
  }
}

