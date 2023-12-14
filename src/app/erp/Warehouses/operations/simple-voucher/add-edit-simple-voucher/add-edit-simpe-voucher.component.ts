import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { REQUIRED_VALIDATORS } from '../../../../../shared/constants/input-validators';
import { ToolbarPath } from '../../../../../shared/interfaces/toolbar-path';
import { PublicService } from '../../../../../shared/services/public.service';
import { BillInstallmentPay, BillPay, SimpleVoucher, VoucherDetail } from '../../../../Accounting/models/voucher'
import { VoucherServiceProxy } from '../../../../Accounting/services/voucher.service';
import { VoucherTypeServiceProxy } from '../../../../Accounting/services/voucher-type.service';
import { VoucherType } from '../../../../Accounting/models/voucher-type'
import { GeneralConfigurationServiceProxy } from '../../../../Accounting/services/general-configurations.services';
import { AccountClassificationsEnum, BeneficiaryTypeArEnum, BeneficiaryTypeEnum, BillKindEnum, CreateFinancialEntryEnum, GeneralConfigurationEnum, PayWayEnum, PaymentTypArEnum, PaymentTypeEnEnum, SerialTypeArEnum, SerialTypeEnum, VoucherTypeEnum, convertEnumToArray } from '../../../../../shared/constants/enumrators/enums';
import { ICustomEnum } from '../../../../../shared/interfaces/ICustom-enum';
import { ToolbarData } from '../../../../../shared/interfaces/toolbar-data';
import { SharedService } from '../../../../../shared/common-services/shared-service';
import { NotificationsAlertsService } from '../../../../../shared/common-services/notifications-alerts.service';
import { ToolbarActions } from '../../../../../shared/enum/toolbar-actions';
import { formatDate, navigateUrl } from '../../../../../shared/helper/helper-url';
import { DateCalculation, DateModel } from '../../../../../shared/services/date-services/date-calc.service';
import { CurrencyServiceProxy } from '../../../../master-codes/services/currency.servies';
import { FiscalPeriodServiceProxy } from '../../../../Accounting/services/fiscal-period.services';
import { FiscalPeriodStatus } from '../../../../../shared/enum/fiscal-period-status';
import { ReportViewerService } from '../../../../Accounting/reports/services/report-viewer.service';
import { AccountServiceProxy } from '../../../../Accounting/services/account.services';
import { DateConverterService } from '../../../../../shared/services/date-services/date-converter.service';
import { AccountingPeriodServiceProxy } from '../../../../Accounting/services/accounting-period.service';
import { stringIsNullOrEmpty } from '../../../../../shared/helper/helper';
import { BillServiceProxy } from '../../../services/bill.service';
import { BillPayment } from '../../../models/bill';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-add-simple-edit-voucher',
  templateUrl: './add-edit-simple-voucher.component.html',
  styleUrls: ['./add-edit-simple-voucher.component.scss']
})
export class AddEditSimpleVoucherComponent implements OnInit, AfterViewInit {
  //#region Main Declarations
  branchId: any = localStorage.getItem("branchId");
  companyId: any = localStorage.getItem("companyId");
  simpleVoucherForm: FormGroup = new FormGroup({});
  simpleVoucherTypesList: any;
  vouchersList: any;
  fiscalPeriodList: any;

  filterSimpleVouchersList
  showSearchSalesPersonModal = false;
  showPaidBills = false;
  fiscalPeriodcheckDate: any;
  showDetails: boolean = false;
  accountingPeriodCheckDate: any;
  salesPersonsList: any;
  routeSalesPersonApi = 'SalesPersonCard/get-ddl?'
  routeFiscalPeriodApi = "FiscalPeriod/get-ddl?"

  currencyId: any;
  cashAccountId: any;
  voucherkindId: any;
  serialTypeId: any;
  accountingPeriods: any;
  createFinancialEntryId: number;
  voucherDate!: DateModel;
  chequeDate!: DateModel;
  chequeDueDate!: DateModel;
  nameEn: any;
  nameAr: any;
  defaultBeneficiaryId: any;
  showSearchCashAccountModal = false;
  showSearchCostCenterModal = false;
  showSearchBeneficiaryAccountsModal = false;
  showSearhBeneficiaryAccountsModal = false;
  showSearchCurrencyModal = false;
  tempVoucherDetail: any[] = [];
  oldVoucherTotalLocal: number = 0;
  voucherTypeName: string;
  enableMultiCurrencies: boolean = false;
  mainCurrencyId: number;
  fiscalPeriodId: number;
  fiscalPeriodName: string;
  fiscalPeriodStatus: number;
  totalDebitLocal: number = 0;
  totalCreditLocal: number = 0;
  simpleVoucher: SimpleVoucher = new SimpleVoucher();
  voucherDetail: VoucherDetail[] = [];
  selectedVoucherDetail: VoucherDetail = new VoucherDetail();
  beneficiaryTypesEnum: ICustomEnum[] = [];
  paymentTypesEnum: ICustomEnum[] = [];
  billPay: BillPay[] = [];
  billInstallmentPay: BillInstallmentPay[] = [];
  billPayment: any;
  billPaid: any;
  beneficiariesList: any;
  beneficiaryTypeId: any;
  fromDate: any;
  toDate: any;
  sub: any;
  url: any;
  id: any = 0;
  currnetUrl;
  errorMessage = '';
  errorClass = '';
  lang = localStorage.getItem("language")
  routeCashAccountApi = 'Account/getLeafAccounts?AccountClassificationId=' + AccountClassificationsEnum.Cash
  routeCurrencyApi = "Currency/get-ddl?"
  routeCostCenterApi = 'CostCenter/get-ddl?'
  routeCustomerApi = 'CustomerCard/get-ddl?'
  routeSupplierApi = 'SupplierCard/get-ddl?'
  routeAccountApi = 'Account/GetLeafAccounts?'
  routeVoucherApi = 'Voucher/get-ddl?'
  cashBankAccountsList: any;
  beneficiaryAccountsList: any;
  filterBeneficiaryList: any;
  beneficiaryAccountId: number;
  currenciesList: any;
  currenciesListInDetail: any;
  costCentersList: any;
  costCentersInDetailsList: any;
  currencyTransactionList: any;
  filterCurrencyTransactionList: any;
  cashAndBankAccountsList: any;
  customersList: any;
  suppliersList: any;
  accountsList: any;
  balance: number = 0;

  queryParams: any;
  voucherTypeId: any;
  voucherType: VoucherType[] = [];
  currencyFactor: number;
  voucherTotal: number = 0;
  voucherTotalLocal: number = 0;
  currency: any;
  addUrl: string = '/warehouses-operations/simpleVoucher/add-simpleVoucher';
  updateUrl: string = '/warehouses-operations/simpleVoucher/update-simpleVoucher/';
  listUrl: string = '/warehouses-operations/simpleVoucher/';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.simple-vouchers"),
    componentAdd: '',

  };

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private translate: TranslateService,
    private publicService: PublicService,
    private voucherService: VoucherServiceProxy,
    private dateService: DateCalculation,
    private currencyService: CurrencyServiceProxy,
    private voucherTypeService: VoucherTypeServiceProxy,
    private generalConfigurationService: GeneralConfigurationServiceProxy,
    private sharedServices: SharedService,
    private alertsService: NotificationsAlertsService,
    private currencyServiceProxy: CurrencyServiceProxy,
    private fiscalPeriodService: FiscalPeriodServiceProxy,
    private reportViewerService: ReportViewerService,
    private accountService: AccountServiceProxy,
    private accountingPeriodServiceProxy: AccountingPeriodServiceProxy,
    private billService: BillServiceProxy,
    private dateConverterService: DateConverterService,
    private datePipe: DatePipe,


  ) {
    this.defineSimpleVoucherForm();
    this.voucherDetail = [];

  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    this.getPaymentTypes();
    this.getBeneficiaryTypes();

    this.spinner.show();

    Promise.all([
      this.getGeneralConfigurationsOfMainCurrency(),
      this.getGeneralConfigurationsOfMultiCurrency(),
      this.getGeneralConfigurationsOfFiscalPeriod(),
      this.getCurrencies(),
      this.getCurrenciesTransactions(),
      this.getAccounts(),
      this.getCostCenters(),
      this.getCustomers(),
      this.getSuppliers(),
      this.getSalesPersons(),
      this.getFiscalPeriod()



    ]).then(a => {
      this.getRouteData();
      this.changePath();
      this.listenToClickedButton();
    }).catch((err) => {

      this.spinner.hide();
    })


  }
  getRouteData() {
    localStorage.removeItem("itemId")
    let sub = this.route.params.subscribe((params) => {
      if (params['voucherTypeId'] != null) {
        this.voucherTypeId = params['voucherTypeId'];
        if (this.voucherTypeId) {
          this.getSimpleVoucherTypes(this.voucherTypeId);
        }
      }
      if (params['id'] != null) {
        this.id = params['id'];

        if (this.id) {
          localStorage.setItem("itemId", this.id)
          this.getSimpleVoucherById(this.id, 1).then(a => {
            this.getVoucherBillPay(this.id);
            this.sharedServices.changeButton({ action: 'Update', disabledPrint: false } as ToolbarData)
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
        this.sharedServices.changeButton({ action: 'New' } as ToolbarData);
        this.spinner.hide();
      }
    });
    this.subsList.push(sub);

  }

  //#endregion
  ngAfterViewInit(): void {

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
  defineSimpleVoucherForm() {
    this.simpleVoucherForm = this.fb.group({
      id: 0,
      companyId: this.companyId,
      branchId: this.branchId,
      voucherTypeId: this.voucherTypeId,
      code: REQUIRED_VALIDATORS,
      voucherDate: [this.dateService.getCurrentDate(), Validators.compose([Validators.required])],
      cashAccountId: REQUIRED_VALIDATORS,
      costCenterId: '',
      currencyId: this.enableMultiCurrencies == true ? ['', Validators.compose([Validators.required])] : this.mainCurrencyId,
      description: '',
      voucherTotal: REQUIRED_VALIDATORS,
      voucherTotalLocal: REQUIRED_VALIDATORS,
      currencyFactor: 1,
      fiscalPeriodId: this.fiscalPeriodId,
      referenceId: '',
      referenceNo: '',
      paymentType: REQUIRED_VALIDATORS,
      chequeNumber: '',
      chequeDate: this.dateService.getCurrentDate(),
      chequeDueDate: this.dateService.getCurrentDate(),
      invoicesNotes: '',
      salesPersonId: '',
      beneficiaryTypeId: REQUIRED_VALIDATORS,
      beneficiaryId: REQUIRED_VALIDATORS




    });
    this.voucherDate = this.dateService.getCurrentDate();
    this.chequeDate = this.dateService.getCurrentDate();
    this.chequeDueDate = this.dateService.getCurrentDate();


  }
  getfiscalPeriodById(id: any) {
    return new Promise<void>((resolve, reject) => {
      let sub = this.fiscalPeriodService.getFiscalPeriod(id).subscribe({
        next: (res: any) => {
          resolve();
          this.fiscalPeriodName = this.lang == 'ar' ? res.response?.nameAr : res.response?.nameEn;
          this.fiscalPeriodStatus = res.response?.fiscalPeriodStatus.toString();
          this.fromDate = res.response?.fromDate;
          this.toDate = res.response?.toDate;

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
  getVoucherData(referenceId: number) {
    this.getSimpleVoucherById(referenceId, 2);
  }
  getSimpleVouchers(voucherTypeId: number) {
    return new Promise<void>((resolve, reject) => {
      let sub = this.voucherService.allVouchers(undefined, undefined, undefined, undefined, undefined).subscribe({
        next: (res) => {
          if (res.success) {
            this.vouchersList = res.response.items.filter(x => x.voucherTypeId == voucherTypeId && x.branchId == this.branchId && x.companyId == this.companyId && x.fiscalPeriodId == this.fiscalPeriodId)

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
  getClosedAccountingPeriodsByFiscalPeriodId(fiscalPeriodId: any) {
    return new Promise<void>((resolve, reject) => {
      let sub = this.accountingPeriodServiceProxy.allAccountingPeriods(undefined, undefined, undefined, undefined, undefined).subscribe({
        next: (res) => {
          if (res.success) {
            this.accountingPeriods = res.response.items.filter(x => x.companyId == this.companyId && x.fiscalPeriodId == fiscalPeriodId);
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
  getBeneficiary(beneficiaryTypeId: any) {

    this.beneficiariesList = [];
    this.simpleVoucherForm.patchValue({
      beneficiaryId: ''
    });
    if (beneficiaryTypeId == BeneficiaryTypeEnum.Client) {
      this.beneficiariesList = this.customersList;
    }
    if (beneficiaryTypeId == BeneficiaryTypeEnum.Supplier) {
      this.beneficiariesList = this.suppliersList;

    }
    if (beneficiaryTypeId == BeneficiaryTypeEnum.Account) {
      this.beneficiariesList = this.accountsList;

    }

  }
  //#region Helper Functions

  get f(): { [key: string]: AbstractControl } {
    return this.simpleVoucherForm.controls;
  }
  //#endregion
  getSimpleVoucherTypes(id) {
    return new Promise<void>((resolve, reject) => {
      let sub = this.voucherTypeService.getVoucherType(id).subscribe({
        next: (res: any) => {
          resolve();
          this.cashAccountId = res.response.defaultAccountId + "";
          this.currencyId = res.response.defaultCurrencyId;
          this.simpleVoucherForm.value.currencyId = res.response.defaultCurrencyId;
          this.voucherkindId = res.response.voucherKindId;
          this.serialTypeId = res.response.serialTypeId;
          this.createFinancialEntryId = res.response.createFinancialEntryId;
          this.voucherTypeName = this.lang == 'ar' ? res.response.nameAr : res.response.nameEn;
          this.nameAr = res.response.nameAr;
          this.defaultBeneficiaryId = res.response.defaultBeneficiaryId;

          if (this.id == 0) {
            if (this.serialTypeId == SerialTypeEnum.Automatic) {
              this.getVoucherCode();
            }
          }
          if (this.voucherkindId != null) {
            this.getSimpleVoucherTypesByKind(this.voucherkindId);
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
  getSimpleVoucherTypesByKind(voucherkindId: any) {
    return new Promise<void>((resolve, reject) => {
      let sub = this.voucherTypeService.allVoucherTypees(undefined, undefined, undefined, undefined, undefined).subscribe({
        next: (res) => {
          if (res.success) {
            this.simpleVoucherTypesList = res.response.items.filter(x => x.voucherKindId == voucherkindId && x.companyId == this.companyId && this.branchId == this.branchId);

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
  getSimpleVouchersByReferenceId(ReferenceId: any) {
    debugger
    this.filterSimpleVouchersList = this.vouchersList.filter(x => x.voucherTypeId == ReferenceId);
  }
  getSimpleVoucherById(id: any, type: number) {
    this.lang = localStorage.getItem("language");
    return new Promise<void>((resolve, reject) => {
      let sub = this.voucherService.getVoucher(id).subscribe({
        next: (res: any) => {
          resolve();
          this.getBeneficiary(res.response?.voucherDetail[0].beneficiaryTypeId);
          this.simpleVoucherForm.setValue({
            id: type == 1 ? res.response?.id : this.id,
            companyId: res.response?.companyId,
            branchId: res.response?.branchId,
            voucherTypeId: type == 1 ? res.response?.voucherTypeId : this.voucherTypeId,
            code: type == 1 ? res.response?.code : this.simpleVoucherForm.value.code,
            voucherDate: this.dateService.getDateForCalender(res.response?.voucherDate),
            cashAccountId: res.response?.cashAccountId + "",
            costCenterId: res.response?.costCenterId,
            currencyId: this.enableMultiCurrencies == true ? res.response?.currencyId : this.mainCurrencyId,
            description: res.response?.description,
            voucherTotal: res.response?.voucherTotal,
            voucherTotalLocal: res.response?.voucherTotalLocal,
            currencyFactor: res.response?.currencyFactor,
            fiscalPeriodId: res.response?.fiscalPeriodId,
            referenceId: type == 1 ? res.response?.referenceId : this.simpleVoucherForm.value.referenceId,
            referenceNo: type == 1 ? res.response?.referenceNo : this.simpleVoucherForm.value.referenceNo,
            paymentType: res.response?.paymentType,
            chequeNumber: res.response?.chequeNumber,
            chequeDate: this.dateService.getDateForCalender(res.response?.chequeDate),
            chequeDueDate: this.dateService.getDateForCalender(res.response?.chequeDueDate),
            invoicesNotes: res.response?.invoicesNotes,
            salesPersonId: res.response?.salesPersonId,
            beneficiaryTypeId: res.response?.voucherDetail[0].beneficiaryTypeId,
            beneficiaryId: res.response?.voucherDetail[0].beneficiaryId,


          });
          this.beneficiaryAccountId = res.response?.voucherDetail[0].beneficiaryAccountId

          this.voucherTotal = res.response?.voucherTotal;
          this.voucherTotalLocal = res.response?.voucherTotalLocal;

          this.setInputData();
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
  getGeneralConfigurationsOfFiscalPeriod() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.generalConfigurationService.getGeneralConfiguration(GeneralConfigurationEnum.AccountingPeriod).subscribe({
        next: (res: any) => {
          resolve();

          if (res.response.value > 0) {
            this.fiscalPeriodId = res.response.value;
            this.getfiscalPeriodById(this.fiscalPeriodId);
            this.getClosedAccountingPeriodsByFiscalPeriodId(this.fiscalPeriodId);

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
  getVoucherCode() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.voucherService.getLastCodeByTypeId(this.voucherTypeId).subscribe({
        next: (res: any) => {
          resolve();
          this.simpleVoucherForm.patchValue({
            code: res.response.data
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
  getAccounts() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeAccountApi).subscribe({
        next: (res) => {
          if (res.success) {
            this.cashAndBankAccountsList = res.response.filter(x => x.accountClassificationId == AccountClassificationsEnum.Cash || x.accountClassificationId == AccountClassificationsEnum.Bank);
            this.accountsList = res.response;

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
            this.currenciesListInDetail = res.response;

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
  getCurrenciesTransactions() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.currencyService.getCurrenciesTransactions().subscribe({
        next: (res) => {
          resolve();

          if (res.success) {

            this.currencyTransactionList = res.response;

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
  getCostCenters() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeCostCenterApi).subscribe({
        next: (res) => {
          if (res.success) {
            this.costCentersList = res.response;
            this.costCentersInDetailsList = res.response;

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
  onSelectCashAccount(event) {
    this.simpleVoucherForm.controls.cashAccountId.setValue(event.id);
    this.showSearchCashAccountModal = false;
  }
  onSelectCostCenter(event) {
    this.simpleVoucherForm.controls.costCenterId.setValue(event.id);
    this.showSearchCostCenterModal = false;
  }
  onSelectCurrency(event) {
    this.simpleVoucherForm.controls.currencyId.setValue(event.id);
    this.showSearchCurrencyModal = false;
  }
  getBeneficiaryTypes() {
    if (this.lang == 'en') {
      this.beneficiaryTypesEnum = convertEnumToArray(BeneficiaryTypeEnum);
    }
    else {
      this.beneficiaryTypesEnum = convertEnumToArray(BeneficiaryTypeArEnum);

    }
  }
  getPaymentTypes() {
    if (this.lang == 'en') {
      this.paymentTypesEnum = convertEnumToArray(PaymentTypeEnEnum);
    }
    else {
      this.paymentTypesEnum = convertEnumToArray(PaymentTypArEnum);

    }
  }

  index: any;

  numberOnly(event, i, type): boolean {
    this.index = i;
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;

  }
  onInput(event, i) {
    debugger
    this.billPayment[i].amount = Number(event);
    this.billPayment[i].remaining = this.billPayment[i].remaining2 - Number(event);


  }



  setInputData() {
    if (this.id == 0) {
      this.billPayment.forEach(element => {
        var paid = 0;
        var amount = 0;
        var remainig = 0;
        if (element.paid > 0) {
          paid = element.paid;
        }
        if (element.amount > 0) {
          amount = element.amount;
        }
        if (element.remainig > 0) {
          remainig = element.remainig;
        }
        element.paid = paid + amount;

      });
    }
    this.simpleVoucher.voucherDetail.push({
      id: 0,
      voucherId: 0,
      beneficiaryTypeId: this.simpleVoucherForm.controls["beneficiaryTypeId"].value,
      beneficiaryId: this.simpleVoucherForm.controls["beneficiaryId"].value,
      beneficiaryAccountId: Number(this.beneficiaryAccountId),
      debit: this.voucherkindId == VoucherTypeEnum['Simple Withdrawal'] ? this.voucherTotal : 0,
      credit: this.voucherkindId == VoucherTypeEnum['Simple Deposit'] ? this.voucherTotal : 0,
      currencyId: this.simpleVoucherForm.controls["currencyId"].value,
      currencyConversionFactor: this.simpleVoucherForm.controls["currencyFactor"].value,
      debitLocal: this.voucherkindId == VoucherTypeEnum['Simple Withdrawal'] ? this.voucherTotalLocal : 0,
      creditLocal: this.voucherkindId == VoucherTypeEnum['Simple Deposit'] ? this.voucherTotalLocal : 0,
      description: '',
      costCenterId: this.simpleVoucherForm.controls["costCenterId"].value,
      currencyName: '',
      beneficiaryName: '',
      costCenterName: ''
    })
    this.simpleVoucher = {
      id: this.simpleVoucherForm.controls["id"].value,
      companyId: this.simpleVoucherForm.controls["companyId"].value,
      branchId: this.simpleVoucherForm.controls["branchId"].value,
      voucherTypeId: this.voucherTypeId,
      code: this.simpleVoucherForm.controls["code"].value,
      voucherDate: formatDate(Date.parse(this.simpleVoucherForm.controls["voucherDate"].value)),
      cashAccountId: this.simpleVoucherForm.controls["cashAccountId"].value,
      costCenterId: this.simpleVoucherForm.controls["costCenterId"].value,
      currencyId: this.simpleVoucherForm.controls["currencyId"].value,
      description: this.simpleVoucherForm.controls["description"].value,
      voucherTotal: this.simpleVoucherForm.controls["voucherTotal"].value,
      voucherTotalLocal: this.simpleVoucherForm.controls["voucherTotalLocal"].value,
      currencyFactor: this.simpleVoucherForm.controls["currencyFactor"].value,
      fiscalPeriodId: this.simpleVoucherForm.controls["fiscalPeriodId"].value,
      referenceId: this.simpleVoucherForm.controls["referenceId"].value,
      referenceNo: this.simpleVoucherForm.controls["referenceNo"].value,
      paymentType: this.simpleVoucherForm.controls["paymentType"].value,
      chequeNumber: this.simpleVoucherForm.controls["chequeNumber"].value,
      chequeDate: formatDate(Date.parse(this.simpleVoucherForm.controls["chequeDate"].value)),
      chequeDueDate: formatDate(Date.parse(this.simpleVoucherForm.controls["chequeDueDate"].value)),
      invoicesNotes: this.simpleVoucherForm.controls["invoicesNotes"].value,
      salesPersonId: this.simpleVoucherForm.controls["salesPersonId"].value,

      voucherDetail: this.simpleVoucher.voucherDetail ?? [],
      // billPay: this.simpleVoucher.billPay ?? [],
      billPay: this.billPayment ?? [],

      billInstallmentPay: this.simpleVoucher.billInstallmentPay ?? [],


    };



  }
  confirmSave() {
    this.simpleVoucher.voucherDate = this.dateService.getDateForInsert(this.simpleVoucherForm.controls["voucherDate"].value);
    this.simpleVoucher.chequeDate = this.dateService.getDateForInsert(this.simpleVoucherForm.controls["chequeDate"].value);
    this.simpleVoucher.chequeDueDate = this.dateService.getDateForInsert(this.simpleVoucherForm.controls["chequeDueDate"].value);

    return new Promise<void>((resolve, reject) => {
      debugger
      let sub = this.voucherService.createVoucherAndRelations(this.simpleVoucher.voucherTypeId, this.simpleVoucher).subscribe({
        next: (result: any) => {
          this.defineSimpleVoucherForm();
          this.voucherDetail = [];
          navigateUrl(this.listUrl + this.voucherTypeId, this.router);

          this.spinner.hide();

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
  getAccountBalance(id: any) {
    return new Promise<void>((resolve, reject) => {
      let sub = this.accountService.getAccountBalance(id).subscribe({
        next: (res: any) => {
          resolve();

          this.balance = res.response.data.result[0].balance;


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
    if (this.simpleVoucherForm.valid) {
      if (this.fiscalPeriodId > 0) {
        if (this.fiscalPeriodStatus != FiscalPeriodStatus.Opened) {
          this.errorMessage = this.translate.instant("voucher.no-add-voucher-fiscal-period-closed") + " : " + this.fiscalPeriodName;
          this.errorClass = 'errorMessage';
          this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
          return;
        }

        let _date = this.dateConverterService.getDateTimeForInsertISO_Format(this.voucherDate);
        if (this.accountingPeriods != null) {
          this.accountingPeriodCheckDate = this.accountingPeriods.find(x => x.fromDate <= _date && x.toDate >= _date);
          if (this.accountingPeriodCheckDate != undefined) {

            this.errorMessage = this.translate.instant("general.date-in-closed-accounting-period");
            this.errorClass = 'errorMessage';
            this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
            return;
          }
        }

        let checkDate = this.dateService.getDateForInsert(this.voucherDate)
        const date = new Date(checkDate);
        const formattedDate = this.datePipe.transform(date, 'yyyy-MM-ddT00:00:00');
        this.fiscalPeriodcheckDate = this.fiscalPeriodList.find(x => x.fromDate <= formattedDate && x.toDate >= formattedDate);

        if (this.fiscalPeriodcheckDate == undefined) {
          this.errorMessage = this.translate.instant("general.date-out-fiscal-period");
          this.errorClass = 'errorMessage';
          this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
          return;
        }

      }

      var i = 0;
      if (this.createFinancialEntryId == CreateFinancialEntryEnum['Create the entry automatically']) {

        this.getAccountBalance(this.cashAccountId).then(a => {
          var account = this.cashAndBankAccountsList.find(x => x.id == this.cashAccountId);

          var accountName = this.lang == 'ar' ? account.nameAr : account.nameEn;

          if (Number(this.balance) > 0 && account.debitLimit > 0) {

            if (Number(this.balance) + this.voucherTotalLocal > account.debitLimit) {


              this.errorMessage = this.translate.instant('general.debit-limit-exceed-account') + " : " + accountName + "(" + this.translate.instant('general.cash-account') + ")" + this.translate.instant('general.code') + " : " + account.code;
              this.errorClass = 'errorMessage';
              this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
              i++;
            }

          }
          else if (Number(this.balance) < 0 && account.creditLimit > 0) {

            if (-(this.balance) + this.voucherTotalLocal > account.creditLimit) {

              this.errorMessage = this.translate.instant('general.credit-limit-exceed-account') + " : " + accountName + "(" + this.translate.instant('general.cash-account') + ")" + this.translate.instant('general.code') + " : " + account.code;
              this.errorClass = 'errorMessage';
              this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
              i++;
            }


          }


        });


        this.getAccountBalance(this.beneficiaryAccountId).then(a => {
          var account = this.accountsList.find(x => x.id == this.beneficiaryAccountId);

          var accountName = this.lang == 'ar' ? account.nameAr : account.nameEn;

          if (Number(this.balance) > 0 && account.debitLimit > 0) {

            if (Number(this.balance) + this.voucherTotalLocal > account.debitLimit) {

              this.errorMessage = this.translate.instant('general.debit-limit-exceed-account') + " : " + accountName + "(" + this.translate.instant('general.cash-account') + ")" + this.translate.instant('general.code') + " : " + account.code;
              this.errorClass = 'errorMessage';
              this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
              i++;
            }

          }
          else if (Number(this.balance) < 0 && account.creditLimit > 0) {

            if (-(this.balance) + this.voucherTotalLocal > account.creditLimit) {

              this.errorMessage = this.translate.instant('general.credit-limit-exceed-account') + " : " + accountName + "(" + this.translate.instant('general.cash-account') + ")" + this.translate.instant('general.code') + " : " + account.code;
              this.errorClass = 'errorMessage';
              this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
              i++;
            }


          }


        });


      }
      setTimeout(() => {
        if (i == 0) {
          this.setInputData();
          this.spinner.show();
          this.confirmSave().then(a => {
            this.spinner.hide();
          }).catch(e => {
            this.spinner.hide();
          });
        }
      }, 1000);
    }
    else {
      this.errorMessage = this.translate.instant("validation-messages.invalid-data");
      this.errorClass = 'errorMessage';
      this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
      return this.simpleVoucherForm.markAllAsTouched();

    }
  }
  confirmUpdate() {
    this.simpleVoucher.voucherDate = this.dateService.getDateForInsert(this.simpleVoucherForm.controls["voucherDate"].value);
    this.simpleVoucher.chequeDate = this.dateService.getDateForInsert(this.simpleVoucherForm.controls["chequeDate"].value);
    this.simpleVoucher.chequeDueDate = this.dateService.getDateForInsert(this.simpleVoucherForm.controls["chequeDueDate"].value);

    return new Promise<void>((resolve, reject) => {
      let sub = this.voucherService.updateVoucherAndRelations(this.simpleVoucher.voucherTypeId, this.simpleVoucher).subscribe({
        next: (result: any) => {
          this.defineSimpleVoucherForm();
          this.voucherDetail = [];

          navigateUrl(this.listUrl + this.voucherTypeId, this.router);

          this.spinner.hide();

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

    if (this.simpleVoucherForm.valid) {
      
      if (this.fiscalPeriodId > 0) {
        if (this.fiscalPeriodStatus != FiscalPeriodStatus.Opened) {
          this.errorMessage = this.translate.instant("voucher.no-update-voucher-fiscal-period-closed") + " : " + this.fiscalPeriodName;
          this.errorClass = 'errorMessage';
          this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
          return;
        }

        let _date = this.dateConverterService.getDateTimeForInsertISO_Format(this.voucherDate);
        if (this.accountingPeriods != null) {
          this.accountingPeriodCheckDate = this.accountingPeriods.find(x => x.fromDate <= _date && x.toDate >= _date);
          if (this.accountingPeriodCheckDate != undefined) {

            this.errorMessage = this.translate.instant("general.date-in-closed-accounting-period");
            this.errorClass = 'errorMessage';
            this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
            return;
          }
        }

        let checkDate = this.dateService.getDateForInsert(this.voucherDate)
        const date = new Date(checkDate);
        const formattedDate = this.datePipe.transform(date, 'yyyy-MM-ddT00:00:00');
        this.fiscalPeriodcheckDate = this.fiscalPeriodList.find(x => x.fromDate <= formattedDate && x.toDate >= formattedDate);

        if (this.fiscalPeriodcheckDate == undefined) {
          this.errorMessage = this.translate.instant("general.date-out-fiscal-period");
          this.errorClass = 'errorMessage';
          this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
          return;
        }

      }
      var i = 0;
      if (this.createFinancialEntryId == CreateFinancialEntryEnum['Create the entry automatically']) {

        this.getAccountBalance(this.cashAccountId).then(a => {
          var account = this.cashAndBankAccountsList.find(x => x.id == this.cashAccountId);

          var accountName = this.lang == 'ar' ? account.nameAr : account.nameEn;

          if (Number(this.balance) > 0 && account.debitLimit > 0) {

            if (Number(this.balance) + this.voucherTotalLocal > account.debitLimit) {


              this.errorMessage = this.translate.instant('general.debit-limit-exceed-account') + " : " + accountName + "(" + this.translate.instant('general.cash-account') + ")" + this.translate.instant('general.code') + " : " + account.code;
              this.errorClass = 'errorMessage';
              this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
              i++;
            }

          }
          else if (Number(this.balance) < 0 && account.creditLimit > 0) {

            if (-(this.balance) + this.voucherTotalLocal > account.creditLimit) {

              this.errorMessage = this.translate.instant('general.credit-limit-exceed-account') + " : " + accountName + "(" + this.translate.instant('general.cash-account') + ")" + this.translate.instant('general.code') + " : " + account.code;
              this.errorClass = 'errorMessage';
              this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
              i++;
            }


          }


        });


        this.getAccountBalance(this.beneficiaryAccountId).then(a => {
          var account = this.accountsList.find(x => x.id == this.beneficiaryAccountId);

          var accountName = this.lang == 'ar' ? account.nameAr : account.nameEn;

          if (Number(this.balance) > 0 && account.debitLimit > 0) {

            if (Number(this.balance) + this.voucherTotalLocal > account.debitLimit) {

              this.errorMessage = this.translate.instant('general.debit-limit-exceed-account') + " : " + accountName + "(" + this.translate.instant('general.cash-account') + ")" + this.translate.instant('general.code') + " : " + account.code;
              this.errorClass = 'errorMessage';
              this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
              i++;
            }

          }
          else if (Number(this.balance) < 0 && account.creditLimit > 0) {

            if (-(this.balance) + this.voucherTotalLocal > account.creditLimit) {

              this.errorMessage = this.translate.instant('general.credit-limit-exceed-account') + " : " + accountName + "(" + this.translate.instant('general.cash-account') + ")" + this.translate.instant('general.code') + " : " + account.code;
              this.errorClass = 'errorMessage';
              this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
              i++;
            }


          }


        });


      }
      
      setTimeout(() => {
        if (i == 0) {
          this.setInputData();
          this.spinner.show();
          this.confirmUpdate().then(a => {
            this.spinner.hide();
          }).catch(e => {
            this.spinner.hide();
          });
        }
      }, 1000);

    }
    else {
      this.errorMessage = this.translate.instant("validation-messages.invalid-data");
      this.errorClass = 'errorMessage';
      this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
      return this.simpleVoucherForm.markAllAsTouched();

    }
  }
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
              listPath: this.listUrl + this.voucherTypeId,
            } as ToolbarPath);
            this.router.navigate([this.listUrl + this.voucherTypeId]);
          } else if (currentBtn.action == ToolbarActions.Save) {
            this.onSave();
          } else if (currentBtn.action == ToolbarActions.New) {
            this.toolbarPathData.componentAdd = this.translate.instant("voucher.add-voucher");
            this.defineSimpleVoucherForm();
            this.voucherDetail = [];

            this.sharedServices.changeToolbarPath(this.toolbarPathData);
          } else if (currentBtn.action == ToolbarActions.Update && currentBtn.submitMode) {
            this.onUpdate();
          }
          else if (currentBtn.action == ToolbarActions.Copy) {
            this.getVoucherCode();
          } else if (currentBtn.action == ToolbarActions.Print) {
            this.onViewReportClicked(this.id);
          }
        }
      },
    });
    this.subsList.push(sub);
  }
  changePath() {
    this.sharedServices.changeToolbarPath(this.toolbarPathData);
  }
  getVoucherDate(selectedDate: DateModel) {
    this.voucherDate = selectedDate;
  }
  getChequeDate(selectedDate: DateModel) {
    this.chequeDate = selectedDate;
  }
  getChequeDueDate(selectedDate: DateModel) {
    this.chequeDueDate = selectedDate;
  }


  getVoucherTotal() {
    if (this.enableMultiCurrencies == true) {
      if (this.simpleVoucherForm.value.currencyId == Number(this.mainCurrencyId)) {
        this.voucherTotal = this.voucherTotalLocal;
        this.currencyFactor = 1;
      }
      else {
        let sub = this.currencyServiceProxy.getCurrency(this.simpleVoucherForm.value.currencyId).subscribe({
          next: (res: any) => {

            this.currency = res;
            let currencyModel = this.currency.response.currencyTransactionsDto.filter(x => x.currencyDetailId == this.mainCurrencyId)[0];
            this.currencyFactor = currencyModel.transactionFactor;
            this.voucherTotal = (1 / currencyModel.transactionFactor) * this.voucherTotalLocal;
          }
        })
        this.subsList.push(sub);

      }
    }

  }

  getVoucherTotalLocal() {

    if (this.enableMultiCurrencies == true) {
      if (this.simpleVoucherForm.value.currencyId == Number(this.mainCurrencyId)) {
        this.voucherTotalLocal = this.voucherTotal;
        this.currencyFactor = 1;
      }
      else {
        let sub = this.currencyServiceProxy.getCurrency(this.simpleVoucherForm.value.currencyId).subscribe({
          next: (res: any) => {

            this.currency = res;
            let currencyModel = this.currency.response.currencyTransactionsDto.filter(x => x.currencyDetailId == this.mainCurrencyId)[0];
            this.currencyFactor = currencyModel.transactionFactor;
            this.voucherTotalLocal = currencyModel.transactionFactor * this.voucherTotal;
          }
        })
        this.subsList.push(sub);

      }
    }

  }
  getCustomers() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeCustomerApi).subscribe({
        next: (res) => {
          if (res.success) {
            this.customersList = res.response;

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
  getSuppliers() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeSupplierApi).subscribe({
        next: (res) => {
          if (res.success) {
            this.suppliersList = res.response;

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
  getSalesPersons() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeSalesPersonApi).subscribe({
        next: (res) => {
          if (res.success) {
            this.salesPersonsList = res.response;

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

  selectBillPayment(item: BillPayment, event) {
    if (event.target.checked) {
      debugger
      this.simpleVoucher.billPay.push({
        id: 0,
        voucherId: 0,
        billId: item.id,
        net: item.net,
        return: 0,
        paid: item.paid,
        amount: 0,
        remaining: item.remaining - item.paid
      });
      this.voucherTotalLocal += item.paid;

    }
    else {

      let removedItem = this.simpleVoucher.billPay.find(x => x.id == item.id);
      const index = this.simpleVoucher.billPay.indexOf(removedItem!);
      if (index > -1) {
        this.simpleVoucher.billPay.splice(index, 1);

      }
      this.voucherTotalLocal -= item.paid
    }
    this.getVoucherTotal();
  }


  getBillPaid(event) {
    debugger
    this.billPaid = [];
    if (event.target.checked) {
      this.showPaidBills = true;

      if (this.voucherkindId == VoucherTypeEnum['Simple Deposit'] && this.simpleVoucherForm.value.beneficiaryTypeId == BeneficiaryTypeEnum.Client) {

        return new Promise<void>((resolve, reject) => {
          debugger
          let sub = this.billService.GetBillPaidByParams(PayWayEnum.Credit, BillKindEnum['Sales Bill'], this.simpleVoucherForm.value.beneficiaryId, '').subscribe({
            next: (res: any) => {
              resolve();
              debugger
              this.billPaid = res.response.data
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

      if (this.voucherkindId == VoucherTypeEnum['Simple Withdrawal'] && this.simpleVoucherForm.value.beneficiaryTypeId == BeneficiaryTypeEnum.Supplier) {
        return new Promise<void>((resolve, reject) => {
          let sub = this.billService.GetBillPaidByParams(PayWayEnum.Credit, BillKindEnum['Purchases Bill'], '', this.simpleVoucherForm.value.beneficiaryId).subscribe({
            next: (res: any) => {
              resolve();
              this.billPaid = res.response.data
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
    }
    else {
      this.showPaidBills = false;

    }

  }

  getBillPaymentsByBeneficiaryId(beneficiaryId: number) {
    debugger
    this.billPayment = [];

    if (this.simpleVoucherForm.value.beneficiaryTypeId == BeneficiaryTypeEnum.Account) {
      this.beneficiaryAccountId = beneficiaryId;
    }
    else {
      this.beneficiaryAccountId = this.beneficiariesList.find(x => x.id == beneficiaryId).accountId;
    }
    if (this.voucherkindId == VoucherTypeEnum['Simple Deposit'] && this.simpleVoucherForm.value.beneficiaryTypeId == BeneficiaryTypeEnum.Client) {

      return new Promise<void>((resolve, reject) => {

        let sub = this.billService.GetBillPaymentsByParams(PayWayEnum.Credit, BillKindEnum['Sales Bill'], beneficiaryId, '').subscribe({
          next: (res: any) => {
            resolve();
            debugger
            if (res.response.data != null) {
              debugger
              res.response.data.forEach(element => {
                debugger
                element.id = 0;
                element.billId = element.billId;
                element.remaining2 = element.remaining;
                this.billPayment.push(element)

              });
            }
            //this.billPayment = res.response.data
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

    if (this.voucherkindId == VoucherTypeEnum['Simple Withdrawal'] && this.simpleVoucherForm.value.beneficiaryTypeId == BeneficiaryTypeEnum.Supplier) {
      return new Promise<void>((resolve, reject) => {
        let sub = this.billService.GetBillPaymentsByParams(PayWayEnum.Credit, BillKindEnum['Purchases Bill'], '', beneficiaryId).subscribe({
          next: (res: any) => {
            resolve();
            //this.billPayment = res.response.data
            if (res.response.data != null) {
              res.response.data.forEach(element => {
                element.id = 0;
                element.billId = element.billId;
                element.remaining2 = element.remaining;
                this.billPayment.push(element)

              });
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
  }

  getVoucherBillPay(voucherId: number) {
    this.billPayment = [];
    return new Promise<void>((resolve, reject) => {
      let sub = this.voucherService.getVouchersBillPays(voucherId).subscribe({
        next: (res: any) => {
          resolve();
          debugger
          this.billPayment = res.response.data;
          // if (this.billPayment != null) {
          //   this.billPayment.forEach(element => {
          //     this.simpleVoucher.billPay.push({
          //       id: 0,
          //       voucherId: 0,
          //       billId: element.id,
          //       net: element.net ?? 0,
          //       return: 0,
          //       paid: element.paid ?? 0,
          //       amount: element.amount ?? 0,
          //       remaining: element.remaining
          //     });

          //   });
          // }


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
  getFiscalPeriod() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeFiscalPeriodApi).subscribe({
        next: (res) => {

          if (res.success) {

            this.fiscalPeriodList = res.response.filter(x => x.isActive);

            // this.checkPeriod = res.response.fiscalPeriodStatus;
            // this.fiscalPeriodName = this.lang == 'ar' ? res.response.nameAr : res.response.nameEn;

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
  onViewReportClicked(id) {
    localStorage.removeItem("itemId")
    localStorage.setItem("itemId", id)
    let reportType = 1;
    let reportTypeId = 11;
    this.reportViewerService.gotoViewer(reportType, reportTypeId, id);
  }
  onSelectSalesPerson(event) {
    this.simpleVoucherForm.controls.salesPersonId.setValue(event.id);
    this.showSearchSalesPersonModal = false;
  }

}

