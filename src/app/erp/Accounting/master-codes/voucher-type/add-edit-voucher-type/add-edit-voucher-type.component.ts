import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SharedService } from '../../../../../shared/common-services/shared-service';
import { ToolbarPath } from '../../../../../shared/interfaces/toolbar-path';
import { NgxSpinnerService } from 'ngx-spinner';
import { NAME_REQUIRED_VALIDATORS, REQUIRED_VALIDATORS } from '../../../../../shared/constants/input-validators';
import { Subscription } from 'rxjs';
import { ToolbarData } from '../../../../../shared/interfaces/toolbar-data';
import { ToolbarActions } from '../../../../../shared/enum/toolbar-actions';
import { ICustomEnum } from 'src/app/shared/interfaces/ICustom-enum';

import {
  AccountClassificationsEnum,
  BeneficiaryTypeArEnum,
  BeneficiaryTypeEnum,
  convertEnumToArray,
  CreateFinancialEntryArEnum,
  CreateFinancialEntryEnum,
  GeneralConfigurationEnum,
  ModuleLocationArEnum,
  ModuleLocationEnEnum,
  SerialTypeArEnum,
  SerialTypeEnum,
  VoucherTypeArEnum,
  VoucherTypeEnum,

} from 'src/app/shared/constants/enumrators/enums';

import { PublicService } from 'src/app/shared/services/public.service';
import { VoucherTypeServiceProxy } from '../../../services/voucher-type.service';
import { NotificationsAlertsService } from 'src/app/shared/common-services/notifications-alerts.service';
import { GeneralConfigurationServiceProxy } from '../../../services/general-configurations.services';
import { stringIsNullOrEmpty } from 'src/app/shared/helper/helper';
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
  moduleLocation: ICustomEnum[] = [];

  journalList: any;
  currenciesList: any;
  fiscalPeriodList: any;
  cashAccountList: any;
  serialList: { nameAr: string; nameEn: string; value: string; }[];
  sub: any;
  url: any;
  id: any = 0;
  enableMultiCurrencies: boolean = false;
  mainCurrencyId: number = null;
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
  routeCashAccountApi = 'Account/getLeafAccounts?AccountClassificationId=' + AccountClassificationsEnum.Cash
  companyId: string = localStorage.getItem("companyId");
  branchId: string = localStorage.getItem("branchId");


  constructor(
    private voucherTypeService: VoucherTypeServiceProxy,
    private publicService: PublicService,
    private AlertsService: NotificationsAlertsService,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private sharedServices: SharedService, private translate: TranslateService,
    private generalConfigurationService: GeneralConfigurationServiceProxy,


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
    this.getModuleLocation();


    this.spinner.show();
    Promise.all([
      this.getGeneralConfigurationsOfMultiCurrency(),
      this.getGeneralConfigurationsOfMainCurrency(),
      this.getJournal(),
      this.getCashAccounts(),
      this.getCurrencies()

    ]).then(a => {
      this.getRouteData();
      this.changePath();
      this.listenToClickedButton();
    }).catch((err) => {

      this.spinner.hide();
    })
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
      companyId: this.companyId,
      branchId: this.branchId,
      nameAr: NAME_REQUIRED_VALIDATORS,
      nameEn: '',
      journalId: REQUIRED_VALIDATORS,
      voucherKindId: REQUIRED_VALIDATORS,
      serialTypeId: 1,
      serialId: null,
      defaultAccountId: REQUIRED_VALIDATORS,
      defaultCurrencyId: this.enableMultiCurrencies == true ? ['', Validators.compose([Validators.required])] : this.mainCurrencyId,
      createFinancialEntryId: REQUIRED_VALIDATORS,
      defaultBeneficiaryId: REQUIRED_VALIDATORS,
      location:[ModuleLocationEnEnum.Accounting,Validators.compose([Validators.required])] ,
      printAfterSave: false
    });

  }


  //#endregion

  //#region CRUD Operations
  getRouteData() {
    let sub = this.route.params.subscribe((params) => {
      if (params['id'] != null) {
        this.id = params['id'];
        if (this.id > 0) {
          this.getVoucherTypeById(this.id).then(a => {
            this.sharedServices.changeButton({ action: 'Update', submitMode: false } as ToolbarData);

            this.spinner.hide();

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
    });
    this.subsList.push(sub);

  }
  getGeneralConfigurationsOfMultiCurrency() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.generalConfigurationService.getGeneralConfiguration(GeneralConfigurationEnum.MultiCurrency).subscribe({
        next: (res: any) => {
          resolve();

          if (res.response.value == 'true') {
            this.enableMultiCurrencies = true;
          }


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
  getGeneralConfigurationsOfMainCurrency() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.generalConfigurationService.getGeneralConfiguration(GeneralConfigurationEnum.MainCurrency).subscribe({
        next: (res: any) => {
          resolve();
          if (res.response.value > 0) {
             
            this.mainCurrencyId = res.response.value;
          }


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

  getVoucherTypeById(id: any) {
    return new Promise<void>((resolve, reject) => {
      let sub = this.voucherTypeService.getVoucherType(id).subscribe({
        next: (res: any) => {
          resolve();

          this.voucherTypeForm.setValue({
            id: res.response?.id,
            companyId: res.response?.companyId,
            branchId: res.response?.branchId,
            nameAr: res.response?.nameAr,
            nameEn: res.response?.nameEn,
            journalId: res.response?.journalId,
            voucherKindId: res.response?.voucherKindId,
            serialTypeId: res.response?.serialTypeId,
            serialId: res.response?.serialId,
            defaultAccountId: res.response?.defaultAccountId + "",
            defaultCurrencyId: this.enableMultiCurrencies ==true ? res.response?.defaultCurrencyId: this.mainCurrencyId,
            createFinancialEntryId: res.response?.createFinancialEntryId,
            defaultBeneficiaryId: res.response?.defaultBeneficiaryId,
            location: res.response?.location,
            printAfterSave: res.response?.printAfterSave



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
        },
      });

      this.subsList.push(sub);
    });

  }
  getCashAccounts() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeCashAccountApi).subscribe({
        next: (res) => {
          if (res.success) {
            this.cashAccountList = res.response;

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
  getModuleLocation() {
    if (this.lang == 'en') {
      this.moduleLocation = convertEnumToArray(ModuleLocationEnEnum);
    }
    else {
      this.moduleLocation = convertEnumToArray(ModuleLocationArEnum);

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
            if (this.voucherTypeForm.value.code != null) {
            }
            this.defineVoucherTypeForm();
            this.sharedServices.changeToolbarPath(this.toolbarPathData);
          } else if (currentBtn.action == ToolbarActions.Update && currentBtn.submitMode) {

            this.onUpdate();
          }
          else if (currentBtn.action == ToolbarActions.Copy) {
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
    return new Promise<void>((resolve, reject) => {
      var entity = this.voucherTypeForm.value;

      let sub = this.voucherTypeService.createVoucherType(entity).subscribe({
        next: (result: any) => {
          this.spinner.show();

          this.defineVoucherTypeForm();

          this.submited = false;
          this.spinner.hide();
          this.router.navigate([this.listUrl])
            .then(() => {
              window.location.reload();
            });
        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {
        },
      });
    });
  }
  onSave() {
    if (this.voucherTypeForm.valid) {
      if (stringIsNullOrEmpty(this.voucherTypeForm.value.defaultCurrencyId) &&  this.enableMultiCurrencies ==false) {
        this.errorMessage = this.translate.instant("general.choose-currency-from-configuration");
        this.errorClass = 'errorMessage';
        this.AlertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
        return;
      }
      this.spinner.show();
      this.confirmSave().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });

    } else {
      this.errorMessage = this.translate.instant("validation-messages.invalid-data");
      this.errorClass = 'errorMessage';
      this.AlertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
      return this.voucherTypeForm.markAllAsTouched();
    }
  }
  confirmUpdate() {
    this.voucherTypeForm.value.id = this.id;
    var entityDb = this.voucherTypeForm.value;
    entityDb.id = this.id;

    return new Promise<void>((resolve, reject) => {

      this.voucherTypeService.updateVoucherType(entityDb).subscribe({
        next: (result: any) => {
          this.spinner.show();

          this.defineVoucherTypeForm();
          this.submited = false;
          this.spinner.hide();

          this.router.navigate([this.listUrl])
            .then(() => {
              window.location.reload();
            });
        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {
        },
      });
    });
  }

  onUpdate() {
    if (this.voucherTypeForm.valid) {
       
      if (stringIsNullOrEmpty(this.voucherTypeForm.value.defaultCurrencyId) && this.enableMultiCurrencies==false) {
        this.errorMessage = this.translate.instant("general.choose-currency-from-configuration");
        this.errorClass = 'errorMessage';
        this.AlertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
        return;
      }
      this.spinner.show();
      this.confirmUpdate().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });
    }

    else {

      // this.errorMessage = this.translate.instant("validation-messages.invalid-data");
      // this.errorClass = 'errorMessage';
      // this.AlertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
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

