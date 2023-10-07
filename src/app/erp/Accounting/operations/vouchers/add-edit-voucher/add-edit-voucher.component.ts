import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { REQUIRED_VALIDATORS } from 'src/app/shared/constants/input-validators';
import { ToolbarPath } from 'src/app/shared/interfaces/toolbar-path';
import { PublicService } from 'src/app/shared/services/public.service';
import { Voucher, VoucherDetail } from 'src/app/erp/Accounting/models/voucher'
import { VoucherServiceProxy } from '../../../services/voucher.service';
import { VoucherDetailsServiceProxy } from '../../../services/voucher-details.service';
import { VoucherTypeServiceProxy } from '../../../services/voucher-type.service';
import { VoucherType } from 'src/app/erp/Accounting/models/voucher-type'
import { GeneralConfigurationServiceProxy } from '../../../services/general-configurations.services';
import { AccountClassificationsEnum, BeneficiaryTypeArEnum, BeneficiaryTypeEnum, SerialTypeArEnum, SerialTypeEnum, convertEnumToArray } from 'src/app/shared/constants/enumrators/enums';
import { ICustomEnum } from 'src/app/shared/interfaces/ICustom-enum';
import { SearchDialogService } from 'src/app/shared/services/search-dialog.service'
import { ToolbarData } from 'src/app/shared/interfaces/toolbar-data';
import { SharedService } from 'src/app/shared/common-services/shared-service';
import { NotificationsAlertsService } from 'src/app/shared/common-services/notifications-alerts.service';
import { ToolbarActions } from 'src/app/shared/enum/toolbar-actions';
import { formatDate, navigateUrl } from 'src/app/shared/helper/helper-url';
import { DateCalculation, DateModel } from 'src/app/shared/services/date-services/date-calc.service';
import { CurrencyServiceProxy } from 'src/app/erp/master-codes/services/currency.servies';

@Component({
  selector: 'app-add-edit-voucher',
  templateUrl: './add-edit-voucher.component.html',
  styleUrls: ['./add-edit-voucher.component.scss']
})
export class AddEditVoucherComponent implements OnInit, AfterViewInit {
  //#region Main Declarations
  branchId: string = localStorage.getItem("branchId");
  companyId: string = localStorage.getItem("companyId");
  //voucherForm!: FormGroup;
  voucherForm: FormGroup = new FormGroup({});
  currencyId: any;
  cashAccountId: any;
  voucherkindId: any;
  serialTypeId: any;
  voucherDate!: DateModel;

  showSearchCashAccountModal = false;
  showSearchCostCenterModal = false;
  showSearchBeneficiaryAccountsModal = false;
  showSearhBeneficiaryAccountsModal = false;
  showSearchCurrencyModal = false;

  enableMultiCurrencies: boolean = false;
  mainCurrencyId: number;
  totalDebitLocal: number = 0;
  totalCreditLocal: number = 0;
  voucher: Voucher = new Voucher();
  voucherDetail: VoucherDetail[] = [];
  _voucherDetail: VoucherDetail = new VoucherDetail();
  selectedVoucherDetail: VoucherDetail = new VoucherDetail();
  beneficiaryTypesEnum: ICustomEnum[] = [];

  sub: any;
  url: any;
  id: any = 0;
  currnetUrl;
  errorMessage = '';
  errorClass = '';
  lang = localStorage.getItem("language")
  routeAccountApi = 'Account/get-ddl?'
  routeCurrencyApi = "currency/get-ddl?"
  routeCostCenterApi = 'CostCenter/get-ddl?'

  cashAccountsList: any;
  //  costCenterAccountsList: any;
  beneficiaryAccountsList: any;
  //costCenterAccountsInDetailList: any;
  currenciesList: any;
  currenciesListInDetail: any;
  costCentersList: any;
  costCentersInDetailsList: any;
  currencyTransactionList: any;
  filterCurrencyTransactionList: any;

  queryParams: any;
  voucherTypeId: any;
  voucherType: VoucherType[] = [];
  currencyFactor: number;
  voucherTotal: number = 0;
  voucherTotalLocal: number = 0;
  currency: any;
  addUrl: string = '/accounting-operations/vouchers/add-voucher';
  updateUrl: string = '/accounting-operations/vouchers/update-voucher/';
  listUrl: string = '/accounting-operations/vouchers/';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.vouchers"),
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
    private voucherDetailsService: VoucherDetailsServiceProxy,
    private dateService: DateCalculation,
    private currencyService: CurrencyServiceProxy,

    private voucherTypeService: VoucherTypeServiceProxy,
    private generalConfigurationService: GeneralConfigurationServiceProxy,
    private searchDialog: SearchDialogService,
    private sharedServices: SharedService,
    private alertsService: NotificationsAlertsService,
    private spinnerService: NgxSpinnerService,
    private currencyServiceProxy: CurrencyServiceProxy,



  ) {
    this.defineVoucherForm();
    this.clearSelectedItemData();
    this.voucherDetail = [];

  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {


    this.getBeneficiaryTypes();
    this.spinner.show();
    Promise.all([
      this.getGeneralConfigurationsOfMainCurrency(),
      this.getGeneralConfigurationsOfMultiCurrency(),
      this.getCurrencies(),
      this.getCurrenciesTransactions(),
      this.getAccounts(),
      this.getCostCenters(),

    ]).then(a => {
      this.getRouteData();
      this.changePath();
      this.listenToClickedButton();
    }).catch((err) => {

      this.spinner.hide();
    })


  }
  getRouteData() {
    let sub = this.route.params.subscribe((params) => {

      if (params['voucherTypeId'] != null) {
        this.voucherTypeId = params['voucherTypeId'];
        if (this.voucherTypeId) {
          this.getVoucherTypes(this.voucherTypeId);

        }
      }
      if (params['id'] != null) {
        this.id = params['id'];

        if (this.id) {
          this.getVoucherById(this.id).then(a => {
            this.getVoucherDetailsById(this.id);

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
  defineVoucherForm() {
    this.voucherForm = this.fb.group({
      id: 0,
      companyId: this.companyId,
      branchId: this.branchId,
      voucherTypeId: this.voucherTypeId,
      code: REQUIRED_VALIDATORS,
      voucherDate: [this.dateService.getCurrentDate(), Validators.compose([Validators.required])],
      cashAccountId: REQUIRED_VALIDATORS,
      costCenterId: '',
      currencyId: REQUIRED_VALIDATORS,
      description: '',
      voucherTotal: REQUIRED_VALIDATORS,
      voucherTotalLocal: REQUIRED_VALIDATORS,
      currencyFactor: '',



    });
    this.voucherDate = this.dateService.getCurrentDate();

  }





  //#region Helper Functions

  get f(): { [key: string]: AbstractControl } {
    return this.voucherForm.controls;
  }


  //#endregion
  getVoucherTypes(id) {

    return new Promise<void>((resolve, reject) => {
      let sub = this.voucherTypeService.getVoucherType(id).subscribe({
        next: (res: any) => {
          resolve();
          this.cashAccountId = res.response.defaultAccountId;
          this.currencyId = res.response.defaultCurrencyId;
          this.voucherkindId = res.response.voucherKindId;
          this.serialTypeId = res.response.serialTypeId;


          if (this.id == 0) {
            if (this.serialTypeId == SerialTypeEnum.Automatic) {
              this.getVoucherCode();
            }
          }

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
  getVoucherById(id: any) {
    return new Promise<void>((resolve, reject) => {
      let sub = this.voucherService.getVoucher(id).subscribe({
        next: (res: any) => {
          resolve();
          this.voucherForm.setValue({
            id: res.response?.id,
            companyId: res.response?.companyId,
            branchId: res.response?.branchId,
            voucherTypeId: res.response?.voucherTypeId,
            code: res.response?.code,
            // voucherDate: formatDate(res.response?.voucherDate),
            voucherDate: this.dateService.getDateForCalender(res.response?.voucherDate),
            cashAccountId: res.response?.cashAccountId,
            costCenterId: res.response?.costCenterId,
            currencyId: res.response?.currencyId,
            description: res.response?.description,
            voucherTotal: res.response?.voucherTotal,
            voucherTotalLocal: res.response?.voucherTotalLocal,
            currencyFactor: res.response?.currencyFactor


          });
          this.voucherTotal = res.response?.voucherTotal;
          this.voucherTotalLocal = res.response?.voucherTotalLocal;
          console.log(
            'this.voucherForm.value set value',
            this.voucherForm.value
          );
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
  getVoucherDetailsById(id: any) {
    return new Promise<void>((resolve, reject) => {
      let sub = this.voucherDetailsService.allVoucherDetails(undefined, undefined, undefined, undefined, undefined).subscribe({
        next: (res: any) => {
          resolve();
          res = res.response.items.filter(x => x.voucherId == id)
          res.forEach(element => {

            var currencyName;
            var beneficiaryAccountName;
            var costCenterName;
            if (element.currencyId > 0) {

              currencyName = this.currenciesListInDetail.find(x => x.id == element.currencyId);
            }
            if (element.beneficiaryAccountId > 0) {
              beneficiaryAccountName = this.beneficiaryAccountsList.find(x => x.id == element.beneficiaryAccountId);
            }
            if (element.costCenterId > 0) {
              costCenterName = this.costCentersInDetailsList.find(x => x.id == element.costCenterId);
            }
            this.voucherDetail.push(
              {
                id: element.id,
                voucherId: element.voucherId,
                debit: element.debit,
                credit: element.credit,
                currencyId: element.currencyId,
                currencyConversionFactor: element.currencyConversionFactor,
                debitLocal: element.debitLocal,
                creditLocal: element.creditLocal,
                beneficiaryTypeId: element.beneficiaryTypeId,
                beneficiaryAccountId: element.beneficiaryAccountId,
                description: element.description,
                costCenterId: element.costCenterId,
                currencyNameAr: currencyName?.nameAr ?? '',
                currencyNameEn: currencyName?.nameEn ?? '',
                beneficiaryAccountNameAr: beneficiaryAccountName?.nameAr ?? '',
                beneficiaryAccountNameEn: beneficiaryAccountName?.nameEn ?? '',
                costCenterNameAr: costCenterName?.nameAr ?? '',
                costCenterNameEn: costCenterName?.nameEn ?? ''
              }
            )
            this.totalDebitLocal += element.debitLocal ?? 0;
            this.totalCreditLocal += element.creditLocal ?? 0;

          });
          this.voucher.voucherDetail = this.voucherDetail;



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
  getGeneralConfigurationsOfMainCurrency() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.generalConfigurationService.getGeneralConfiguration(1).subscribe({
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
          console.log('complete');
        },
      });
      this.subsList.push(sub);

    });

  }
  getGeneralConfigurationsOfMultiCurrency() {

    return new Promise<void>((resolve, reject) => {

      let sub = this.generalConfigurationService.getGeneralConfiguration(2).subscribe({
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
          console.log('complete');
        },
      });
      this.subsList.push(sub);

    });

  }
  getVoucherCode() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.voucherService.getLastCode().subscribe({
        next: (res: any) => {
          resolve();
          this.voucherForm.patchValue({
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
      this.subsList.push(sub);

    });

  }
  getAccounts() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeAccountApi).subscribe({
        next: (res) => {

          if (res.success) {
            this.cashAccountsList = res.response.filter(x => x.isLeafAccount == true && x.isActive == true && x.accountClassificationId == AccountClassificationsEnum.Cash);
            this.beneficiaryAccountsList = res.response.filter(x => x.isLeafAccount == true && x.isActive == true);

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
          console.log('complete');
        },
      });

      this.subsList.push(sub);
    });

  }
  getCurrenciesTransactions() {

    return new Promise<void>((resolve, reject) => {
      let sub = this.currencyService.getCurrenciesTransactions().subscribe({
        next: (res) => {
          if (res.success) {

            this.currencyTransactionList = res.response;

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
          console.log('complete');
        },
      });

      this.subsList.push(sub);
    });

  }
  openCurrencySearchDialog(i) {

    let searchTxt = '';
    if (i == -1) {
      searchTxt = this.selectedVoucherDetail?.currencyNameAr ?? '';
    } else {
      searchTxt = ''
      // this.selectedRentContractUnits[i].unitNameAr!;
    }

    let data = this.currenciesListInDetail.filter((x) => {
      return (
        (x.nameAr + ' ' + x.nameEn).toLowerCase().includes(searchTxt) ||
        (x.nameAr + ' ' + x.nameEn).toUpperCase().includes(searchTxt)
      );
    });

    if (data.length == 1) {
      if (i == -1) {
        this.selectedVoucherDetail!.currencyNameAr = data[0].nameAr;
        this.selectedVoucherDetail!.currencyId = data[0].id;

        if (this.selectedVoucherDetail!.currencyId != this.mainCurrencyId) {

          this.filterCurrencyTransactionList = this.currencyTransactionList.find(x => x.currencyMasterId == this.selectedVoucherDetail!.currencyId && x.currencyDetailId == this.mainCurrencyId)
          this.selectedVoucherDetail!.currencyConversionFactor = this.filterCurrencyTransactionList.transactionFactor;
          this.getValueAfterConversion();
        }
      } else {
        this.voucherDetail[i].currencyNameAr = data[0].nameAr;
        this.voucherDetail[i].currencyId = data[0].id;
        if (this.voucherDetail[i]!.currencyId != this.mainCurrencyId) {

          this.filterCurrencyTransactionList = this.currencyTransactionList.find(x => x.currencyMasterId == this.voucherDetail[i]!.currencyId && x.currencyDetailId == this.mainCurrencyId)
          this.voucherDetail[i]!.currencyConversionFactor = this.filterCurrencyTransactionList.transactionFactor;
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
              this.selectedVoucherDetail!.currencyNameAr = d.nameAr;
              this.selectedVoucherDetail!.currencyId = d.id;
              if (this.selectedVoucherDetail!.currencyId != this.mainCurrencyId) {

                this.filterCurrencyTransactionList = this.currencyTransactionList.find(x => x.currencyMasterId == this.selectedVoucherDetail!.currencyId && x.currencyDetailId == this.mainCurrencyId)
                this.selectedVoucherDetail!.currencyConversionFactor = this.filterCurrencyTransactionList.transactionFactor;
                this.getValueAfterConversion();

              }
            } else {

              this.voucherDetail[i].currencyNameAr = d.nameAr;
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
  openBeneficiaryAccountSearchDialog(i) {

    let searchTxt = '';
    if (i == -1) {
      searchTxt = this.selectedVoucherDetail?.beneficiaryAccountNameAr ?? '';
    } else {
      searchTxt = ''
      // this.selectedRentContractUnits[i].unitNameAr!;
    }

    let data = this.beneficiaryAccountsList.filter((x) => {
      return (
        (x.nameAr + ' ' + x.nameEn).toLowerCase().includes(searchTxt) ||
        (x.nameAr + ' ' + x.nameEn).toUpperCase().includes(searchTxt)
      );
    });

    if (data.length == 1) {
      if (i == -1) {
        this.selectedVoucherDetail!.beneficiaryAccountNameAr = data[0].nameAr;
        this.selectedVoucherDetail!.beneficiaryAccountId = data[0].id;
      } else {
        this.voucherDetail[i].beneficiaryAccountNameAr = data[0].nameAr;
        this.voucherDetail[i].beneficiaryAccountId = data[0].id;
      }
    } else {
      let lables = ['الكود', 'الاسم', 'الاسم الانجليزى'];
      let names = ['code', 'nameAr', 'nameEn'];
      let title = 'بحث عن الحساب';
      let sub = this.searchDialog
        .showDialog(lables, names, this.beneficiaryAccountsList, title, searchTxt)
        .subscribe((d) => {
          if (d) {
            if (i == -1) {
              this.selectedVoucherDetail!.beneficiaryAccountNameAr = d.nameAr;
              this.selectedVoucherDetail!.beneficiaryAccountId = d.id;
            } else {
              this.voucherDetail[i].beneficiaryAccountNameAr = d.nameAr;
              this.voucherDetail[i].beneficiaryAccountId = d.id;
            }
          }
        });
      this.subsList.push(sub);
    }

  }
  openCostCenterSearchDialog(i) {

    let searchTxt = '';
    if (i == -1) {
      searchTxt = this.selectedVoucherDetail?.costCenterNameAr ?? '';
    } else {
      searchTxt = ''
      // this.selectedRentContractUnits[i].unitNameAr!;
    }

    let data = this.costCentersInDetailsList.filter((x) => {
      return (
        (x.nameAr + ' ' + x.nameEn).toLowerCase().includes(searchTxt) ||
        (x.nameAr + ' ' + x.nameEn).toUpperCase().includes(searchTxt)
      );
    });

    if (data.length == 1) {
      if (i == -1) {
        this.selectedVoucherDetail!.costCenterNameAr = data[0].nameAr;
        this.selectedVoucherDetail!.costCenterId = data[0].id;
      } else {
        this.voucherDetail[i].costCenterNameAr = data[0].nameAr;
        this.voucherDetail[i].costCenterId = data[0].id;
      }
    } else {
      let lables = ['الكود', 'الاسم', 'الاسم الانجليزى'];
      let names = ['code', 'nameAr', 'nameEn'];
      let title = 'بحث عن الحساب';
      let sub = this.searchDialog
        .showDialog(lables, names, this.costCentersInDetailsList, title, searchTxt)
        .subscribe((d) => {
          if (d) {
            if (i == -1) {
              this.selectedVoucherDetail!.costCenterNameAr = d.nameAr;
              this.selectedVoucherDetail!.costCenterId = d.id;
            } else {
              this.voucherDetail[i].costCenterNameAr = d.nameAr;
              this.voucherDetail[i].costCenterId = d.id;
            }
          }
        });
      this.subsList.push(sub);
    }

  }
  onSelectCashAccount(event) {
    this.voucherForm.controls.cashAccountId.setValue(event.id);
    this.showSearchCashAccountModal = false;
  }
  onSelectCostCenter(event) {
    this.voucherForm.controls.costCenterId.setValue(event.id);
    this.showSearchCostCenterModal = false;
  }
  onSelectCurrency(event) {
    this.voucherForm.controls.currencyId.setValue(event.id);
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
  addItem() {
    this.voucherDetail.push({
      id: 0,
      voucherId: this.selectedVoucherDetail?.voucherId ?? 0,
      debit: this.selectedVoucherDetail?.debit ?? 0,
      credit: this.selectedVoucherDetail?.credit ?? 0,
      currencyId: this.selectedVoucherDetail?.currencyId ?? 0,
      currencyConversionFactor: this.selectedVoucherDetail?.currencyConversionFactor ?? 0,
      debitLocal: this.selectedVoucherDetail?.debitLocal ?? 0,
      creditLocal: this.selectedVoucherDetail?.creditLocal ?? 0,
      beneficiaryTypeId: this.selectedVoucherDetail?.beneficiaryTypeId ?? 0,
      beneficiaryAccountId: this.selectedVoucherDetail?.beneficiaryAccountId ?? 0,
      description: this.selectedVoucherDetail?.description ?? '',
      costCenterId: this.selectedVoucherDetail?.costCenterId ?? 0,
      currencyNameAr: this.selectedVoucherDetail?.currencyNameAr ?? '',
      currencyNameEn: this.selectedVoucherDetail?.currencyNameEn ?? '',
      beneficiaryAccountNameAr: this.selectedVoucherDetail?.beneficiaryAccountNameAr ?? '',
      beneficiaryAccountNameEn: this.selectedVoucherDetail?.beneficiaryAccountNameEn ?? '',
      costCenterNameAr: this.selectedVoucherDetail?.costCenterNameAr ?? '',
      costCenterNameEn: this.selectedVoucherDetail?.costCenterNameEn ?? ''
    });
    this.voucher!.voucherDetail = this.voucherDetail;


    this.totalDebitLocal += this.selectedVoucherDetail?.debitLocal ?? 0;
    this.totalCreditLocal += this.selectedVoucherDetail?.creditLocal ?? 0;
    let currencyConversionFactor;
    if (this.voucherkindId == 1) {
      //here
      this.voucherForm.controls["voucherTotalLocal"].setValue(this.totalDebitLocal)
      if (this.currencyId != this.mainCurrencyId) {

        this.filterCurrencyTransactionList = this.currencyTransactionList.find(x => x.currencyMasterId == this.mainCurrencyId && x.currencyDetailId == this.currencyId)

        currencyConversionFactor = this.filterCurrencyTransactionList.transactionFactor;
        this.voucherForm.controls["voucherTotal"].setValue(this.totalDebitLocal * currencyConversionFactor)
      }
      else {
        this.voucherForm.controls["voucherTotal"].setValue(this.totalDebitLocal)
      }
    }
    if (this.voucherkindId == 2) {
      this.voucherForm.controls["voucherTotalLocal"].setValue(this.totalCreditLocal)
      if (this.currencyId != this.mainCurrencyId) {

        this.filterCurrencyTransactionList = this.currencyTransactionList.find(x => x.currencyMasterId == this.mainCurrencyId && x.currencyDetailId == this.currencyId)

        currencyConversionFactor = this.filterCurrencyTransactionList.transactionFactor;
        this.voucherForm.controls["voucherTotal"].setValue(this.totalCreditLocal * currencyConversionFactor)
      }
      else {
        this.voucherForm.controls["voucherTotal"].setValue(this.totalCreditLocal)
      }
    }

    this.clearSelectedItemData();

  }
  deleteItem(index) {
    
    this.totalDebitLocal = this.totalDebitLocal - this.voucherDetail[index]?.debitLocal ?? 0;
    this.totalCreditLocal = this.totalCreditLocal - this.voucherDetail[index]?.creditLocal ?? 0;
    let currencyConversionFactor;
    if (this.voucherkindId == 1) {
      this.voucherForm.controls["voucherTotalLocal"].setValue(this.totalDebitLocal)
      if (this.currencyId != this.mainCurrencyId) {

        this.filterCurrencyTransactionList = this.currencyTransactionList.find(x => x.currencyMasterId == this.mainCurrencyId && x.currencyDetailId == this.currencyId)

        currencyConversionFactor = this.filterCurrencyTransactionList.transactionFactor;
        this.voucherForm.controls["voucherTotal"].setValue(this.totalDebitLocal * currencyConversionFactor)
      }
      else {
        this.voucherForm.controls["voucherTotal"].setValue(this.totalDebitLocal)
      }
    }
    if (this.voucherkindId == 2) {
      this.voucherForm.controls["voucherTotalLocal"].setValue(this.totalCreditLocal)
      if (this.currencyId != this.mainCurrencyId) {

        this.filterCurrencyTransactionList = this.currencyTransactionList.find(x => x.currencyMasterId == this.mainCurrencyId && x.currencyDetailId == this.currencyId)

        currencyConversionFactor = this.filterCurrencyTransactionList.transactionFactor;
        this.voucherForm.controls["voucherTotal"].setValue(this.totalCreditLocal * currencyConversionFactor)
      }
      else {
        this.voucherForm.controls["voucherTotal"].setValue(this.totalCreditLocal)
      }
    }

    if (this.voucherDetail.length) {
      if (this.voucherDetail.length == 1) {
        this.voucherDetail = [];
      } else {
        this.voucherDetail.splice(index, 1);
      }
    }

    this.voucher.voucherDetail = this.voucherDetail;
    
    this.currencyFactor = 0;
    this.currencyId = null;

  }
  clearSelectedItemData() {
    this.selectedVoucherDetail = {
      id: 0,
      voucherId: 0,
      debit: 0,
      credit: 0,
      currencyId: 0,
      currencyConversionFactor: 1,
      debitLocal: 0,
      creditLocal: 0,
      beneficiaryTypeId: 0,
      beneficiaryAccountId: 0,
      description: '',
      costCenterId: 0,
      currencyNameAr: '',
      currencyNameEn: '',
      beneficiaryAccountNameAr: '',
      beneficiaryAccountNameEn: '',
      costCenterNameAr: '',
      costCenterNameEn: ''
    }
  }
  calculateTotal(a) {

  }
  setInputData() {

    this.voucher = {
      id: this.voucherForm.controls["id"].value,
      companyId: this.voucherForm.controls["companyId"].value,
      branchId: this.voucherForm.controls["branchId"].value,
      voucherTypeId: this.voucherTypeId,
      code: this.voucherForm.controls["code"].value,
      voucherDate: formatDate(Date.parse(this.voucherForm.controls["voucherDate"].value)),
      cashAccountId: this.voucherForm.controls["cashAccountId"].value,
      costCenterId: this.voucherForm.controls["costCenterId"].value,
      currencyId: this.voucherForm.controls["currencyId"].value,
      description: this.voucherForm.controls["description"].value,
      voucherTotal: this.voucherForm.controls["voucherTotal"].value,
      voucherTotalLocal: this.voucherForm.controls["voucherTotalLocal"].value,
      currencyFactor: this.voucherForm.controls["currencyFactor"].value,

      voucherDetail: this.voucher.voucherDetail ?? [],

    };


  }
  confirmSave() {
    this.voucher.voucherDate = this.dateService.getDateForInsert(this.voucherForm.controls["voucherDate"].value);
    return new Promise<void>((resolve, reject) => {

      let sub = this.voucherService.createVoucherAndRelations(this.voucher).subscribe({
        next: (result: any) => {
          this.defineVoucherForm();
          this.clearSelectedItemData();
          this.voucherDetail = [];
          // this.submited = false;
          this.spinner.hide();

          navigateUrl(this.listUrl + this.voucherTypeId, this.router);
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
  onSave() {
    if (this.voucher.voucherDetail.length == 0) {
      this.errorMessage = this.translate.instant("voucher.voucher-details-required");
      this.errorClass = 'errorMessage';
      this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
      return;
    }

    if (this.voucherForm.valid) {
      this.setInputData();
      this.spinner.show();
      this.confirmSave().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });




    }
    else {
      this.errorMessage = this.translate.instant("validation-messages.invalid-data");
      this.errorClass = 'errorMessage';
      this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
      return this.voucherForm.markAllAsTouched();

    }
  }
  confirmUpdate() {
    this.voucher.voucherDate = this.dateService.getDateForInsert(this.voucherForm.controls["voucherDate"].value);

    return new Promise<void>((resolve, reject) => {

      let sub = this.voucherService.updateVoucherAndRelations(this.voucher).subscribe({
        next: (result: any) => {


          this.defineVoucherForm();
          this.clearSelectedItemData();
          this.voucherDetail = [];

          // this.submited = false;
          this.spinner.hide();

          navigateUrl(this.listUrl + this.voucherTypeId, this.router);
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
  onUpdate() {
    if (this.voucher.voucherDetail.length == 0) {
      this.errorMessage = this.translate.instant("voucher.voucher-details-required");
      this.errorClass = 'errorMessage';
      this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
      return;
    }

    if (this.voucherForm.valid) {
      this.setInputData();
      this.spinner.show();
      this.confirmUpdate().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });




    }
    else {
      this.errorMessage = this.translate.instant("validation-messages.invalid-data");
      this.errorClass = 'errorMessage';
      this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
      return this.voucherForm.markAllAsTouched();

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
            this.defineVoucherForm();
            this.clearSelectedItemData();
            this.voucherDetail = [];

            this.sharedServices.changeToolbarPath(this.toolbarPathData);
          }else if (currentBtn.action == ToolbarActions.Update) {
            this.onUpdate();
          }
          else if (currentBtn.action == ToolbarActions.Copy) {
           this.getVoucherCode();
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
  getValueAfterConversion() {
    this.selectedVoucherDetail.debitLocal = Number(this.selectedVoucherDetail.debit) * Number(this.selectedVoucherDetail.currencyConversionFactor);
    this.selectedVoucherDetail.creditLocal = Number(this.selectedVoucherDetail.credit) * Number(this.selectedVoucherDetail.currencyConversionFactor);


  }
  getAddedValueAfterConversion(i: any) {
    this.voucherDetail[i].debitLocal = Number(this.voucherDetail[i].debit) * Number(this.voucherDetail[i].currencyConversionFactor);
    this.voucherDetail[i].creditLocal = Number(this.voucherDetail[i].credit) * Number(this.voucherDetail[i].currencyConversionFactor);

  }
  getAmount() {
    if (this.voucherForm.value.currencyId == this.mainCurrencyId) {
      this.voucherTotal = this.voucherTotalLocal;
      this.currencyFactor = 1;
    }
    else {
      let sub = this.currencyServiceProxy.getCurrency(this.voucherForm.value.currencyId).subscribe({
        next: (res: any) => {
          
          this.currency = res;
          let currencyModel = this.currency.response.currencyTransactionsDto.filter(x => x.currencyDetailId == this.mainCurrencyId)[0];
          this.currencyFactor = 1 / currencyModel.transactionFactor;
          this.voucherTotal = (1 / currencyModel.transactionFactor) * this.voucherTotalLocal;
        }
      })
      this.subsList.push(sub);

    }
  }
}

