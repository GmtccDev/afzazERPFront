import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { REQUIRED_VALIDATORS } from '../../../../../shared/constants/input-validators';
import { ToolbarPath } from '../../../../../shared/interfaces/toolbar-path';
import { PublicService } from '../../../../../shared/services/public.service';
import { Bill, BillAdditionAndDiscount, BillItem, BillItemTax } from '../../../models/bill'
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
import { convertEnumToArray, AccountClassificationsEnum, PayWayEnum, PayWayArEnum, ShipMethodEnum, ShipKindEnum, ShipKindArEnum, ManuallyTaxType, GeneralConfigurationEnum } from '../../../../../shared/constants/enumrators/enums';
import { BillServiceProxy } from '../../../services/bill.service';
import { navigateUrl } from 'src/app/shared/helper/helper-url';
import { ItemCardUnitDto } from '../../../models/item-card';
import { ItemCardServiceProxy } from '../../../Services/item-card.service';

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
  salesPersonId: any;
  storeId: any;
  costCenterId: any;
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
  billItemTax: BillItemTax[] = [];

  selectedBillItem: BillItem = new BillItem();
  billAdditionAndDiscount: BillAdditionAndDiscount[] = [];
  selectedBillAdditionAndDiscount: BillAdditionAndDiscount = new BillAdditionAndDiscount();
  itemCardUnit: ItemCardUnitDto[] = [];
  subsList: Subscription[] = [];
  currencyValue: number;
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
  totalBeforeTax: number = 0;
  netAfterTax: number = 0;
  codingPolicy: number;
  lang = localStorage.getItem("language")
  routeCashAccountApi = 'Account/GetLeafAccounts?AccountClassificationId=' + AccountClassificationsEnum.Cash
  routeSalesAccountApi = 'Account/GetLeafAccounts?AccountClassificationId=' + AccountClassificationsEnum.Sales
  routeSupplierAccountApi = 'Account/GetLeafAccounts?AccountClassificationId=' + AccountClassificationsEnum.Supplier
  routePurchasesAccountApi = 'Account/GetLeafAccounts?AccountClassificationId=' + AccountClassificationsEnum.Purchases
  routeAccountApi = 'Account/GetLeafAccounts?'

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

  accountsList: any;
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
  filterItem: any;

  unitsList: any;


  payWaysEnum: ICustomEnum[] = [];
  shipMethodsEnum: ICustomEnum[] = [];
  shipKindsEnum: ICustomEnum[] = [];

  queryParams: any;
  billTypeId: any;
  billType: BillType[] = [];
  billTypeKind: any;
  billTypeCalculatingTax: boolean;
  billTypeCalculatingTaxManual: boolean;

  currency: any;
  mainCurrencyId: number;
  paidAccountId: number;
  remainingAccountId: number;
  showSearchSupplierModal = false;
  showSearchCustomerModal = false;
  showSearchCashAccountModal = false;
  showSearchSupplierAccountModal = false;
  showSearchSalesAccountModal = false;
  showSearchSalesReturnAccountModal = false;
  showSearchPurchasesAccountModal = false;
  showSearchPurchasesReturnAccountModal = false;
  showSearchPaidAccountModal = false;
  showSearchRemainingAccountModal = false;
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
    private generalConfigurationService: GeneralConfigurationServiceProxy,
    private searchDialog: SearchDialogService,
    private sharedServices: SharedService,
    private alertsService: NotificationsAlertsService,
    private itemCardService: ItemCardServiceProxy,




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
      this.getGeneralConfigurationsOfMainCurrency(),
      this.getSuppliers(),
      this.getCustomers(),
      this.getCurrencies(),
      this.getCurrenciesTransactions(),
      this.getCashAccounts(),
      this.getSupplierAccounts(),
      this.getSalesAccounts(),
      this.getPurchasesAccounts(),
      this.getAccounts(),
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
          this.getBillById(this.id, 1).then(a => {

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
      supplierId: null,
      supplierReference: '',
      customerId: null,
      payWay: REQUIRED_VALIDATORS,
      shipMethod: null,
      shipKind: null,
      referenceId: null,
      referenceNo: '',
      salesPersonId: null,
      storeId: REQUIRED_VALIDATORS,
      currencyId: REQUIRED_VALIDATORS,
      currencyValue: '',
      projectId: null,
      costCenterId: '',
      notes: '',
      attachment: '',
      cashAccountId: null,
      supplierAccountId: null,
      salesAccountId: null,
      salesReturnAccountId: null,
      purchasesAccountId: null,
      purchasesReturnAccountId: null,
      totalBeforeTax: '',
      taxRatio: null,
      taxValue: null,
      total: '',
      net: '',
      netAfterTax: null,
      paid: '',
      paidAccountId: null,
      remaining: '',
      remainingAccountId: null



    });
    this.date = this.dateService.getCurrentDate();
    this.deliveryDate = this.dateService.getCurrentDate();

  }
  clearBillFormForReference() {
    this.billForm.patchValue({
      supplierId: null,
      supplierReference: '',
      customerId: null,
      payWay: '',
      shipMethod: null,
      shipKind: null,
      salesPersonId: null,
      storeId: null,
      currencyId: '',
      currencyValue: '',
      projectId: null,
      costCenterId: null,
      notes: '',
      attachment: '',
      cashAccountId: null,
      supplierAccountId: null,
      salesAccountId: null,
      salesReturnAccountId: null,
      purchasesAccountId: null,
      purchasesReturnAccountId: null,
      totalBeforeTax: '',
      taxRatio: '',
      taxValue: '',
      total: '',
      net: '',
      netAfterTax: '',
      paid: '',
      paidAccountId: null,
      remaining: '',
      remainingAccountId: null



    });
  }





  //#region Helper Functions

  get f(): { [key: string]: AbstractControl } {
    return this.billForm.controls;
  }


  //#endregion
  getBillTypeById(id) {

    this.billType = this.billTypesList.filter(x => x.id == id);
    this.billTypeKind = this.billType[0].kind;
    this.billTypeCalculatingTax = this.billType[0].calculatingTax;
    this.billTypeCalculatingTaxManual = this.billType[0].calculatingTaxManual;

    if (this.id == 0) {
      debugger
      if (this.billType[0].codingPolicy != 1) {
        this.getBillCode();
      }
      this.currencyId = this.billType[0].defaultCurrencyId
      if (this.currencyId > 0) {
        this.getCurrencyFactor(this.currencyId)
      }
      this.salesPersonId = this.billType[0].salesPersonId
      this.storeId = this.billType[0].storeId
      this.costCenterId = this.billType[0].costCenterId



    }

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
  getBillById(id: any, type: any) {
    debugger
    if (id > 0) {
      this.clearBillFormForReference();
      this.clearSelectedItemData();
      this.billItem = [];
      this.clearSelectedBilladditionDiscountData();
      this.billAdditionAndDiscount = [];
    }
    return new Promise<void>((resolve, reject) => {
      let sub = this.billService.getBill(id).subscribe({
        next: (res: any) => {
          resolve();
          if (type == 1) {
            this.getBillsByReferenceId(res.response?.referenceId)
          }
          else {
            this.getBillsByReferenceId(this.billForm.value?.referenceId)

          }
          this.billForm.setValue({
            id: type == 1 ? res.response?.id : this.id,
            companyId: type == 1 ? res.response?.companyId : this.companyId,
            branchId: type == 1 ? res.response?.branchId : this.branchId,
            billTypeId: type == 1 ? res.response?.billTypeId : this.billTypeId,
            code: type == 1 ? res.response?.code : this.billForm.value.code,
            date: this.dateService.getDateForCalender(res.response?.date),
            supplierId: res.response?.supplierId,
            supplierReference: res.response?.supplierReference,
            customerId: res.response?.customerId,
            payWay: res.response?.payWay,
            shipMethod: res.response?.shipMethod,
            shipKind: res.response?.shipKind,
            referenceId: type == 1 ? res.response?.referenceId : this.billForm.value.referenceId,
            referenceNo: type == 1 ? res.response?.referenceNo : this.billForm.value.referenceNo,
            salesPersonId: res.response?.salesPersonId,
            storeId: res.response?.storeId,
            deliveryDate: this.dateService.getDateForCalender(res.response?.deliveryDate),
            currencyId: res.response?.currencyId,
            currencyValue: res.response?.currencyValue,
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
            totalBeforeTax: res.response?.totalBeforeTax,
            total: res.response?.total,
            taxRatio: res.response?.taxRatio,
            taxValue: res.response?.taxValue,
            net: res.response?.net,
            netAfterTax: res.response?.netAfterTax,
            paid: res.response?.paid,
            paidAccountId: res.response?.paidAccountId,
            remaining: res.response?.remaining,
            remainingAccountId: res.response?.remainingAccountId

          });

          var itemName;
          var unitName;
          var storeName;
          var accountName;
          var correspondingAccountName;
          var currencyName;
          var costCenterName;
          if (res.response?.billItems != null) {
            res.response?.billItems.forEach(element => {
              if (element.itemId > 0) {
                itemName = this.itemsList?.find(c => c.id == element.itemId)

              }
              if (element.unitId > 0) {
                unitName = this.unitsList?.find(c => c.id == element.unitId)

              }
              if (element.storeId > 0) {
                storeName = this.storesList?.find(c => c.id == element.storeId)

              }
              if (element.costCenterId > 0) {
                costCenterName = this.costCentersList?.find(c => c.id == element.costCenterId)

              }
              this.billItem.push(
                {
                  id: 0,
                  billId: element.billId,
                  itemId: element.itemId,
                  itemDescription: element.itemDescription,
                  unitId: element.unitId,
                  quantity: element.quantity,
                  price: element.price,
                  totalBeforeTax: element.totalBeforeTax,
                  additionRatio: element.additionRatio,
                  additionValue: element.additionValue,
                  discountRatio: element.discountRatio,
                  discountValue: element.discountValue,
                  totalTax: element.totalTax,
                  total: element.total,
                  storeId: element.storeId,
                  costCenterId: element.costCenterId,
                  notes: element.notes,
                  itemName: this.lang = "ar" ? itemName?.nameAr ?? '' : itemName?.nameEn ?? '',
                  unitName: this.lang = "ar" ? unitName?.nameAr ?? '' : unitName?.nameEn ?? '',
                  storeName: this.lang = "ar" ? storeName?.nameAr ?? '' : storeName?.nameEn ?? '',
                  costCenterName: this.lang = "ar" ? costCenterName?.nameAr ?? '' : costCenterName?.nameEn ?? '',

                }
              )
            });

          }
          if (res.response?.billItemTaxes != null) {
          this.billItemTax=res.response?.billItemTaxes
          }
          if (res.response?.billAdditionAndDiscounts != null) {
            res.response?.billAdditionAndDiscounts.forEach(element => {
              if (element.accountId > 0) {
                accountName = this.accountsList?.find(c => c.id == element.accountId)

              }
              if (element.correspondingAccountId > 0) {
                correspondingAccountName = this.accountsList?.find(c => c.id == element.correspondingAccountId)

              }
              if (element.currencyId > 0) {
                currencyName = this.currenciesList?.find(c => c.id == element.currencyId)

              }
              this.billAdditionAndDiscount.push(
                {
                  id: 0,
                  billId: element.billId,
                  additionRatio: element.additionRatio,
                  additionValue: element.additionValue,
                  discountRatio: element.discountRatio,
                  discountValue: element.discountValue,
                  accountId: element.accountId,
                  notes: element.notes,
                  correspondingAccountId: element.correspondingAccountId,
                  currencyId: element.currencyId,
                  currencyValue: element.currencyValue,
                  accountName: this.lang = "ar" ? accountName?.nameAr ?? '' : accountName?.nameEn ?? '',
                  correspondingAccountName: this.lang = "ar" ? correspondingAccountName?.nameAr ?? '' : correspondingAccountName?.nameEn ?? '',
                  currencyName: this.lang = "ar" ? currencyName?.nameAr ?? '' : currencyName?.nameEn ?? ''
                })



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


  getBillCode() {
    return new Promise<void>((resolve, reject) => {

      let sub = this.billService.getLastCodeByTypeId(this.billTypeId).subscribe({
        next: (res: any) => {

          resolve();
          this.billForm.patchValue({
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
  getCashAccounts() {
    return new Promise<void>((resolve, reject) => {

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
            debugger
            this.itemsList = res.response;

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
  onSelectPaidAccount(event) {
    this.billForm.controls.paidAccountId.setValue(event.id);
  }
  onSelectRemainingAccount(event) {
    this.billForm.controls.remainingAccountId.setValue(event.id);
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
    var taxValue = 0;
    if (this.billType[0].calculatingTax == true && this.billType[0].calculatingTaxManual != true) {
      if (this.billType[0].calculatingTaxOnPriceAfterDeductionAndAddition == true) {
      //  taxValue = (this.selectedBillItem?.totalBeforeTax ?? 0) * (this.selectedBillItem?.taxRatio ?? 0 / 100)
      }
      else {
      //  taxValue = (this.selectedBillItem?.totalBeforeTax ?? 0 + this.selectedBillItem?.additionValue ?? 0 - this.selectedBillItem?.discountValue ?? 0) * (this.selectedBillItem?.taxRatio ?? 0 / 100)

      }
    }
    this.billItem.push({
      id: 0,
      billId: this.selectedBillItem?.billId ?? 0,
      itemId: this.selectedBillItem?.itemId ?? null,
      itemDescription: this.selectedBillItem?.itemDescription ?? '',
      unitId: this.selectedBillItem?.unitId ?? null,
      quantity: this.selectedBillItem?.quantity ?? 0,
      price: this.selectedBillItem?.price ?? 0,
      totalBeforeTax: this.selectedBillItem?.totalBeforeTax ?? 0,
      additionRatio: this.selectedBillItem?.additionRatio ?? 0,
      additionValue: this.selectedBillItem?.additionValue ?? 0,
      discountRatio: this.selectedBillItem?.discountRatio ?? 0,
      discountValue: this.selectedBillItem?.discountValue ?? 0,
      totalTax: this.billType[0].calculatingTax == true && this.billType[0].calculatingTaxManual != true
        ? this.selectedBillItem?.totalTax ?? 0 : null,
      total: this.selectedBillItem?.total ?? 0,
      storeId: this.selectedBillItem?.storeId ?? null,
      costCenterId: this.selectedBillItem?.costCenterId ?? null,
      notes: this.selectedBillItem?.notes ?? '',
      itemName: this.selectedBillItem?.itemName,
      unitName: this.selectedBillItem?.unitName,
      storeName: this.selectedBillItem?.storeName,
      costCenterName: this.selectedBillItem?.costCenterName,

    });
    this.bill!.billItems = this.billItem;

    // this.totalBeforeTax += this.selectedBillItem?.totalBeforeTax ?? 0;//comment
    // this.total += this.selectedBillItem?.total ?? 0;
    // this.net += this.selectedBillItem?.total ?? 0;
    // this.netAfterTax += this.selectedBillItem?.total ?? 0;
    // this.remaining += this.selectedBillItem?.total - this.paid;
    // this.taxRatio = 0;
    // this.taxValue = 0;
    this.clearSelectedItemData();
    this.calculateValues();

  }
  deleteItem(index) {
    // this.totalBeforeTax = this.totalBeforeTax - this.billItem[index]?.totalBeforeTax ?? 0;//comment
    // this.total = this.total - this.billItem[index]?.total ?? 0;
    // this.net = this.total ?? 0;
    // this.netAfterTax = this.net ?? 0;
    // this.remaining = this.netAfterTax - this.paid;
    if (this.billItem.length) {
      if (this.billItem.length == 1) {
        this.billItem = [];
      } else {
        this.billItem.splice(index, 1);
      }
    }

    this.bill.billItems = this.billItem;
    this.calculateValues();



  }
  deleteBillAdditionDiscount(index) {
    // this.net = this.net - this.billAdditionAndDiscount[index]?.additionValue + this.billAdditionAndDiscount[index].discountValue ?? 0;
    // this.netAfterTax = this.net;
    // this.remaining = this.netAfterTax - this.paid;

    if (this.billAdditionAndDiscount.length) {
      if (this.billAdditionAndDiscount.length == 1) {
        this.billAdditionAndDiscount = [];
      } else {
        this.billAdditionAndDiscount.splice(index, 1);
      }
    }

    this.bill.billAdditionAndDiscounts = this.billAdditionAndDiscount;
    this.calculateValues();

  }
  clearSelectedItemData() {
    this.selectedBillItem = {
      id: 0,
      billId: 0,
      itemId: null,
      itemDescription: '',
      unitId: null,
      quantity: 0,
      price: 0,
      totalBeforeTax: 0,
      additionRatio: 0,
      additionValue: 0,
      discountRatio: 0,
      discountValue: 0,
      totalTax: 0,
      total: 0,
      storeId: null,
      costCenterId: null,
      notes: '',
      itemName: '',
      unitName: '',
      storeName: '',
      costCenterName: ''

    }
  }
  clearSelectedBilladditionDiscountData() {
    this.selectedBillAdditionAndDiscount = {
      id: 0,
      billId: 0,
      additionRatio: 0,
      additionValue: 0,
      discountRatio: 0,
      discountValue: 0,
      accountId: null,
      notes: '',
      correspondingAccountId: null,
      currencyId: null,
      currencyValue: 0,
      accountName: '',
      correspondingAccountName: '',
      currencyName: '',

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
      currencyValue: this.billForm.controls["currencyValue"].value,
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
      totalBeforeTax: this.billForm.controls["totalBeforeTax"].value,
      total: this.billForm.controls["total"].value,
      taxRatio: this.billForm.controls["taxRatio"].value,
      taxValue: this.billForm.controls["taxValue"].value,
      net: this.billForm.controls["net"].value,
      netAfterTax: this.billForm.controls["netAfterTax"].value,
      paid: this.billForm.controls["paid"].value,
      paidAccountId: this.billForm.controls["paidAccountId"].value,
      remaining: this.billForm.controls["remaining"].value,
      remainingAccountId: this.billForm.controls["remainingAccountId"].value,
      billItems: this.bill.billItems ?? [],
      billItemTaxes: this.bill.billItemTaxes ?? [],
      billAdditionAndDiscounts: this.bill.billAdditionAndDiscounts ?? [],


    };
    debugger
    this.bill.billItems = this.billItem;
    this.bill.billItemTaxes = this.billItemTax;
    this.bill.billAdditionAndDiscounts = this.billAdditionAndDiscount;



  }
  confirmSave() {
    return new Promise<void>((resolve, reject) => {
      debugger
      let sub = this.billService.createBill(this.bill).subscribe({
        next: (result: any) => {
          this.defineBillForm();
          this.clearSelectedItemData();
          this.billItem = [];
          this.clearSelectedBilladditionDiscountData();
          this.billAdditionAndDiscount = [];
          this.billItemTax = [];
          this.spinner.hide();

          navigateUrl(this.listUrl + this.billTypeId, this.router);
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
    debugger
    if (this.billForm.valid) {
      this.setInputData();

      if (this.bill.billItems.length == 0) {
        this.errorMessage = this.translate.instant("bill.bill-items-required");
        this.errorClass = 'errorMessage';
        this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
        return;
      }
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
    return new Promise<void>((resolve, reject) => {
      let sub = this.billService.updateBill(this.bill).subscribe({
        next: (result: any) => {
          this.defineBillForm();
          this.clearSelectedItemData();
          this.billItem = [];
          this.billItemTax = [];
          this.clearSelectedBilladditionDiscountData();
          this.billAdditionAndDiscount = [];
          this.spinner.hide();

          navigateUrl(this.listUrl + this.billTypeId, this.router);
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
    if (this.billForm.valid) {
      debugger
      this.setInputData();
      if (this.bill.billItems.length == 0) {
        this.errorMessage = this.translate.instant("bill.bill-items-required");
        this.errorClass = 'errorMessage';
        this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
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
      // this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
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
            this.onUpdate();
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
    if (currencyId == this.mainCurrencyId) {
      this.currencyValue = 1;
    }
    else {
      this.currencyValue = this.currencyTransactionList.filter(x => x.currencyMasterId == currencyId && x.currencyDetailId == this.mainCurrencyId)[0].transactionFactor

    }
  }
  getCurrencyFactorForAdditionAndDiscount(currencyId: any) {

    if (currencyId == this.mainCurrencyId) {
      this.selectedBillAdditionAndDiscount.currencyValue = 1;
    }
    else {
      this.selectedBillAdditionAndDiscount.currencyValue = this.currencyTransactionList.filter(x => x.currencyMasterId == currencyId && x.currencyDetailId == this.mainCurrencyId)[0].transactionFactor

    }
  }
  getCurrencyFactorForAdditionAndDiscountAdded(currencyId: any, i: number) {
    if (currencyId == this.mainCurrencyId) {
      this.billAdditionAndDiscount[i].currencyValue = 1;
    }
    else {
      this.billAdditionAndDiscount[i].currencyValue = this.currencyTransactionList.filter(x => x.currencyMasterId == currencyId && x.currencyDetailId == this.mainCurrencyId)[0].transactionFactor

    }
  }
  openItemSearchDialog(i) {
    let searchTxt = '';
    if (i == -1) {
      searchTxt = this.selectedBillItem?.itemName ?? '';
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
        this.selectedBillItem!.itemName = this.lang = "ar" ? data[0].nameAr : data[0].nameEn;
        this.selectedBillItem!.itemId = data[0].id;
      } else {
        this.billItem[i].itemName = this.lang = "ar" ? data[0].nameAr : data[0].nameEn;
        this.billItem[i].itemId = data[0].id;
      }
      this.onChangeItem(data[0].id,i);

    } else {
      let lables = ['الكود', 'الاسم', 'الاسم الانجليزى'];
      let names = ['code', 'nameAr', 'nameEn'];
      let title = 'بحث عن الصنف';
      let sub = this.searchDialog
        .showDialog(lables, names, this.itemsList, title, searchTxt)
        .subscribe((d) => {
          if (d) {
            if (i == -1) {
              this.selectedBillItem!.itemName = this.lang = "ar" ? d.nameAr : d.nameEn;
              this.selectedBillItem!.itemId = d.id;
            } else {
              this.billItem[i].itemName = this.lang = "ar" ? d.nameAr : d.nameEn;
              this.billItem[i].itemId = d.id;
            }
            this.onChangeItem(d.id,i);

          }
        });
      this.subsList.push(sub);
    }

  }
  openUnitSearchDialog(i) {
    let searchTxt = '';
    if (i == -1) {
      searchTxt = this.selectedBillItem?.unitName ?? '';
    } else {
      searchTxt = ''
      // this.selectedRentContractUnits[i].unitNameAr!;
    }
    debugger
    let data = this.itemCardUnit.filter((x) => {
      return (
        (x.unitNameAr + ' ' + x.unitNameEn).toLowerCase().includes(searchTxt) ||
        (x.unitNameAr + ' ' + x.unitNameEn).toUpperCase().includes(searchTxt)
      );
    });

    if (data.length == 1) {
      if (i == -1) {
        this.selectedBillItem!.unitName = this.lang = "ar" ? data[0].unitNameAr : data[0].unitNameEn;
        this.selectedBillItem!.unitId = data[0].unitId;
      } else {
        this.billItem[i].unitName = this.lang = "ar" ? data[0].unitNameAr : data[0].unitNameEn;
        this.billItem[i].unitId = data[0].unitId;
      }
    } else {
      let lables = ['الكود', 'الاسم', 'الاسم الانجليزى'];
      let names = ['unitCode', 'unitNameAr', 'unitNameEn'];
      let title = 'بحث عن الوحدة';
      let sub = this.searchDialog
        .showDialog(lables, names, this.itemCardUnit, title, searchTxt)
        .subscribe((d) => {
          if (d) {
            if (i == -1) {
              this.selectedBillItem!.unitName = this.lang = "ar" ? d.unitNameAr : d.unitNameEn;
              this.selectedBillItem!.unitId = d.unitId;
            } else {
              this.billItem[i].unitName = this.lang = "ar" ? d.unitNameAr : d.unitNameEn;
              this.billItem[i].unitId = d.unitId;
            }
          }
        });
      this.subsList.push(sub);
    }

  }
  openStoreSearchDialog(i) {

    let searchTxt = '';
    if (i == -1) {
      searchTxt = this.selectedBillItem?.storeName ?? '';
    } else {
      searchTxt = ''
    }

    let data = this.storesList.filter((x) => {
      return (
        (x.nameAr + ' ' + x.nameEn).toLowerCase().includes(searchTxt) ||
        (x.nameAr + ' ' + x.nameEn).toUpperCase().includes(searchTxt)
      );
    });

    if (data.length == 1) {
      if (i == -1) {
        this.selectedBillItem!.storeName = this.lang = "ar" ? data[0].nameAr : data[0].nameEn;
        this.selectedBillItem!.storeId = data[0].id;
      } else {
        this.billItem[i].storeName = this.lang = "ar" ? data[0].nameAr : data[0].nameEn;
        this.billItem[i].storeId = data[0].id;
      }
    } else {
      let lables = ['الكود', 'الاسم', 'الاسم الانجليزى'];
      let names = ['code', 'nameAr', 'nameEn'];
      let title = 'بحث عن المستودع';
      let sub = this.searchDialog
        .showDialog(lables, names, this.storesList, title, searchTxt)
        .subscribe((d) => {
          if (d) {
            if (i == -1) {
              this.selectedBillItem!.storeName = this.lang = "ar" ? d.nameAr : d.nameEn;
              this.selectedBillItem!.storeId = d.id;
            } else {
              this.billItem[i].storeName = this.lang = "ar" ? d.nameAr : d.nameEn;
              this.billItem[i].storeId = d.id;
            }
          }
        });
      this.subsList.push(sub);
    }

  }
  openCostCenterSearchDialog(i) {
    let searchTxt = '';
    if (i == -1) {
      searchTxt = this.selectedBillItem?.costCenterName ?? '';
    } else {
      searchTxt = ''
    }

    let data = this.costCentersList.filter((x) => {
      return (
        (x.nameAr + ' ' + x.nameEn).toLowerCase().includes(searchTxt) ||
        (x.nameAr + ' ' + x.nameEn).toUpperCase().includes(searchTxt)
      );
    });

    if (data.length == 1) {
      if (i == -1) {
        this.selectedBillItem!.costCenterName = this.lang = "ar" ? data[0].nameAr : data[0].nameEn;
        this.selectedBillItem!.costCenterId = data[0].id;
      } else {
        this.billItem[i].costCenterName = this.lang = "ar" ? data[0].nameAr : data[0].nameEn;
        this.billItem[i].costCenterId = data[0].id;
      }
    } else {
      let lables = ['الكود', 'الاسم', 'الاسم الانجليزى'];
      let names = ['code', 'nameAr', 'nameEn'];
      let title = 'بحث عن مركز التكلفة';
      let sub = this.searchDialog
        .showDialog(lables, names, this.costCentersList, title, searchTxt)
        .subscribe((d) => {
          if (d) {
            if (i == -1) {
              this.selectedBillItem!.costCenterName = this.lang = "ar" ? d.nameAr : d.nameEn;
              this.selectedBillItem!.costCenterId = d.id;
            } else {
              this.billItem[i].costCenterName = this.lang = "ar" ? d.nameAr : d.nameEn;
              this.billItem[i].costCenterId = d.id;
            }
          }
        });
      this.subsList.push(sub);
    }

  }
  openAccountSearchDialog(i) {

    let searchTxt = '';
    if (i == -1) {
      searchTxt = this.selectedBillAdditionAndDiscount?.accountName ?? '';
    } else {
      searchTxt = ''
      // this.selectedRentContractUnits[i].unitNameAr!;
    }

    let data = this.accountsList.filter((x) => {
      return (
        (x.nameAr + ' ' + x.nameEn).toLowerCase().includes(searchTxt) ||
        (x.nameAr + ' ' + x.nameEn).toUpperCase().includes(searchTxt)
      );
    });

    if (data.length == 1) {
      if (i == -1) {
        this.selectedBillAdditionAndDiscount!.accountName = this.lang = "ar" ? data[0].nameAr : data[0].nameEn;
        this.selectedBillAdditionAndDiscount!.accountId = data[0].id;
      } else {
        this.billAdditionAndDiscount[i].accountName = this.lang = "ar" ? data[0].nameAr : data[0].nameEn;
        this.billAdditionAndDiscount[i].accountId = data[0].id;
      }

    } else {
      let lables = ['الكود', 'الاسم', 'الاسم الانجليزى'];
      let names = ['code', 'nameAr', 'nameEn'];
      let title = 'بحث عن الحساب';
      let sub = this.searchDialog
        .showDialog(lables, names, this.accountsList, title, searchTxt)
        .subscribe((d) => {
          if (d) {
            if (i == -1) {
              this.selectedBillAdditionAndDiscount!.accountName = this.lang = "ar" ? d.nameAr : d.nameEn;
              this.selectedBillAdditionAndDiscount!.accountId = d.id;
            } else {
              this.billAdditionAndDiscount[i].accountName = this.lang = "ar" ? d.nameAr : d.nameEn;
              this.billAdditionAndDiscount[i].accountId = d.id;
            }

          }
        });
      this.subsList.push(sub);
    }

  }
  openCorrespondingAccountSearchDialog(i) {

    let searchTxt = '';
    if (i == -1) {
      searchTxt = this.selectedBillAdditionAndDiscount?.correspondingAccountName ?? '';
    } else {
      searchTxt = ''
      // this.selectedRentContractUnits[i].unitNameAr!;
    }

    let data = this.accountsList.filter((x) => {
      return (
        (x.nameAr + ' ' + x.nameEn).toLowerCase().includes(searchTxt) ||
        (x.nameAr + ' ' + x.nameEn).toUpperCase().includes(searchTxt)
      );
    });

    if (data.length == 1) {
      if (i == -1) {
        this.selectedBillAdditionAndDiscount!.correspondingAccountName = this.lang = "ar" ? data[0].nameAr : data[0].nameEn;
        this.selectedBillAdditionAndDiscount!.correspondingAccountId = data[0].id;
      } else {
        this.billAdditionAndDiscount[i].correspondingAccountName = this.lang = "ar" ? data[0].nameAr : data[0].nameEn;
        this.billAdditionAndDiscount[i].correspondingAccountId = data[0].id;
      }

    } else {
      let lables = ['الكود', 'الاسم', 'الاسم الانجليزى'];
      let names = ['code', 'nameAr', 'nameEn'];
      let title = 'بحث عن الحساب';
      let sub = this.searchDialog
        .showDialog(lables, names, this.accountsList, title, searchTxt)
        .subscribe((d) => {
          if (d) {
            if (i == -1) {
              this.selectedBillAdditionAndDiscount!.correspondingAccountName = this.lang = "ar" ? d.nameAr : d.nameEn;
              this.selectedBillAdditionAndDiscount!.correspondingAccountId = d.id;
            } else {
              this.billAdditionAndDiscount[i].correspondingAccountName = this.lang = "ar" ? d.nameAr : d.nameEn;
              this.billAdditionAndDiscount[i].correspondingAccountId = d.id;
            }

          }
        });
      this.subsList.push(sub);
    }

  }
  openCurrencySearchDialog(i) {
    let searchTxt = '';
    if (i == -1) {
      searchTxt = this.selectedBillAdditionAndDiscount?.currencyName ?? '';
    } else {
      searchTxt = ''
      // this.selectedRentContractUnits[i].unitNameAr!;
    }

    let data = this.currenciesList.filter((x) => {
      return (
        (x.nameAr + ' ' + x.nameEn).toLowerCase().includes(searchTxt) ||
        (x.nameAr + ' ' + x.nameEn).toUpperCase().includes(searchTxt)
      );
    });

    if (data.length == 1) {
      if (i == -1) {
        this.selectedBillAdditionAndDiscount!.currencyName = this.lang = "ar" ? data[0].nameAr : data[0].nameEn;
        this.selectedBillAdditionAndDiscount!.currencyId = data[0].id;
        this.getCurrencyFactorForAdditionAndDiscount(data[0].id);
      } else {
        this.billAdditionAndDiscount[i].currencyName = this.lang = "ar" ? data[0].nameAr : data[0].nameEn;
        this.billAdditionAndDiscount[i].currencyId = data[0].id;
        this.getCurrencyFactorForAdditionAndDiscountAdded(data[0].id, i);

      }

    } else {
      let lables = ['الكود', 'الاسم', 'الاسم الانجليزى'];
      let names = ['code', 'nameAr', 'nameEn'];
      let title = 'بحث عن العملة';
      let sub = this.searchDialog
        .showDialog(lables, names, this.currenciesList, title, searchTxt)
        .subscribe((d) => {
          if (d) {
            if (i == -1) {
              this.selectedBillAdditionAndDiscount!.currencyName = this.lang = "ar" ? d.nameAr : d.nameEn;
              this.selectedBillAdditionAndDiscount!.currencyId = d.id;
              this.getCurrencyFactorForAdditionAndDiscount(data[0].id);

            } else {
              this.billAdditionAndDiscount[i].currencyName = this.lang = "ar" ? d.nameAr : d.nameEn;
              this.billAdditionAndDiscount[i].currencyId = d.id;
              this.getCurrencyFactorForAdditionAndDiscountAdded(data[0].id, i);

            }

          }
        });
      this.subsList.push(sub);
    }

  }

  onChangeItem(itemId: any,i:any) {
    this.itemCardUnit=[];
    if(i==-1)
    {
      this.selectedBillItem.unitName='';

    }
    else
    {
      this.billItem[i].unitName='';

    }
    return new Promise<void>((resolve, reject) => {
      let sub = this.itemCardService.getItemCard(itemId).subscribe({
        next: (res: any) => {
          resolve();
          var unit;
         
          if (res.response?.mainUnitId != null) {
            
            unit = this.unitsList?.find(c => c.id == res.response?.mainUnitId)
            this.itemCardUnit.push(
              {
                id: 0,
                itemCardId: undefined,
                unitId: res.response?.mainUnitId,
                transactionFactor: res.response?.transactionFactor,
                sellingPrice: res.response?.sellingPrice,
                minSellingPrice: res.response?.minSellingPrice,
                consumerPrice: res.response?.consumerPrice,
                openingCostPrice: res.response?.openingCostPrice,
                unitNameAr: unit?.nameAr ?? '',
                unitNameEn: unit?.nameEn ?? '',
                unitCode:unit?.code ?? ''

              }
            )
          }

          if (res.response?.itemCardUnits != null) {
            res.response?.itemCardUnits.forEach(element => {
              unit = this.unitsList?.find(c => c.id == element.unitId)
              this.itemCardUnit.push(
                {
                  id: 0,
                  itemCardId: undefined,
                  unitId: element.unitId,
                  transactionFactor: element.transactionFactor,
                  sellingPrice: element.sellingPrice,
                  minSellingPrice: element.minSellingPrice,
                  consumerPrice: element.consumerPrice,
                  openingCostPrice: element.openingCostPrice,
                  unitNameAr: unit?.nameAr ?? '',
                  unitNameEn: unit?.nameEn ?? '',
                  unitCode:unit?.code ?? ''

  
                }
              )
            });


          }

          
          if (this.selectedBillItem.quantity > 0 && this.selectedBillItem.price > 0) {
            this.onChangeQuantityOrPrice();
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
  onChangeQuantityOrPrice() {
    this.selectedBillItem.totalBeforeTax = Number(this.selectedBillItem.quantity) * Number(this.selectedBillItem.price);
    if (this.billType[0].calculatingTax == true) {
      if (this.billType[0].calculatingTaxManual != true) {
        this.selectedBillItem.total = Number(this.selectedBillItem.totalBeforeTax) + Number(this.selectedBillItem.totalBeforeTax * 0.14);

      }
      else {
        this.selectedBillItem.total = this.selectedBillItem.totalBeforeTax;

      }
    }
    else {
      this.selectedBillItem.total = this.selectedBillItem.totalBeforeTax;

    }
    this.selectedBillItem.additionRatio = 0;
    this.selectedBillItem.additionValue = 0;
    this.selectedBillItem.discountRatio = 0;
    this.selectedBillItem.discountValue = 0;

  }
  onChangeQuantityOrPriceAdded(i: any) {
    this.billItem[i].totalBeforeTax = Number(this.billItem[i].quantity) * Number(this.billItem[i].price);
    if (this.billType[0].calculatingTax == true) {
      if (this.billType[0].calculatingTaxManual != true) {
        this.billItem[i].total = Number(this.billItem[i].totalBeforeTax) + Number(this.billItem[i].totalBeforeTax * 0.14);
      }
      else {
        this.billItem[i].total = this.billItem[i].totalBeforeTax;

      }
    }
    else {
      this.billItem[i].total = this.billItem[i].totalBeforeTax;

    }
    this.billItem[i].additionRatio = 0;
    this.billItem[i].additionValue = 0;
    this.billItem[i].discountRatio = 0;
    this.billItem[i].discountValue = 0;
    this.calculateValues();

  }
  onChangeAdditionOrDiscountRatio(i: number) {
    if (i == 1) {
      this.selectedBillItem.additionValue =
        Number(this.selectedBillItem.quantity * this.selectedBillItem.price) * Number(this.selectedBillItem.additionRatio / 100);
      this.selectedBillItem.discountRatio = 0;
      this.selectedBillItem.discountValue = 0;

    }
    if (i == 2) {
      this.selectedBillItem.discountValue =
        Number(this.selectedBillItem.quantity * this.selectedBillItem.price) * Number(this.selectedBillItem.discountRatio / 100);
      this.selectedBillItem.additionRatio = 0;
      this.selectedBillItem.additionValue = 0;
    }
    if (i == 3) {
      this.selectedBillItem.additionRatio =
        (Number(this.selectedBillItem.additionValue) / Number(this.selectedBillItem.quantity * this.selectedBillItem.price)) * 100;
      this.selectedBillItem.discountRatio = 0;
      this.selectedBillItem.discountValue = 0;

    }
    if (i == 4) {
      this.selectedBillItem.discountRatio =
        (Number(this.selectedBillItem.discountValue) / Number(this.selectedBillItem.quantity * this.selectedBillItem.price)) * 100;
      this.selectedBillItem.additionRatio = 0;
      this.selectedBillItem.additionValue = 0;
    }
    this.selectedBillItem.totalBeforeTax = Number(this.selectedBillItem.quantity * this.selectedBillItem.price) + Number(this.selectedBillItem.additionValue) - Number(this.selectedBillItem.discountValue)

    if (this.billType[0].calculatingTax == true && this.billType[0].calculatingTaxManual != true) {
      if (this.billType[0].calculatingTaxOnPriceAfterDeductionAndAddition == true) {
        this.selectedBillItem.total =
          Number(this.selectedBillItem.quantity * this.selectedBillItem.price) + Number(this.selectedBillItem.additionValue) - Number(this.selectedBillItem.discountValue)
          + (Number(Number(this.selectedBillItem.quantity * this.selectedBillItem.price) + Number(this.selectedBillItem.additionValue) - Number(this.selectedBillItem.discountValue)) * 0.14)
      }
      else {
        this.selectedBillItem.total =
          Number(this.selectedBillItem.quantity * this.selectedBillItem.price) + Number(this.selectedBillItem.additionValue) - Number(this.selectedBillItem.discountValue)
          + Number(this.selectedBillItem.quantity * this.selectedBillItem.price * 0.14)

      }

    }
    else {
      this.selectedBillItem.total =
        Number(this.selectedBillItem.quantity * this.selectedBillItem.price) + Number(this.selectedBillItem.additionValue) - Number(this.selectedBillItem.discountValue);

    }



  }

  onChangeAdditionOrDiscountRatioAdded(a: any, i: number) {
    if (a == 1) {
      this.billItem[i].additionValue =
        Number(this.billItem[i].quantity * this.billItem[i].price) * Number(this.billItem[i].additionRatio / 100);
      this.billItem[i].discountRatio = 0;
      this.billItem[i].discountValue = 0;

    }
    if (a == 2) {
      this.billItem[i].discountValue =
        Number(this.billItem[i].quantity * this.billItem[i].price) * Number(this.billItem[i].discountRatio / 100);
      this.billItem[i].additionRatio = 0;
      this.billItem[i].additionValue = 0;
    }
    if (a == 3) {
      this.billItem[i].additionRatio =
        (Number(this.billItem[i].additionValue) / Number(this.billItem[i].quantity * this.billItem[i].price)) * 100;
      this.billItem[i].discountRatio = 0;
      this.billItem[i].discountValue = 0;

    }
    if (a == 4) {
      this.billItem[i].discountRatio =
        (Number(this.billItem[i].discountValue) / Number(this.billItem[i].quantity * this.billItem[i].price)) * 100;
      this.billItem[i].additionRatio = 0;
      this.billItem[i].additionValue = 0;
    }
    this.billItem[i].totalBeforeTax = Number(this.billItem[i].quantity * this.billItem[i].price) + Number(this.billItem[i].additionValue) - Number(this.billItem[i].discountValue)

    if (this.billType[0].calculatingTax == true && this.billType[0].calculatingTaxManual != true) {
      if (this.billType[0].calculatingTaxOnPriceAfterDeductionAndAddition == true) {
        this.billItem[i].total =
          Number(this.billItem[i].quantity * this.billItem[i].price) + Number(this.billItem[i].additionValue) - Number(this.billItem[i].discountValue)
          + (Number(Number(this.billItem[i].quantity * this.billItem[i].price) + Number(this.billItem[i].additionValue) - Number(this.billItem[i].discountValue)) * 0.14)
      }
      else {
        this.billItem[i].total =
          Number(this.billItem[i].quantity * this.billItem[i].price) + Number(this.billItem[i].additionValue) - Number(this.billItem[i].discountValue)
          + Number(this.billItem[i].quantity * this.billItem[i].price * 0.14)

      }

    }
    else {
      this.billItem[i].total =
        Number(this.billItem[i].quantity * this.billItem[i].price) + Number(this.billItem[i].additionValue) - Number(this.billItem[i].discountValue);

    }

    this.calculateValues();


  }
  onChangeAdditionOrDiscountRatioInBillAdditionDiscount(i: any) {
    if (i == 1) {
      this.selectedBillAdditionAndDiscount.additionValue =
        Number(this.total) * Number(this.selectedBillAdditionAndDiscount.additionRatio / 100);
      this.selectedBillAdditionAndDiscount.discountRatio = 0;
      this.selectedBillAdditionAndDiscount.discountValue = 0;

    }
    if (i == 2) {
      this.selectedBillAdditionAndDiscount.discountValue =
        Number(this.total) * Number(this.selectedBillAdditionAndDiscount.discountRatio / 100);
      this.selectedBillAdditionAndDiscount.additionRatio = 0;
      this.selectedBillAdditionAndDiscount.additionValue = 0;
    }
    if (i == 3) {
      this.selectedBillAdditionAndDiscount.additionRatio =
        (Number(this.selectedBillAdditionAndDiscount.additionValue) / Number(this.total)) * 100;
      this.selectedBillAdditionAndDiscount.discountRatio = 0;
      this.selectedBillAdditionAndDiscount.discountValue = 0;

    }
    if (i == 4) {
      this.selectedBillAdditionAndDiscount.discountRatio =
        (Number(this.selectedBillAdditionAndDiscount.discountValue) / Number(this.total)) * 100;
      this.selectedBillAdditionAndDiscount.additionRatio = 0;
      this.selectedBillAdditionAndDiscount.additionValue = 0;
    }
  }
  onChangeAdditionOrDiscountRatioInBillAdditionDiscountAdded(a: any, i: any) {
    if (a == 1) {
      this.billAdditionAndDiscount[i].additionValue =
        Number(this.total) * Number(this.billAdditionAndDiscount[i].additionRatio / 100);
      this.billAdditionAndDiscount[i].discountRatio = 0;
      this.billAdditionAndDiscount[i].discountValue = 0;

    }
    if (a == 2) {
      this.billAdditionAndDiscount[i].discountValue =
        Number(this.total) * Number(this.billAdditionAndDiscount[i].discountRatio / 100);
      this.billAdditionAndDiscount[i].additionRatio = 0;
      this.billAdditionAndDiscount[i].additionValue = 0;
    }
    if (a == 3) {
      this.billAdditionAndDiscount[i].additionRatio =
        (Number(this.billAdditionAndDiscount[i].additionValue) / Number(this.total)) * 100;
      this.billAdditionAndDiscount[i].discountRatio = 0;
      this.billAdditionAndDiscount[i].discountValue = 0;

    }
    if (a == 4) {
      this.billAdditionAndDiscount[i].discountRatio =
        (Number(this.billAdditionAndDiscount[i].discountValue) / Number(this.total)) * 100;
      this.billAdditionAndDiscount[i].additionRatio = 0;
      this.billAdditionAndDiscount[i].additionValue = 0;
    }
    this.calculateValues();
    // this.net = this.net + this.billAdditionAndDiscount[i].additionValue - this.billAdditionAndDiscount[i].discountValue;
  }

  updateItemData(item: BillItem) {
    if (this.billItem.length > 0) {
      this.deleteBillItemForUpdate(item);
      this.addItemDataForUpdate(item);
    }

  }
  addItemDataForUpdate(item: BillItem) {

    this.billItem.push(
      {
        id: 0,
        billId: item.billId,
        itemId: item.itemId,
        itemDescription: item.itemDescription,
        unitId: item.unitId,
        quantity: item.quantity,
        price: item.price,
        totalBeforeTax: item.totalBeforeTax,
        additionRatio: item.additionRatio,
        additionValue: item.additionValue,
        discountRatio: item.discountRatio,
        discountValue: item.discountValue,
        totalTax: item.totalTax,
        total: item.total,
        storeId: item.storeId,
        costCenterId: item.costCenterId,
        notes: item.notes,
        itemName: item.itemName,
        unitName: item.unitName,
        storeName: item.storeName,
        costCenterName: item.costCenterName
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
  updateBillAdditionsAndDiscountData(item: BillAdditionAndDiscount) {
    if (this.billAdditionAndDiscount.length > 0) {
      this.deleteBillAdditionDiscountForUpdate(item);
      this.addBillAdditionDiscountDataForUpdate(item);
    }
  }
  addBillAdditionDiscountDataForUpdate(item: BillAdditionAndDiscount) {

    this.billAdditionAndDiscount.push(
      {
        id: 0,
        billId: item.billId,
        additionRatio: item.additionRatio,
        additionValue: item.additionValue,
        discountRatio: item.discountRatio,
        discountValue: item.discountValue,
        accountId: item.accountId,
        notes: item.notes,
        correspondingAccountId: item.correspondingAccountId,
        currencyId: item.currencyId,
        currencyValue: item.currencyValue,
        accountName: item.accountName,
        correspondingAccountName: item.correspondingAccountName,
        currencyName: item.currencyName
      }
    )

    this.billAdditionAndDiscount.forEach(item => {
      this.net = this.total + item.additionValue - item.discountValue;

    }
    )


  }
  deleteBillAdditionDiscountForUpdate(item: BillAdditionAndDiscount) {
    if (item != null) {
      const index: number = this.billAdditionAndDiscount.indexOf(item);
      if (index !== -1) {
        this.billAdditionAndDiscount.splice(index, 1);

        this.net = this.net - this.billAdditionAndDiscount[index].additionValue + this.billAdditionAndDiscount[index].discountValue;
      }

    }
  }

  getNetAfterTax(type: any) {
    debugger
    if (this.billType[0].manuallyTaxType == ManuallyTaxType.Total) {
      if (type == 1) {
        this.taxValue = Math.round(Number(this.total) * Number(this.taxRatio / 100));

      }
      else if (type == 2) {
        this.taxRatio = (this.taxValue / this.total) * 100

      }


    }
    else if (this.billType[0].manuallyTaxType == ManuallyTaxType.Net) {
      if (type == 1) {
        this.taxValue = Math.round(Number(this.net) * Number(this.taxRatio / 100));
      }
      else if (type == 2) {
        this.taxRatio = (this.taxValue / this.net) * 100

      }
    }
    this.netAfterTax = Number(this.net) + this.taxValue;
    this.remaining = this.netAfterTax - this.paid;


  }
  getRamining() {
    if (this.netAfterTax > 0) {
      this.remaining = Number(this.netAfterTax) - Number(this.paid)
    }
  }
  addItemAdditionsDiscounts() {
    this.billAdditionAndDiscount.push({
      id: 0,
      billId: this.selectedBillAdditionAndDiscount?.billId ?? 0,
      additionRatio: this.selectedBillAdditionAndDiscount?.additionRatio ?? 0,
      additionValue: this.selectedBillAdditionAndDiscount?.additionValue ?? 0,
      discountRatio: this.selectedBillAdditionAndDiscount?.discountRatio ?? 0,
      discountValue: this.selectedBillAdditionAndDiscount?.discountValue ?? 0,
      accountId: this.selectedBillAdditionAndDiscount?.accountId ?? null,
      notes: this.selectedBillAdditionAndDiscount?.notes ?? '',
      correspondingAccountId: this.selectedBillAdditionAndDiscount?.correspondingAccountId ?? null,
      currencyId: this.selectedBillAdditionAndDiscount?.currencyId ?? null,
      currencyValue: this.selectedBillAdditionAndDiscount?.currencyValue ?? 0,
      accountName: this.selectedBillAdditionAndDiscount?.accountName ?? '',
      correspondingAccountName: this.selectedBillAdditionAndDiscount?.correspondingAccountName ?? '',
      currencyName: this.selectedBillAdditionAndDiscount?.currencyName ?? ''
    });
    this.bill!.billAdditionAndDiscounts = this.billAdditionAndDiscount;

    // this.net = this.net + this.selectedBillAdditionAndDiscount?.additionValue - this.selectedBillAdditionAndDiscount?.discountValue ?? 0;
    // this.netAfterTax = this.net ?? 0;
    // this.remaining = this.netAfterTax - this.paid; // comment

    this.clearSelectedBilladditionDiscountData();
    this.calculateValues();
  }
  clearValues() {
    this.totalBeforeTax = 0;
    this.total = 0;
    this.net = 0;
    this.netAfterTax = 0;
    this.remaining = 0;


  }

  calculateValues() {
    this.clearValues();
    if (this.billItem != null) {
      this.billItem.forEach(element => {
        this.totalBeforeTax += element.totalBeforeTax;
        this.total += element.total;
        this.net += element.total;
        this.netAfterTax += element.total;
      });
      if (this.billAdditionAndDiscount != null) {
        this.billAdditionAndDiscount.forEach(element => {
          element.additionValue = (this.total * element.additionRatio) / 100;
          element.discountValue = (this.total * element.discountRatio) / 100;
          this.net += element.additionValue - element.discountValue;
          this.netAfterTax = this.net;
        });
      }
      this.getNetAfterTax(1);
    }
  }

}

