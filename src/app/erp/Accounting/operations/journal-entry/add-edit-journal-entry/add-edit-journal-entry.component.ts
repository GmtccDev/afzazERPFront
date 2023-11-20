import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
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
import { formatDate, navigateUrl } from '../../../../../shared/helper/helper-url';
import { JournalEntryServiceProxy } from '../../../services/journal-entry'
import { PublicService } from 'src/app/shared/services/public.service';
import { NotificationsAlertsService } from 'src/app/shared/common-services/notifications-alerts.service';
import { GeneralConfigurationServiceProxy } from '../../../services/general-configurations.services';
import { AccountClassificationsEnum, EntryStatusArEnum, EntryStatusEnum, GeneralConfigurationEnum, convertEnumToArray } from 'src/app/shared/constants/enumrators/enums';
import { UserService } from 'src/app/shared/common-services/user.service';
import { DateCalculation } from 'src/app/shared/services/date-services/date-calc.service';
import { DateModel } from 'src/app/shared/model/date-model';
import { CurrencyServiceProxy } from 'src/app/erp/master-codes/services/currency.servies';
import { AccountDto } from '../../../models/account';
import { ModuleType } from '../../../models/general-configurations';
import { JournalEntryDetail } from '../../../models/journal';
import { MessageModalComponent } from 'src/app/shared/components/message-modal/message-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbdModalContent } from 'src/app/shared/components/modal/modal-component';
import { ReportServiceProxy } from 'src/app/shared/common-services/report.service';
import { ReportFile } from 'src/app/shared/model/report-file';
import { environment } from 'src/environments/environment';
import { FiscalPeriodServiceProxy } from '../../../services/fiscal-period.services';
import { FiscalPeriodStatus } from 'src/app/shared/enum/fiscal-period-status';
import { DatePipe } from '@angular/common';
import { ReportViewerService } from '../../../reports/services/report-viewer.service';
import { SearchDialogService } from 'src/app/shared/services/search-dialog.service';
@Component({
  selector: 'app-add-edit-journal-entry',
  templateUrl: './add-edit-journal-entry.component.html',
  styleUrls: ['./add-edit-journal-entry.component.scss']
})
export class AddEditJournalEntryComponent implements OnInit, OnDestroy {
  //#region Main Declarations
  userId: any = localStorage.getItem("userId");
  branchId: string = localStorage.getItem("branchId");
  companyId: string = localStorage.getItem("companyId");
  orderBy: any;
  lang = localStorage.getItem("language");
  journalEntryForm!: FormGroup;
  sub: any;
  url: any;
  id: any = 0;
  currnetUrl;
  fromDate: any;
  toDate: any;
  public show: boolean = false;
  journalEntry: [] = [];
  addUrl: string = '/accounting-operations/journalEntry/add-journalEntry';
  updateUrl: string = '/accounting-operations/journalEntry/update-journalEntry/';
  listUrl: string = '/accounting-operations/journalEntry';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.journalEntry"),
    componentAdd: '',

  };
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
  journalList: any;
  costCenterList: any;
  currencyList: any;
  fiscalPeriodList: any;
  counter: number = 0;
  accountList: any;
  index: any;
  totalCredit: number;
  totalDebit: number;
  totalDebitLocal: number;
  totalCreditLocal: number;
  checkPeriod: any;
  isMultiCurrency: boolean;
  serial: any;
  date: any = this.dateService.getCurrentDate();
  serialList: { nameAr: string; nameEn: string; value: string; }[];
  fiscalPeriod: any;
  entriesStatusEnum: any;

  showSearchCostCenterModal = false;
  showSearchBeneficiaryAccountsModal = false;
  showSearhBeneficiaryAccountsModal = false;
  showSearchCurrencyModal = false;
  showSearchCashAccountModal = false;
  listDetail: JournalEntryDetail[] = [];
  disableFlag: boolean = false;
  fiscalPeriodId: any;
  fiscalPeriodName: any;
  fiscalPeriodStatus: any;
  fiscalPeriodcheckDate: any;
  constructor(
    private journalEntryService: JournalEntryServiceProxy, private userService: UserService,
    private router: Router,
    private fb: FormBuilder,
    private currencyServiceProxy: CurrencyServiceProxy,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private sharedServices: SharedService, private translate: TranslateService,
    private cd: ChangeDetectorRef,
    private publicService: PublicService,
    private reportViewerService: ReportViewerService,
    private dateService: DateCalculation,
    private rptSrv: ReportServiceProxy,
    private alertsService: NotificationsAlertsService,
    private generalConfigurationService: GeneralConfigurationServiceProxy,
    private fiscalPeriodService: FiscalPeriodServiceProxy,
    private datePipe: DatePipe,
    private searchDialog: SearchDialogService,
    private modalService: NgbModal,
  ) {
    this.definejournalEntryForm();

  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    this.getEntriesStatusEnum();

    this.spinner.show();
    Promise.all([
      this.getGeneralConfiguration(),
      this.getJournals(),
      this.getCostCenter(),
      this.getCurrency(),
      this.getFiscalPeriod(),

      this.getAccount()
    ]).then(a => {
      this.getRouteData();
      this.currnetUrl = this.router.url;
      if (this.currnetUrl == this.addUrl) {
        this.getjournalEntryCode();
        this.getGeneralConfiguration()

        this.onChangeCode(null);
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

          this.getjournalEntryById(this.id).then(a => {
            this.spinner.hide();
            this.sharedServices.changeButton({ action: 'Update', submitMode: false, disabledPrint: false } as ToolbarData);

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

    this.journalEntryForm.controls.journalId.setValue(event.id);
    this.showSearchModal = false;
  }
  onSelectCountry(event) {


    this.journalEntryForm.controls.countryId.setValue(event.id);
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
  //#endregion

  //#region Authentications

  //#endregion

  //#region Subscriptionss

  //#endregion

  //#region  State Management
  //#endregion

  //#region Basic Data
  ///Geting form dropdown list data
  getSerial() {
    this.serialList = [
      { nameAr: 'رقم ', nameEn: 'Number', value: '1' },
      { nameAr: 'اليومية / رقم', nameEn: 'Daily/Number', value: '2' },
      { nameAr: "اليومية / الفترة المحاسبي / رقم   ", nameEn: 'Daily/Period Accounting/Number', value: '3' }
    ];
  }
  codeSerial = '';
  journal = '';
  onChangeCode(event) {
    if (this.serial == '2') {

      this.codeSerial = this.journal + "/" + this.journalEntryForm.controls['code'].value
    }
    if (this.serial == '3') {

      this.codeSerial = this.journal + "/" + this.fiscalPeriod + "/" + this.journalEntryForm.controls['code'].value
    }
  }
  onChangeJournal(event) {

    //this.journalEntryForm.controls['jEMasterStatusId'].value
    let journalModel;
    if (event != null) {
      journalModel = this.journalList?.find(x => x.id == event);
    }
    if (journalModel != null) {
      this.journal = this.lang == 'ar' ? journalModel.nameAr : journalModel.nameEn;
    }
    if (this.serial == '1') {

      this.codeSerial = this.journalEntryForm.controls['code'].value
    }
    if (this.serial == '2') {

      this.codeSerial = this.journal + "/" + this.journalEntryForm.controls['code'].value
    }
    if (this.serial == '3') {

      this.codeSerial = this.journal + "/" + this.fiscalPeriod + "/" + this.journalEntryForm.controls['code'].value
    }
  }
  onChangefiscalPeriod(event) {

    let fiscalPeriodModel = this.fiscalPeriodList?.find(x => x.id == event);
    if (fiscalPeriodModel != null) {
      this.fiscalPeriod = this.lang == 'ar' ? fiscalPeriodModel.nameAr : fiscalPeriodModel.nameEn;
      this.fromDate = fiscalPeriodModel.fromDate;
      this.toDate = fiscalPeriodModel?.toDate;
    }
    if (this.serial == '3') {

      this.codeSerial = this.journal + "/" + this.fiscalPeriod + "/" + this.journalEntryForm.controls['code'].value
    }

  }
  defaultCurrencyId: any;
  financialEntryCycle: any;
  getGeneralConfiguration() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.generalConfigurationService.allGeneralConfiguration(ModuleType.Accounting, undefined, undefined, undefined, undefined, undefined).subscribe({
        next: (res) => {
          resolve();

          if (res.success) {
            
            this.defaultCurrencyId = Number(res?.response?.result?.items?.find(c => c.id == GeneralConfigurationEnum.MainCurrency).value)
            this.financialEntryCycle = Number(res?.response?.result?.items?.find(c => c.id == GeneralConfigurationEnum.FinancialEntryCycle).value)
            if (!this.id) {
              this.journalEntryForm.controls.fiscalPeriodId.patchValue(Number(res?.response?.result?.items?.find(c => c.id == GeneralConfigurationEnum.AccountingPeriod).value))
              this.journalEntryForm.controls.journalId.patchValue(Number(res?.response?.result?.items?.find(c => c.id == GeneralConfigurationEnum.DefaultJournal).value))
            
            }

            this.isMultiCurrency = res?.response?.result?.items?.find(c => c.id == GeneralConfigurationEnum.MultiCurrency).value == "true" ? true : false;
            this.serial = res?.response?.result?.items?.find(c => c.id == GeneralConfigurationEnum.JournalEntriesSerial).value;
            this.fiscalPeriodId = res.response.result.items.find(c => c.id == GeneralConfigurationEnum.AccountingPeriod).value;

            if (this.currnetUrl == this.addUrl) {
              this.initGroup();
              this.onChangeJournal(this.journalEntryForm.controls.journalId.value);
              this.onChangefiscalPeriod(this.journalEntryForm.controls.fiscalPeriodId.value);
              this.onChangeCode(null);
            }
            // if (this.isMultiCurrency) {
            //   this.getCurrency();
            // }

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

  definejournalEntryForm() {
    this.journalEntryForm = this.fb.group({
      id: 0,
      date: [this.dateService.getCurrentDate(), Validators.compose([Validators.required])],
      code: CODE_REQUIRED_VALIDATORS,
      isActive: true,
      openBalance: false,
      notes: null,
      journalId: ['', Validators.compose([Validators.required])],
      fiscalPeriodId: ['', Validators.compose([Validators.required])],
      postType: '',
      journalEntriesDetail: this.fb.array([])
    });
    // this.initGroup();
    this.journalEntryForm.get('journalEntriesDetail').valueChanges.subscribe(values => {

      this.totalCredit = 0;
      this.totalDebit = 0;
      this.totalDebitLocal = 0;
      this.totalCreditLocal = 0;
      const ctrl = <FormArray>this.journalEntryForm.controls['journalEntriesDetail'];
      ctrl.controls.forEach(x => {
        let parsed = parseInt(x.get('jEDetailCredit').value)
        this.totalCredit += parsed
        let parsedjEDetailDebit = parseInt(x.get('jEDetailDebit').value)
        this.totalDebit += parsedjEDetailDebit

        let parsedjEDetailDebitLocal = parseInt(x.get('jEDetailDebitLocal').value)

        this.totalDebitLocal += (parsedjEDetailDebitLocal)

        let parsedjEDetailCreditLocal = parseInt(x.get('jEDetailCreditLocal').value)

        this.totalCreditLocal += (parsedjEDetailCreditLocal)


        this.cd.detectChanges()
      });
    })
    //this.initGroup();
  }
  get jEMasterStatusId() {

    return this.journalEntryForm.controls['jEMasterStatusId'].value;
  }
  get journalEntriesDetailList(): FormArray { return this.journalEntryForm.get('journalEntriesDetail') as FormArray; }
  initGroup() {

    this.counter += 1;
    let journalEntriesDetail = this.journalEntryForm.get('journalEntriesDetail') as FormArray;
    journalEntriesDetail.push(this.fb.group({
      id: [null],
      journalEntriesMasterId: [null],
      accountId: [null, Validators.required],
      currencyId: [null],
      transactionFactor: [null],
      notes: [''],
      jEDetailCredit: [0.0],
      jEDetailDebit: [0.0],
      costCenterId: [null],
      costCenterName: '',
      currencyName: '',
      accountName: '',
      jEDetailCreditLocal: [0.0],
      jEDetailDebitLocal: [0.0],
      jEDetailSerial: [this.counter]
    }, {
      validator: this.atLeastOne(Validators.required, ['jEDetailCredit', 'jEDetailDebit']),

    },

    ));

    const currentIndex = journalEntriesDetail.length - 1;
    this.index = currentIndex;
    this.onOpenNewRow();
  }
  onDeleteRow(rowIndex) {
    const modalRef = this.modalService.open(MessageModalComponent);
    modalRef.componentInstance.message = this.translate.instant('messages.confirm-delete');
    modalRef.componentInstance.title = this.translate.instant('messageTitle.delete');
    modalRef.componentInstance.btnConfirmTxt = this.translate.instant('messageTitle.delete');
    modalRef.componentInstance.isYesNo = true;
    modalRef.result.then((rs) => {
      if (rs == 'Confirm') {
        this.spinner.show();

        let journalEntriesDetail = this.journalEntryForm.get('journalEntriesDetail') as FormArray;
        journalEntriesDetail.removeAt(rowIndex);
        this.counter -= 1;
        this.spinner.hide();

      }
    });


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
  get journalEntriesDetailDTOList(): FormArray { return this.journalEntryForm.get('journalEntriesDetail') as FormArray; }

  //#region CRUD operations
  postType: any;
  getjournalEntryById(id: any) {

    return new Promise<void>((resolve, reject) => {
      let sub = this.journalEntryService.getJournalEntry(id).subscribe({
        next: (res: any) => {
          resolve();

          this.lang = localStorage.getItem("language")

          this.journalEntryForm = this.fb.group({
            id: res.response?.id,
            date: formatDate(Date.parse(res.response.date)),
            code: res.response?.code,
            isActive: res.response?.isActive,
            openBalance: res.response?.openBalance,
            notes: res.response?.notes,
            journalId: res.response?.journalId,
            fiscalPeriodId: res.response?.fiscalPeriodId,
            // postType:res.response?.postType,
            journalEntriesDetail: this.fb.array([])

          });

          this.listDetail = res.response?.journalEntriesDetail;

          this.journalEntriesDetailDTOList.clear();
          this.listDetail.forEach(element => {

            var costCenter = this.costCenterList?.find(c => c.id == element.costCenterId)
            if (costCenter != null && costCenter != undefined) {
              element.costCenterName = this.lang == "ar" ? costCenter.nameAr : costCenter.nameEn;
            }
            var currency = this.currencyList?.find(c => c.id == element.currencyId)
            if (currency != null && currency != undefined) {
              element.currencyName = this.lang == "ar" ? currency.nameAr : currency.nameEn;
            }
            var account = this.accountList?.find(c => c.id == element.accountId)
            if (account != null && account != undefined) {
              element.accountName = this.lang == "ar" ? account.nameAr : account.nameEn;
            }
            this.journalEntriesDetailDTOList.push(this.fb.group({
              id: element.id,
              journalEntriesMasterId: element.journalEntriesMasterId,
              accountId: element.accountId,
              currencyId: element.currencyId,
              transactionFactor: element.transactionFactor,
              notes: element.notes,
              jEDetailCredit: element.jeDetailCredit,
              jEDetailDebit: element.jeDetailDebit,
              costCenterId: element.costCenterId,
              jEDetailCreditLocal: element.jeDetailCreditLocal,
              jEDetailDebitLocal: element.jeDetailDebitLocal,
              jEDetailSerial: this.counter,
              costCenterName: element.costCenterName,
              currencyName: element.currencyName,
              accountName: element.accountName,

            }, { validator: this.atLeastOne(Validators.required, ['jEDetailCredit', 'JEDetailDebit']) }
            ));

            this.onChangeJournal(res.response?.journalId);
            this.onChangefiscalPeriod(res.response?.fiscalPeriodId);
            this.onChangeCode(null);
            console.log(this.journalList)
            this.counter = element.jeDetailSerial;
          });
          this.totalCredit = 0;
          const ctrl = <FormArray>this.journalEntryForm.controls['journalEntriesDetail'];
          ctrl.controls.forEach(x => {
            let parsed = parseInt(x.get('jEDetailCredit').value)
            this.totalCredit += parsed
            this.cd.detectChanges()
          });


          this.totalDebit = 0;
          ctrl.controls.forEach(x => {
            let parsed = parseInt(x.get('jEDetailDebit').value)
            this.totalDebit += parsed
            this.cd.detectChanges()

          })


          this.totalDebitLocal = 0;
          ctrl.controls.forEach(x => {
            let parsed = parseInt(x.get('jEDetailDebitLocal').value)
            let transactionFactor = parseInt(x.get('transactionFactor').value)
            this.totalDebitLocal += (parsed)
            this.cd.detectChanges()

          });
          this.totalCreditLocal = 0;
          ctrl.controls.forEach(x => {
            let parsed = parseInt(x.get('jEDetailCreditLocal').value)
            let transactionFactor = parseInt(x.get('transactionFactor').value)
            this.totalCreditLocal += (parsed)
            this.cd.detectChanges()

          })
          this.journalEntryForm.get('journalEntriesDetail').valueChanges.subscribe(values => {

            this.totalCredit = 0;
            this.totalDebit = 0;
            this.totalDebitLocal = 0;
            this.totalCreditLocal = 0;
            const ctrl = <FormArray>this.journalEntryForm.controls['journalEntriesDetail'];
            ctrl.controls.forEach(x => {
              let parsed = parseInt(x.get('jEDetailCredit').value)
              this.totalCredit += parsed
              let parsedjEDetailDebit = parseInt(x.get('jEDetailDebit').value)
              this.totalDebit += parsedjEDetailDebit

              let parsedjEDetailDebitLocal = parseInt(x.get('jEDetailDebitLocal').value)

              this.totalDebitLocal += (parsedjEDetailDebitLocal)

              let parsedjEDetailCreditLocal = parseInt(x.get('jEDetailCreditLocal').value)

              this.totalCreditLocal += (parsedjEDetailCreditLocal)

              this.cd.detectChanges()
            });
          })

          if (res.response?.postType == 1) {
            this.postType = res.response?.postType;

            this.journalEntryForm.disable();
            this.disableFlag = true;
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

  getjournalEntryCode() {
    return new Promise<void>((resolve, reject) => {

      let sub = this.journalEntryService.getLastCode().subscribe({

        next: (res: any) => {

          this.toolbarPathData.componentList = this.translate.instant("component-names.journalEntry");
          this.journalEntryForm.patchValue({
            code: res.response
          });
          this.codeSerial = res.response;
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
    return this.journalEntryForm.controls;
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
            if (this.journalEntryForm.value.code != null) {
              this.getjournalEntryCode()
            }
            this.toolbarPathData.componentAdd = 'Add journalEntry';
            this.definejournalEntryForm();
            this.isSelectCurrency = false;
            this.sharedServices.changeToolbarPath(this.toolbarPathData);
          } else if (currentBtn.action == ToolbarActions.Update && currentBtn.submitMode) {
            this.onUpdate();
          }
          else if (currentBtn.action == ToolbarActions.Copy) {
            this.getjournalEntryCode();
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
  confirmSave() {
    return new Promise<void>((resolve, reject) => {
      this.journalEntryForm.value.postType = this.financialEntryCycle == 3 ? 1 : 2;
      this.journalEntryForm.value.date = this.dateService.getDateForInsert(this.date)
      var entity = this.journalEntryForm.value;
      entity.branchId = this.branchId;
      entity.companyId = this.companyId;

      let sub = this.journalEntryService.createJournalEntry(entity).subscribe({
        next: (result: any) => {
          this.spinner.show();
          this.definejournalEntryForm();
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
    debugger
    this.fiscalPeriodId = this.journalEntryForm.get('fiscalPeriodId').value
    if (this.fiscalPeriodId > 0) {
      this.fiscalPeriodStatus = this.fiscalPeriodList.find(c => c.id == this.fiscalPeriodId).fiscalPeriodStatus;
    }

    if (this.fiscalPeriodStatus != FiscalPeriodStatus.Opened) {
      this.errorMessage = this.translate.instant("general.no-add-fiscal-period-choose-open-fiscal-period");
      this.errorClass = 'errorMessage';
      this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
      return;
    }
    let checkDate = this.dateService.getDateForInsert(this.date)
    const date = new Date(checkDate);
    const formattedDate = this.datePipe.transform(date, 'yyyy-MM-ddT00:00:00');
    this.fiscalPeriodcheckDate = this.fiscalPeriodList.find(x => x.fromDate <= formattedDate && x.toDate >= formattedDate);

    if (this.fiscalPeriodcheckDate == undefined) {
      this.errorMessage = this.translate.instant("general.no-add-fiscal-period-choose-date-open-fiscal-period");
      this.errorClass = 'errorMessage';
      this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
      return;
    }

    let entryDate = this.journalEntryForm.controls["date"].value;
    let _date;
    let month;
    let day;
    if (entryDate?.month + 1 > 9) {
      month = entryDate?.month + 1
    }
    else {
      month = '0' + entryDate.month + 1
    }
    if (entryDate.day < 10) {
      day = '0' + entryDate?.day
    }
    else {
      day = entryDate.day
    }
    _date = entryDate.year + '-' + month + '-' + day

    if (_date >= this.fromDate && _date <= this.toDate) {


    }
    else {
      this.errorMessage = this.translate.instant("general.date-out-fiscal-period");
      this.errorClass = 'errorMessage';
      this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
      return;

    }
    if (this.counter < 2) {
      this.alertsService.showError(
        this.translate.instant('twoRows'),
        ""

      )
      return;
    }
    if ((this.totalCredit == 0 || this.totalDebit == 0)) {
      this.alertsService.showError(
        this.translate.instant('debitCreditValues'),
        ""
      )
      return;
    }
    if ((this.totalCredit !== this.totalDebit)) {
      this.alertsService.showError(
        this.translate.instant('totalValues'),
        ""
      )
      return;
    }

    //  var entity = new CreateJournalEntryCommand();
    if (this.journalEntryForm.valid) {
      this.spinner.show();
      this.confirmSave().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });

    } else {

      return this.journalEntryForm.markAllAsTouched();
    }
  }

  isSelectCurrency: boolean = false;
  onChangeGetDefaultCurrency(event, index) {
    ;
    if (!this.isSelectCurrency) {
      let currencyId;
      var accountData = this.accountList.find(x => x.id == event.target.value) as AccountDto;
      if (accountData != null) {
        currencyId = accountData.currencyId != null ? accountData.currencyId : this.defaultCurrencyId;
      }
      const ctrl = <FormArray>this.journalEntryForm.controls['journalEntriesDetail'];
      ctrl.controls.forEach(x => {
        x.get('currencyId').setValue(currencyId)
        this.cd.detectChanges()
      });
      this.onSelectCurrency(currencyId, index)
    }

  }
  currency: any;

  onChangeCurrency(event, index) {
    this.isSelectCurrency = true;
    let selectCurrencyId = event;
    let currencyModel = this.currencyList.find(x => x.id == selectCurrencyId);
    if (this.defaultCurrencyId == selectCurrencyId) {
      currencyModel.transactionFactor = 1;
      const faControl =
        (<FormArray>this.journalEntryForm.controls['journalEntriesDetail']).at(index);
      faControl['controls'].transactionFactor.setValue(currencyModel.transactionFactor);
      faControl['controls'].jEDetailCreditLocal.setValue(currencyModel.transactionFactor * faControl['controls'].jEDetailCredit.value);
      faControl['controls'].jEDetailDebitLocal.setValue(currencyModel.transactionFactor * faControl['controls'].jEDetailDebit.value);
      faControl['controls'].jEDetailSerial.setValue(index + 1);
    } else {
      let sub = this.currencyServiceProxy.getCurrency(selectCurrencyId).subscribe({
        next: (res: any) => {
          this.currency = res;
          let currencyModel = this.currency.response.currencyTransactionsDto.filter(x => x.currencyDetailId == this.defaultCurrencyId)[0];
          let currencyFactor = 1;
          if (currencyModel !== null && currencyModel !== undefined) {
            currencyFactor = currencyModel?.transactionFactor;
          }

          const faControl =
            (<FormArray>this.journalEntryForm.controls['journalEntriesDetail']).at(index);
          faControl['controls'].transactionFactor.setValue(currencyFactor);
          faControl['controls'].jEDetailCreditLocal.setValue(currencyFactor * faControl['controls'].jEDetailCredit.value);
          faControl['controls'].jEDetailDebitLocal.setValue(currencyFactor * faControl['controls'].jEDetailDebit.value);
          faControl['controls'].jEDetailSerial.setValue(index + 1);

        }
      })
      this.subsList.push(sub);
    }

  }
  onSelectCurrency(currencyId, index) {

    let currencyModel = this.currencyList.find(x => x.id == currencyId);
    if (this.defaultCurrencyId == currencyId) {
      currencyModel.transactionFactor = 1;
      const faControl =
        (<FormArray>this.journalEntryForm.controls['journalEntriesDetail']).at(index);
      faControl['controls'].transactionFactor.setValue(currencyModel.transactionFactor);
      faControl['controls'].jEDetailCreditLocal.setValue(currencyModel.transactionFactor * faControl['controls'].jEDetailCredit.value);
      faControl['controls'].jEDetailDebitLocal.setValue(currencyModel.transactionFactor * faControl['controls'].jEDetailDebit.value);
      faControl['controls'].jEDetailSerial.setValue(index + 1);
    } else {
      let sub = this.currencyServiceProxy.getCurrency(currencyId).subscribe({
        next: (res: any) => {
          this.currency = res;
          let currencyModel = this.currency?.response?.currencyTransactionsDto?.filter(x => x.currencyDetailId == this.defaultCurrencyId)[0];
          let currencyFactor = currencyModel.transactionFactor;
          const faControl =
            (<FormArray>this.journalEntryForm.controls['journalEntriesDetail']).at(index);
          faControl['controls'].transactionFactor.setValue(currencyFactor);
          faControl['controls'].jEDetailCreditLocal.setValue(currencyFactor * faControl['controls'].jEDetailCredit.value);
          faControl['controls'].jEDetailDebitLocal.setValue(currencyFactor * faControl['controls'].jEDetailDebit.value);
          faControl['controls'].jEDetailSerial.setValue(index + 1);
        }
      })
      this.subsList.push(sub);

    }

  }
  onUpdate() {

    if (this.journalEntryForm.touched || this.journalEntriesDetailDTOList.touched) {

      this.fiscalPeriodId = this.journalEntryForm.get('fiscalPeriodId').value
      if (this.fiscalPeriodId > 0) {
        this.fiscalPeriodStatus = this.fiscalPeriodList.find(c => c.id == this.fiscalPeriodId).fiscalPeriodStatus;
      }
      if (this.journalEntryForm.valid) {
        if (this.fiscalPeriodStatus != FiscalPeriodStatus.Opened) {
          this.errorMessage = this.translate.instant("general.no-edit-fiscal-period-choose-open-fiscal-period") + " : " + this.fiscalPeriodName;
          this.errorClass = 'errorMessage';
          this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
          return;
        }
        let entryDate = this.journalEntryForm.controls["date"].value;
    let _date;
    let month;
    let day;
    if (entryDate?.month + 1 > 9) {
      month = entryDate?.month + 1
    }
    else {
      month = '0' + entryDate.month + 1
    }
    if (entryDate.day < 10) {
      day = '0' + entryDate?.day
    }
    else {
      day = entryDate.day
    }
    _date = entryDate.year + '-' + month + '-' + day

    if (_date >= this.fromDate && _date <= this.toDate) {


    }
    else {
      this.errorMessage = this.translate.instant("general.date-out-fiscal-period");
      this.errorClass = 'errorMessage';
      this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
      return;

    }
        // let checkDate = this.dateService.getDateForInsert(this.date)
        // const date = new Date(checkDate);
        // const formattedDate = this.datePipe.transform(date, 'yyyy-MM-ddT00:00:00');
        // this.fiscalPeriodcheckDate = this.fiscalPeriodList.find(x => x.fromDate <= formattedDate && x.toDate >= formattedDate);

        // if (this.fiscalPeriodcheckDate == undefined) {
        //   this.errorMessage = this.translate.instant("general.no-add-fiscal-period-choose-date-open-fiscal-period");
        //   this.errorClass = 'errorMessage';
        //   this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
        //   return;
        // }
      }
      if (this.counter < 2) {
        this.alertsService.showError(
          this.translate.instant('twoRows'),
          ""

        )
        return;
      }
      if ((this.totalCredit == 0 || this.totalDebit == 0)) {
        this.alertsService.showError(
          this.translate.instant('debitCreditValues'),
          ""
        )
        return;
      }
      if ((this.totalCredit !== this.totalDebit)) {
        this.alertsService.showError(
          this.translate.instant('totalValues'),
          ""
        )
        return;
      }
      return new Promise<void>((resolve, reject) => {

        var entity = this.journalEntryForm.value;
        entity.branchId = this.branchId;
        entity.companyId = this.companyId;
        entity.date = this.dateService.getDateForInsert(this.date)
        let sub = this.journalEntryService.updateJournalEntry(entity).subscribe({
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
    this.spinner.hide();
  }



  getJournals() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeJournalApi).subscribe({
        next: (res) => {

          if (res.success) {

            this.journalList = res.response.filter(x => x.isActive && (x.nameAr != null || x.nameEn != null));
            // this.journalList.forEach(element => {
            //   if (this.lang == "ar") {
            //     element.nameAr = element.nameAr;
            //   }
            //   else {
            //     element.nameAr = element.nameEn;
            //   }
           // })
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
  getAccount() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeAccountApi).subscribe({
        next: (res) => {

          if (res.success) {
            this.accountList = res.response.filter(x => x.isActive);

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
            this.costCenterList = res.response.filter(x => x.isActive);

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
            this.currencyList = res.response.filter(x => x.isActive);


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
  getFiscalPeriod() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeFiscalPeriodApi).subscribe({
        next: (res) => {

          if (res.success) {

            this.fiscalPeriodList = res.response.filter(x => x.isActive);
            // this.fiscalPeriodList.forEach(element => {
            //   // if (this.lang == "ar") {
            //   //   element.nameAr = element.nameAr;
            //   // }
            //   // else {
            //   //   element.nameAr = element.nameEn;
            //   // }
            // })
            this.checkPeriod = res.response.fiscalPeriodStatus;
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
    if (type == 'Credit') {
      const faControl =
        (<FormArray>this.journalEntryForm.controls['journalEntriesDetail']).at(i);
      faControl['controls'].jEDetailDebit.setValue(0);


    }
    else if (type == 'Debit') {
      const faControl =
        (<FormArray>this.journalEntryForm.controls['journalEntriesDetail']).at(i);
      faControl['controls'].jEDetailCredit.setValue(0);
    }


    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;

  }
  onInput(event, i, type): boolean {

    this.index = i;
    if (type == 'Credit') {
      const faControl =
        (<FormArray>this.journalEntryForm.controls['journalEntriesDetail']).at(i);
      faControl['controls'].jEDetailDebit.setValue(0);

      let jEDetailCredit = faControl['controls'].jEDetailCredit.value;
      let jEDetailDebit = faControl['controls'].jEDetailDebit.value;
      let transactionFactor = faControl['controls'].transactionFactor.value;
      if (transactionFactor != null) {
        faControl['controls'].jEDetailCreditLocal.setValue(jEDetailCredit * transactionFactor);
        faControl['controls'].jEDetailDebitLocal.setValue(jEDetailDebit * transactionFactor);
      }


    }
    else if (type == 'Debit') {
      const faControl =
        (<FormArray>this.journalEntryForm.controls['journalEntriesDetail']).at(i);
      faControl['controls'].jEDetailCredit.setValue(0);

      let jEDetailCredit = faControl['controls'].jEDetailCredit.value;
      let jEDetailDebit = faControl['controls'].jEDetailDebit.value;
      let transactionFactor = faControl['controls'].transactionFactor.value;
      if (transactionFactor != null) {
        faControl['controls'].jEDetailCreditLocal.setValue(jEDetailCredit * transactionFactor);
        faControl['controls'].jEDetailDebitLocal.setValue(jEDetailDebit * transactionFactor);
      }
    }


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
  getEntriesStatusEnum() {
    if (this.lang == 'en') {
      this.entriesStatusEnum = convertEnumToArray(EntryStatusEnum);
    }
    else {
      this.entriesStatusEnum = convertEnumToArray(EntryStatusArEnum);

    }
  }

  getDate(selectedDate: DateModel) {
    this.journalEntryForm.markAsTouched();
    this.date = selectedDate;
    let checkDate = this.dateService.getDateForInsert(this.date)
    const date = new Date(checkDate);
    const formattedDate = this.datePipe.transform(date, 'yyyy-MM-ddT00:00:00');
    this.fiscalPeriodcheckDate = this.fiscalPeriodList.find(x => x.fromDate <= formattedDate && x.toDate >= formattedDate);

  }
  onSelectCashAccount(event) {
    const faControl = (<FormArray>this.journalEntryForm.controls['journalEntriesDetail']).at(this.index);
    faControl['controls'].accountId.setValue(event.id);
    faControl['controls'].accountName.setValue(this.lang == "ar" ? event.nameAr : event.nameEn);
    this.showSearchCashAccountModal = false;
  }
  onSelectCostCenter(event) {

    const faControl = (<FormArray>this.journalEntryForm.controls['journalEntriesDetail']).at(this.index);
    faControl['controls'].costCenterId.setValue(event.id);
    faControl['controls'].costCenterName.setValue(this.lang == "ar" ? event.nameAr : event.nameEn);
    this.showSearchCostCenterModal = false;
  }
  onSelectCurrencyPopup(event) {
    const faControl = (<FormArray>this.journalEntryForm.controls['journalEntriesDetail']).at(this.index);
    faControl['controls'].currencyId.setValue(event.id);
    faControl['controls'].currencyName.setValue(this.lang == "ar" ? event.nameAr : event.nameEn);
    this.onChangeCurrency(event.id, this.index)
    this.showSearchCurrencyModal = false;
  }
  onOpenNewRow() {
    if (this.currencyList != undefined && this.defaultCurrencyId != undefined) {
      const faControl = (<FormArray>this.journalEntryForm.controls['journalEntriesDetail']).at(this.index);
      var event = this.currencyList.find(c => c.id == this.defaultCurrencyId);
      faControl['controls'].currencyId.setValue(event.id);
      faControl['controls'].currencyName.setValue(this.lang == "ar" ? event.nameAr : event.nameEn);
      this.onChangeCurrency(event.id, this.index)
      this.showSearchCurrencyModal = false;
    }

  }
  openModalSearchCostCenter(i) {

    this.index = i;
    this.showSearchCostCenterModal = true;

  }
  openModalSearchCurrency(i) {

    this.index = i;
    this.showSearchCurrencyModal = true;

  }
  openModalSearchAccount(i) {

    this.index = i;
    this.showSearchCashAccountModal = true;

  }

  // Print Page Report


  onViewReportClicked(id) {
    localStorage.removeItem("itemId")
    localStorage.setItem("itemId", id);
    let reportType = 1;
    let reportTypeId = 6;
    this.reportViewerService.gotoViewer(reportType, reportTypeId, id);
  }

  openSearchCurrency(i) {
    this.index = i;
    let lables = ['الكود', 'الاسم', 'الاسم الانجليزى'];
    let names = ['code', 'nameAr', 'nameEn'];
    let title = 'بحث عن العملة';
    let sub = this.searchDialog
      .showDialog(lables, names, this.currencyList, title, '')
      .subscribe((d) => {
        if (d) {
          this.onSelectCurrencyPopup(d);
        }
      });
    this.subsList.push(sub);
  }
  openSearchCostCenter(i) {
    this.index = i;
    let lables = ['الكود', 'الاسم', 'الاسم الانجليزى'];
    let names = ['code', 'nameAr', 'nameEn'];
    let title = 'بحث عن مركز التكلفة';
    let sub = this.searchDialog
      .showDialog(lables, names, this.costCenterList, title, '')
      .subscribe((d) => {
        if (d) {
          this.onSelectCostCenter(d);
        }
      });
    this.subsList.push(sub);
  }
  openSearchAccount(i) {
    this.index = i;
    let lables = ['الكود', 'الاسم', 'الاسم الانجليزى'];
    let names = ['code', 'nameAr', 'nameEn'];
    let title = 'بحث عن  الحساب';
    let sub = this.searchDialog
      .showDialog(lables, names, this.accountList, title, '')
      .subscribe((d) => {
        if (d) {
          this.onSelectCashAccount(d);
        }
      });
    this.subsList.push(sub);
  }
}



