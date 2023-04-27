import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { CODE_REQUIRED_VALIDATORS, NAME_REQUIRED_VALIDATORS } from '../../../../../shared/constants/input-validators';
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
import { CompanyServiceProxy } from 'src/app/erp/master-codes/services/company.service';
import { CostCenterDto } from '../../../models/cost-Center';
import { PublicService } from 'src/app/shared/services/public.service';

@Component({
  selector: 'app-add-edit-account',
  templateUrl: './add-edit-account.component.html',
  styleUrls: ['./add-edit-account.component.scss']
})
export class AddEditAccountComponent implements OnInit {
  //#region Main Declarations
  accountForm!: FormGroup;
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
  routeCostCenterApi = 'CostCenter/get-dd?'
  routeCurrencyApi = "Currency/get-ddl?"
  routeAccountGroupApi = "AccountGroup/get-ddl?"
  currencyList: any;
  accountGroupList: any;

  constructor(
    private accountService: AccountServiceProxy,
    private publicService: PublicService,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private sharedServices: SharedService, private translate: TranslateService,
    private modelService: NgbModal,
    private cd: ChangeDetectorRef

  ) {
    this.defineaccountForm();
  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    this.getCompanies();
    this.getAccount();
    this.getAccountGroup();
    this.getCurrency();
    this.getCostCenter();
    this.currnetUrl = this.router.url;
    this.listenToClickedButton();
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
      id: 0,
      nameAr: NAME_REQUIRED_VALIDATORS,
      nameEn: null,
      code: CODE_REQUIRED_VALIDATORS,
      isActive: true,
      parentId: null,
      companyId: null,
      openBalanceDebit: null,
      openBalanceCredit: null,
      debitLimit: null,
      creditLimit: null,
      taxNumber: null,
      currencyId: null,
      costCenterId: null,
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
            this.accountForm.controls.parentId.setValue(Number(this.parentId));
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
            parentId: res.response?.parentId,
            companyId: res.resonse?.companyId,
            openBalanceDebit: res.resonse?.openBalanceDebit,
            openBalanceCredit: res.resonse?.openBalanceCredit,
            debitLimit: res.resonse?.debitLimit,
            creditLimit: res.resonse?.creditLimit,
            taxNumber: res.resonse?.taxNumber,
            currencyId: res.resonse?.currencyId,
            costCenterId: res.resonse?.costCenterId,

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

      //  return this.accountForm.markAllAsTouched();
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

      // return this.accountForm.markAllAsTouched();
    }
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

}

