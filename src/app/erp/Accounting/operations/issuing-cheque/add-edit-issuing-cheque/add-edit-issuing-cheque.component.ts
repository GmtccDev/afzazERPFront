import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SharedService } from '../../../../../shared/common-services/shared-service';
import { ToolbarPath } from '../../../../../shared/interfaces/toolbar-path';
import { NgxSpinnerService } from 'ngx-spinner';
import { CODE_REQUIRED_VALIDATORS } from '../../../../../shared/constants/input-validators';
import { Subscription } from 'rxjs';
import { ToolbarData } from '../../../../../shared/interfaces/toolbar-data';
import { ToolbarActions } from '../../../../../shared/enum/toolbar-actions';
import { navigateUrl } from '../../../../../shared/helper/helper-url';
import { IssuingChequeServiceProxy } from '../../../services/issuing-cheque.services';
import { PublicService } from 'src/app/shared/services/public.service';
import { NotificationsAlertsService } from 'src/app/shared/common-services/notifications-alerts.service';
import { GeneralConfigurationServiceProxy } from '../../../services/general-configurations.services';
import { AccountClassificationsEnum, BeneficiaryTypeArEnum, BeneficiaryTypeEnum, ChequeStatusEnum, GeneralConfigurationEnum, convertEnumToArray } from 'src/app/shared/constants/enumrators/enums';
import { ICustomEnum } from 'src/app/shared/interfaces/ICustom-enum';
import { DateCalculation, DateModel } from 'src/app/shared/services/date-services/date-calc.service';
import { CurrencyServiceProxy } from 'src/app/erp/master-codes/services/currency.servies';
import { ModuleType } from '../../../models/general-configurations';
import { FiscalPeriodServiceProxy } from '../../../services/fiscal-period.services';
import { FiscalPeriodStatus } from 'src/app/shared/enum/fiscal-period-status';
import { format } from 'date-fns';
import { DateConverterService } from 'src/app/shared/services/date-services/date-converter.service';
import { AccountingPeriodServiceProxy } from '../../../services/accounting-period.service';
import { ReportViewerService } from '../../../reports/services/report-viewer.service';
import { stringIsNullOrEmpty } from 'src/app/shared/helper/helper';
import { AccountServiceProxy } from '../../../services/account.services';

@Component({
  selector: 'app-add-edit-issuing-cheque',
  templateUrl: './add-edit-issuing-cheque.component.html',
  styleUrls: ['./add-edit-issuing-cheque.component.scss']
})
export class AddEditIssuingChequeComponent implements OnInit {
  //#region Main Declarations
  branchId: string = localStorage.getItem("branchId");
  companyId: string = localStorage.getItem("companyId");
  issuingChequeForm!: FormGroup;
  id: any = 0;
  currnetUrl;
  fiscalPeriodId: number;
  fiscalPeriodName: string;
  fiscalPeriodStatus: number;
  public show: boolean = false;
  balance: number = 0;
  tempListDetail: any[] = [];
  oldAmountLocal: number = 0;
  accountingPeriods: any;
  accountingPeriodCheckDate: any;
  lang = localStorage.getItem("language")
  issuingCheque: [] = [];
  addUrl: string = '/accounting-operations/issuingCheque/add-issuingCheque';
  updateUrl: string = '/accounting-operations/issuingCheque/update-issuingCheque/';
  listUrl: string = '/accounting-operations/issuingCheque';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.issuing-cheque"),
    componentAdd: '',

  };
  accountExchangeId: any;

  showSearchBankAccountModal = false;
  fromDate: any;
  toDate: any;
  currencyId: any;
  amount: number = 0;
  amountLocal: number = 0;
  mainCurrencyId: number;
  errorMessage = '';
  errorClass = '';
  submited: boolean = false;
  showSearchModal = false;
  showSearchModalCountry = false;
  showAccountsModalDebit = false;
  showAccountsModalCredit = false;
  showCostCenterModal = false;
  routeFiscalPeriodApi = "FiscalPeriod/get-ddl?"
  routeJournalApi = 'Journal/get-ddl?'
  routeCostCenterApi = 'CostCenter/get-ddl?'
  routeCurrencyApi = "Currency/get-ddl?"
  routeAccountApi = 'Account/GetLeafAccounts?'
  routeBankAccountApi = 'Account/GetLeafAccounts?AccountClassificationId=' + AccountClassificationsEnum.Bank
  routeCustomerApi = 'CustomerCard/get-ddl?'
  routeSupplierApi = 'SupplierCard/get-ddl?'
  journalList: any;
  costCenterList: any;
  currencyList: any;
  fiscalPeriodList: any;
  counter: number;
  bankAccountList: any;
  accountDetailsList: any;
  beneficiaryAccountList: any;
  index: any;
  totalamount: number;
  totalDebit: number;
  totalDebitLocal: number;
  checkPeriod: any;
  isMultiCurrency: boolean = false;
  serial: any;
  serialList: { nameAr: string; nameEn: string; value: string; }[];
  fiscalPeriod: any;
  beneficiaryTypesEnum: ICustomEnum[] = [];
  date!: DateModel;
  dueDate!: DateModel;
  currencyFactor: number;
  currency: any;
  accountList: any;
  customerList: any;
  supplierList: any;
  filterBeneficiaryList: any;

  constructor(
    private issuingChequeService: IssuingChequeServiceProxy,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private sharedServices: SharedService, private translate: TranslateService,
    private cd: ChangeDetectorRef,
    private publicService: PublicService,
    private alertsService: NotificationsAlertsService,
    private generalConfigurationService: GeneralConfigurationServiceProxy,
    private dateService: DateCalculation,
    private currencyServiceProxy: CurrencyServiceProxy,
    private fiscalPeriodService: FiscalPeriodServiceProxy,
    private reportViewerService: ReportViewerService,
    private accountService: AccountServiceProxy,
    private dateConverterService: DateConverterService,
    private accountingPeriodServiceProxy: AccountingPeriodServiceProxy,




  ) {
    this.defineIssuingChequeForm();
  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {

    this.getBeneficiaryTypes();
    this.spinner.show();
    Promise.all([
      this.getGeneralConfiguration(),
      this.getCostCenter(),
      this.getCurrency(),
      this.getAccount(),
      this.getBankAccount(),
      this.getCustomers(),
      this.getSuppliers()

    ]).then(a => {
      this.getRouteData();
      this.currnetUrl = this.router.url;
      if (this.currnetUrl == this.addUrl) {
        this.getIssuingChequeCode();
        if (this.mainCurrencyId > 0) {
          this.currencyId = Number(this.mainCurrencyId);
          this.getAmount();
        }
      }
      this.changePath();
      this.listenToClickedButton();
    }).catch(err => {
      this.spinner.hide();
    });




  }
  getRouteData() {
    let sub = this.route.params.subscribe((params) => {
      if (params['id'] != null) {
        this.id = params['id'];

        if (this.id > 0) {
          this.getIssuingChequeById(this.id).then(a => {
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
        this.sharedServices.changeButton({ action: 'New' } as ToolbarData);
        this.spinner.hide();
      }
    });
    this.subsList.push(sub);

  }
  onSelectJournal(event) {

    this.issuingChequeForm.controls.accountId.setValue(event.id);
    this.showSearchModal = false;
  }
  onSelectCountry(event) {


    this.issuingChequeForm.controls.countryId.setValue(event.id);
    this.showSearchModalCountry = false;
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
  getBeneficiaryTypes() {

    if (this.lang == 'en') {
      this.beneficiaryTypesEnum = convertEnumToArray(BeneficiaryTypeEnum);
    }
    else {
      this.beneficiaryTypesEnum = convertEnumToArray(BeneficiaryTypeArEnum);

    }
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



  getGeneralConfiguration() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.generalConfigurationService.allGeneralConfiguration(ModuleType.Accounting, undefined, undefined, undefined, undefined, undefined).subscribe({
        next: (res) => {
          resolve();
          if (res.success && res.response.result.items.length > 0) {
            this.isMultiCurrency = res.response.result.items.find(c => c.id == GeneralConfigurationEnum.MultiCurrency).value == "true" ? true : false;
            this.serial = res.response.result.items.find(c => c.id == GeneralConfigurationEnum.JournalEntriesSerial).value;
            this.mainCurrencyId = res.response.result.items.find(c => c.id == GeneralConfigurationEnum.MainCurrency).value;
            this.fiscalPeriodId = res.response.result.items.find(c => c.id == GeneralConfigurationEnum.AccountingPeriod).value;
            this.accountExchangeId = res.response.result.items.find(c => c.id == GeneralConfigurationEnum.AccountExchange).value;

            if (this.fiscalPeriodId > 0) {
              this.getfiscalPeriodById(this.fiscalPeriodId);
              this.getClosedAccountingPeriodsByFiscalPeriodId(this.fiscalPeriodId);

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
  defineIssuingChequeForm() {
    this.issuingChequeForm = this.fb.group({
      id: 0,
      date: ['', Validators.compose([Validators.required])],
      code: CODE_REQUIRED_VALIDATORS,
      isActive: true,
      dueDate: ['', Validators.compose([Validators.required])],
      notes: null,
      bankAccountId: ['', Validators.compose([Validators.required])],
      amount: ['', Validators.compose([Validators.required])],
      amountLocal: ['', Validators.compose([Validators.required])],
      currencyId: [null, Validators.compose([Validators.required])],
      currencyFactor: '',
      companyId: this.companyId,
      branchId: this.branchId,
      status: 0,
      fiscalPeriodId: this.fiscalPeriodId,

      issuingChequeDetail: this.fb.array([]),
      issuingChequeStatusDetail: this.fb.array([])

    });
    this.date = this.dateService.getCurrentDate();
    this.dueDate = this.dateService.getCurrentDate();
    // this.initGroup();


    const ctrl = <FormArray>this.issuingChequeForm.controls['issuingChequeDetail'];

    this.issuingChequeForm.get('issuingChequeDetail').valueChanges.subscribe(values => {

      // this.totalamount = 0;
      // const ctrl = <FormArray>this.issuingChequeForm.controls['issuingChequeDetail'];
      // ctrl.controls.forEach(x => {
      //   let parsed = parseInt(x.get('amount').value)
      //   this.totalamount += parsed

      //   this.cd.detectChanges()
      // });
    })
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
  getDate(selectedDate: DateModel) {
    this.date = selectedDate;
  }
  getDueDate(selectedDate: DateModel) {
    this.dueDate = selectedDate;
  }
  get jEMasterStatusId() {

    return this.issuingChequeForm.controls['jEMasterStatusId'].value;
  }
  get issuingChequeDetailList(): FormArray { return this.issuingChequeForm.get('issuingChequeDetail') as FormArray; }
  initGroup() {
    this.counter += 1;
    let issuingChequeDetail = this.issuingChequeForm.get('issuingChequeDetail') as FormArray;
    if (issuingChequeDetail.length > 0) {
      this.alertsService.showError(
        this.translate.instant("incoming-cheque.can-not-add-more-than-one-detail"),
        ""
      )
      return;
    }
    // if (issuingChequeDetail.length > 0) {
    //   this.amountLocal = this.amountLocal + this.issuingChequeForm.get('issuingChequeDetail').value[0].currencyLocal;
    //   if (this.issuingChequeForm.value.currencyId == this.mainCurrencyId) {
    //     this.amount = this.amountLocal;

    //   }
    //   else {
    //     let currencyModel = this.currencyList.find(x => x.id == this.issuingChequeForm.value.currencyId);
    //     this.amount = currencyModel.transactionFactor * this.amountLocal;

    //   }

    // }
    issuingChequeDetail.push(this.fb.group({
      id: [null],
      issuingChequeId: [null],
      accountId: [''],
      beneficiaryTypeId: [null],
      currencyId: [null],
      transactionFactor: [null],
      notes: [''],
      amount: [0.0],
      currencyLocal: [null],
      beneficiaryId: [null],
      iCDetailSerial: [this.counter]
    }, {
      validator: this.atLeastOne(Validators.required, ['amount', 'amount']),

    },

    ));
  }
  getAmount() {
    if (this.currencyId == this.mainCurrencyId) {
      this.amount = this.amountLocal;
      this.currencyFactor = 1;
    }
    else {
      let sub = this.currencyServiceProxy.getCurrency(this.currencyId).subscribe({
        next: (res: any) => {

          this.currency = res;
          let currencyModel = this.currency.response.currencyTransactionsDto.filter(x => x.currencyDetailId == this.mainCurrencyId)[0];
          this.currencyFactor = 1 / currencyModel.transactionFactor;
          this.amount = (1 / currencyModel.transactionFactor) * this.amountLocal;
        }
      })
      this.subsList.push(sub);

    }
  }
  onDeleteRow(rowIndex) {

    let issuingChequeDetail = this.issuingChequeForm.get('issuingChequeDetail') as FormArray;
    issuingChequeDetail.removeAt(rowIndex);
    this.counter -= 1;
    this.amount = 0;
    this.amountLocal = 0;
    this.currencyFactor = 0;
    this.currencyId = null;
  }
  atLeastOne = (validator: ValidatorFn, controls: string[]) => (
    group: FormGroup,
  ): ValidationErrors | 0 => {
    if (!controls) {
      controls = Object.keys(group.controls)
    }

    const hasAtLeastOne = group && group.controls && controls
      .some(k => !validator(group.controls[k]));

    return hasAtLeastOne ? 0 : {
      atLeastOne: true,
    };
  };
  //#endregion
  get issuingChequeDetailDTOList(): FormArray { return this.issuingChequeForm.get('issuingChequeDetail') as FormArray; }
  get issuingChequeDetailStatusDTOList(): FormArray { return this.issuingChequeForm.get('issuingChequeStatusDetail') as FormArray; }

  //#region CRUD operations
  getIssuingChequeById(id: any) {
    return new Promise<void>((resolve, reject) => {
      let sub = this.issuingChequeService.getIssuingCheque(id).subscribe({
        next: (res: any) => {
          resolve();
          this.issuingChequeForm = this.fb.group({
            id: res.response?.id,
            date: this.dateService.getDateForCalender(res.response.date),
            code: res.response?.code,
            isActive: res.response?.isActive,
            dueDate: this.dateService.getDateForCalender(res.response.dueDate),
            notes: res.response?.notes,
            bankAccountId: res.response?.bankAccountId,
            amount: res.response?.amount,
            amountLocal: res.response?.amountLocal,
            status: res.response?.status,
            statusName: res.response?.status,
            currencyId: res.response?.currencyId,
            currencyFactor: res.response?.currencyFactor,
            fiscalPeriodId: res.response?.fiscalPeriodId,

            issuingChequeDetail: this.fb.array([]),
            issuingChequeStatusDetail: this.fb.array([])


          });
          this.date = this.dateService.getDateForCalender(res.response.date);
          this.dueDate = this.dateService.getDateForCalender(res.response.dueDate);
          let ListDetail = res.response?.issuingChequeDetail;
          this.tempListDetail = res.response?.issuingChequeDetail;
          this.oldAmountLocal = res.response.amountLocal;

          this.issuingChequeDetailDTOList.clear();
          ListDetail.forEach(element => {
            this.getBeneficiaryList(element.beneficiaryTypeId);
            this.issuingChequeDetailDTOList.push(this.fb.group({
              id: element.id,
              issuingChequeId: element.issuingChequeId,
              beneficiaryTypeId: element.beneficiaryTypeId,
              beneficiaryId: element.beneficiaryId,
              accountId: element.accountId,
              currencyId: element.currencyId,
              transactionFactor: element.transactionFactor,
              notes: element.notes,
              amount: element.amount,
              currencyLocal: element.currencyLocal,
              iCDetailSerial: this.counter
            }, { validator: this.atLeastOne(Validators.required, ['amount', 'amount']) }
            ));


            this.counter = element.jeDetailSerial;
          });

          let ListDetailStatus = res.response?.issuingChequeStatusDetails;
          this.issuingChequeDetailStatusDTOList.clear();
          ListDetailStatus.forEach(element => {

            if (element.status == ChequeStatusEnum.Registered) {
              element.statusName = this.translate.instant("incoming-cheque.registered");
            }
            if (element.status == ChequeStatusEnum.EditRegistered) {
              element.statusName = this.translate.instant("incoming-cheque.edit-registered");
            }
            else if (element.status == ChequeStatusEnum.Collected) {
              element.statusName = this.translate.instant("incoming-cheque.collected");

            }
            else if (element.status == ChequeStatusEnum.Rejected) {
              element.statusName = this.translate.instant("incoming-cheque.rejected");

            }
            else if (element.status == ChequeStatusEnum.CancelCollected) {
              element.statusName = this.translate.instant("incoming-cheque.cancel-collect");

            }
            else if (element.status == ChequeStatusEnum.CancelRejected) {
              element.statusName = this.translate.instant("incoming-cheque.cancel-reject");

            }
            this.issuingChequeDetailStatusDTOList.push(this.fb.group({
              date: format(new Date(element.date), 'MM/dd/yyyy'),
              status: element.status,
              statusName: element.statusName


            }
            ));


          });


          const ctrl = <FormArray>this.issuingChequeForm.controls['issuingChequeDetail'];

          this.issuingChequeForm.get('issuingChequeDetail').valueChanges.subscribe(values => {
            // this.totalamount = 0;
            // const ctrl = <FormArray>this.issuingChequeForm.controls['issuingChequeDetail'];
            // ctrl.controls.forEach(x => {
            //   let parsed = parseInt(x.get('amount').value)
            //   this.totalamount += parsed

            //   this.cd.detectChanges()
            // });
          })

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

  getIssuingChequeCode() {
    return new Promise<void>((resolve, reject) => {

      let sub = this.issuingChequeService.getLastCode().subscribe({

        next: (res: any) => {

          this.toolbarPathData.componentList = this.translate.instant("component-names.issuing-cheque");
          this.issuingChequeForm.patchValue({
            code: res.response
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
  //#endregion

  //#region Helper Functions

  get f(): { [key: string]: AbstractControl } {
    return this.issuingChequeForm.controls;
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
            this.toolbarPathData.componentAdd = this.translate.instant("issuing-cheque.add-issuing-cheque");
            if (this.issuingChequeForm.value.code != null) {
              this.getIssuingChequeCode()
            }
            this.defineIssuingChequeForm();
            this.sharedServices.changeToolbarPath(this.toolbarPathData);
          } else if (currentBtn.action == ToolbarActions.Update && currentBtn.submitMode) {

            this.onUpdate();
          }
          else if (currentBtn.action == ToolbarActions.Copy) {
            this.getIssuingChequeCode();
          }
          else if (currentBtn.action == ToolbarActions.Print) {

            // let reportParams: string =
            //   "reportParameter=id!" + this.id
            //   + "&reportParameter=lang!" + this.lang
            // const modalRef = this.modalService.open(NgbdModalContent);
            // modalRef.componentInstance.reportParams = reportParams;
            // modalRef.componentInstance.reportType = 1;
            // modalRef.componentInstance.reportTypeID = 10

            let reportType = 1;
            let reportTypeId = 10;
            this.reportViewerService.gotoViewer(reportType, reportTypeId, this.id);
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
      var entity = this.issuingChequeForm.value;

      entity.date = this.dateService.getDateForInsert(entity.date);
      entity.dueDate = this.dateService.getDateForInsert(entity.dueDate);
      let sub = this.issuingChequeService.createIssuingCheque(entity).subscribe({
        next: (result: any) => {

          this.spinner.show();
          this.defineIssuingChequeForm();
          this.submited = false;
          this.spinner.hide();
          navigateUrl(this.listUrl, this.router);
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

    // if (this.checkPeriod == null) {
    //   this.alertsService.showError(
    //     'يجب أن يكون السنة المالية مفتوحة و السنة المالية مفتوحة',
    //     "",

    //   )
    //   return;
    // }
    if (this.issuingChequeForm.valid) {
      if (this.fiscalPeriodStatus != FiscalPeriodStatus.Opened) {
        if (this.fiscalPeriodStatus == null) {
          this.errorMessage = this.translate.instant("incoming-cheque.no-add-cheque-fiscal-period-choose-open-fiscal-period");

        }
        else {
          this.errorMessage = this.translate.instant("incoming-cheque.no-add-cheque-fiscal-period-closed") + " : " + this.fiscalPeriodName;

        }
        this.errorClass = 'errorMessage';
        this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
        return;
      }
      else {
            
        let _date = this.dateConverterService.getDateTimeForInsertISO_Format(this.date);
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
      if (stringIsNullOrEmpty(this.accountExchangeId)) {
        this.errorMessage = this.translate.instant("general.account-exchange-required");
        this.errorClass = 'errorMessage';
        this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
        return;


      }
      let chequeDate = this.issuingChequeForm.controls["date"].value;
      let date = this.dateConverterService.getDateTimeForInsertISO_Format(chequeDate);



      if (!(date >= this.fromDate && date <= this.toDate)) {

        this.errorMessage = this.translate.instant("general.date-out-fiscal-period");
        this.errorClass = 'errorMessage';
        this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
        return;
      }


      this.totalamount = 0;
      const ctrl = <FormArray>this.issuingChequeForm.controls['issuingChequeDetail'];

      ctrl.controls.forEach(x => {
        let parsed = parseInt(x.get('amount').value)
        this.totalamount += parsed

        this.cd.detectChanges()
      });
      if ((this.totalamount == 0)) {
        this.alertsService.showError(
          this.translate.instant("incoming-cheque.sum-values-equal-to-cheque-details"),
          ""
        )
        return;
      }
      // if ((this.totalamount !== this.issuingChequeForm.value.amount)) {
      //   this.alertsService.showError(
      //     this.translate.instant("incoming-cheque.sum-values-equal-to-cheque-details"),
      //     ""
      //   )
      //   return;
      // }

      //  var entity = new CreateissuingChequeCommand();
      var issuingChequeDetail = this.issuingChequeForm.get('issuingChequeDetail') as FormArray;
      var i = 0;

      if (issuingChequeDetail != null) {
        this.issuingChequeForm.value.issuingChequeDetail.forEach(element => {

          if (element.accountId != null) {
            var value = 0;
            if (element.jEDetailDebitLocal > 0) {
              value = element.jEDetailDebitLocal;
            }
            if (element.jEDetailCreditLocal > 0) {
              value = element.jEDetailCreditLocal;

            }

            this.getAccountBalance(element.accountId).then(a => {
              var account = this.accountList.find(x => x.id == element.accountId);

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
      this.getAccountBalance(this.accountExchangeId).then(a => {
        var account = this.accountList.find(x => x.id == this.accountExchangeId);

        var accountName = this.lang == 'ar' ? account.nameAr : account.nameEn;

        if (Number(this.balance) > 0 && account.debitLimit > 0) {

          if (Number(this.balance) + this.amountLocal > account.debitLimit) {


            this.errorMessage = this.translate.instant('general.debit-limit-exceed-account') + " : " + accountName + "(" + this.translate.instant('accounting-configration.account-exchange') + ")" + this.translate.instant('general.code') + " : " + account.code;
            this.errorClass = 'errorMessage';
            this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
            i++;
          }

        }
        else if (Number(this.balance) < 0 && account.creditLimit > 0) {

          if (-(this.balance) + this.amountLocal > account.creditLimit) {

            this.errorMessage = this.translate.instant('general.credit-limit-exceed-account') + " : " + accountName + "(" + this.translate.instant('accounting-configration.account-exchange') + ")" + this.translate.instant('general.code') + " : " + account.code;
            this.errorClass = 'errorMessage';
            this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
            i++;
          }


        }


      });
      setTimeout(() => {
        if (i == 0) {

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
      return this.issuingChequeForm.markAllAsTouched();
    }
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
  onChangeCurrency(event, index) {
    // this.amount = 0;
    // this.amountLocal = 0;
    // this.currencyFactor = 0;
    // this.currencyId = null;
    return new Promise<void>((resolve, reject) => {
      let sub = this.currencyServiceProxy.getCurrency(event.target.value).subscribe({
        next: (res: any) => {
          resolve();
          this.currency = res;
          if (event.target.value == this.mainCurrencyId) {
            const faControl =
              (<FormArray>this.issuingChequeForm.controls['issuingChequeDetail']).at(index);
            faControl['controls'].transactionFactor.setValue(1);
            faControl['controls'].currencyLocal.setValue(1 * faControl['controls'].amount.value);
            faControl['controls'].iCDetailSerial.setValue(index + 1);

          }
          else {
            let currencyModel = this.currency.response.currencyTransactionsDto.filter(x => x.currencyDetailId == this.mainCurrencyId)[0];
            const faControl =
              (<FormArray>this.issuingChequeForm.controls['issuingChequeDetail']).at(index);
            faControl['controls'].transactionFactor.setValue(currencyModel.transactionFactor);
            faControl['controls'].currencyLocal.setValue(currencyModel.transactionFactor * faControl['controls'].amount.value);
            faControl['controls'].iCDetailSerial.setValue(index + 1);
          }
          let issuingChequeDetail = this.issuingChequeForm.get('issuingChequeDetail') as FormArray;
          if (issuingChequeDetail.length > 0) {
            this.amountLocal =
              //this.amountLocal + 
              this.issuingChequeForm.get('issuingChequeDetail').value[index].currencyLocal;
            if (event.target.value == this.mainCurrencyId) {
              this.amount = this.amountLocal;

            }
            else {
              let currencyModel = this.currencyList.find(x => x.id == event.target.value);
              this.amount = currencyModel.transactionFactor * this.amountLocal;

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
  confirmUpdate() {
    return new Promise<void>((resolve, reject) => {
      var entity = this.issuingChequeForm.value;
      if (entity.status == ChequeStatusEnum.Collected || entity.status == ChequeStatusEnum.Rejected) {
        this.spinner.hide();
        this.alertsService.showError(
          this.translate.instant("incoming-cheque.cannot-edit"),
          ""
        )
        return;
      }
      entity.status = ChequeStatusEnum.EditRegistered;
      entity.date = this.dateService.getDateForInsert(entity.date);
      entity.dueDate = this.dateService.getDateForInsert(entity.dueDate);

      let sub = this.issuingChequeService.updateIssuingCheque(entity).subscribe({
        next: (result: any) => {
          this.spinner.show();
          this.submited = false;
          this.spinner.hide();

          navigateUrl(this.listUrl, this.router);
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
    if (this.issuingChequeForm.valid) {
      this.totalamount = 0;
      const ctrl = <FormArray>this.issuingChequeForm.controls['issuingChequeDetail'];
      ctrl.controls.forEach(x => {
        let parsed = parseInt(x.get('amount').value)
        this.totalamount += parsed

        this.cd.detectChanges()
      });

      // if ((this.totalamount!= this.issuingChequeForm.value.amount)) {
      //   this.alertsService.showError(
      //     this.translate.instant("incoming-cheque.sum-values-equal-to-cheque-details"),
      //             ""
      //   )
      //   return;
      // }
      //  var entity = new CreateissuingChequeCommand();

      if (this.fiscalPeriodStatus != FiscalPeriodStatus.Opened) {
        this.errorMessage = this.translate.instant("incoming-cheque.no-update-cheque-fiscal-period-closed") + " : " + this.fiscalPeriodName;
        this.errorClass = 'errorMessage';
        this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
        return;
      }
      else {
        let _date = this.dateConverterService.getDateTimeForInsertISO_Format(this.date);
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
      if (stringIsNullOrEmpty(this.accountExchangeId)) {
        this.errorMessage = this.translate.instant("general.account-exchange-required");
        this.errorClass = 'errorMessage';
        this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
        return;


      }
      let chequeDate = this.issuingChequeForm.controls["date"].value;
      let date = this.dateConverterService.getDateTimeForInsertISO_Format(chequeDate);

      if (!(date >= this.fromDate && date <= this.toDate)) {

        this.errorMessage = this.translate.instant("general.date-out-fiscal-period");
        this.errorClass = 'errorMessage';
        this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
        return;
      }
      var issuingChequeDetail = this.issuingChequeForm.get('issuingChequeDetail') as FormArray;
      var i = 0;

      if (issuingChequeDetail != null) {
        this.issuingChequeForm.value.issuingChequeDetail.forEach(element => {
          var oldElement = this.tempListDetail.find(x => x.accountId == element.accountId);

          if (element.accountId != null) {
            var value = 0;
            if (element.jEDetailDebitLocal > 0) {
              value = element.jEDetailDebitLocal;
            }
            if (element.jEDetailCreditLocal > 0) {
              value = element.jEDetailCreditLocal;

            }

            this.getAccountBalance(element.accountId).then(a => {
              var account = this.accountList.find(x => x.id == element.accountId);

              var accountName = this.lang == 'ar' ? account.nameAr : account.nameEn;

              if (Number(this.balance) > 0 && account.debitLimit > 0) {

                if (Number(this.balance) + value - oldElement.jeDetailDebitLocal > account.debitLimit) {


                  this.errorMessage = this.translate.instant('general.debit-limit-exceed-account') + " : " + accountName + this.translate.instant('general.code') + " : " + account.code;
                  this.errorClass = 'errorMessage';
                  this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
                  i++;
                }

              }
              else if (Number(this.balance) < 0 && account.creditLimit > 0) {

                if (-(this.balance) + value - oldElement.jeDetailCreditLocal > account.creditLimit) {

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
      this.getAccountBalance(this.accountExchangeId).then(a => {
        var account = this.accountList.find(x => x.id == this.accountExchangeId);

        var accountName = this.lang == 'ar' ? account.nameAr : account.nameEn;

        if (Number(this.balance) > 0 && account.debitLimit > 0) {

          if (Number(this.balance) + this.amountLocal - this.oldAmountLocal > account.debitLimit) {


            this.errorMessage = this.translate.instant('general.debit-limit-exceed-account') + " : " + accountName + "(" + this.translate.instant('accounting-configration.account-exchange') + ")" + this.translate.instant('general.code') + " : " + account.code;
            this.errorClass = 'errorMessage';
            this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
            i++;
          }

        }
        else if (Number(this.balance) < 0 && account.creditLimit > 0) {

          if (-(this.balance) + this.amountLocal - this.oldAmountLocal > account.creditLimit) {

            this.errorMessage = this.translate.instant('general.credit-limit-exceed-account') + " : " + accountName + "(" + this.translate.instant('accounting-configration.account-exchange') + ")" + this.translate.instant('general.code') + " : " + account.code;
            this.errorClass = 'errorMessage';
            this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
            i++;
          }


        }


      });
      setTimeout(() => {
        if (i == 0) {

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
      return this.issuingChequeForm.markAllAsTouched();
    }
  }


  getAccount() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeAccountApi).subscribe({
        next: (res) => {
          if (res.success) {
            this.accountList = res.response;
            // this.beneficiaryAccountList = res.response;

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
            this.customerList = res.response;

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
            this.supplierList = res.response;

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
  getBankAccount() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeBankAccountApi).subscribe({
        next: (res) => {
          if (res.success) {
            this.bankAccountList = res.response;

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
        },
      });

      this.subsList.push(sub);
    });

  }
  ClickAccount(i) {
    this.showAccountsModalDebit = true;
    this.index = i;

  }

  numberOnly(event, i, type): boolean {
    this.index = i;
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;

  }
  onInput(event, i): boolean {

    this.index = i;
    // if (type == 'Credit') {
    const faControl = (<FormArray>this.issuingChequeForm.controls['issuingChequeDetail']).at(i);
    //   faControl['controls'].amount.setValue(0);

    let amount = faControl['controls'].amount.value;
    // let amount = faControl['controls'].amount.value;
    let transactionFactor = faControl['controls'].transactionFactor.value;
    if (this.isMultiCurrency == false) {
      faControl['controls'].transactionFactor.setValue(1);

      faControl['controls'].currencyId.value = this.mainCurrencyId;
    }
    if (transactionFactor != null) {
      faControl['controls'].currencyLocal.setValue(amount * transactionFactor);
      // faControl['controls'].amountLocal.setValue(amount * transactionFactor);
    }

    this.amount = amount;
    this.currencyFactor = faControl['controls'].transactionFactor.value;
    this.amountLocal = faControl['controls'].currencyLocal.value;

    this.getAmount();


    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;

  }
  ClickCostCenter(i) {
    this.showCostCenterModal = true;
    this.index = i;

  }
  onSelectBankAccount(event) {
    this.issuingChequeForm.controls.bankAccountId.setValue(event.id);
    this.showSearchBankAccountModal = false;
  }
  getBeneficiaryAccount(row) {

    if (row != null) {
      if (row.get('beneficiaryTypeId').value == BeneficiaryTypeEnum.Client || row.get('beneficiaryTypeId').value == BeneficiaryTypeEnum.Supplier) {

        row.get('accountId').value = this.filterBeneficiaryList.filter(x => x.id == Number(row.get('beneficiaryId').value))[0].accountId;


      }
      else if (row.get('beneficiaryTypeId').value == BeneficiaryTypeEnum.Account) {
        row.get('accountId').value = Number(row.get('beneficiaryId').value);
      }
    }
  }
  getBeneficiaryList(beneficiaryTypeId) {

    this.filterBeneficiaryList = [];
    if (beneficiaryTypeId != null) {
      if (beneficiaryTypeId == BeneficiaryTypeEnum.Client) {
        this.filterBeneficiaryList = this.customerList;
      }
      else if (beneficiaryTypeId == BeneficiaryTypeEnum.Supplier) {
        this.filterBeneficiaryList = this.supplierList;
      }
      else if (beneficiaryTypeId == BeneficiaryTypeEnum.Account) {
        this.filterBeneficiaryList = this.accountList;
      }
    }

  }
}

