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
import { convertEnumToArray, AccountClassificationsEnum, PayWayEnum, PayWayArEnum, ShipMethodEnum, ShipKindEnum, ShipKindArEnum, ManuallyTaxType, GeneralConfigurationEnum, CreateFinancialEntryEnum, BillKindEnum } from '../../../../../shared/constants/enumrators/enums';
import { BillServiceProxy } from '../../../services/bill.service';
import { navigateUrl } from 'src/app/shared/helper/helper-url';
import { ItemCardUnitDto } from '../../../models/item-card';
import { ItemCardServiceProxy } from '../../../Services/item-card.service';
import { TaxServiceProxy } from '../../../Services/tax.service';
import { FiscalPeriodServiceProxy } from 'src/app/erp/Accounting/services/fiscal-period.services';
import { FiscalPeriodStatus } from 'src/app/shared/enum/fiscal-period-status';
import { MatDialog } from '@angular/material/dialog';
import { BillDynamicDeterminantComponent } from '../../bill-dynamic-determinant/bill-dynamic-determinant.component';
import { BillTypeServiceProxy } from '../../../Services/bill-type.service';
import { CompanyServiceProxy } from 'src/app/erp/master-codes/services/company.service';
import { CountryServiceProxy } from 'src/app/erp/master-codes/services/country.servies';

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
  searchText: any;
  currencyId: any;
  salesPersonId: any;
  storeId: any;
  costCenterId: any;
  cashAccountId: any;
  //supplierAccountId: any;
  taxes: any[] = [];
  useTaxDetail: boolean = false;
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
  selectedBillItemTax: BillItemTax[] = [];

  temporaryBillItemTax: BillItemTax[] = [];
  tempSubTaxCodeDetail: any[] = []
  tempSubTaxNameDetail: any[] = []
  tempSubTaxDetail: any[] = []


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
  taxIds: any;
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
  showItemTax: boolean = false;
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
  showSearchDiscountAccountModal = false;
  showSearchTaxAccountModal = false;

  showSearchPaidAccountModal = false;
  showSearchRemainingAccountModal = false;
  showSearchCostCenterModal = false;
  showSearchCurrencyModal = false;
  showSearchSalesPersonModal = false;
  showSearchStoreModal = false;
  showSearchProjectModal = false;
  billItemId: any = -1;
  fiscalPeriodId: number;
  fiscalPeriodName: string;
  fiscalPeriodStatus: number;
  fromDate: any;
  toDate: any;
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
    private taxServiceProxy: TaxServiceProxy,
    private fiscalPeriodService: FiscalPeriodServiceProxy,
    public dialog: MatDialog,
    private billTypeService: BillTypeServiceProxy,
    private companyService: CompanyServiceProxy,
    private countryService: CountryServiceProxy,


  ) {
    this.defineBillForm();
    this.clearSelectedItemData();
    this.billItem = [];

  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {

    this.lang = localStorage.getItem("language");
    this.spinner.show();

    this.getPayWays();
    this.getShipKinds();
    this.getShipMethods();

    Promise.all([
      this.getGeneralConfigurationsOfMainCurrency(),
      this.getGeneralConfigurationsOfFiscalPeriod(),
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
      this.getTaxes(),
      this.getCompanyById(this.companyId)





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
      fiscalPeriodId: this.fiscalPeriodId,
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
      // supplierAccountId: null,
      salesAccountId: null,
      salesReturnAccountId: null,
      purchasesAccountId: null,
      purchasesReturnAccountId: null,
      // discountAccountId: null,
      taxAccountId: null,
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
      //supplierAccountId: null,
      salesAccountId: null,
      salesReturnAccountId: null,
      purchasesAccountId: null,
      purchasesReturnAccountId: null,
      // discountAccountId: null,
      taxAccountId: null,

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

  getCompanyById(id: any) {
    return new Promise<void>((resolve, reject) => {
      let sub = this.companyService.getCompany(id).subscribe({
        next: (res: any) => {
          if (res.response != null) {
            if (res?.response?.countryId > 0) {

              this.getCountryById(res?.response?.countryId);
            }

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
  getCountryById(id: any) {
    return new Promise<void>((resolve, reject) => {
      let sub = this.countryService.getCountry(id).subscribe({
        next: (res: any) => {
          if (res.response != null) {

            if (res?.response?.useTaxDetail == true) {
              this.useTaxDetail = true;
            }

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
    return this.billForm.controls;
  }


  //#endregion
  getBillTypeById(id) {

    if (this.billTypesList.length > 0) {

      this.billType = this.billTypesList.filter(x => x.id == id);
      this.billTypeKind = this.billType[0].kind;
      this.billTypeCalculatingTax = this.billType[0].calculatingTax;
      this.billTypeCalculatingTaxManual = this.billType[0].calculatingTaxManual;

      if (this.id == 0) {

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
    this.lang = localStorage.getItem("language");
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
            fiscalPeriodId: res.response?.fiscalPeriodId,
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
            salesAccountId: res.response?.salesAccountId,
            salesReturnAccountId: res.response?.salesReturnAccountId,
            purchasesAccountId: res.response?.purchasesAccountId,
            purchasesReturnAccountId: res.response?.purchasesReturnAccountId,
            taxAccountId: res.response?.taxAccountId,
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
            var c = 0;
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
                  id: c,
                  billId: element.billId,
                  itemId: element.itemId,
                  itemDescription: element.itemDescription,
                  unitId: element.unitId,
                  unitTransactionFactor: element.unitTransactionFactor,
                  quantity: element.quantity,
                  totalQuantity: element.totalQuantity,
                  price: element.price,
                  totalBeforeTax: element.totalBeforeTax,
                  additionRatio: element.additionRatio,
                  additionValue: element.additionValue,
                  discountRatio: element.discountRatio,
                  discountValue: element.discountValue,
                  totalTax: Math.round(element.totalTax),
                  total: element.total,
                  storeId: element.storeId,
                  costCenterId: element.costCenterId,
                  totalCostPrice: element.totalCostPrice,
                  notes: element.notes,
                  itemName: this.lang = "ar" ? itemName?.nameAr ?? '' : itemName?.nameEn ?? '',
                  unitName: this.lang = "ar" ? unitName?.nameAr ?? '' : unitName?.nameEn ?? '',
                  storeName: this.lang = "ar" ? storeName?.nameAr ?? '' : storeName?.nameEn ?? '',
                  costCenterName: this.lang = "ar" ? costCenterName?.nameAr ?? '' : costCenterName?.nameEn ?? '',
                  billItemTaxes: this.billItemTax ?? [],


                }
              )


              if (res.response?.billItems[c]?.billItemTaxes.length > 0) {

                var i = 0;
                res.response?.billItems[c]?.billItemTaxes.forEach(_element => {
                  if (_element.taxId != null) {
                    var taxName = this.taxes.find(x => x.id == _element.taxId);
                    // _element.subTaxCode = _element.subTaxCode;
                    // _element.subTaxReason = _element.subTaxReason;
                    // this.tempSubTaxDetail.push(_element);

                    this.selectedBillItemTax.push(
                      {
                        id: i,
                        billItemId: c,
                        name: this.lang == 'ar' ? taxName.nameAr : taxName.nameEn,
                        taxId: _element.taxId,
                        taxRatio: _element.taxRatio,
                        taxValue: _element.taxValue,
                        subTaxCode: _element.subTaxCode,
                        subTaxReason: _element.subTaxReason
                      }
                    )

                    this.billItemTax.push(
                      {
                        id: i,
                        billItemId: c,
                        name: this.lang == 'ar' ? taxName.nameAr : taxName.nameEn,
                        taxId: _element.taxId,
                        taxRatio: _element.taxRatio,
                        taxValue: _element.taxValue,
                        subTaxCode: _element.subTaxCode,
                        subTaxReason: _element.subTaxReason
                      }
                    )
                    debugger

                    this.subsList.push(sub);

                  }
                  i++;
                });
              }


              c++;
            });



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
  getTaxes() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.taxServiceProxy.allTaxes(undefined, undefined, undefined, undefined, undefined).subscribe({
        next: (res) => {
          if (res.success) {
            this.taxes = res.response.items;

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
      let sub = this.billTypeService.allBillTypees(undefined, undefined, undefined, undefined, undefined).subscribe({
        next: (res) => {
          if (res.success) {
            this.billTypesList = res.response.items

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
  // onSelectSupplierAccount(event) {
  //   this.billForm.controls.supplierAccountId.setValue(event.id);
  //   this.showSearchSupplierAccountModal = false;
  // }
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
  // onSelectDiscountAccount(event) {
  //   this.billForm.controls.discountAccountId.setValue(event.id);
  //   this.showSearchDiscountAccountModal = false;
  // }
  onSelectTaxAccount(event) {
    this.billForm.controls.taxAccountId.setValue(event.id);
    this.showSearchTaxAccountModal = false;
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
  getTotalTax(i, number) {

    let a = this.billItemId;
    if (this.billItemId == -1) {
      if (number == 1) {
        this.selectedBillItemTax[i].taxValue = Math.round(Number(this.selectedBillItem.totalBeforeTax * this.selectedBillItemTax[i].taxRatio / 100));

      }
      else {
        this.selectedBillItemTax[i].taxRatio = Math.round(Number(this.selectedBillItemTax[i].taxValue / this.selectedBillItem.totalBeforeTax * 100));

      }
      this.selectedBillItem.totalTax = 0;
      this.selectedBillItem.total = 0;
      this.selectedBillItemTax.forEach(element => {
        this.selectedBillItem.totalTax += Math.round(Number(element.taxValue));

      });
      this.selectedBillItem.total = Math.round(Number(this.selectedBillItem.totalBeforeTax) + Number(this.selectedBillItem.totalTax));

    }
    else {
      if (number == 1) {
        this.selectedBillItemTax[i].taxValue = Math.round(Number(this.billItem[a].totalBeforeTax * this.selectedBillItemTax[i].taxRatio / 100));
      }
      else {
        this.selectedBillItemTax[i].taxRatio = Math.round(Number(this.selectedBillItemTax[i].taxRatio / this.billItem[a].totalBeforeTax * 100));

      }
      this.billItem[a].totalTax = 0;
      this.billItem[a].total = 0;
      this.selectedBillItemTax.forEach(element => {
        this.billItem[a].totalTax += Math.round(Number(element.taxValue));

      });
      this.billItem[a].total = Math.round(Number(this.billItem[a].totalBeforeTax) + Number(this.billItem[a].totalTax));

    }


  }
  addItem() {
    var totalQuantity = 0;
    var totalCostPrice = 0;

    if (this.selectedBillItem?.itemId == null) {
      this.errorMessage = this.translate.instant("general.item-required");
      this.errorClass = 'errorMessage';
      this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
      return;
    }
    if (this.selectedBillItem?.quantity == 0) {
      this.errorMessage = this.translate.instant("general.quantity-required");
      this.errorClass = 'errorMessage';
      this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
      return;
    }
    if (this.selectedBillItem?.price == 0) {
      this.errorMessage = this.translate.instant("general.price-required");
      this.errorClass = 'errorMessage';
      this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
      return;
    }

    if (this.billType[0].affectOnCostPrice == true && (this.billType[0].kind == BillKindEnum['Purchases Bill'] || this.billType[0].kind == BillKindEnum['Purchases Returns Bill'])) {
      totalQuantity = this.selectedBillItem.quantity * this.selectedBillItem.unitTransactionFactor;
      totalCostPrice = this.selectedBillItem.quantity * this.selectedBillItem.price;

      if (this.billType[0].additionAffectsCostPrice) {
        totalCostPrice = totalCostPrice + this.selectedBillItem?.additionValue ?? 0
      }
      if (this.billType[0].discountAffectsCostPrice) {
        totalCostPrice = totalCostPrice - this.selectedBillItem?.discountValue ?? 0

      }
      if (this.billType[0].taxAffectsCostPrice) {
        totalCostPrice = totalCostPrice + this.selectedBillItem?.totalTax ?? 0

      }

    }

    var billItemId;
    this.billItemTax.forEach(element => {
      if (element.billItemId == -1) {
        element.billItemId = this.billItem.length;
        billItemId = this.billItem.length;
      }

    });
    this.selectedBillItemTax = this.billItemTax.filter(x => x.billItemId == billItemId);
    this.billItem.push({
      id: 0,
      billId: this.selectedBillItem?.billId ?? 0,
      itemId: this.selectedBillItem?.itemId ?? null,
      itemDescription: this.selectedBillItem?.itemDescription ?? '',
      unitId: this.selectedBillItem?.unitId ?? null,
      unitTransactionFactor: this.selectedBillItem?.unitTransactionFactor ?? null,
      quantity: this.selectedBillItem?.quantity ?? 0,
      totalQuantity: Number(totalQuantity),
      price: this.selectedBillItem?.price ?? 0,
      totalBeforeTax: this.selectedBillItem?.totalBeforeTax ?? 0,
      additionRatio: this.selectedBillItem?.additionRatio ?? 0,
      additionValue: this.selectedBillItem?.additionValue ?? 0,
      discountRatio: this.selectedBillItem?.discountRatio ?? 0,
      discountValue: this.selectedBillItem?.discountValue ?? 0,
      totalTax: this.billType[0].calculatingTax == true && this.billType[0].calculatingTaxManual != true
        ? Math.round(this.selectedBillItem?.totalTax) ?? 0 : null,
      total: this.selectedBillItem?.total ?? 0,
      storeId: this.selectedBillItem?.storeId ?? null,
      costCenterId: this.selectedBillItem?.costCenterId ?? null,
      totalCostPrice: Number(totalCostPrice),
      notes: this.selectedBillItem?.notes ?? '',
      itemName: this.selectedBillItem?.itemName,
      unitName: this.selectedBillItem?.unitName,
      storeName: this.selectedBillItem?.storeName,
      costCenterName: this.selectedBillItem?.costCenterName,
      billItemTaxes: this.selectedBillItemTax ?? [],


    });

    console.log("bill item", this.billItem)
    this.bill!.billItems = this.billItem;


    this.clearSelectedItemData();
    this.calculateValues();

  }
  deleteItem(index) {

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
      unitTransactionFactor: 1,
      quantity: 0,
      totalQuantity: 0,
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
      totalCostPrice: 0,
      notes: '',
      itemName: '',
      unitName: '',
      storeName: '',
      costCenterName: '',
      billItemTaxes: [],


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
      fiscalPeriodId: this.billForm.controls["fiscalPeriodId"].value,
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
      salesAccountId: this.billForm.controls["salesAccountId"].value,
      salesReturnAccountId: this.billForm.controls["salesReturnAccountId"].value,
      purchasesAccountId: this.billForm.controls["purchasesAccountId"].value,
      purchasesReturnAccountId: this.billForm.controls["purchasesReturnAccountId"].value,
      taxAccountId: this.billForm.controls["taxAccountId"].value,
      totalBeforeTax: this.billForm.controls["totalBeforeTax"].value,
      total: this.billForm.controls["total"].value,
      taxRatio: this.billForm.controls["taxRatio"].value,
      taxValue: this.billForm.controls["taxValue"].value,
      net: this.billForm.controls["net"].value,
      netAfterTax: this.netAfterTax,
      paid: this.billForm.controls["paid"].value,
      paidAccountId: this.billForm.controls["paidAccountId"].value,
      remaining: this.billForm.controls["remaining"].value,
      remainingAccountId: this.billForm.controls["remainingAccountId"].value,
      billItems: this.bill.billItems ?? [],
      billAdditionAndDiscounts: this.bill.billAdditionAndDiscounts ?? [],


    };

    this.bill.billItems = this.billItem;
    this.bill.billAdditionAndDiscounts = this.billAdditionAndDiscount;



  }
  confirmSave() {
    return new Promise<void>((resolve, reject) => {
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
    if (this.billForm.valid) {
      this.setInputData();
      if (this.fiscalPeriodId > 0) {
        if (this.fiscalPeriodStatus != FiscalPeriodStatus.Opened) {
          this.errorMessage = this.translate.instant("bill.no-add-bill-fiscal-period-closed") + " : " + this.fiscalPeriodName;
          this.errorClass = 'errorMessage';
          this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
          return;
        }


        let billDate = this.billForm.controls["date"].value;
        let date;
        let month;
        let day;
        if (billDate?.month + 1 > 9) {
          month = billDate?.month + 1
        }
        else {
          month = '0' + billDate.month + 1
        }
        if (billDate.day < 10) {
          day = '0' + billDate?.day
        }
        else {
          day = billDate.day
        }
        date = billDate.year + '-' + month + '-' + day

        if (date >= this.fromDate && date <= this.toDate) {


        }
        else {
          this.errorMessage = this.translate.instant("general.date-out-fiscal-period");
          this.errorClass = 'errorMessage';
          this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
          return;

        }
      }
      if (this.billType[0].kind == BillKindEnum['Sales Bill'] || this.billType[0].kind == BillKindEnum['Sales Returns Bill']) {
        if (this.bill.customerId == null) {
          this.errorMessage = this.translate.instant("bill.customer-required");
          this.errorClass = 'errorMessage';
          this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
          return;
        }

      }
      if (this.billType[0].kind == BillKindEnum['Purchases Bill'] || this.billType[0].kind == BillKindEnum['Purchases Returns Bill']) {
        if (this.bill.supplierId == null) {
          this.errorMessage = this.translate.instant("bill.supplier-required");
          this.errorClass = 'errorMessage';
          this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
          return;
        }

      }
      if (this.bill.billItems.length == 0) {
        this.errorMessage = this.translate.instant("bill.bill-items-required");
        this.errorClass = 'errorMessage';
        this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
        return;
      }
      if (this.billType[0].accountingEffect == CreateFinancialEntryEnum['Create the entry automatically'] && this.fiscalPeriodId > 0) {
        if (this.billType[0].kind != BillKindEnum['First Period Goods Bill']) {
          if (this.bill.payWay == PayWayEnum.Cash) {
            if (this.bill.cashAccountId == null) {
              this.errorMessage = this.translate.instant("bill.cash-account-required");
              this.errorClass = 'errorMessage';
              this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
              return;
            }
          }
        }

        if (this.billType[0].kind == BillKindEnum['Sales Bill']) {
          if (this.bill.salesAccountId == null) {
            this.errorMessage = this.translate.instant("bill.sales-account-required");
            this.errorClass = 'errorMessage';
            this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
            return;
          }

        }

        if (this.billType[0].kind == BillKindEnum['Sales Returns Bill']) {
          if (this.bill.salesReturnAccountId == null) {
            this.errorMessage = this.translate.instant("bill.sales-return-account-required");
            this.errorClass = 'errorMessage';
            this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
            return;
          }

        }
        if (this.billType[0].kind == BillKindEnum['Purchases Bill']) {
          if (this.bill.purchasesAccountId == null) {
            this.errorMessage = this.translate.instant("bill.purchases-account-required");
            this.errorClass = 'errorMessage';
            this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
            return;
          }

        }
        if (this.billType[0].kind == BillKindEnum['Purchases Returns Bill']) {
          if (this.bill.purchasesReturnAccountId == null) {
            this.errorMessage = this.translate.instant("bill.purchases-return-account-required");
            this.errorClass = 'errorMessage';
            this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
            return;
          }

        }
        if (this.billType[0].calculatingTax == true && this.billType[0].calculatingTaxManual == true) {
          if (this.bill.taxAccountId == null) {
            this.errorMessage = this.translate.instant("bill.tax-account-required");
            this.errorClass = 'errorMessage';
            this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
            return;
          }
        }



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
      this.setInputData();
      if (this.fiscalPeriodId > 0) {
        if (this.fiscalPeriodStatus != FiscalPeriodStatus.Opened) {
          this.errorMessage = this.translate.instant("bill.no-edit-bill-fiscal-period-closed") + " : " + this.fiscalPeriodName;
          this.errorClass = 'errorMessage';
          this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
          return;
        }


        let billDate = this.billForm.controls["date"].value;
        let date;
        let month;
        let day;
        if (billDate?.month + 1 > 9) {
          month = billDate?.month + 1
        }
        else {
          month = '0' + billDate.month + 1
        }
        if (billDate.day < 10) {
          day = '0' + billDate?.day
        }
        else {
          day = billDate.day
        }
        date = billDate.year + '-' + month + '-' + day

        if (date >= this.fromDate && date <= this.toDate) {


        }
        else {
          this.errorMessage = this.translate.instant("general.date-out-fiscal-period");
          this.errorClass = 'errorMessage';
          this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
          return;

        }
      }
      if (this.billType[0].kind == BillKindEnum['Sales Bill'] || this.billType[0].kind == BillKindEnum['Sales Returns Bill']) {
        if (this.bill.customerId == null) {
          this.errorMessage = this.translate.instant("bill.customer-required");
          this.errorClass = 'errorMessage';
          this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
          return;
        }

      }
      if (this.billType[0].kind == BillKindEnum['Purchases Bill'] || this.billType[0].kind == BillKindEnum['Purchases Returns Bill']) {
        if (this.bill.supplierId == null) {
          this.errorMessage = this.translate.instant("bill.supplier-required");
          this.errorClass = 'errorMessage';
          this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
          return;
        }

      }
      if (this.bill.billItems.length == 0) {
        this.errorMessage = this.translate.instant("bill.bill-items-required");
        this.errorClass = 'errorMessage';
        this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
        return;
      }
      if (this.billType[0].accountingEffect == CreateFinancialEntryEnum['Create the entry automatically'] && this.fiscalPeriodId > 0) {
        if (this.bill.payWay == PayWayEnum.Cash) {
          if (this.bill.cashAccountId == null) {
            this.errorMessage = this.translate.instant("bill.cash-account-required");
            this.errorClass = 'errorMessage';
            this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
            return;
          }
        }

        if (this.billType[0].kind == BillKindEnum['Sales Bill']) {
          if (this.bill.salesAccountId == null) {
            this.errorMessage = this.translate.instant("bill.sales-account-required");
            this.errorClass = 'errorMessage';
            this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
            return;
          }

        }

        if (this.billType[0].kind == BillKindEnum['Sales Returns Bill']) {
          if (this.bill.salesReturnAccountId == null) {
            this.errorMessage = this.translate.instant("bill.sales-return-account-required");
            this.errorClass = 'errorMessage';
            this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
            return;
          }

        }
        if (this.billType[0].kind == BillKindEnum['Purchases Bill']) {
          if (this.bill.purchasesAccountId == null) {
            this.errorMessage = this.translate.instant("bill.purchases-account-required");
            this.errorClass = 'errorMessage';
            this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
            return;
          }

        }
        if (this.billType[0].kind == BillKindEnum['Purchases Returns Bill']) {
          if (this.bill.purchasesReturnAccountId == null) {
            this.errorMessage = this.translate.instant("bill.purchases-return-account-required");
            this.errorClass = 'errorMessage';
            this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
            return;
          }

        }
        if (this.billType[0].calculatingTax == true && this.billType[0].calculatingTaxManual == true) {
          if (this.bill.taxAccountId == null) {
            this.errorMessage = this.translate.instant("bill.tax-account-required");
            this.errorClass = 'errorMessage';
            this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
            return;
          }
        }



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
          } else if (currentBtn.action == ToolbarActions.Update && currentBtn.submitMode) {
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
      this.onChangeItem(data[0].id, i);

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
            this.onChangeItem(d.id, i);

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
    }

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
        this.selectedBillItem!.price =
          this.billTypeKind == BillKindEnum['Sales Bill'] || this.billTypeKind == BillKindEnum['Sales Returns Bill']
            ? data[0].sellingPrice : 0;
        this.onChangeQuantityOrPrice();
      } else {
        this.billItem[i].unitName = this.lang = "ar" ? data[0].unitNameAr : data[0].unitNameEn;
        this.billItem[i].unitId = data[0].unitId;
        this.billItem[i]!.price =
          this.billTypeKind == BillKindEnum['Sales Bill'] || this.billTypeKind == BillKindEnum['Sales Returns Bill']
            ? data[0].sellingPrice : 0;
        this.onChangeQuantityOrPriceAdded(i);


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
              this.selectedBillItem!.unitTransactionFactor = d.transactionFactor;

              this.selectedBillItem!.price =
                this.billTypeKind == BillKindEnum['Sales Bill'] || this.billTypeKind == BillKindEnum['Sales Returns Bill']
                  ? d.sellingPrice : 0;
              this.onChangeQuantityOrPrice();


            } else {
              this.billItem[i].unitName = this.lang = "ar" ? d.unitNameAr : d.unitNameEn;
              this.billItem[i].unitId = d.unitId;
              this.billItem[i].unitTransactionFactor = d.transactionFactor;
              this.billItem[i]!.price =
                this.billTypeKind == BillKindEnum['Sales Bill'] || this.billTypeKind == BillKindEnum['Sales Returns Bill']
                  ? d.sellingPrice : 0;
              this.onChangeQuantityOrPriceAdded(i);

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

  onChangeItem(itemId: any, i: any) {

    this.itemCardUnit = [];
    if (i == -1) {
      this.selectedBillItem.unitName = '';

    }
    else {
      this.billItem[i].unitName = '';

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
                transactionFactor: 1,
                sellingPrice: res.response?.sellingPrice,
                minSellingPrice: res.response?.minSellingPrice,
                consumerPrice: res.response?.consumerPrice,
                openingCostPrice: res.response?.openingCostPrice,
                unitNameAr: unit?.nameAr ?? '',
                unitNameEn: unit?.nameEn ?? '',
                unitCode: unit?.code ?? ''

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
                  unitCode: unit?.code ?? ''


                }
              )
            });


          }

          if (res.response?.taxIds != null && res.reponse?.taxIds != '') {
            this.taxIds = res.response?.taxIds;
          }


          if (this.selectedBillItem.quantity > 0 && this.selectedBillItem.price > 0) {
            this.onChangeQuantityOrPrice();
          }
          let row = {
            billItemId: this.id,
            itemCardId: itemId
          }
          this.dialog.open(BillDynamicDeterminantComponent,
            {
              width: '1000px',
              data: row
            })
            .afterClosed().subscribe(result => {
              if (result) {
                //this.getBills();
              }
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
  getGeneralConfigurationsOfFiscalPeriod() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.generalConfigurationService.getGeneralConfiguration(GeneralConfigurationEnum.AccountingPeriod).subscribe({
        next: (res: any) => {
          resolve();

          if (res.response.value > 0) {
            this.fiscalPeriodId = res.response.value;
            this.getfiscalPeriodById(this.fiscalPeriodId);
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
  closeItemTaxDialog() {
    let itemTaxDialog: any = <any>document.getElementById("itemTaxDialog");
    itemTaxDialog.close();

  }
  getTaxData(id, i) {
    this.lang = localStorage.getItem("language");
    return new Promise<void>((resolve, reject) => {
      let sub = this.taxServiceProxy.getTax(id).subscribe({
        next: (res: any) => {
          resolve();
          if (this.useTaxDetail == false) {
            if (res.response?.taxDetail != null) {
              res.response?.taxDetail.forEach(element => {
                let fromDate = element.fromDate;
                let toDate = element.toDate;
                let currentDate;
                const now = new Date()
                let month;
                let day;
                if (now.getMonth() + 1 > 9) {
                  month = now.getMonth() + 1
                }
                else {
                  month = '0' + now.getMonth() + 1
                }
                if (now.getDate() < 10) {
                  day = '0' + now.getDate()
                }
                else {
                  day = now.getDate()
                }

                currentDate = now.getFullYear() + '-' + month + '-' + day

                if (currentDate >= fromDate && currentDate <= toDate) {

                  this.billItemTax.push(
                    {
                      id: 0,
                      billItemId: i,
                      taxId: res.response?.id,
                      name: this.lang == 'ar' ? res.response?.nameAr : res.response?.nameEn,
                      taxRatio: element.taxRatio,
                      taxValue: Math.round(this.selectedBillItem.totalBeforeTax * (element.taxRatio / 100)),
                      subTaxCode: '',
                      subTaxReason: ''
                    }
                  )
                  if (i == -1) {

                    this.selectedBillItem.totalTax += Math.round(this.selectedBillItem.totalBeforeTax * (element.taxRatio / 100));
                    this.selectedBillItem.total = Number(this.selectedBillItem.totalBeforeTax) + this.selectedBillItem.totalTax;

                  }
                  else {
                    this.billItem[i].totalTax += Math.round(this.billItem[i].totalBeforeTax * (element.taxRatio / 100));
                    this.billItem[i].total = Number(this.billItem[i].totalBeforeTax) + this.billItem[i].totalTax;
                    this.calculateValues();

                  }
                  return;
                }

              });

            }
          }
          else {

            if (res.response?.subTaxDetail != null) {
              res.response?.subTaxDetail[0].subTaxRatioDetail.forEach(element => {

                let fromDate = element.fromDate;
                let toDate = element.toDate;
                let currentDate;
                const now = new Date()
                let month;
                let day;
                if (now.getMonth() + 1 > 9) {
                  month = now.getMonth() + 1
                }
                else {
                  month = '0' + now.getMonth() + 1
                }
                if (now.getDate() < 10) {
                  day = '0' + now.getDate()
                }
                else {
                  day = now.getDate()
                }

                currentDate = now.getFullYear() + '-' + month + '-' + day

                if (currentDate >= fromDate && currentDate <= toDate) {

                  if (res.response != null) {
                    var name = '';
                    if (this.lang == 'ar') {
                      name = res.response.nameAr;
                    }
                    else {
                      name = res.response.nameEn;
                    }
                  }

                  if (res.response?.subTaxDetail[0] != null) {
                    var subTaxDetail = res.response?.subTaxDetail[0];

                  }

                  if (res.response?.subTaxDetail[0].subTaxReasonsDetail[0] != null) {
                    debugger
                    var subTaxReasonsDetail = res.response?.subTaxDetail[0].subTaxReasonsDetail[0];
                    var reason = '';
                    if (this.lang == 'ar') {
                      debugger
                      reason = subTaxReasonsDetail.taxReasonAr;
                    }
                    else {
                      reason = subTaxReasonsDetail.taxReasonEn;
                    }
                  }

                  this.billItemTax.push(
                    {
                      id: 0,
                      billItemId: i,
                      taxId: id,
                      name: name,
                      taxRatio: element.taxRatio,
                      taxValue: Math.round(this.selectedBillItem.totalBeforeTax * (element.taxRatio / 100)),
                      subTaxCode: subTaxDetail.code,
                      subTaxReason: reason
                    }
                  )
                  debugger
                  if (res.response?.subTaxDetail != null) {

                    res.response?.subTaxDetail.forEach(element => {
                      element.name = this.lang == 'ar' ? element.subTaxNameAr : element.subTaxNameEn;
                      element.subTaxReason = this.lang == 'ar' ? element.taxReasonAr : element.taxReasonEn;
                      this.tempSubTaxDetail.push(element)

                    });
                  }

                  if (i == -1) {

                    this.selectedBillItem.totalTax += Math.round(this.selectedBillItem.totalBeforeTax * (element.taxRatio / 100));
                    this.selectedBillItem.total = Number(this.selectedBillItem.totalBeforeTax) + this.selectedBillItem.totalTax;

                  }
                  else {
                    this.billItem[i].totalTax += Math.round(this.billItem[i].totalBeforeTax * (element.taxRatio / 100));
                    this.billItem[i].total = Number(this.billItem[i].totalBeforeTax) + this.billItem[i].totalTax;
                    this.calculateValues();

                  }
                  return;
                }


              })
            }

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
    if (this.selectedBillItem.quantity > 0 && this.selectedBillItem.price > 0) {
      this.selectedBillItemTax = [];
      this.selectedBillItem.totalBeforeTax = Number(this.selectedBillItem.quantity) * Number(this.selectedBillItem.price);
      if (this.billType[0].calculatingTax == true) {
        this.selectedBillItem.totalTax = 0;

        if (this.billType[0].calculatingTaxManual != true) {
          if (this.taxIds != null && this?.taxIds != '') {

            var spiltedIds: string[] = [];
            spiltedIds = this.taxIds.split(',');
            for (var a = 0; a <= spiltedIds.length - 1; a++) {
              this.getTaxData(spiltedIds[a], -1);

            }
          }
          else {
            this.selectedBillItem.total = Number(this.selectedBillItem.totalBeforeTax)

          }
        }
        else {
          this.selectedBillItem.total = Number(this.selectedBillItem.totalBeforeTax)
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
  }
  onChangeQuantityOrPriceAdded(i: any) {
    var totalQuantity = 0;
    var totalCostPrice = 0;
    if (this.billItem[i].quantity > 0 && this.billItem[i].price > 0) {
      this.selectedBillItemTax = [];
      this.billItem[i].totalTax = 0;
      this.billItem[i].totalBeforeTax = Number(this.billItem[i].quantity) * Number(this.billItem[i].price);
      if (this.billType[0].calculatingTax == true) {
        if (this.billType[0].calculatingTaxManual != true) {


          if (this.taxIds != null && this?.taxIds != '') {

            var spiltedIds: string[] = [];
            spiltedIds = this.taxIds.split(',');
            for (var a = 0; a <= spiltedIds.length - 1; a++) {
              this.getTaxData(spiltedIds[a], i);

            }
          }
          else {
            this.billItem[i].total = Number(this.billItem[i].totalBeforeTax);

          }
        }
        else {
          this.billItem[i].total = this.billItem[i].totalBeforeTax;

        }
      }
      else {
        this.billItem[i].total = this.billItem[i].totalBeforeTax;

      }

      if (this.billType[0].affectOnCostPrice == true && (this.billType[0].kind == BillKindEnum['Purchases Bill'] || this.billType[0].kind == BillKindEnum['Purchases Returns Bill'])) {

        totalQuantity = this.billItem[i].quantity * this.billItem[i].unitTransactionFactor;
        totalCostPrice = this.billItem[i].quantity * this.billItem[i].price;

        if (this.billType[0].additionAffectsCostPrice) {
          totalCostPrice = totalCostPrice + this.billItem[i]?.additionValue ?? 0
        }
        if (this.billType[0].discountAffectsCostPrice) {
          totalCostPrice = totalCostPrice - this.billItem[i]?.discountValue ?? 0

        }
        if (this.billType[0].taxAffectsCostPrice) {
          totalCostPrice = totalCostPrice + this.billItem[i]?.totalTax ?? 0

        }
        this.billItem[i].totalQuantity = Number(totalQuantity);
        this.billItem[i].totalCostPrice = Number(totalCostPrice);


      }
      this.billItem[i].additionRatio = 0;
      this.billItem[i].additionValue = 0;
      this.billItem[i].discountRatio = 0;
      this.billItem[i].discountValue = 0;
      this.calculateValues();
    }

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


      if (this.billItemTax != null) {

        this.selectedBillItem.totalTax = 0;
        this.selectedBillItem.total = 0;
        this.billItemTax.forEach(element => {
          if (this.billType[0].calculatingTaxOnPriceAfterDeductionAndAddition == true) {

            this.selectedBillItem.totalTax += Math.round((Number(Number(this.selectedBillItem.quantity * this.selectedBillItem.price) + Number(this.selectedBillItem.additionValue) - Number(this.selectedBillItem.discountValue)) * (element.taxRatio / 100)));
            element.taxValue = (Number(Number(this.selectedBillItem.quantity * this.selectedBillItem.price) + Number(this.selectedBillItem.additionValue) - Number(this.selectedBillItem.discountValue)) * (element.taxRatio / 100));

          }
          else {

            this.selectedBillItem.totalTax += Math.round((Number(this.selectedBillItem.quantity * this.selectedBillItem.price * (element.taxRatio / 100))));

            element.taxValue = Number(this.selectedBillItem.quantity * this.selectedBillItem.price * (element.taxRatio / 100));

          }
        });
        if (this.billType[0].calculatingTaxOnPriceAfterDeductionAndAddition == true) {
          this.selectedBillItem.total =
            Number(this.selectedBillItem.quantity * this.selectedBillItem.price) + Number(this.selectedBillItem.additionValue) - Number(this.selectedBillItem.discountValue)
            + this.selectedBillItem.totalTax;
        }
        else {
          this.selectedBillItem.total =
            Number(this.selectedBillItem.quantity * this.selectedBillItem.price) + Number(this.selectedBillItem.additionValue) - Number(this.selectedBillItem.discountValue)
            + this.selectedBillItem.totalTax;
        }
      }

    }
    else {
      this.selectedBillItem.total =
        Number(this.selectedBillItem.quantity * this.selectedBillItem.price) + Number(this.selectedBillItem.additionValue) - Number(this.selectedBillItem.discountValue);

    }



  }

  onChangeAdditionOrDiscountRatioAdded(a: any, i: number) {
    var totalQuantity = 0;
    var totalCostPrice = 0;
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


      if (this.billItemTax != null) {

        this.billItem[i].totalTax = 0;
        this.billItem[i].total = 0;
        this.billItemTax.forEach(element => {
          if (this.billType[0].calculatingTaxOnPriceAfterDeductionAndAddition == true) {

            this.billItem[i].totalTax += Math.round((Number(Number(this.billItem[i].quantity * this.billItem[i].price) + Number(this.billItem[i].additionValue) - Number(this.billItem[i].discountValue)) * (element.taxRatio / 100)));
            element.taxValue = (Number(Number(this.billItem[i].quantity * this.billItem[i].price) + Number(this.billItem[i].additionValue) - Number(this.billItem[i].discountValue)) * (element.taxRatio / 100));

          }
          else {

            this.billItem[i].totalTax += Math.round(Number(this.billItem[i].quantity * this.billItem[i].price * (element.taxRatio / 100)));

            element.taxValue = Number(this.billItem[i].quantity * this.billItem[i].price * (element.taxRatio / 100));


          }
        });
        if (this.billType[0].calculatingTaxOnPriceAfterDeductionAndAddition == true) {
          this.billItem[i].total =
            Number(this.billItem[i].quantity * this.billItem[i].price) + Number(this.billItem[i].additionValue) - Number(this.billItem[i].discountValue)
            + this.billItem[i].totalTax;
        }
        else {
          this.billItem[i].total =
            Number(this.billItem[i].quantity * this.billItem[i].price) + Number(this.billItem[i].additionValue) - Number(this.billItem[i].discountValue)
            + this.billItem[i].totalTax;
        }
      }

    }
    else {
      this.billItem[i].total =
        Number(this.billItem[i].quantity * this.billItem[i].price) + Number(this.billItem[i].additionValue) - Number(this.billItem[i].discountValue);

    }
    if (this.billType[0].affectOnCostPrice == true && (this.billType[0].kind == BillKindEnum['Purchases Bill'] || this.billType[0].kind == BillKindEnum['Purchases Returns Bill'])) {
      totalQuantity = this.billItem[i].quantity * this.billItem[i].unitTransactionFactor;
      totalCostPrice = this.billItem[i].quantity * this.billItem[i].price;

      if (this.billType[0].additionAffectsCostPrice) {
        totalCostPrice = totalCostPrice + this.billItem[i]?.additionValue ?? 0
      }
      if (this.billType[0].discountAffectsCostPrice) {
        totalCostPrice = totalCostPrice - this.billItem[i]?.discountValue ?? 0

      }
      if (this.billType[0].taxAffectsCostPrice) {
        totalCostPrice = totalCostPrice + this.billItem[i]?.totalTax ?? 0

      }
      this.billItem[i].totalQuantity = Number(totalQuantity);
      this.billItem[i].totalCostPrice = Number(totalCostPrice);

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
    this.calculateValues();

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
  }

  getNetAfterTax(type: any) {

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
    if (this.billType[0].accountingEffect == CreateFinancialEntryEnum['Create the entry automatically']) {
      if (this.billType[0].kind != BillKindEnum['First Period Goods Bill']) {
        if (this.selectedBillAdditionAndDiscount.accountId == null) {
          this.errorMessage = this.translate.instant("bill.account-required");
          this.errorClass = 'errorMessage';
          this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
          return;
        }
      }
    }
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
    this.clearSelectedBilladditionDiscountData();
    this.calculateValues();
  }
  openItemTax(i) {
    this.selectedBillItemTax = this.billItemTax.filter(x => x.billItemId == i);
    let itemTaxDialog: any = <any>document.getElementById("itemTaxDialog");
    itemTaxDialog.showModal();

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

