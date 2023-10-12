import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { REQUIRED_VALIDATORS } from '../../../../../shared/constants/input-validators';
import { ToolbarPath } from '../../../../../shared/interfaces/toolbar-path';
import { PublicService } from '../../../../../shared/services/public.service';
import { Bill, BillItem } from '../../../models/bill'
import { BillService } from '../../../services/bill.service';
import { BillType } from '../../../models/bill-type'
import { ICustomEnum } from '../../../../../shared/interfaces/ICustom-enum';
import { SearchDialogService } from '../../../../../shared/services/search-dialog.service'
import { ToolbarData } from '../../../../../shared/interfaces/toolbar-data';
import { SharedService } from '../../../../../shared/common-services/shared-service';
import { NotificationsAlertsService } from '../../../../../shared/common-services/notifications-alerts.service';
import { ToolbarActions } from '../../../../../shared/enum/toolbar-actions';
import { formatDate, navigateUrl } from '../../../../../shared/helper/helper-url';
import { DateCalculation, DateModel } from '../../../../../shared/services/date-services/date-calc.service';
import { CurrencyServiceProxy } from '../../../../master-codes/services/currency.servies';
import { GeneralConfigurationServiceProxy } from '../../../../Accounting/services/general-configurations.services'
import { convertEnumToArray, AccountClassificationsEnum, PayWayEnum, PayWayArEnum, ShipMethodEnum, ShipKindEnum, ShipKindArEnum } from '../../../../../shared/constants/enumrators/enums';
import { BillTypeServiceProxy } from '../../../Services/bill-type.service';
import { AccountServiceProxy } from 'src/app/erp/Accounting/services/account.services';

@Component({
  selector: 'app-add-edit-bill',
  templateUrl: './add-edit-bill.component.html',
  styleUrls: ['./add-edit-bill.component.scss']
})
export class AddEditBillComponent implements OnInit, AfterViewInit {
  //#region Main Declarations
  branchId: any = localStorage.getItem("branchId");
  companyId: any = localStorage.getItem("companyId");
  billForm: FormGroup = new FormGroup({});
  currencyId: any;
  cashAccountId: any;
  supplierAccountId: any;
  salesAccountsList: any;
  salesReturnAccountsList: any;
  purchasesAccountsList: any;
  purchasesReturnAccountsList: any;
  supplierAccountsList: any;
  date!: DateModel;
  deliveryDate: DateModel;
  bill: Bill = new Bill();
  billItem: BillItem[] = [];
  _billItem: BillItem = new BillItem();
  selectedBillItem: BillItem = new BillItem();
  subsList: Subscription[] = [];

  id: any = 0;
  currnetUrl;
  errorMessage = '';
  errorClass = '';
  lang = localStorage.getItem("language")
  routeCashAccountApi = 'Account/GetLeafAccountsByAccountClassificationId?AccountClassificationId=' + AccountClassificationsEnum.Cash
  routeSalesAccountApi = 'Account/GetLeafAccountsByAccountClassificationId?AccountClassificationId=' + AccountClassificationsEnum.Sales
  routeSupplierAccountApi = 'Account/GetLeafAccountsByAccountClassificationId?AccountClassificationId=' + AccountClassificationsEnum.Supplier
  routePurchasesAccountApi = 'Account/GetLeafAccountsByAccountClassificationId?AccountClassificationId=' + AccountClassificationsEnum.Purchases





  routeCurrencyApi = "currency/get-ddl?"
  routeCostCenterApi = 'CostCenter/get-ddl?'

  routeSupplierApi = 'SupplierCard/get-ddl?'
  routeCustomerApi = 'CustomerCard/get-ddl?'
  routeBillTypeApi = 'BillType/get-ddl?'
  routeBillApi = 'Bill/get-ddl?'
  routeSalesPersonApi = 'SalesPersonCard/get-ddl?'
  routeStoreApi = 'StoreCard/get-ddl?'
  routeProjectApi = 'Project/get-ddl?'


  cashAccountsList: any;
  currenciesList: any;
  costCentersList: any;
  currencyTransactionList: any;
  filterCurrencyTransactionList: any;
  suppliersList: any;
  customersList: any;
  billTypesList: any;
  billsList: any;
  filterBillsList: any;
  salesPersonsList: any;
  storesList: any;
  projectsList: any;

  payWaysEnum: ICustomEnum[] = [];
  shipMethodsEnum: ICustomEnum[] = [];
  shipKindsEnum: ICustomEnum[] = [];

  queryParams: any;
  billTypeId: any;
  billType: BillType[] = [];

  currency: any;

  showSearchSupplierModal = false;
  showSearchCustomerModal = false;
  showSearchCashAccountModal = false;
  showSearchSupplierAccountModal = false;
  showSearchSalesAccountModal = false;
  showSearchSalesReturnAccountModal = false;
  showSearchPurchasesAccountModal = false;
  showSearchPurchasesReturnAccountModal = false;

  showSearchCostCenterModal = false;
  showSearchCurrencyModal = false;
  showSearchSalesPersonModal = false;
  showSearchStoreModal = false;
  showSearchProjectModal = false;

  addUrl: string = '/warehouses-operations/bill/add-bill';
  updateUrl: string = '/warehouses-operations/bill/update-bill/';
  listUrl: string = '/warehouses-operations/bill/';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.bills"),
    componentAdd: '',

  };

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private translate: TranslateService,
    private publicService: PublicService,
    // private billService: BillService,
    private dateService: DateCalculation,
    private currencyService: CurrencyServiceProxy,
    private billTypeService: BillTypeServiceProxy,
    private generalConfigurationService: GeneralConfigurationServiceProxy,
    private searchDialog: SearchDialogService,
    private sharedServices: SharedService,
    private alertsService: NotificationsAlertsService,
    private spinnerService: NgxSpinnerService,
    private accountService: AccountServiceProxy,



  ) {
    this.defineBillForm();
    this.clearSelectedItemData();
    this.billItem = [];

  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    this.spinner.show();
    this.getPayWays();
    this.getShipKinds();
    this.getShipMethods();

    Promise.all([
      this.getSuppliers(),
      this.getCustomers(),
      this.getCurrencies(),
      this.getCurrenciesTransactions(),
      this.getCashAccounts(),
      this.getSupplierAccounts(),
      this.getSalesAccounts(),
      this.getPurchasesAccounts(),

      this.getCostCenters(),
      this.getBillTypes(),
      this.getBills(),
      this.getSalesPersons(),
      this.getStores(),
      // this.getProjects(),



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

      if (params['billTypeId'] != null) {
        this.billTypeId = params['billTypeId'];
        if (this.billTypeId) {
          this.getBillTypeById(this.billTypeId);

        }
      }
      if (params['id'] != null) {
        this.id = params['id'];

        // if (this.id) {
        //   this.getBillById(this.id).then(a => {

        //     this.spinner.hide();

        //   }).catch(err => {
        //     this.spinner.hide();

        //   });
        // }
        // else {
        //   this.sharedServices.changeButton({ action: 'New' } as ToolbarData);
        //   this.spinner.hide();
        // }
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
  defineBillForm() {
    this.billForm = this.fb.group({
      id: 0,
      companyId: this.companyId,
      branchId: this.branchId,
      billTypeId: this.billTypeId,
      code: REQUIRED_VALIDATORS,
      date: [this.dateService.getCurrentDate(), Validators.compose([Validators.required])],
      deliveryDate: [this.dateService.getCurrentDate()],
      supplierId: '',
      supplierReference: '',
      customerId: '',
      payWay: REQUIRED_VALIDATORS,
      shipMethod: '',
      shipKind: '',
      referenceId: '',
      referenceNo: '',
      salesPersonId: '',
      storeId: '',
      currencyId: REQUIRED_VALIDATORS,
      currencyExchangeTransaction: '',
      projectId: '',
      costCenterId: REQUIRED_VALIDATORS,
      notes: '',
      attachment: '',
      cashAccountId: '',
      supplierAccountId: '',
      salesAccountId: '',
      salesReturnAccountId: '',
      purchasesAccountId: '',
      purchasesReturnAccountId: '',
      total: '',
      tax: '',
      discount: '',
      discountAccountId: '',
      net: '',
      paid: '',
      paidAccountId: '',
      remaining: '',
      remainingAccountId: ''



    });
    this.date = this.dateService.getCurrentDate();
    this.deliveryDate = this.dateService.getCurrentDate();

  }





  //#region Helper Functions

  get f(): { [key: string]: AbstractControl } {
    return this.billForm.controls;
  }


  //#endregion
  getBillTypeById(id) {
    this.billType = this.billTypesList.filter(x => x.id == id);
    if (this.id == 0) {
      //this.getBillCode();

    }
    // return new Promise<void>((resolve, reject) => {
    //   let sub = this.billTypeService.getBillType(id).subscribe({
    //     next: (res: any) => {
    //       resolve();
    //       this.billType = res.response

    //       if (this.id == 0) {
    //         //this.getBillCode();

    //       }

    //     },
    //     error: (err: any) => {
    //       reject(err);
    //     },
    //     complete: () => {
    //       console.log('complete');
    //     },
    //   });
    //   this.subsList.push(sub);

    // });

  }
  getPayWays() {

    if (this.lang == 'en') {
      this.payWaysEnum = convertEnumToArray(PayWayEnum);
    }
    else {
      this.payWaysEnum = convertEnumToArray(PayWayArEnum);

    }
  }
  getShipMethods() {

    this.shipMethodsEnum = convertEnumToArray(ShipMethodEnum);

  }
  getShipKinds() {

    if (this.lang == 'en') {
      this.shipKindsEnum = convertEnumToArray(ShipKindEnum);
    }
    else {
      this.shipKindsEnum = convertEnumToArray(ShipKindArEnum);

    }
  }
  // getBillById(id: any) {
  //   return new Promise<void>((resolve, reject) => {
  //     let sub = this.billService.getWithResponse<Bill>("getById?id=" + id).subscribe({
  //       next: (res: any) => {
  //         resolve();
  //         this.billForm.setValue({
  //           id: res.response?.id,
  //           companyId: res.response?.companyId,
  //           branchId: res.response?.branchId,
  //           billTypeId: res.response?.billTypeId,
  //           code: res.response?.code,
  //           date: this.dateService.getDateForCalender(res.response?.date),
  //           supplierId: res.response?.supplierId,
  //           supplierReference: res.response?.supplierReference,
  //           customerId: res.response?.customerId,
  //           payWay: res.response?.payWay,
  //           shipMethod: res.response?.shipMethod,
  //           shipKind: res.response?.shipKind,
  //           referenceId: res.response?.referenceId,
  //           referenceNo: res.response?.referenceNo,
  //           salesPersonId: res.response?.salesPersonId,
  //           storeId: res.response?.storeId,
  //           deliveryDate:this.dateService.getDateForCalender(res.response?.deliveryDate),
  //           currencyId: res.response?.currencyId,
  //           currencyExchangeTransaction: res.response?.currencyExchangeTransaction,
  //           projectId: res.response?.projectId,
  //           costCenterId: res.response?.costCenterId,
  //           notes:res.response?.notes,
  //           attachment:res.response?.attachment,
  //           cashAccountId: res.response?.cashAccountId,
  //           supplierAccountId: res.response?.supplierAccountId,
  //           salesAccountId: res.response?.salesAccountId,
  //           salesReturnAccountId:res.response?.salesReturnAccountId,
  //           purchasesAccountId: res.response?.purchasesAccountId,
  //           purchasesReturnAccountId: res.response?.purchasesReturnAccountId,
  //           total:res.response?.total,
  //           tax: res.response?.tax,
  //           discount: res.response?.discount,
  //           discountAccountId: res.response?.discountAccountId,
  //           net: res.response?.net,
  //           paid: res.response?.paid,
  //           paidAccountId: res.response?.paidAccountId,
  //           remaining: res.response?.remaining,
  //           remainingAccountId: res.response?.remainingAccountId



  //         });
  //         this.bill.billItem=res.data.billItem;
  //         // this.billTotal = res.response?.billTotal;
  //         // this.billTotalLocal = res.response?.billTotalLocal;
  //         console.log(
  //           'this.billForm.value set value',
  //           this.billForm.value
  //         );
  //       },
  //       error: (err: any) => {
  //         reject(err);
  //       },
  //       complete: () => {
  //         console.log('complete');
  //       },
  //     });
  //     this.subsList.push(sub);

  //   });
  // }


  // getBillCode() {
  //   return new Promise<void>((resolve, reject) => {
  //     let sub = this.billService.getWithResponse("getLastCode").subscribe({
  //       next: (res: any) => {
  //         resolve();
  //         this.billForm.patchValue({
  //           code: res.response
  //         });

  //       },
  //       error: (err: any) => {
  //         reject(err);
  //       },
  //       complete: () => {
  //         console.log('complete');
  //       },
  //     });
  //     this.subsList.push(sub);

  //   });

  // }
  getCashAccounts() {
    debugger
    return new Promise<void>((resolve, reject) => {
      // let sub = this.accountService.getLeafAccounts().subscribe({
      //   next: (res) => {
      //     debugger
      //     if (res.success) {
      //       this.cashAccountsList = res.response.filter(x => x.accountClassificationId == AccountClassificationsEnum.Cash);

      //     }


      //     resolve();

      //   },
      //   error: (err: any) => {
      //     reject(err);
      //   },
      //   complete: () => {
      //     console.log('complete');
      //   },
      // });
      // let sub = this.accountService.getLeafAccountsByAccountClassificationId(AccountClassificationsEnum.Cash).subscribe({
      //   next: (res) => {
      //     debugger
      //     if (res.success) {
      //       this.cashAccountsList = res.response;

      //     }


      //     resolve();

      //   },
      //   error: (err: any) => {
      //     reject(err);
      //   },
      //   complete: () => {
      //     console.log('complete');
      //   },
      // });
      let sub = this.publicService.getDdl(this.routeCashAccountApi).subscribe({
        next: (res) => {
          if (res.success) {
            this.cashAccountsList = res.response;

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
  getSupplierAccounts() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeSupplierAccountApi).subscribe({
        next: (res) => {
          if (res.success) {
            this.supplierAccountsList = res.response;

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
  getSalesAccounts() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeSalesAccountApi).subscribe({
        next: (res) => {
          if (res.success) {
            this.salesAccountsList = res.response;
            this.salesReturnAccountsList = res.response;

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
  getPurchasesAccounts() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routePurchasesAccountApi).subscribe({
        next: (res) => {
          if (res.success) {
            this.purchasesAccountsList = res.response;
            this.purchasesReturnAccountsList = res.response;

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
          console.log('complete');
        },
      });

      this.subsList.push(sub);
    });

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
          console.log('complete');
        },
      });

      this.subsList.push(sub);
    });

  }
  getBillTypes() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeBillTypeApi).subscribe({
        next: (res) => {
          if (res.success) {
            this.billTypesList = res.response;

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
  getBills() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeBillApi).subscribe({
        next: (res) => {
          if (res.success) {
            this.billsList = res.response;

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
  getBillsByReferenceId(referenceId: any) {
    this.filterBillsList = this.billsList.filter(x => x.billTypeId == referenceId);
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
          console.log('complete');
        },
      });

      this.subsList.push(sub);
    });

  }
  getStores() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeStoreApi).subscribe({
        next: (res) => {
          if (res.success) {
            this.storesList = res.response;

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
  getProjects() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeProjectApi).subscribe({
        next: (res) => {
          if (res.success) {
            this.projectsList = res.response;

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
  // openCurrencySearchDialog(i) {

  //   let searchTxt = '';
  //   if (i == -1) {
  //     searchTxt = this.selectedBillDetail?.currencyNameAr ?? '';
  //   } else {
  //     searchTxt = ''
  //     // this.selectedRentContractUnits[i].unitNameAr!;
  //   }

  //   let data = this.currenciesListInDetail.filter((x) => {
  //     return (
  //       (x.nameAr + ' ' + x.nameEn).toLowerCase().includes(searchTxt) ||
  //       (x.nameAr + ' ' + x.nameEn).toUpperCase().includes(searchTxt)
  //     );
  //   });

  //   if (data.length == 1) {
  //     if (i == -1) {
  //       this.selectedBillDetail!.currencyNameAr = data[0].nameAr;
  //       this.selectedBillDetail!.currencyId = data[0].id;

  //       if (this.selectedBillDetail!.currencyId != this.mainCurrencyId) {

  //         this.filterCurrencyTransactionList = this.currencyTransactionList.find(x => x.currencyMasterId == this.selectedBillDetail!.currencyId && x.currencyDetailId == this.mainCurrencyId)
  //         this.selectedBillDetail!.currencyConversionFactor = this.filterCurrencyTransactionList.transactionFactor;
  //         this.getValueAfterConversion();
  //       }
  //     } else {
  //       this.billItem[i].currencyNameAr = data[0].nameAr;
  //       this.billItem[i].currencyId = data[0].id;
  //       if (this.billItem[i]!.currencyId != this.mainCurrencyId) {

  //         this.filterCurrencyTransactionList = this.currencyTransactionList.find(x => x.currencyMasterId == this.billItem[i]!.currencyId && x.currencyDetailId == this.mainCurrencyId)
  //         this.billItem[i]!.currencyConversionFactor = this.filterCurrencyTransactionList.transactionFactor;
  //         this.getAddedValueAfterConversion(i);
  //       }
  //     }
  //   } else {
  //     let lables = ['الكود', 'الاسم', 'الاسم الانجليزى'];
  //     let names = ['code', 'nameAr', 'nameEn'];
  //     let title = 'بحث عن العملة';
  //     let sub = this.searchDialog
  //       .showDialog(lables, names, this.currenciesListInDetail, title, searchTxt)
  //       .subscribe((d) => {
  //         if (d) {
  //           if (i == -1) {
  //             this.selectedBillDetail!.currencyNameAr = d.nameAr;
  //             this.selectedBillDetail!.currencyId = d.id;
  //             if (this.selectedBillDetail!.currencyId != this.mainCurrencyId) {

  //               this.filterCurrencyTransactionList = this.currencyTransactionList.find(x => x.currencyMasterId == this.selectedBillDetail!.currencyId && x.currencyDetailId == this.mainCurrencyId)
  //               this.selectedBillDetail!.currencyConversionFactor = this.filterCurrencyTransactionList.transactionFactor;
  //               this.getValueAfterConversion();

  //             }
  //           } else {

  //             this.billItem[i].currencyNameAr = d.nameAr;
  //             this.billItem[i].currencyId = d.id;
  //             if (this.billItem[i]!.currencyId != this.mainCurrencyId) {

  //               this.filterCurrencyTransactionList = this.currencyTransactionList.find(x => x.currencyMasterId == this.billItem[i]!.currencyId && x.currencyDetailId == this.mainCurrencyId)
  //               this.billItem[i]!.currencyConversionFactor = this.filterCurrencyTransactionList.transactionFactor;
  //               this.getAddedValueAfterConversion(i);
  //             }
  //           }
  //         }
  //       });
  //     this.subsList.push(sub);
  //   }

  // }
  // openBeneficiaryAccountSearchDialog(i) {

  //   let searchTxt = '';
  //   if (i == -1) {
  //     searchTxt = this.selectedBillDetail?.beneficiaryAccountNameAr ?? '';
  //   } else {
  //     searchTxt = ''
  //     // this.selectedRentContractUnits[i].unitNameAr!;
  //   }

  //   let data = this.beneficiaryAccountsList.filter((x) => {
  //     return (
  //       (x.nameAr + ' ' + x.nameEn).toLowerCase().includes(searchTxt) ||
  //       (x.nameAr + ' ' + x.nameEn).toUpperCase().includes(searchTxt)
  //     );
  //   });

  //   if (data.length == 1) {
  //     if (i == -1) {
  //       this.selectedBillDetail!.beneficiaryAccountNameAr = data[0].nameAr;
  //       this.selectedBillDetail!.beneficiaryAccountId = data[0].id;
  //     } else {
  //       this.billItem[i].beneficiaryAccountNameAr = data[0].nameAr;
  //       this.billItem[i].beneficiaryAccountId = data[0].id;
  //     }
  //   } else {
  //     let lables = ['الكود', 'الاسم', 'الاسم الانجليزى'];
  //     let names = ['code', 'nameAr', 'nameEn'];
  //     let title = 'بحث عن الحساب';
  //     let sub = this.searchDialog
  //       .showDialog(lables, names, this.beneficiaryAccountsList, title, searchTxt)
  //       .subscribe((d) => {
  //         if (d) {
  //           if (i == -1) {
  //             this.selectedBillDetail!.beneficiaryAccountNameAr = d.nameAr;
  //             this.selectedBillDetail!.beneficiaryAccountId = d.id;
  //           } else {
  //             this.billItem[i].beneficiaryAccountNameAr = d.nameAr;
  //             this.billItem[i].beneficiaryAccountId = d.id;
  //           }
  //         }
  //       });
  //     this.subsList.push(sub);
  //   }

  // }
  // openCostCenterSearchDialog(i) {

  //   let searchTxt = '';
  //   if (i == -1) {
  //     searchTxt = this.selectedBillDetail?.costCenterNameAr ?? '';
  //   } else {
  //     searchTxt = ''
  //     // this.selectedRentContractUnits[i].unitNameAr!;
  //   }

  //   let data = this.costCentersInDetailsList.filter((x) => {
  //     return (
  //       (x.nameAr + ' ' + x.nameEn).toLowerCase().includes(searchTxt) ||
  //       (x.nameAr + ' ' + x.nameEn).toUpperCase().includes(searchTxt)
  //     );
  //   });

  //   if (data.length == 1) {
  //     if (i == -1) {
  //       this.selectedBillDetail!.costCenterNameAr = data[0].nameAr;
  //       this.selectedBillDetail!.costCenterId = data[0].id;
  //     } else {
  //       this.billItem[i].costCenterNameAr = data[0].nameAr;
  //       this.billItem[i].costCenterId = data[0].id;
  //     }
  //   } else {
  //     let lables = ['الكود', 'الاسم', 'الاسم الانجليزى'];
  //     let names = ['code', 'nameAr', 'nameEn'];
  //     let title = 'بحث عن الحساب';
  //     let sub = this.searchDialog
  //       .showDialog(lables, names, this.costCentersInDetailsList, title, searchTxt)
  //       .subscribe((d) => {
  //         if (d) {
  //           if (i == -1) {
  //             this.selectedBillDetail!.costCenterNameAr = d.nameAr;
  //             this.selectedBillDetail!.costCenterId = d.id;
  //           } else {
  //             this.billItem[i].costCenterNameAr = d.nameAr;
  //             this.billItem[i].costCenterId = d.id;
  //           }
  //         }
  //       });
  //     this.subsList.push(sub);
  //   }

  // }
  onSelectSupplier(event) {
    this.billForm.controls.supplierId.setValue(event.id);
    this.showSearchSupplierModal = false;
  }
  onSelectCustomer(event) {
    this.billForm.controls.customerId.setValue(event.id);
    this.showSearchCustomerModal = false;
  }
  onSelectCashAccount(event) {
    this.billForm.controls.cashAccountId.setValue(event.id);
    this.showSearchCashAccountModal = false;
  }
  onSelectSupplierAccount(event) {
    this.billForm.controls.supplierAccountId.setValue(event.id);
    this.showSearchSupplierAccountModal = false;
  }
  onSelectSalesAccount(event) {
    this.billForm.controls.salesAccountId.setValue(event.id);
    this.showSearchSalesAccountModal = false;
  }
  onSelectSalesReturnAccount(event) {
    this.billForm.controls.salesReturnAccountId.setValue(event.id);
    this.showSearchSalesReturnAccountModal = false;
  }
  onSelectPurchasesAccount(event) {
    this.billForm.controls.purchasesAccountId.setValue(event.id);
    this.showSearchPurchasesAccountModal = false;
  }
  onSelectPurchasesReturnAccount(event) {
    this.billForm.controls.purchasesReturnAccountId.setValue(event.id);
    this.showSearchPurchasesReturnAccountModal = false;
  }
  onSelectCostCenter(event) {
    this.billForm.controls.costCenterId.setValue(event.id);
    this.showSearchCostCenterModal = false;
  }
  onSelectCurrency(event) {
    this.billForm.controls.currencyId.setValue(event.id);
    this.showSearchCurrencyModal = false;
  }
  onSelectSalesPerson(event) {
    this.billForm.controls.salesPersonId.setValue(event.id);
    this.showSearchSalesPersonModal = false;
  }
  onSelectStore(event) {
    this.billForm.controls.storeId.setValue(event.id);
    this.showSearchStoreModal = false;
  }
  onSelectProject(event) {
    this.billForm.controls.projectId.setValue(event.id);
    this.showSearchProjectModal = false;
  }
  // getBeneficiaryTypes() {
  //   if (this.lang == 'en') {
  //     this.beneficiaryTypesEnum = convertEnumToArray(BeneficiaryTypeEnum);
  //   }
  //   else {
  //     this.beneficiaryTypesEnum = convertEnumToArray(BeneficiaryTypeArEnum);

  //   }
  // }
  // addItem() {
  //   this.billItem.push({
  //     id: 0,
  //     billId: this.selectedBillDetail?.billId ?? 0,
  //     debit: this.selectedBillDetail?.debit ?? 0,
  //     credit: this.selectedBillDetail?.credit ?? 0,
  //     currencyId: this.selectedBillDetail?.currencyId ?? 0,
  //     currencyConversionFactor: this.selectedBillDetail?.currencyConversionFactor ?? 0,
  //     debitLocal: this.selectedBillDetail?.debitLocal ?? 0,
  //     creditLocal: this.selectedBillDetail?.creditLocal ?? 0,
  //     beneficiaryTypeId: this.selectedBillDetail?.beneficiaryTypeId ?? 0,
  //     beneficiaryAccountId: this.selectedBillDetail?.beneficiaryAccountId ?? 0,
  //     description: this.selectedBillDetail?.description ?? '',
  //     costCenterId: this.selectedBillDetail?.costCenterId ?? 0,
  //     currencyNameAr: this.selectedBillDetail?.currencyNameAr ?? '',
  //     currencyNameEn: this.selectedBillDetail?.currencyNameEn ?? '',
  //     beneficiaryAccountNameAr: this.selectedBillDetail?.beneficiaryAccountNameAr ?? '',
  //     beneficiaryAccountNameEn: this.selectedBillDetail?.beneficiaryAccountNameEn ?? '',
  //     costCenterNameAr: this.selectedBillDetail?.costCenterNameAr ?? '',
  //     costCenterNameEn: this.selectedBillDetail?.costCenterNameEn ?? ''
  //   });
  //   this.bill!.billItem = this.billItem;


  //   this.totalDebitLocal += this.selectedBillDetail?.debitLocal ?? 0;
  //   this.totalCreditLocal += this.selectedBillDetail?.creditLocal ?? 0;
  //   let currencyConversionFactor;
  //   if (this.billkindId == 1) {
  //     //here
  //     this.billForm.controls["billTotalLocal"].setValue(this.totalDebitLocal)
  //     if (this.currencyId != this.mainCurrencyId) {

  //       this.filterCurrencyTransactionList = this.currencyTransactionList.find(x => x.currencyMasterId == this.mainCurrencyId && x.currencyDetailId == this.currencyId)

  //       currencyConversionFactor = this.filterCurrencyTransactionList.transactionFactor;
  //       this.billForm.controls["billTotal"].setValue(this.totalDebitLocal * currencyConversionFactor)
  //     }
  //     else {
  //       this.billForm.controls["billTotal"].setValue(this.totalDebitLocal)
  //     }
  //   }
  //   if (this.billkindId == 2) {
  //     this.billForm.controls["billTotalLocal"].setValue(this.totalCreditLocal)
  //     if (this.currencyId != this.mainCurrencyId) {

  //       this.filterCurrencyTransactionList = this.currencyTransactionList.find(x => x.currencyMasterId == this.mainCurrencyId && x.currencyDetailId == this.currencyId)

  //       currencyConversionFactor = this.filterCurrencyTransactionList.transactionFactor;
  //       this.billForm.controls["billTotal"].setValue(this.totalCreditLocal * currencyConversionFactor)
  //     }
  //     else {
  //       this.billForm.controls["billTotal"].setValue(this.totalCreditLocal)
  //     }
  //   }

  //   this.clearSelectedItemData();

  // }
  // deleteItem(index) {

  //   this.totalDebitLocal = this.totalDebitLocal - this.billItem[index]?.debitLocal ?? 0;
  //   this.totalCreditLocal = this.totalCreditLocal - this.billItem[index]?.creditLocal ?? 0;
  //   let currencyConversionFactor;
  //   if (this.billkindId == 1) {
  //     this.billForm.controls["billTotalLocal"].setValue(this.totalDebitLocal)
  //     if (this.currencyId != this.mainCurrencyId) {

  //       this.filterCurrencyTransactionList = this.currencyTransactionList.find(x => x.currencyMasterId == this.mainCurrencyId && x.currencyDetailId == this.currencyId)

  //       currencyConversionFactor = this.filterCurrencyTransactionList.transactionFactor;
  //       this.billForm.controls["billTotal"].setValue(this.totalDebitLocal * currencyConversionFactor)
  //     }
  //     else {
  //       this.billForm.controls["billTotal"].setValue(this.totalDebitLocal)
  //     }
  //   }
  //   if (this.billkindId == 2) {
  //     this.billForm.controls["billTotalLocal"].setValue(this.totalCreditLocal)
  //     if (this.currencyId != this.mainCurrencyId) {

  //       this.filterCurrencyTransactionList = this.currencyTransactionList.find(x => x.currencyMasterId == this.mainCurrencyId && x.currencyDetailId == this.currencyId)

  //       currencyConversionFactor = this.filterCurrencyTransactionList.transactionFactor;
  //       this.billForm.controls["billTotal"].setValue(this.totalCreditLocal * currencyConversionFactor)
  //     }
  //     else {
  //       this.billForm.controls["billTotal"].setValue(this.totalCreditLocal)
  //     }
  //   }

  //   if (this.billItem.length) {
  //     if (this.billItem.length == 1) {
  //       this.billItem = [];
  //     } else {
  //       this.billItem.splice(index, 1);
  //     }
  //   }

  //   this.bill.billItem = this.billItem;

  //   this.currencyFactor = 0;
  //   this.currencyId = null;

  // }
  clearSelectedItemData() {
    this.selectedBillItem = {
      id: 0,
      billId: 0,
      itemId: 0,
      itemDescription: '',
      quantity: 0,
      price: 0,
      tax: 0,
      discount: 0,
      subTotal: 0,
      total: 0,
      notes: '',
      storeId: 0
    }
  }

  setInputData() {

    this.bill = {
      id: this.billForm.controls["id"].value,
      companyId: this.billForm.controls["companyId"].value,
      branchId: this.billForm.controls["branchId"].value,
      billTypeId: this.billTypeId,
      code: this.billForm.controls["code"].value,
      date: this.dateService.getDateForInsert(this.billForm.controls["date"].value),
      supplierId: this.billForm.controls["supplierId"].value,
      supplierReference: this.billForm.controls["supplierReference"].value,
      customerId: this.billForm.controls["customerId"].value,
      payWay: this.billForm.controls["payWay"].value,
      shipMethod: this.billForm.controls["shipMethod"].value,
      shipKind: this.billForm.controls["shipKind"].value,
      referenceId: this.billForm.controls["referenceId"].value,
      referenceNo: this.billForm.controls["referenceNo"].value,
      salesPersonId: this.billForm.controls["salesPersonId"].value,
      storeId: this.billForm.controls["storeId"].value,
      deliveryDate: this.dateService.getDateForInsert(this.billForm.controls["deliveryDate"].value),
      currencyId: this.billForm.controls["currencyId"].value,
      currencyExchangeTransaction: this.billForm.controls["currencyExchangeTransaction"].value,
      projectId: this.billForm.controls["projectId"].value,
      costCenterId: this.billForm.controls["costCenterId"].value,
      notes: this.billForm.controls["notes"].value,
      attachment: this.billForm.controls["attachment"].value,
      cashAccountId: this.billForm.controls["cashAccountId"].value,
      supplierAccountId: this.billForm.controls["supplierAccountId"].value,
      salesAccountId: this.billForm.controls["salesAccountId"].value,
      salesReturnAccountId: this.billForm.controls["salesReturnAccountId"].value,
      purchasesAccountId: this.billForm.controls["purchasesAccountId"].value,
      purchasesReturnAccountId: this.billForm.controls["purchasesReturnAccountId"].value,
      total: this.billForm.controls["total"].value,
      tax: this.billForm.controls["tax"].value,
      discount: this.billForm.controls["discount"].value,
      discountAccountId: this.billForm.controls["discountAccountId"].value,
      net: this.billForm.controls["net"].value,
      paid: this.billForm.controls["paid"].value,
      paidAccountId: this.billForm.controls["paidAccountId"].value,
      remaining: this.billForm.controls["remaining"].value,
      remainingAccountId: this.billForm.controls["remainingAccountId"].value,

      billItem: this.bill.billItem ?? [],

    };


  }
  // confirmSave() {
  //   this.bill.billDate = this.dateService.getDateForInsert(this.billForm.controls["billDate"].value);
  //   return new Promise<void>((resolve, reject) => {

  //     let sub = this.billService.createBillAndRelations(this.bill).subscribe({
  //       next: (result: any) => {
  //         this.defineBillForm();
  //         this.clearSelectedItemData();
  //         this.billItem = [];
  //         // this.submited = false;
  //         this.spinner.hide();

  //         navigateUrl(this.listUrl + this.billTypeId, this.router);
  //       },
  //       error: (err: any) => {
  //         reject(err);
  //       },
  //       complete: () => {
  //         console.log('complete');
  //       },
  //     });
  //     this.subsList.push(sub);

  //   });
  // }
  // onSave() {
  //   if (this.bill.billItem.length == 0) {
  //     this.errorMessage = this.translate.instant("bill.bill-details-required");
  //     this.errorClass = 'errorMessage';
  //     this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
  //     return;
  //   }

  //   if (this.billForm.valid) {
  //     this.setInputData();
  //     this.spinner.show();
  //     this.confirmSave().then(a => {
  //       this.spinner.hide();
  //     }).catch(e => {
  //       this.spinner.hide();
  //     });




  //   }
  //   else {
  //     this.errorMessage = this.translate.instant("validation-messages.invalid-data");
  //     this.errorClass = 'errorMessage';
  //     this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
  //     return this.billForm.markAllAsTouched();

  //   }
  // }
  // confirmUpdate() {
  //   this.bill.billDate = this.dateService.getDateForInsert(this.billForm.controls["billDate"].value);

  //   return new Promise<void>((resolve, reject) => {

  //     let sub = this.billService.updateBillAndRelations(this.bill).subscribe({
  //       next: (result: any) => {


  //         this.defineBillForm();
  //         this.clearSelectedItemData();
  //         this.billItem = [];

  //         // this.submited = false;
  //         this.spinner.hide();

  //         navigateUrl(this.listUrl + this.billTypeId, this.router);
  //       },
  //       error: (err: any) => {
  //         reject(err);
  //       },
  //       complete: () => {
  //         console.log('complete');
  //       },
  //     });
  //     this.subsList.push(sub);

  //   });
  // }
  // onUpdate() {
  //   if (this.bill.billItem.length == 0) {
  //     this.errorMessage = this.translate.instant("bill.bill-details-required");
  //     this.errorClass = 'errorMessage';
  //     this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
  //     return;
  //   }

  //   if (this.billForm.valid) {
  //     this.setInputData();
  //     this.spinner.show();
  //     this.confirmUpdate().then(a => {
  //       this.spinner.hide();
  //     }).catch(e => {
  //       this.spinner.hide();
  //     });




  //   }
  //   else {
  //     this.errorMessage = this.translate.instant("validation-messages.invalid-data");
  //     this.errorClass = 'errorMessage';
  //     this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
  //     return this.billForm.markAllAsTouched();

  //   }
  // }
  //#region Tabulator
  currentBtnResult;
  listenToClickedButton() {
    let sub = this.sharedServices.getClickedbutton().subscribe({
      next: (currentBtn: ToolbarData) => {
        currentBtn;

        if (currentBtn != null) {
          if (currentBtn.action == ToolbarActions.List) {
            this.sharedServices.changeToolbarPath({
              listPath: this.listUrl + this.billTypeId,
            } as ToolbarPath);
            this.router.navigate([this.listUrl + this.billTypeId]);
          } else if (currentBtn.action == ToolbarActions.Save) {
            // this.onSave();
          } else if (currentBtn.action == ToolbarActions.New) {
            this.toolbarPathData.componentAdd = this.translate.instant("bill.add-bill");
            this.defineBillForm();
            this.clearSelectedItemData();
            this.billItem = [];

            this.sharedServices.changeToolbarPath(this.toolbarPathData);
          } else if (currentBtn.action == ToolbarActions.Update) {
            //this.onUpdate();
          }
          else if (currentBtn.action == ToolbarActions.Copy) {
            // this.getBillCode();
          }
        }
      },
    });
    this.subsList.push(sub);
  }
  changePath() {
    this.sharedServices.changeToolbarPath(this.toolbarPathData);
  }
  getDate(selectedDate: DateModel) {
    this.date = selectedDate;
  }
  getDeliveryDate(selectedDate: DateModel) {
    this.deliveryDate = selectedDate;
  }

}
