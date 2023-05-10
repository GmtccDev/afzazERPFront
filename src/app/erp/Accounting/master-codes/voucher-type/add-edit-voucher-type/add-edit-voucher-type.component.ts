import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SharedService } from '../../../../../shared/common-services/shared-service';
import { ToolbarPath } from '../../../../../shared/interfaces/toolbar-path';
import { NgxSpinnerService } from 'ngx-spinner';
import { NAME_REQUIRED_VALIDATORS, REQUIRED_VALIDATORS } from '../../../../../shared/constants/input-validators';
import { Subscription } from 'rxjs';
import { ToolbarData } from '../../../../../shared/interfaces/toolbar-data';
import { ToolbarActions } from '../../../../../shared/enum/toolbar-actions';
import { navigateUrl } from '../../../../../shared/helper/helper-url';
import { ICustomEnum } from 'src/app/shared/interfaces/ICustom-enum';
import {
  BeneficiaryTypeArEnum,
  BeneficiaryTypeEnum,
  convertEnumToArray,
  CreateFinancialEntryArEnum,
  CreateFinancialEntryEnum,
  SerialTypeArEnum,
  SerialTypeEnum,
  VoucherTypeArEnum,
  VoucherTypeEnum,

} from 'src/app/shared/constants/enumrators/enums';

import { PublicService } from 'src/app/shared/services/public.service';
import { VoucherTypeServiceProxy } from '../../../services/voucher-type';
import { AccountDto } from '../../../models/account';
import { NotificationsAlertsService } from 'src/app/shared/common-services/notifications-alerts.service';
@Component({
  selector: 'app-add-edit-voucher-type',
  templateUrl: './add-edit-voucher-type.component.html',
  styleUrls: ['./add-edit-voucher-type.component.scss']
})
export class AddEditVoucherTypeComponent implements OnInit {
  //#region Main Declarations
  voucherTypeForm!: FormGroup;
  voucherTypes: ICustomEnum[] = [];
  serialType: ICustomEnum[] = [];
  createFinancialEntry: ICustomEnum[] = [];
  defaultBeneficiaryType: ICustomEnum[] = [];

  journalList: any;
  currenciesList: any;

  fiscalPeriodList: any;
  accountList: any[] = [];
  serialList: { nameAr: string; nameEn: string; value: string; }[];

  sub: any;
  url: any;
  id: any = 0;
  companyId: any;

  currnetUrl;
  public show: boolean = false;
  lang = localStorage.getItem("language")
  accountClassification: [] = [];
  addUrl: string = '/accounting-master-codes/voucherType/add-voucher-type';
  updateUrl: string = '/accounting-master-codes/voucherType/update-voucher-type/';
  listUrl: string = '/accounting-master-codes/voucherType';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.voucher-types"),
    componentAdd: '',

  };
  errorMessage = '';
  errorClass = '';
  submited: boolean = false;
  showSearchJournalModal = false;
  showSearchAccountModal = false;
  showSearchCurrencyModal = false;

  routeJournalApi = "journal/get-ddl?"
  routeCurrencyApi = "currency/get-ddl?"

  routefiscalPeriodApi = "fiscalPeriod/get-ddl?"
  routeAccountApi = "account/get-ddl?"


  constructor(
    private voucherTypeService: VoucherTypeServiceProxy,
    private publicService: PublicService,
    private AlertsService: NotificationsAlertsService,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private sharedServices: SharedService, private translate: TranslateService,

  ) {
    this.defineVoucherTypeForm();
  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    this.getVoucherType();
    this.getSerialType();
    this.getCreateFinancialEntry();
    this.getBeneficiaryType();
    this.getSerial();

    this.spinner.show();
    Promise.all([
      this.getJournal(),
      this.getAccounts(),
      this.getCurrencies()

    ]).then(a => {
      this.spinner.hide();
    }).catch((err) => {

      this.spinner.hide();
    })


    this.currnetUrl = this.router.url;
    this.listenToClickedButton();
    this.changePath();
    if (this.currnetUrl == this.addUrl) {
    }
    this.sub = this.route.params.subscribe((params) => {
      if (params['id'] != null) {
        this.id = params['id'];
        if (this.id) {
          this.getVoucherTypeById(this.id);
        }
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
  defineVoucherTypeForm() {
    this.voucherTypeForm = this.fb.group({
      id: 0,
      companyId:1,
      voucherNameAr: NAME_REQUIRED_VALIDATORS,
      voucherNameEn: null,
      journalId: null,
      voucherTypeId: REQUIRED_VALIDATORS,
      serialTypeId: 1,
      serialId: null,
      defaultAccountId: null,
      defaultCurrencyId: null,
      chooseAccountNature: false,
      createFinancialEntryId: null,
      defaultBeneficiaryId: null,
      needReview: false,
      defaultLayoutId:null,
      printAfterSave: false
    });

  }


  //#endregion

  //#region CRUD Operations
  getVoucherTypeById(id: any) {
    const promise = new Promise<void>((resolve, reject) => {
      this.voucherTypeService.getVoucherType(id).subscribe({
        next: (res: any) => {

          this.voucherTypeForm.setValue({
            id: res.response?.id,
            companyId:res.response.companyId,
            voucherNameAr: res.response?.voucherNameAr,
            voucherNameEn: res.response?.voucherNameEn,
            journalId: res.response?.journalId,
            voucherTypeId: res.response?.voucherTypeId,
            serialTypeId: res.response?.serialTypeId,
            serialId: res.response?.serialId,
            defaultAccountId: res.response?.defaultAccountId,
            defaultCurrencyId: res.response?.defaultCurrencyId,
            chooseAccountNature: res.response?.chooseAccountNature,
            createFinancialEntryId: res.response?.createFinancialEntryId,
            defaultBeneficiaryId: res.response?.defaultBeneficiaryId,
            needReview: res.response?.needReview,
            defaultLayoutId: res.response?.defaultLayoutId,
            printAfterSave: res.response?.printAfterSave



          });

          console.log(
            'this.voucherTypeForm.value set value',
            this.voucherTypeForm.value
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
  getJournal() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeJournalApi).subscribe({
        next: (res) => {
          if (res.success) {
            this.journalList = res.response;

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
  getSerial() {
    this.serialList = [
      { nameAr: 'رقم ', nameEn: 'Number', value: '1' },
      { nameAr: 'اليومية / رقم', nameEn: 'Daily/Number', value: '2' },
      { nameAr: "  اليومية / الفترة المحاسبي / رقم   ", nameEn: 'Daily/Period Accounting/Number', value: '3' }
    ];
  }
  getFiscalPeriod() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routefiscalPeriodApi).subscribe({
        next: (res) => {
          if (res.success) {
            this.fiscalPeriodList = res.response;

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
  getAccounts() {
  return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeAccountApi).subscribe({
        next: (res) => {
          if (res.success) {
            this.accountList = res.response;

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
      let sub = this.publicService.getDdl(this.routeCurrencyApi).subscribe({
        next: (res) => {
          if (res.success) {
            this.currenciesList = res.response;

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
  getVoucherType() {
    if (this.lang == 'en') {
      this.voucherTypes = convertEnumToArray(VoucherTypeEnum);
    }
    else {
      this.voucherTypes = convertEnumToArray(VoucherTypeArEnum);

    }
  }
  getSerialType() {
    if (this.lang == 'en') {
      this.serialType = convertEnumToArray(SerialTypeEnum);
    }
    else {
      this.serialType = convertEnumToArray(SerialTypeArEnum);

    }
  }
  getBeneficiaryType() {
    if (this.lang == 'en') {
      this.defaultBeneficiaryType = convertEnumToArray(BeneficiaryTypeEnum);
    }
    else {
      this.defaultBeneficiaryType = convertEnumToArray(BeneficiaryTypeArEnum);

    }
  }
  getCreateFinancialEntry() {
    if (this.lang == 'en') {
      this.createFinancialEntry = convertEnumToArray(CreateFinancialEntryEnum);
    }
    else {
      this.createFinancialEntry = convertEnumToArray(CreateFinancialEntryArEnum);

    }
  }

  getCurrentCompany() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeCurrencyApi).subscribe({
        next: (res) => {
          if (res.success) {
            this.currenciesList = res[0].response;

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

  //#region Helper Functions

  get f(): { [key: string]: AbstractControl } {
    return this.voucherTypeForm.controls;
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
          } else if (currentBtn.action == ToolbarActions.New) {
            this.toolbarPathData.componentAdd = this.translate.instant("voucher-type.add-voucher-type");
            this.defineVoucherTypeForm();
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
    debugger;
    if (this.voucherTypeForm.valid) {
      const promise = new Promise<void>((resolve, reject) => {
        var entity = this.voucherTypeForm.value;

        this.voucherTypeService.createVoucherType(entity).subscribe({
          next: (result: any) => {
            this.spinner.show();
            console.log('result dataaddData ', result);

            this.defineVoucherTypeForm();

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
      this.errorMessage = this.translate.instant("validation-messages.invalid-data");
      this.errorClass = 'errorMessage';
      this.AlertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
      return this.voucherTypeForm.markAllAsTouched();
    }
  }


  onUpdate() {

    if (this.voucherTypeForm.valid) {

      this.voucherTypeForm.value.id = this.id;
      var entityDb = this.voucherTypeForm.value;
      entityDb.id = this.id;

      console.log("this.voucherTypeForm.value", this.voucherTypeForm.value)
      const promise = new Promise<void>((resolve, reject) => {

        this.voucherTypeService.updateVoucherType(entityDb).subscribe({
          next: (result: any) => {
            this.spinner.show();
            console.log('result update ', result);

            this.defineVoucherTypeForm();
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

      this.errorMessage = this.translate.instant("validation-messages.invalid-data");
      this.errorClass = 'errorMessage';
      this.AlertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
      return this.voucherTypeForm.markAllAsTouched();
    }
  }

  onSelectJournal(event) {
    this.voucherTypeForm.controls.journalId.setValue(event.id);
    this.showSearchJournalModal = false;
  }
  onSelectAccount(event) {
    this.voucherTypeForm.controls.defaultAccountId.setValue(event.id);
    this.showSearchAccountModal = false;
  }
  onSelectCurrency(event) {
    this.voucherTypeForm.controls.defaultCurrencyId.setValue(event.id);
    this.showSearchCurrencyModal = false;
  }
}

