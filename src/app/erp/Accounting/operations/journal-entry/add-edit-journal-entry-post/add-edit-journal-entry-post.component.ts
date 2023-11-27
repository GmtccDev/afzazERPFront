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
import { formatDate, navigateUrl } from '../../../../../shared/helper/helper-url';
import { JournalEntryServiceProxy } from '../../../services/journal-entry'
import { PublicService } from 'src/app/shared/services/public.service';
import { NotificationsAlertsService } from 'src/app/shared/common-services/notifications-alerts.service';
import { GeneralConfigurationServiceProxy } from '../../../services/general-configurations.services';
import { EntryStatusArEnum, EntryStatusEnum, EntryTypesEnum, convertEnumToArray } from 'src/app/shared/constants/enumrators/enums';
import { UserService } from 'src/app/shared/common-services/user.service';
import { ModuleType } from '../../../models/general-configurations';
@Component({
  selector: 'app-add-edit-journal-entry-post',
  templateUrl: './add-edit-journal-entry-post.component.html',
  styleUrls: ['./add-edit-journal-entry-post.component.scss']
})
export class AddEditJournalEntryPostComponent implements OnInit {
  //#region Main Declarations
  journalEntryForm!: FormGroup;
  sub: any;
  url: any;
  id: any = 0;
  currnetUrl;
  status: string = '';
  type: string = '';
  setting: string = '';
  parentType: number | undefined;
  parentTypeId: number | undefined;
  settingId: number | undefined;
  showDetails: boolean = false;

  public show: boolean = false;
  lang = localStorage.getItem("language")
  journalEntry: [] = [];
  addUrl: string = '/accounting-operations/journalEntryPost/add-journalEntryPost';
  updateUrl: string = '/accounting-operations/journalEntryPost/update-journalEntryPost/';
  listUrl: string = '/accounting-operations/journalEntryPost';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: '',
    componentList: this.translate.instant("component-names.journalEntryPost"),
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
  counter: number;
  accountList: any;
  index: any;
  totalCredit: number;
  totalDebit: number;
  totalDebitLocal: number;
  totalCreditLocal: number;
  checkPeriod: any;
  isMultiCurrency: boolean;
  serial: any;
  serialList: { nameAr: string; nameEn: string; value: string; }[];
  fiscalPeriod: any;
  entriesStatusEnum: any;
  branchId: string = this.userService.getBranchId();
  companyId: string = this.userService.getCompanyId()
  constructor(
    private journalEntryService: JournalEntryServiceProxy,private userService: UserService,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private sharedServices: SharedService, private translate: TranslateService,
    private cd: ChangeDetectorRef,
    private publicService: PublicService,
    private alertsService: NotificationsAlertsService,
    private generalConfigurationService: GeneralConfigurationServiceProxy,

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
      this.getCostCenter(),
      this.getCurrency(),
      this.getFiscalPeriod(),
      this.getJournals(),
      this.getAccount()
    ]).then(a => {
      this.getRouteData();
      this.currnetUrl = this.router.url;
      if (this.currnetUrl == this.addUrl) {
        this.getjournalEntryCode();
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
            this.getJournalEntryAdditionalById(this.id);

            this.spinner.hide();
            this.sharedServices.changeButton({ action: 'Update' } as ToolbarData);
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
    let journalModel = this.journalList.find(x => x.id == event);
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

    let fiscalPeriodModel = this.fiscalPeriodList.find(x => x.id == event);
    if (fiscalPeriodModel != null) {
      this.fiscalPeriod = this.lang == 'ar' ? fiscalPeriodModel.nameAr : fiscalPeriodModel.nameEn;
    }

    if (this.serial == '3') {

      this.codeSerial = this.journal + "/" + this.fiscalPeriod + "/" + this.journalEntryForm.controls['code'].value
    }

  }
  getGeneralConfiguration() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.generalConfigurationService.allGeneralConfiguration(ModuleType.Accounting, undefined, undefined, undefined, undefined, undefined).subscribe({
        next: (res) => {

          resolve();

          if (res.success) {


            this.isMultiCurrency = res.response.result.items.find(c => c.id == 2).value == "true" ? true : false;
            this.serial = res.response.result.items.find(c => c.id == 3).value;
            // if (this.isMultiCurrency) {
            //   this.getCurrency();
            // }

          }



        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {
          //console.log('complete');
        },
      });

      this.subsList.push(sub);
    });

  }
  definejournalEntryForm() {
    this.journalEntryForm = this.fb.group({
      id: 0,
      date: ['', Validators.compose([Validators.required])],
      code: CODE_REQUIRED_VALIDATORS,
      isActive: true,
      openBalance: true,
      notes: null,
      journalId: ['', Validators.compose([Validators.required])],
      fiscalPeriodId: ['', Validators.compose([Validators.required])],
      postType: 2,
      journalEntriesDetail: this.fb.array([])
    });
    this.initGroup();
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
      jEDetailCreditLocal: [0.0],
      jEDetailDebitLocal: [0.0],
      jEDetailSerial: [this.counter]
    }, {
      validator: this.atLeastOne(Validators.required, ['jEDetailCredit', 'jEDetailDebit']),

    },

    ));
    console.log(journalEntriesDetail.value)
  }
  onDeleteRow(rowIndex) {

    let journalEntriesDetail = this.journalEntryForm.get('journalEntriesDetail') as FormArray;
    journalEntriesDetail.removeAt(rowIndex);
    this.counter -= 1;
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
  getjournalEntryById(id: any) {

    return new Promise<void>((resolve, reject) => {
      let sub = this.journalEntryService.getJournalEntry(id).subscribe({
        next: (res: any) => {
          resolve();
          this.journalEntryForm = this.fb.group({
            id: res.response?.id,
            date: formatDate(Date.parse(res.response.date)),
            code: res.response?.code,
            isActive: res.response?.isActive,
            openBalance: res.response?.openBalance,
            notes: res.response?.notes,
            journalId: res.response?.journalId,
            fiscalPeriodId: res.response?.fiscalPeriodId,
            postType: res.response?.postType,
            journalEntriesDetail: this.fb.array([])

          });
          let ListDetail = res.response?.journalEntriesDetail;

          this.journalEntriesDetailDTOList.clear();
          ListDetail.forEach(element => {

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
              jEDetailSerial: this.counter
            }, { validator: this.atLeastOne(Validators.required, ['jEDetailCredit', 'JEDetailDebit']) }
            ));

            this.onChangeJournal(res.response?.journalId);
            this.onChangefiscalPeriod(res.response?.fiscalPeriodId);
            this.onChangeCode(null);
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
          this.journalEntryForm.disable();
          this.journalEntryForm.get('postType').enable();
          console.log(
            'this.journalEntryForm.value set value',
            this.journalEntryForm.value
          );
        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {
          //console.log('complete');
        },
      });
      this.subsList.push(sub);

    });
  }

  getjournalEntryCode() {
    return new Promise<void>((resolve, reject) => {

      let sub = this.journalEntryService.getLastCode().subscribe({

        next: (res: any) => {

          this.toolbarPathData.componentList = this.translate.instant("component-names.journalEntryPost");
          this.journalEntryForm.patchValue({
            code: res.response
          });
          this.codeSerial = res.response;
        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {
          //console.log('complete');
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
            //this.onSave();
          } else if (currentBtn.action == ToolbarActions.New) {
            //   this.toolbarPathData.componentAdd = 'Add journalEntry';
            //  this.definejournalEntryForm();
            //   this.sharedServices.changeToolbarPath(this.toolbarPathData);
          } else if (currentBtn.action == ToolbarActions.Update && currentBtn.submitMode) {
            this.onUpdate();
          }
          else if (currentBtn.action == ToolbarActions.Copy) {
            this.getjournalEntryCode();
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
      var entity = this.journalEntryForm.getRawValue();

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
          //console.log('complete');
        },
      });
      this.subsList.push(sub);

    });
  }
  onSave() {

   
   // console.log("getRawValue=>", this.journalEntryForm.getRawValue());
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

  onChangeCurrency(event, index) {

    console.log('Name changed:', event.target.value);

    let currencyModel = this.currencyList.find(x => x.id == event.target.value);
    const faControl =
      (<FormArray>this.journalEntryForm.controls['journalEntriesDetail']).at(index);
    faControl['controls'].transactionFactor.setValue(currencyModel.transactionFactor);
    faControl['controls'].jEDetailCreditLocal.setValue(currencyModel.transactionFactor * faControl['controls'].jEDetailCredit.value);
    faControl['controls'].jEDetailDebitLocal.setValue(currencyModel.transactionFactor * faControl['controls'].jEDetailDebit.value);
    faControl['controls'].jEDetailSerial.setValue(index + 1);
  }
  confirmUpdate() {
    return new Promise<void>((resolve, reject) => {
      
   
      var entity = this.journalEntryForm.getRawValue();
      entity.branchId = this.branchId;
      entity.companyId = this.companyId;
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
          //console.log('complete');
        },
      });
      this.subsList.push(sub);

    });
  }
  onUpdate() {

    console.log("getRawValue=>", this.journalEntryForm.getRawValue());
    if (this.counter < 2) {
      this.alertsService.showError(
        'يجب أن يكون على الاقل اثنين من الصفوف',
        ""

      )
      return;
    }
    if ((this.totalCredit == 0 || this.totalDebit == 0)) {
      this.alertsService.showError(
        'يجب ان يكون قيم في الدائن والمدين',
        ""
      )
      return;
    }
    if ((this.totalCredit !== this.totalDebit)) {
      this.alertsService.showError(
        'مجموع القيم الدائنة في عامود دائن يجب ان تكون مساوية لمجموع القيم المدينة في عامود مدين',
        ""
      )
      return;
    }
    if (this.journalEntryForm.valid) {
      this.spinner.show();
      this.confirmUpdate().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });

    } else {

      return this.journalEntryForm.markAllAsTouched();
    }
  }


  getJournals() {
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
          //console.log('complete');
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
            this.accountList = res.response;

          }


          resolve();

        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {
          //console.log('complete');
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
          //console.log('complete');
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
          //console.log('complete');
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

            this.fiscalPeriodList = res.response;
            this.checkPeriod = res.response.fiscalPeriodStatus;
          }


          resolve();

        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {
          //console.log('complete');
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
  getJournalEntryAdditionalById(id: number) {
    return new Promise<void>((resolve, reject) => {
      let sub = this.journalEntryService.getJournalEntryAdditionalById(id).subscribe({
        next: (res) => {
          resolve();
          if (res.success) {
            this.showDetails = true;
            this.status = this.lang == 'ar' ? res.response.data.result[0].statusAr : res.response.data.result[0].statusEn;
            this.type = this.lang == 'ar' ? res.response.data.result[0].entryTypeAr : res.response.data.result[0].entryTypeEn;
            this.setting = this.lang == 'ar' ? res.response.data.result[0].settingAr : res.response.data.result[0].settingEn;
            this.parentType = res.response.data.result[0].parentType;
            this.parentTypeId = res.response.data.result[0].parentTypeId;
            this.settingId = res.response.data.result[0].settingId;


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
  onViewClicked() {
    
    if (this.parentType == EntryTypesEnum.Voucher) {
      window.open('accounting-operations/vouchers/update-voucher/' + this.settingId + '/' + this.parentTypeId, "")
    }
    if (this.parentType == EntryTypesEnum.IncomingCheque) {
      window.open('accounting-operations/incomingCheque/update-incomingCheque/' + this.parentTypeId, "_blank")
    }
    if (this.parentType == EntryTypesEnum.IssuingCheque) {
      window.open('accounting-operations/issuingCheque/update-issuingCheque/' + this.parentTypeId, "_blank")
    }
    if (this.parentType == EntryTypesEnum.SalesBill || this.parentType == EntryTypesEnum.SalesReturnBill
      || this.parentType == EntryTypesEnum.PurchasesBill || this.parentType == EntryTypesEnum.PurchasesReturnBill) {
      window.open('warehouses-operations/bill/update-bill/' + this.settingId + '/' + this.parentTypeId, "_blank")
    }
  }
}

