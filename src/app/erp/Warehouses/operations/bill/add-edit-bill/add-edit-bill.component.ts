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
import { BillType } from '../../../models/bill-type'
import { ICustomEnum } from '../../../../../shared/interfaces/ICustom-enum';
import { SearchDialogService } from '../../../../../shared/services/search-dialog.service'
import { ToolbarData } from '../../../../../shared/interfaces/toolbar-data';
import { SharedService } from '../../../../../shared/common-services/shared-service';
import { NotificationsAlertsService } from '../../../../../shared/common-services/notifications-alerts.service';
import { ToolbarActions } from '../../../../../shared/enum/toolbar-actions';
import { DateCalculation, DateModel } from '../../../../../shared/services/date-services/date-calc.service';
import { CurrencyServiceProxy } from '../../../../master-codes/services/currency.servies';
import { GeneralConfigurationServiceProxy } from '../../../../Accounting/services/general-configurations.services'
import { convertEnumToArray, AccountClassificationsEnum, PayWayEnum, PayWayArEnum, ShipMethodEnum, ShipKindEnum, ShipKindArEnum } from '../../../../../shared/constants/enumrators/enums';
import { BillTypeServiceProxy } from '../../../Services/bill-type.service';
import { AccountServiceProxy } from 'src/app/erp/Accounting/services/account.services';
import { BillServiceProxy } from '../../../services/bill.service';
import { navigateUrl } from 'src/app/shared/helper/helper-url';

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
  selectedBillItem: BillItem = new BillItem();
  subsList: Subscription[] = [];
  currencyExchangeTransaction: number;
  id: any = 0;
  currnetUrl;
  errorMessage = '';
  errorClass = '';
  total: number = 0;
  tax: number = 0;
  taxRatio: number = 0;
  taxValue: number = 0;
  discount: number = 0;
  net: number = 0;
  paid: number = 0;
  remaining: number = 0;


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
  routeItemApi = 'ItemCard/get-ddl?'
  routeUnitApi = 'Unit/get-ddl?'


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
  itemsList: any;
  unitsList: any;


  payWaysEnum: ICustomEnum[] = [];
  shipMethodsEnum: ICustomEnum[] = [];
  shipKindsEnum: ICustomEnum[] = [];

  queryParams: any;
  billTypeId: any;
  billType: BillType[] = [];

  currency: any;
  mainCurrencyId: number;

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
    private billService: BillServiceProxy,
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
      this.getGeneralConfigurationsOfMainCurrency(),
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
      this.getItems(),
      this.getUnits(),





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

        if (this.id) {
          this.getBillById(this.id).then(a => {

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
      taxRatio: '',
      taxValue: '',

      // discount: '',
      // discountAccountId: '',
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
      this.getBillCode();

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
  getBillById(id: any) {
    return new Promise<void>((resolve, reject) => {
      let sub = this.billService.getBill(id).subscribe({
        next: (res: any) => {
          resolve();
          this.billForm.setValue({
            id: res.response?.id,
            companyId: res.response?.companyId,
            branchId: res.response?.branchId,
            billTypeId: res.response?.billTypeId,
            code: res.response?.code,
            date: this.dateService.getDateForCalender(res.response?.date),
            supplierId: res.response?.supplierId,
            supplierReference: res.response?.supplierReference,
            customerId: res.response?.customerId,
            payWay: res.response?.payWay,
            shipMethod: res.response?.shipMethod,
            shipKind: res.response?.shipKind,
            referenceId: res.response?.referenceId,
            referenceNo: res.response?.referenceNo,
            salesPersonId: res.response?.salesPersonId,
            storeId: res.response?.storeId,
            deliveryDate: this.dateService.getDateForCalender(res.response?.deliveryDate),
            currencyId: res.response?.currencyId,
            currencyExchangeTransaction: res.response?.currencyExchangeTransaction,
            projectId: res.response?.projectId,
            costCenterId: res.response?.costCenterId,
            notes: res.response?.notes,
            attachment: res.response?.attachment,
            cashAccountId: res.response?.cashAccountId,
            supplierAccountId: res.response?.supplierAccountId,
            salesAccountId: res.response?.salesAccountId,
            salesReturnAccountId: res.response?.salesReturnAccountId,
            purchasesAccountId: res.response?.purchasesAccountId,
            purchasesReturnAccountId: res.response?.purchasesReturnAccountId,
            total: res.response?.total,
            taxRatio: res.response?.taxRatio,
            taxValue: res.response?.taxValue,

            // discount: res.response?.discount,
            // discountAccountId: res.response?.discountAccountId,
            net: res.response?.net,
            paid: res.response?.paid,
            paidAccountId: res.response?.paidAccountId,
            remaining: res.response?.remaining,
            remainingAccountId: res.response?.remainingAccountId



          });
          this.bill.billItem = res.data.billItem;
          // this.billTotal = res.response?.billTotal;
          // this.billTotalLocal = res.response?.billTotalLocal;
          console.log(
            'this.billForm.value set value',
            this.billForm.value
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


  getBillCode() {
    return new Promise<void>((resolve, reject) => {
      debugger
      let sub = this.billService.getLastCodeByTypeId(this.billTypeId).subscribe({
        next: (res: any) => {
          debugger
          resolve();
          this.billForm.patchValue({
            code: res.response.data
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
  getItems() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeItemApi).subscribe({
        next: (res) => {
          if (res.success) {
            this.itemsList = res.response;

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
  getUnits() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeUnitApi).subscribe({
        next: (res) => {
          if (res.success) {
            this.unitsList = res.response;

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

  addItem() {
    this.billItem.push({
      id: 0,
      billId: this.selectedBillItem?.billId ?? 0,
      itemId: this.selectedBillItem?.itemId ?? 0,
      unitId: this.selectedBillItem?.unitId ?? 0,
      quantity: this.selectedBillItem?.quantity ?? 0,
      price: this.selectedBillItem?.price ?? 0,
      totalBeforeTax: this.selectedBillItem?.totalBeforeTax ?? 0,
      taxRatio: this.selectedBillItem?.taxRatio ?? 0,
      taxValue: this.selectedBillItem?.taxValue ?? 0,
      discountRatio: this.selectedBillItem?.discountRatio ?? 0,
      discountValue: this.selectedBillItem?.discountValue ?? 0,
      total: this.selectedBillItem?.total ?? 0,
      notes: this.selectedBillItem?.notes ?? '',
      itemNameAr: this.selectedBillItem?.itemNameAr,
      itemNameEn: this.selectedBillItem?.itemNameEn,
      unitNameAr: this.selectedBillItem?.unitNameAr,
      unitNameEn: this.selectedBillItem?.unitNameEn
    });
    this.bill!.billItem = this.billItem;

    console.log("total:", this.selectedBillItem?.total)
    this.total += this.selectedBillItem?.total ?? 0;
    this.net += this.selectedBillItem?.total ?? 0;
    this.remaining += this.selectedBillItem?.total ?? 0;
    this.taxRatio = 0;
    this.taxValue = 0;
    this.paid = 0;


    debugger


    this.clearSelectedItemData();

  }
  deleteItem(index) {
    this.total = this.total - this.billItem[index]?.total ?? 0;
    if (this.billItem.length) {
      if (this.billItem.length == 1) {
        this.billItem = [];
      } else {
        this.billItem.splice(index, 1);
      }
    }

    this.bill.billItem = this.billItem;



  }
  clearSelectedItemData() {
    this.selectedBillItem = {
      id: 0,
      billId: 0,
      itemId: 0,
      unitId: 0,
      quantity: 0,
      price: 0,
      totalBeforeTax: 0,
      taxRatio: 0,
      taxValue: 0,
      discountRatio: 0,
      discountValue: 0,
      total: 0,
      notes: '',
      itemNameAr: '',
      itemNameEn: '',
      unitNameAr: '',
      unitNameEn: ''
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
      taxRatio: this.billForm.controls["taxRatio"].value,
      taxValue: this.billForm.controls["taxValue"].value,

      // discount: this.billForm.controls["discount"].value,
      // discountAccountId: this.billForm.controls["discountAccountId"].value,
      net: this.billForm.controls["net"].value,
      paid: this.billForm.controls["paid"].value,
      paidAccountId: this.billForm.controls["paidAccountId"].value,
      remaining: this.billForm.controls["remaining"].value,
      remainingAccountId: this.billForm.controls["remainingAccountId"].value,

      billItem: this.bill.billItem ?? [],

    };


  }
  confirmSave() {
    //this.bill.date = this.dateService.getDateForInsert(this.billForm.controls["billDate"].value);

    return new Promise<void>((resolve, reject) => {
  
      let sub = this.billService.createBill(this.bill).subscribe({
        next: (result: any) => {
          this.defineBillForm();
          this.clearSelectedItemData();
          this.billItem = [];
          // this.submited = false;
          this.spinner.hide();

          navigateUrl(this.listUrl + this.billTypeId, this.router);
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


    if (this.billForm.valid) {
      if (this.bill.billItem.length == 0) {
        this.errorMessage = this.translate.instant("bill.bill-details-required");
        this.errorClass = 'errorMessage';
        this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
        return;
      }
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
      return this.billForm.markAllAsTouched();

    }
  }
  confirmUpdate() {
    //  this.bill.billDate = this.dateService.getDateForInsert(this.billForm.controls["billDate"].value);

    return new Promise<void>((resolve, reject) => {

      let sub = this.billService.updateBill(this.bill).subscribe({
        next: (result: any) => {


          this.defineBillForm();
          this.clearSelectedItemData();
          this.billItem = [];

          // this.submited = false;
          this.spinner.hide();

          navigateUrl(this.listUrl + this.billTypeId, this.router);
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

    if (this.billForm.valid) {
      if (this.bill.billItem.length == 0) {
        this.errorMessage = this.translate.instant("bill.bill-details-required");
        this.errorClass = 'errorMessage';
        this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
        return;
      }
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
      return this.billForm.markAllAsTouched();

    }
  }
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
            this.onSave();
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
  getCurrencyFactor(currencyId: any) {
    debugger
    if (currencyId == this.mainCurrencyId) {
      this.currencyExchangeTransaction = 1;
    }
    else {
      this.currencyExchangeTransaction = this.currencyTransactionList.filter(x => x.currencyMasterId == currencyId && x.currencyDetailId == this.mainCurrencyId)[0].transactionFactor

    }
  }
  openItemSearchDialog(i) {

    let searchTxt = '';
    if (i == -1) {
      searchTxt = this.selectedBillItem?.itemNameAr ?? '';
    } else {
      searchTxt = ''
      // this.selectedRentContractUnits[i].unitNameAr!;
    }

    let data = this.itemsList.filter((x) => {
      return (
        (x.nameAr + ' ' + x.nameEn).toLowerCase().includes(searchTxt) ||
        (x.nameAr + ' ' + x.nameEn).toUpperCase().includes(searchTxt)
      );
    });

    if (data.length == 1) {
      if (i == -1) {
        this.selectedBillItem!.itemNameAr = data[0].nameAr;
        this.selectedBillItem!.itemId = data[0].id;
      } else {
        this.billItem[i].itemNameAr = data[0].nameAr;
        this.billItem[i].itemId = data[0].id;
      }
      this.onChangeItem();

    } else {
      let lables = ['الكود', 'الاسم', 'الاسم الانجليزى'];
      let names = ['code', 'nameAr', 'nameEn'];
      let title = 'بحث عن الصنف';
      let sub = this.searchDialog
        .showDialog(lables, names, this.itemsList, title, searchTxt)
        .subscribe((d) => {
          if (d) {
            if (i == -1) {
              this.selectedBillItem!.itemNameAr = d.nameAr;
              this.selectedBillItem!.itemId = d.id;
            } else {
              this.billItem[i].itemNameAr = d.nameAr;
              this.billItem[i].itemId = d.id;
            }
            this.onChangeItem();

          }
        });
      this.subsList.push(sub);
    }

  }
  openUnitSearchDialog(i) {

    let searchTxt = '';
    if (i == -1) {
      searchTxt = this.selectedBillItem?.unitNameAr ?? '';
    } else {
      searchTxt = ''
      // this.selectedRentContractUnits[i].unitNameAr!;
    }

    let data = this.unitsList.filter((x) => {
      return (
        (x.nameAr + ' ' + x.nameEn).toLowerCase().includes(searchTxt) ||
        (x.nameAr + ' ' + x.nameEn).toUpperCase().includes(searchTxt)
      );
    });

    if (data.length == 1) {
      if (i == -1) {
        this.selectedBillItem!.unitNameAr = data[0].nameAr;
        this.selectedBillItem!.unitId = data[0].id;
      } else {
        this.billItem[i].unitNameAr = data[0].nameAr;
        this.billItem[i].unitId = data[0].id;
      }
    } else {
      let lables = ['الكود', 'الاسم', 'الاسم الانجليزى'];
      let names = ['code', 'nameAr', 'nameEn'];
      let title = 'بحث عن الوحدة';
      let sub = this.searchDialog
        .showDialog(lables, names, this.unitsList, title, searchTxt)
        .subscribe((d) => {
          if (d) {
            if (i == -1) {
              this.selectedBillItem!.unitNameAr = d.nameAr;
              this.selectedBillItem!.unitId = d.id;
            } else {
              this.billItem[i].unitNameAr = d.nameAr;
              this.billItem[i].unitId = d.id;
            }
          }
        });
      this.subsList.push(sub);
    }

  }
  onChangeItem() {
    this.selectedBillItem.price = this.itemsList.find((x) => x.id == this.selectedBillItem.itemId)?.sellingPrice;
    if (this.selectedBillItem.quantity > 0 && this.selectedBillItem.price > 0) {
      this.onChangeQuantityOrPrice();
    }
  }
  onChangeQuantityOrPrice() {
    this.selectedBillItem.totalBeforeTax = Number(this.selectedBillItem.quantity) * Number(this.selectedBillItem.price);
    this.selectedBillItem.total = this.selectedBillItem.totalBeforeTax;
    this.selectedBillItem.taxRatio = 0;
    this.selectedBillItem.taxValue = 0;
    this.selectedBillItem.discountRatio = 0;
    this.selectedBillItem.discountValue = 0;

  }
  onChangeTaxOrDiscountRatio() {
    if (this.selectedBillItem.taxRatio > 0) {
      this.selectedBillItem.taxValue =
        Number(this.selectedBillItem.totalBeforeTax) * Number(this.selectedBillItem.taxRatio / 100);

    }
    if (this.selectedBillItem.discountRatio > 0) {
      this.selectedBillItem.discountValue =
        Number(this.selectedBillItem.totalBeforeTax) * Number(this.selectedBillItem.discountRatio / 100);
    }


    this.selectedBillItem.total =
      Number(this.selectedBillItem.totalBeforeTax) + Number(this.selectedBillItem.taxValue) + Number(this.selectedBillItem.discountValue);



  }
  onChangeQuantityOrPriceAdded(i: any) {
    this.billItem[i].totalBeforeTax = Number(this.billItem[i].quantity) * Number(this.billItem[i].price);
    this.billItem[i].total = this.billItem[i].totalBeforeTax;
    this.billItem[i].taxRatio = 0;
    this.billItem[i].taxValue = 0;
    this.billItem[i].discountRatio = 0;
    this.billItem[i].discountValue = 0;

  }
  onChangeTaxOrDiscountRatioAdded(i: any) {
    if (this.billItem[i].taxRatio > 0) {
      this.billItem[i].taxValue =
        Number(this.billItem[i].totalBeforeTax) * Number(this.billItem[i].taxRatio / 100);

    }
    if (this.billItem[i].discountRatio > 0) {
      this.billItem[i].discountValue =
        Number(this.billItem[i].totalBeforeTax) * Number(this.billItem[i].discountRatio / 100);
    }


    this.billItem[i].total =
      Number(this.billItem[i].totalBeforeTax) + Number(this.billItem[i].taxValue) + Number(this.billItem[i].discountValue);



  }
  updateItemData(item: BillItem) {
    if (this.billItem.length > 0) {
      this.deleteBillItemForUpdate(item);
      this.addItemDataForUpdate(item);
    }

  }

  addItemDataForUpdate(item: BillItem) {
    debugger
    this.billItem.push(
      {
        id: 0,
        billId: item.billId,
        itemId: item.itemId,
        unitId: item.unitId,
        quantity: item.quantity,
        price: item.price,
        totalBeforeTax: item.totalBeforeTax,
        taxRatio: item.taxRatio,
        taxValue: item.taxValue,
        discountRatio: item.discountRatio,
        discountValue: item.discountValue,
        total: item.total,
        notes: item.notes,
        itemNameAr: item.itemNameAr,
        itemNameEn: item.itemNameEn,
        unitNameAr: item.unitNameAr,
        unitNameEn: item.unitNameEn
      }
    )

    this.billItem.forEach(item => {
      this.total += item.total;
      this.net += item.total;
      this.remaining += item.total;
    }
    )
    this.taxRatio = 0;
    this.taxValue = 0;
    this.paid = 0;

  }
  deleteBillItemForUpdate(item: BillItem) {
    if (item != null) {
      const index: number = this.billItem.indexOf(item);
      if (index !== -1) {
        this.billItem.splice(index, 1);

        this.total = 0;
        this.net = 0;
        this.taxRatio = 0;
        this.taxValue = 0;
        this.paid = 0;
        this.remaining = 0;


      }

    }





  }
  getNet() {
    debugger
    this.taxValue = Number(this.total) * Number(this.taxRatio / 100);
    this.net = Number(this.total) + this.taxValue;
    this.paid=0;
    this.remaining=this.net;


  }
  getRamining() {
    this.remaining = Number(this.net) - Number(this.paid)
  }

}

