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
import { AccountClassificationsEnum, BeneficiaryTypeArEnum, BeneficiaryTypeEnum, CreateFinancialEntryEnum, GeneralConfigurationEnum, PayWayEnum, PaymentTypArEnum, PaymentTypeEnEnum, SerialTypeArEnum, SerialTypeEnum, VoucherTypeEnum, convertEnumToArray } from '../../../../../shared/constants/enumrators/enums';
import { ICustomEnum } from '../../../../../shared/interfaces/ICustom-enum';
import { SearchDialogService } from '../../../../../shared/services/search-dialog.service'
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
import { Bill, BillPayment } from '../../../models/bill';


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
  filterSimpleVouchersList
  showSearchSalesPersonModal = false;
  salesPersonsList: any;
  routeSalesPersonApi = 'SalesPersonCard/get-ddl?'
  routeBillApi='Bill/get-ddl?'

  currencyId: any;
  cashAccountId: any;
  voucherkindId: any;
  serialTypeId: any;
  accountingPeriods: any;
  accountingPeriodCheckDate: any;
  createFinancialEntryId: number;
  voucherDate!: DateModel;
  chequeDate!: DateModel;
  chequeDueDate!: DateModel;

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
  billPayment:BillPayment[]=[];


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
  routeVoucherApi = 'voucher/get-ddl?'
  cashBankAccountsList: any;
  beneficiaryAccountsList: any;
  filterBeneficiaryList: any;

  currenciesList: any;
  currenciesListInDetail: any;
  costCentersList: any;
  costCentersInDetailsList: any;
  currencyTransactionList: any;
  filterCurrencyTransactionList: any;
  cashAndBankAccountsList:any;
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
    private searchDialog: SearchDialogService,
    private sharedServices: SharedService,
    private alertsService: NotificationsAlertsService,
    private currencyServiceProxy: CurrencyServiceProxy,
    private fiscalPeriodService: FiscalPeriodServiceProxy,
    private reportViewerService: ReportViewerService,
    private accountService: AccountServiceProxy,
    private dateConverterService: DateConverterService,
    private accountingPeriodServiceProxy: AccountingPeriodServiceProxy,




  ) {
    this.defineSimpleVoucherForm();
    this.clearSelectedItemData();
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
      this.getVouchers()


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
          this.getSimpleVoucherById(this.id).then(a => {
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
      paymentType: '',
      chequeNumber: '',
      chequeDate: this.dateService.getCurrentDate(),
      chequeDueDate: this.dateService.getCurrentDate(),
      invoicesNotes: '',
      salesPersonId: ''



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
  getVouchers() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeVoucherApi).subscribe({
        next: (res) => {
          if (res.success) {
            this.vouchersList = res.response;

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

  //#region Helper Functions

  get f(): { [key: string]: AbstractControl } {
    return this.simpleVoucherForm.controls;
  }

  nameEn: any;
  nameAr: any;
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
          this.selectedVoucherDetail.beneficiaryTypeId = this.defaultBeneficiaryId;
          this.getBeneficaryByTypeId(this.selectedVoucherDetail.beneficiaryTypeId, -1);
          this.getAmount();
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
            this.simpleVoucherTypesList = res.response.items.filter(x => x.voucherKindId == voucherkindId);

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
     this.filterSimpleVouchersList = this.vouchersList.filter(x => x.voucherTypeId == ReferenceId);
  }
  getSimpleVoucherById(id: any) {
    this.lang = localStorage.getItem("language");
    return new Promise<void>((resolve, reject) => {
      let sub = this.voucherService.getVoucher(id).subscribe({
        next: (res: any) => {
          resolve();

          this.simpleVoucherForm.setValue({
            id: res.response?.id,
            companyId: res.response?.companyId,
            branchId: res.response?.branchId,
            voucherTypeId: res.response?.voucherTypeId,
            code: res.response?.code,
            voucherDate: this.dateService.getDateForCalender(res.response?.voucherDate),
            cashAccountId: res.response?.cashAccountId + "",
            costCenterId: res.response?.costCenterId,
            currencyId: this.enableMultiCurrencies == true ? res.response?.currencyId : this.mainCurrencyId,
            description: res.response?.description,
            voucherTotal: res.response?.voucherTotal,
            voucherTotalLocal: res.response?.voucherTotalLocal,
            currencyFactor: res.response?.currencyFactor,
            fiscalPeriodId: res.response?.fiscalPeriodId,
            referenceId: res.response?.referenceId,
            referenceNo: res.response?.referenceNo,
            paymentType: res.response?.paymentType,
            chequeNumber: res.response?.chequeNumber,
            chequeDate: this.dateService.getDateForCalender(res.response?.chequeDate),
            chequeDueDate: this.dateService.getDateForCalender(res.response?.chequeDueDate),
            invoicesNotes: res.response?.invoicesNotes,
            salesPersonId: res.response?.salesPersonId,

          });

          this.voucherTotal = res.response?.voucherTotal;
          this.voucherTotalLocal = res.response?.voucherTotalLocal;

          var currencyName;
          var beneficiaryName;
          var costCenterName;
          if (res.response?.voucherDetail != null) {
            res.response.voucherDetail.forEach(element => {
              this.getBeneficaryByTypeId(element.beneficiaryTypeId, -1);

              if (element.currencyId > 0) {

                currencyName = this.currenciesListInDetail.find(x => x.id == element.currencyId);
              }
              if (element.beneficiaryId > 0) {
                beneficiaryName = this.filterBeneficiaryList.find(x => x.id == element.beneficiaryId);
              }
              if (element.costCenterId > 0) {
                costCenterName = this.costCentersInDetailsList.find(x => x.id == element.costCenterId);
              }

              this.voucherDetail.push(
                {
                  id: element.id,
                  voucherId: element.voucherId,
                  beneficiaryTypeId: element.beneficiaryTypeId,
                  beneficiaryId: element.beneficiaryId,
                  beneficiaryAccountId: element.beneficiaryAccountId,
                  debit: element.debit,
                  credit: element.credit,
                  currencyId: element.currencyId,
                  currencyConversionFactor: element.currencyConversionFactor,
                  debitLocal: element.debitLocal,
                  creditLocal: element.creditLocal,
                  description: element.description,
                  costCenterId: element.costCenterId,
                  currencyName: this.lang = "ar" ? currencyName?.nameAr ?? '' : currencyName?.nameEn ?? '',
                  beneficiaryName: this.lang = "ar" ? beneficiaryName?.nameAr ?? '' : beneficiaryName?.nameEn ?? '',
                  costCenterName: this.lang = "ar" ? costCenterName?.nameAr ?? '' : costCenterName?.nameEn ?? '',
                }
              )
            });
            this.simpleVoucher.voucherDetail = this.voucherDetail;

          }

          this.tempVoucherDetail = res.response?.voucherDetail;
          this.oldVoucherTotalLocal = res.response?.voucherTotalLocal;


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
  getBeneficiaryAccountByType() {
    this.beneficiaryAccountsList = this.beneficiaryAccountsList.find(x => x.accountClassificationId == this.selectedVoucherDetail.beneficiaryTypeId)
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
  openCurrencySearchDialog(i) {
    this.lang = localStorage.getItem("language");

    let searchTxt = '';
    if (i == -1) {
      searchTxt = this.selectedVoucherDetail?.currencyName ?? '';
    } else {
      searchTxt = ''
    }

    let data = this.currenciesListInDetail.filter((x) => {
      return (
        (x.nameAr + ' ' + x.nameEn).toLowerCase().includes(searchTxt) ||
        (x.nameAr + ' ' + x.nameEn).toUpperCase().includes(searchTxt)
      );
    });

    if (data.length == 1) {
      if (i == -1) {
        this.selectedVoucherDetail!.currencyName = this.lang == 'ar' ? data[0].nameAr : data[0].nameEn;
        this.selectedVoucherDetail!.currencyId = data[0].id;

        if (this.selectedVoucherDetail!.currencyId != this.mainCurrencyId) {

          this.filterCurrencyTransactionList = this.currencyTransactionList.find(x => x.currencyMasterId == this.selectedVoucherDetail!.currencyId && x.currencyDetailId == this.mainCurrencyId)
          this.selectedVoucherDetail!.currencyConversionFactor = this.filterCurrencyTransactionList.transactionFactor;
          this.getValueAfterConversion();
        } else {
          this.selectedVoucherDetail!.currencyConversionFactor = 1;
          this.getValueAfterConversion();
        }
      } else {
        this.voucherDetail[i].currencyName = this.lang == 'ar' ? data[0].nameAr : data[0].nameEn;
        this.voucherDetail[i].currencyId = data[0].id;
        if (this.voucherDetail[i]!.currencyId != this.mainCurrencyId) {

          this.filterCurrencyTransactionList = this.currencyTransactionList.find(x => x.currencyMasterId == this.voucherDetail[i]!.currencyId && x.currencyDetailId == this.mainCurrencyId)
          this.voucherDetail[i]!.currencyConversionFactor = this.filterCurrencyTransactionList.transactionFactor;
          this.getAddedValueAfterConversion(i);
        } else {
          this.voucherDetail[i]!.currencyConversionFactor = 1;
          this.getAddedValueAfterConversion(i);
        }
      }
    } else {
      let lables = ['الكود', 'الاسم', 'الاسم الانجليزى'];
      let names = ['code', 'nameAr', 'nameEn'];
      let title = 'بحث عن العملة';
      let sub = this.searchDialog
        .showDialog(lables, names, this.currenciesListInDetail, title, searchTxt)
        .subscribe((d) => {

          if (d) {
            if (i == -1) {
              this.selectedVoucherDetail!.currencyName = this.lang == 'ar' ? d.nameAr : d.nameEn;
              this.selectedVoucherDetail!.currencyId = d.id;
              if (this.selectedVoucherDetail!.currencyId != this.mainCurrencyId) {

                this.filterCurrencyTransactionList = this.currencyTransactionList.find(x => x.currencyMasterId == this.selectedVoucherDetail!.currencyId && x.currencyDetailId == this.mainCurrencyId)
                this.selectedVoucherDetail!.currencyConversionFactor = this.filterCurrencyTransactionList.transactionFactor;
                this.getValueAfterConversion();

              } else {
                this.selectedVoucherDetail!.currencyConversionFactor = 1;
                this.getValueAfterConversion();
              }
            } else {

              this.voucherDetail[i].currencyName = this.lang == 'ar' ? d.nameAr : d.nameEn;
              this.voucherDetail[i].currencyId = d.id;
              if (this.voucherDetail[i]!.currencyId != this.mainCurrencyId) {

                this.filterCurrencyTransactionList = this.currencyTransactionList.find(x => x.currencyMasterId == this.voucherDetail[i]!.currencyId && x.currencyDetailId == this.mainCurrencyId)
                this.voucherDetail[i]!.currencyConversionFactor = this.filterCurrencyTransactionList.transactionFactor;
                this.getAddedValueAfterConversion(i);
              }
            }
          }
        });
      this.subsList.push(sub);
    }

  }
  openBeneficiarySearchDialog(i) {

    this.lang = localStorage.getItem("language");

    let searchTxt = '';
    if (i == -1) {
      searchTxt = this.selectedVoucherDetail?.beneficiaryName ?? '';
    } else {
      searchTxt = ''
    }

    let data = this.filterBeneficiaryList.filter((x) => {
      return (
        (x.nameAr + ' ' + x.nameEn).toLowerCase().includes(searchTxt) ||
        (x.nameAr + ' ' + x.nameEn).toUpperCase().includes(searchTxt)
      );
    });

    if (data.length == 1) {
      if (i == -1) {
        this.selectedVoucherDetail!.beneficiaryName = this.lang == 'ar' ? data[0].nameAr : data[0].nameEn;
        this.selectedVoucherDetail!.beneficiaryId = data[0].id;
        this.getBeneficiaryAccount();
      } else {
        this.voucherDetail[i].beneficiaryName = this.lang == 'ar' ? data[0].nameAr : data[0].nameEn;
        this.voucherDetail[i].beneficiaryId = data[0].id;
        this.getBeneficiaryAccountAdded(i);

      }
    } else {
      let lables = ['الكود', 'الاسم', 'الاسم الانجليزى'];
      let names = ['code', 'nameAr', 'nameEn'];
      let title = 'بحث عن الجهة';
      let sub = this.searchDialog
        .showDialog(lables, names, this.filterBeneficiaryList, title, searchTxt)
        .subscribe((d) => {
          if (d) {
            if (i == -1) {

              this.selectedVoucherDetail!.beneficiaryName = this.lang == 'ar' ? d.nameAr : d.nameEn;
              this.selectedVoucherDetail!.beneficiaryId = d.id;
              this.getBeneficiaryAccount();

            } else {

              this.voucherDetail[i].beneficiaryName = this.lang == 'ar' ? d.nameAr : d.nameEn;
              this.voucherDetail[i].beneficiaryId = d.id;
              this.getBeneficiaryAccountAdded(i);

            }
          }
        });
      this.subsList.push(sub);
    }

  }
  getBeneficaryByTypeId(typeId: any, i: any) {
    this.filterBeneficiaryList = [];
    if (i == -1) {
      this.selectedVoucherDetail.beneficiaryName = '';

    }
    else {
      this.voucherDetail[i].beneficiaryName = '';

    }
    if (typeId == BeneficiaryTypeEnum.Client) {
      this.filterBeneficiaryList = this.customersList;
    }
    else if (typeId == BeneficiaryTypeEnum.Supplier) {
      this.filterBeneficiaryList = this.suppliersList;
    }
    else if (typeId == BeneficiaryTypeEnum.Account) {
      this.filterBeneficiaryList = this.accountsList;
    }
  }
  openCostCenterSearchDialog(i) {
    this.lang = localStorage.getItem("language");

    let searchTxt = '';
    if (i == -1) {
      searchTxt = this.selectedVoucherDetail?.costCenterName ?? '';
    } else {
      searchTxt = ''
    }

    let data = this.costCentersInDetailsList.filter((x) => {
      return (
        (x.nameAr + ' ' + x.nameEn).toLowerCase().includes(searchTxt) ||
        (x.nameAr + ' ' + x.nameEn).toUpperCase().includes(searchTxt)
      );
    });

    if (data.length == 1) {
      if (i == -1) {
        this.selectedVoucherDetail!.costCenterName = this.lang == 'ar' ? data[0].nameAr : data[0].nameEn;
        this.selectedVoucherDetail!.costCenterId = data[0].id;
      } else {
        this.voucherDetail[i].costCenterName = this.lang == 'ar' ? data[0].nameAr : data[0].nameEn;
        this.voucherDetail[i].costCenterId = data[0].id;
      }
    } else {
      let lables = ['الكود', 'الاسم', 'الاسم الانجليزى'];
      let names = ['code', 'nameAr', 'nameEn'];
      let title = 'بحث عن مركز التكلفة';
      let sub = this.searchDialog
        .showDialog(lables, names, this.costCentersInDetailsList, title, searchTxt)
        .subscribe((d) => {
          if (d) {
            if (i == -1) {
              this.selectedVoucherDetail!.costCenterName = this.lang == 'ar' ? d.nameAr : d.nameEn;
              this.selectedVoucherDetail!.costCenterId = d.id;
            } else {
              this.voucherDetail[i].costCenterName = this.lang == 'ar' ? d.nameAr : d.nameEn;
              this.voucherDetail[i].costCenterId = d.id;
            }
          }
        });
      this.subsList.push(sub);
    }

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
  addItem() {
    this.voucherDetail.push({
      id: 0,
      voucherId: this.selectedVoucherDetail?.voucherId ?? 0,
      beneficiaryTypeId: this.selectedVoucherDetail?.beneficiaryTypeId ?? 0,
      beneficiaryId: this.selectedVoucherDetail?.beneficiaryId ?? 0,
      beneficiaryAccountId: this.selectedVoucherDetail?.beneficiaryAccountId ?? 0,
      debit: this.selectedVoucherDetail?.debit ?? 0,
      credit: this.selectedVoucherDetail?.credit ?? 0,
      currencyId: this.enableMultiCurrencies == true ? this.selectedVoucherDetail?.currencyId ?? 0 : this.mainCurrencyId,
      currencyConversionFactor: this.enableMultiCurrencies == true ? this.selectedVoucherDetail?.currencyConversionFactor ?? 0 : 1,
      debitLocal: this.enableMultiCurrencies == true ? this.selectedVoucherDetail?.debitLocal ?? 0 : this.selectedVoucherDetail?.debit ?? 0,
      creditLocal: this.enableMultiCurrencies == true ? this.selectedVoucherDetail?.creditLocal ?? 0 : this.selectedVoucherDetail?.credit ?? 0,
      description: this.selectedVoucherDetail?.description ?? '',
      costCenterId: this.selectedVoucherDetail?.costCenterId ?? 0,
      currencyName: this.selectedVoucherDetail?.currencyName ?? '',
      beneficiaryName: this.selectedVoucherDetail?.beneficiaryName ?? '',
      costCenterName: this.selectedVoucherDetail?.costCenterName ?? '',
    });

    this.simpleVoucher!.voucherDetail = this.voucherDetail;

    this.totalDebitLocal += this.enableMultiCurrencies == true ? this.selectedVoucherDetail?.debitLocal ?? 0 : this.selectedVoucherDetail?.debit ?? 0;
    this.totalCreditLocal += this.enableMultiCurrencies == true ? this.selectedVoucherDetail?.creditLocal ?? 0 : this.selectedVoucherDetail?.credit ?? 0;
    this.calculateTotals();

    this.clearSelectedItemData();

  }
  calculateTotals() {
    let currencyConversionFactor;
    if (this.voucherkindId == VoucherTypeEnum['Simple Withdrawal']) {

      this.simpleVoucherForm.controls["voucherTotalLocal"].setValue(this.totalDebitLocal)

      if (this.enableMultiCurrencies == true) {
        if (this.currencyId != this.mainCurrencyId) {

          this.filterCurrencyTransactionList = this.currencyTransactionList.find(x => x.currencyMasterId == this.mainCurrencyId && x.currencyDetailId == this.currencyId)

          currencyConversionFactor = this.filterCurrencyTransactionList.transactionFactor;
          this.simpleVoucherForm.controls["voucherTotal"].setValue(this.totalDebitLocal * currencyConversionFactor)
        }
        else {
          this.simpleVoucherForm.controls["voucherTotal"].setValue(this.totalDebitLocal)
        }
      }
      else {

        this.simpleVoucherForm.controls["voucherTotal"].setValue(this.totalDebitLocal)
      }

    }
    if (this.voucherkindId == VoucherTypeEnum['Simple Deposit']) {
      this.simpleVoucherForm.controls["voucherTotalLocal"].setValue(this.totalCreditLocal)
      if (this.enableMultiCurrencies == true) {

        if (this.currencyId != this.mainCurrencyId) {

          this.filterCurrencyTransactionList = this.currencyTransactionList.find(x => x.currencyMasterId == this.mainCurrencyId && x.currencyDetailId == this.currencyId)

          currencyConversionFactor = this.filterCurrencyTransactionList.transactionFactor;
          this.simpleVoucherForm.controls["voucherTotal"].setValue(this.totalCreditLocal * currencyConversionFactor)
        }
        else {
          this.simpleVoucherForm.controls["voucherTotal"].setValue(this.totalCreditLocal)
        }
      }
      else {

        this.simpleVoucherForm.controls["voucherTotal"].setValue(this.totalCreditLocal)
      }
    }
  }
  deleteItem(index) {

    //this.totalDebitLocal = this.totalDebitLocal - this.voucherDetail[index]?.debitLocal ?? 0;
    //this.totalCreditLocal = this.totalCreditLocal - this.voucherDetail[index]?.creditLocal ?? 0;
    let currencyConversionFactor;
    if (this.voucherkindId == VoucherTypeEnum['Simple Withdrawal']) {
      this.simpleVoucherForm.controls["voucherTotalLocal"].setValue(this.totalDebitLocal)
      if (this.currencyId != this.mainCurrencyId) {

        this.filterCurrencyTransactionList = this.currencyTransactionList.find(x => x.currencyMasterId == this.mainCurrencyId && x.currencyDetailId == this.currencyId)

        currencyConversionFactor = this.filterCurrencyTransactionList.transactionFactor;
        this.simpleVoucherForm.controls["voucherTotal"].setValue(this.totalDebitLocal * currencyConversionFactor)
      }
      else {
        this.simpleVoucherForm.controls["voucherTotal"].setValue(this.totalDebitLocal)
      }
    }
    if (this.voucherkindId == VoucherTypeEnum['Simple Deposit']) {
      this.simpleVoucherForm.controls["voucherTotalLocal"].setValue(this.totalCreditLocal)
      if (this.currencyId != this.mainCurrencyId) {

        this.filterCurrencyTransactionList = this.currencyTransactionList.find(x => x.currencyMasterId == this.mainCurrencyId && x.currencyDetailId == this.currencyId)

        currencyConversionFactor = this.filterCurrencyTransactionList.transactionFactor;
        this.simpleVoucherForm.controls["voucherTotal"].setValue(this.totalCreditLocal * currencyConversionFactor)
      }
      else {
        this.simpleVoucherForm.controls["voucherTotal"].setValue(this.totalCreditLocal)
      }
    }

    if (this.voucherDetail.length) {
      if (this.voucherDetail.length == 1) {
        this.voucherDetail = [];
      } else {
        this.voucherDetail.splice(index, 1);
      }
    }

    this.simpleVoucher.voucherDetail = this.voucherDetail;

  }
  clearSelectedItemData() {

    this.selectedVoucherDetail = {
      id: 0,
      voucherId: 0,
      beneficiaryTypeId: this.defaultBeneficiaryId,
      beneficiaryId: 0,
      beneficiaryAccountId: 0,
      debit: 0,
      credit: 0,
      currencyId: 0,
      currencyConversionFactor: 0,
      debitLocal: 0,
      creditLocal: 0,
      description: '',
      costCenterId: 0,
      currencyName: '',
      beneficiaryName: '',
      costCenterName: '',
    }
  }

  setInputData() {
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
      billPay: this.simpleVoucher.billPay ?? [],
      billInstallmentPay: this.simpleVoucher.billInstallmentPay ?? [],


    };

    this.simpleVoucher.voucherDetail = this.voucherDetail;

    this.voucherTotal = this.simpleVoucherForm.controls["voucherTotal"].value;
    if (this.voucherkindId == VoucherTypeEnum['Simple Withdrawal']) {
      this.totalDebitLocal = this.simpleVoucherForm.controls["voucherTotalLocal"].value
    }
    else {
      this.totalCreditLocal = this.simpleVoucherForm.controls["voucherTotalLocal"].value

    }
    this.voucherTotalLocal = this.simpleVoucherForm.controls["voucherTotalLocal"].value;
    this.currencyFactor = this.simpleVoucherForm.controls["currencyFactor"].value;


  }
  confirmSave() {
    this.simpleVoucher.voucherDate = this.dateService.getDateForInsert(this.simpleVoucherForm.controls["voucherDate"].value);
    this.simpleVoucher.chequeDate = this.dateService.getDateForInsert(this.simpleVoucherForm.controls["chequeDate"].value);
    this.simpleVoucher.chequeDueDate = this.dateService.getDateForInsert(this.simpleVoucherForm.controls["chequeDueDate"].value);

    return new Promise<void>((resolve, reject) => {

      let sub = this.voucherService.createVoucherAndRelations(this.simpleVoucher.voucherTypeId, this.simpleVoucher).subscribe({
        next: (result: any) => {
          this.defineSimpleVoucherForm();
          this.clearSelectedItemData();
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
  onSave() {
    if (stringIsNullOrEmpty(this.simpleVoucherForm.value.currencyId)) {
      this.errorMessage = this.translate.instant("general.choose-currency-from-configuration");
      this.errorClass = 'errorMessage';
      this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
      return;
    }
    if (this.fiscalPeriodStatus != FiscalPeriodStatus.Opened) {
      if (this.fiscalPeriodStatus == null) {
        this.errorMessage = this.translate.instant("voucher.no-add-voucher-fiscal-period-choose-open-fiscal-period");

      }
      else {
        this.errorMessage = this.translate.instant("voucher.no-add-voucher-fiscal-period-closed") + " : " + this.fiscalPeriodName;

      }
      this.errorClass = 'errorMessage';
      this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
      return;
    }
    else {

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
    }
    let voucherDate = this.simpleVoucherForm.controls["voucherDate"].value;
    let date = this.dateConverterService.getDateTimeForInsertISO_Format(voucherDate);


    if (!(date >= this.fromDate && date <= this.toDate)) {

      this.errorMessage = this.translate.instant("general.date-out-fiscal-period");
      this.errorClass = 'errorMessage';
      this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
      return;
    }

    if (this.simpleVoucherForm.valid) {
      if (this.simpleVoucher.voucherDetail.length == 0) {
        this.errorMessage = this.translate.instant("voucher.voucher-details-required");
        this.errorClass = 'errorMessage';
        this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
        return;
      }
      var i = 0;
      if (this.createFinancialEntryId == CreateFinancialEntryEnum['Create the entry automatically']) {
        if (this.voucherDetail != null) {
          this.voucherDetail.forEach(element => {

            if (element.beneficiaryId != null) {
              var value = 0;
              // if (element.debitLocal > 0) {
              //   value = element.debitLocal;
              // }
              // if (element.creditLocal > 0) {
              //   value = element.creditLocal;

              // }

              this.getAccountBalance(element.beneficiaryId).then(a => {
                var account = this.accountsList.find(x => x.id == element.beneficiaryId);

                var accountName = this.lang == 'ar' ? account.nameAr : account.nameEn;

                if (Number(this.balance) > 0 && account.debitLimit > 0) {

                  if (Number(this.balance) + value > account.debitLimit) {


                    this.errorMessage = this.translate.instant('general.debit-limit-exceed-account') + " : " + accountName + this.translate.instant('general.code') + " : " + account.code;
                    this.errorClass = 'errorMessage';
                    this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
                    i++;
                  }

                }
                else if (Number(this.balance) < 0 && account.creditLimit > 0) {

                  if (-(this.balance) + value > account.creditLimit) {

                    this.errorMessage = this.translate.instant('general.credit-limit-exceed-account') + " : " + accountName + this.translate.instant('general.code') + " : " + account.code;
                    this.errorClass = 'errorMessage';
                    this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
                    i++;
                  }
                }
              });
            }
          })

        }
        this.getAccountBalance(this.cashAccountId).then(a => {
          var account = this.accountsList.find(x => x.id == this.cashAccountId);

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
          this.clearSelectedItemData();
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
      if (stringIsNullOrEmpty(this.simpleVoucherForm.value.currencyId)) {
        this.errorMessage = this.translate.instant("general.choose-currency-from-configuration");
        this.errorClass = 'errorMessage';
        this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
        return;
      }
      if (this.fiscalPeriodStatus != FiscalPeriodStatus.Opened) {
        this.errorMessage = this.translate.instant("voucher.no-update-voucher-fiscal-period-closed") + " : " + this.fiscalPeriodName;
        this.errorClass = 'errorMessage';
        this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
        return;
      }
      else {
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
      }

      let voucherDate = this.simpleVoucherForm.controls["voucherDate"].value;
      let date = this.dateConverterService.getDateTimeForInsertISO_Format(voucherDate);


      if (!(date >= this.fromDate && date <= this.toDate)) {

        this.errorMessage = this.translate.instant("general.date-out-fiscal-period");
        this.errorClass = 'errorMessage';
        this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
        return;
      }

      if (this.simpleVoucher.voucherDetail.length == 0) {
        this.errorMessage = this.translate.instant("voucher.voucher-details-required");
        this.errorClass = 'errorMessage';
        this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
        return;
      }
      var i = 0;
      if (this.createFinancialEntryId == CreateFinancialEntryEnum['Create the entry automatically']) {

        if (this.voucherDetail != null) {
          this.voucherDetail.forEach(element => {
            var oldElement = this.tempVoucherDetail.find(x => x.accountId == element.beneficiaryAccountId);

            if (element.beneficiaryAccountId != null) {
              var value = 0;
              // if (element.debitLocal > 0) {
              //   value = element.debitLocal;
              // }
              // if (element.creditLocal > 0) {
              //   value = element.creditLocal;

              // }

              this.getAccountBalance(element.beneficiaryAccountId).then(a => {
                var account = this.accountsList.find(x => x.id == element.beneficiaryAccountId);

                var accountName = this.lang == 'ar' ? account.nameAr : account.nameEn;

                if (Number(this.balance) > 0 && account.debitLimit > 0) {

                  if (Number(this.balance) + value - oldElement.debitLocal > account.debitLimit) {


                    this.errorMessage = this.translate.instant('general.debit-limit-exceed-account') + " : " + accountName + this.translate.instant('general.code') + " : " + account.code;
                    this.errorClass = 'errorMessage';
                    this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
                    i++;
                  }

                }
                else if (Number(this.balance) < 0 && account.creditLimit > 0) {

                  if (-(this.balance) + value - oldElement.creditLocal > account.creditLimit) {

                    this.errorMessage = this.translate.instant('general.credit-limit-exceed-account') + " : " + accountName + this.translate.instant('general.code') + " : " + account.code;
                    this.errorClass = 'errorMessage';
                    this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
                    i++;
                  }
                }
              });
            }
          })

        }
        this.getAccountBalance(this.cashAccountId).then(a => {
          var account = this.accountsList.find(x => x.id == this.cashAccountId);

          var accountName = this.lang == 'ar' ? account.nameAr : account.nameEn;

          if (Number(this.balance) > 0 && account.debitLimit > 0) {

            if (Number(this.balance) + this.voucherTotalLocal - this.oldVoucherTotalLocal > account.debitLimit) {


              this.errorMessage = this.translate.instant('general.debit-limit-exceed-account') + " : " + accountName + "(" + this.translate.instant('general.cash-account') + ")" + this.translate.instant('general.code') + " : " + account.code;
              this.errorClass = 'errorMessage';
              this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
              i++;
            }

          }
          else if (Number(this.balance) < 0 && account.creditLimit > 0) {

            if (-(this.balance) + this.voucherTotalLocal - this.oldVoucherTotalLocal > account.creditLimit) {

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
            this.clearSelectedItemData();
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
  getValueAfterConversion() {
    this.selectedVoucherDetail.debitLocal = Number(this.selectedVoucherDetail.debit) * Number(this.selectedVoucherDetail.currencyConversionFactor);
    this.selectedVoucherDetail.creditLocal = Number(this.selectedVoucherDetail.credit) * Number(this.selectedVoucherDetail.currencyConversionFactor);


  }
  getAddedValueAfterConversion(i: any) {
    this.voucherDetail[i].debitLocal = Number(this.voucherDetail[i].debit) * Number(this.voucherDetail[i].currencyConversionFactor);
    this.voucherDetail[i].creditLocal = Number(this.voucherDetail[i].credit) * Number(this.voucherDetail[i].currencyConversionFactor);

  }
  getAmount() {
    debugger
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
  getCostCenterInDetails() {
  }
  updateDetailData(item: VoucherDetail) {
    debugger
    if (this.voucherDetail.length > 0) {
      this.deleteVoucherDetailForUpdate(item);
      this.addVoucherDetailForUpdate(item);
    }

  }
  addVoucherDetailForUpdate(item: VoucherDetail) {

    this.voucherDetail.push(
      {
        id: 0,
        voucherId: 0,
        beneficiaryTypeId: item.beneficiaryTypeId,
        beneficiaryId: item.beneficiaryId,
        beneficiaryAccountId: item.beneficiaryAccountId,
        debit: item.debit,
        credit: item.credit,
        currencyId: item.currencyId,
        currencyConversionFactor: item.currencyConversionFactor,
        debitLocal: item.debitLocal,
        creditLocal: item.creditLocal,
        description: item.description,
        costCenterId: item.costCenterId,
        currencyName: item.currencyName,
        beneficiaryName: item.beneficiaryName,
        costCenterName: item.costCenterName
      }
    )

    this.voucherDetail.forEach(item => {

      this.totalDebitLocal += this.enableMultiCurrencies == true ? item.debitLocal ?? 0 : item.debit ?? 0;
      this.totalCreditLocal += this.enableMultiCurrencies == true ? item.creditLocal ?? 0 : item.credit ?? 0;
    }
    )
    this.calculateTotals();

  }
  deleteVoucherDetailForUpdate(item: VoucherDetail) {
    if (item != null) {
      const index: number = this.voucherDetail.indexOf(item);
      if (index !== -1) {
        this.voucherDetail.splice(index, 1);

        this.totalDebitLocal = 0;
        this.totalCreditLocal = 0;
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
  getBillPayments() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeBillApi).subscribe({
        next: (res) => {
          if (res.success) {
            this.billPayment = res.response.filter(x=>x.payWay == PayWayEnum.Credit || x.companyId == this.companyId || x.branchId ==this.branchId);

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
  getBeneficiaryAccount() {

    if (this.selectedVoucherDetail.beneficiaryTypeId == BeneficiaryTypeEnum.Client || this.selectedVoucherDetail.beneficiaryTypeId == BeneficiaryTypeEnum.Supplier) {
      this.selectedVoucherDetail.beneficiaryAccountId = this.filterBeneficiaryList.filter(x => x.id == Number(this.selectedVoucherDetail.beneficiaryId))[0].accountId
    }
    else if (this.selectedVoucherDetail.beneficiaryTypeId == BeneficiaryTypeEnum.Account) {
      this.selectedVoucherDetail.beneficiaryAccountId = this.selectedVoucherDetail.beneficiaryId;
    }

  }
  getBeneficiaryAccountAdded(i) {


    if (this.voucherDetail[i].beneficiaryTypeId == BeneficiaryTypeEnum.Client || this.voucherDetail[i].beneficiaryTypeId == BeneficiaryTypeEnum.Supplier) {

      this.voucherDetail[i].beneficiaryAccountId = this.filterBeneficiaryList.filter(x => x.id == Number(this.voucherDetail[i].beneficiaryId))[0].accountId
    }
    else if (this.voucherDetail[i].beneficiaryTypeId == BeneficiaryTypeEnum.Account) {
      this.voucherDetail[i].beneficiaryAccountId = this.voucherDetail[i].beneficiaryId;
    }

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

