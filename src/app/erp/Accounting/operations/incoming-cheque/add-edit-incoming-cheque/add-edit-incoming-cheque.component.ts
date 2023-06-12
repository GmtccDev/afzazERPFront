import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SharedService } from '../../../../../shared/common-services/shared-service';
import { ToolbarPath } from '../../../../../shared/interfaces/toolbar-path';
import { NgxSpinnerService } from 'ngx-spinner';
import { CODE_REQUIRED_VALIDATORS, NAME_REQUIRED_VALIDATORS } from '../../../../../shared/constants/input-validators';
import { Subscription } from 'rxjs';
import { ToolbarData } from '../../../../../shared/interfaces/toolbar-data';
import { ToolbarActions } from '../../../../../shared/enum/toolbar-actions';
import { formatDate, navigateUrl } from '../../../../../shared/helper/helper-url';
import { IncomingChequeServiceProxy } from '../../../services/incoming-cheque.services';
import { PublicService } from 'src/app/shared/services/public.service';
import { NotificationsAlertsService } from 'src/app/shared/common-services/notifications-alerts.service';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { GeneralConfigurationServiceProxy } from '../../../services/general-configurations.services';
@Component({
  selector: 'app-add-edit-incoming-cheque',
  templateUrl: './add-edit-incoming-cheque.component.html',
  styleUrls: ['./add-edit-incoming-cheque.component.scss']
})
export class AddEditIncomingChequeComponent implements OnInit {
  //#region Main Declarations
  incomingChequeForm!: FormGroup;
  sub: any;
  url: any;
  id: any = 0;
  currnetUrl;
  public show: boolean = false;
  lang = localStorage.getItem("language")
  incomingCheque: [] = [];
  addUrl: string = '/accounting-operations/incomingCheque/add-incomingCheque';
  updateUrl: string = '/accounting-operations/incomingCheque/update-incomingCheque/';
  listUrl: string = '/accounting-operations/incomingCheque';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.incomingCheque"),
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
  routeAccountApi = "Account/get-ddl?"
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
  constructor(
    private incomingChequeService: IncomingChequeServiceProxy,
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
    this.defineincomingChequeForm();
  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    this.getGeneralConfiguration()
    this.getCostCenter();
    this.getCurrency();
    this.getFiscalPeriod();
    this.getJournals();
    this.getAccount();
    this.currnetUrl = this.router.url;
    this.listenToClickedButton();
    this.changePath();

    if (this.currnetUrl == this.addUrl) {
      this.getincomingChequeCode();
    }

    this.sub = this.route.params.subscribe((params) => {
      if (params['id'] != null) {
        this.id = params['id'];

        if (this.id) {
          this.getincomingChequeById(this.id);
        }
        this.url = this.router.url.split('/')[2];
      }
    });
  }
  onSelectJournal(event) {

    this.incomingChequeForm.controls.bankAccountId.setValue(event.id);
    this.showSearchModal = false;
  }
  onSelectCountry(event) {


    this.incomingChequeForm.controls.countryId.setValue(event.id);
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
  codeSerial='';
  journal='';
  onChangeJournal(event) {
   debugger
   //this.incomingChequeForm.controls['jEMasterStatusId'].value
   let journalModel = this.journalList.find(x => x.id == event);
   this.journal= this.lang == 'ar' ? journalModel.nameAr : journalModel.nameEn;
   if(this.serial=='2'){
   
    this.codeSerial= this.journal+"/"+this.incomingChequeForm.controls['code'].value
   }
    
  }
  onChangefiscalPeriod(event) {
    debugger
     let fiscalPeriodModel = this.fiscalPeriodList.find(x => x.id == event);
     this.fiscalPeriod= this.lang == 'ar' ? fiscalPeriodModel.nameAr : fiscalPeriodModel.nameEn;
     if(this.serial=='3'){
   
      this.codeSerial= this.journal+"/"+ this.fiscalPeriod+"/"+this.incomingChequeForm.controls['code'].value
     }
    
   }
  getGeneralConfiguration() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.generalConfigurationService.allGeneralConfiguration(1, undefined, undefined, undefined, undefined, undefined).subscribe({
        next: (res) => {

          console.log(res);

          if (res.success) {


            this.isMultiCurrency = res.response.items.find(c => c.id == 2).value == "true" ? true : false;
            this.serial = res.response.items.find(c => c.id == 3).value;
            // if (this.isMultiCurrency) {
            //   this.getCurrency();
            // }

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
  defineincomingChequeForm() {
    this.incomingChequeForm = this.fb.group({
      id: 0,
      date: ['', Validators.compose([Validators.required])],
      code: CODE_REQUIRED_VALIDATORS,
      isActive: true,
      dueDate: true,
      notes: null,
      bankAccountId: ['', Validators.compose([Validators.required])],
      receiptAccountId: ['', Validators.compose([Validators.required])],
      journalEntriesDetail: this.fb.array([])
    });
    this.initGroup();
    this.incomingChequeForm.get('journalEntriesDetail').valueChanges.subscribe(values => {

      this.totalCredit = 0;
      this.totalDebit = 0;
      this.totalDebitLocal = 0;
      this.totalCreditLocal = 0;
      const ctrl = <FormArray>this.incomingChequeForm.controls['journalEntriesDetail'];
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

    return this.incomingChequeForm.controls['jEMasterStatusId'].value;
  }
  get journalEntriesDetailList(): FormArray { return this.incomingChequeForm.get('journalEntriesDetail') as FormArray; }
  initGroup() {

    this.counter += 1;
    let journalEntriesDetail = this.incomingChequeForm.get('journalEntriesDetail') as FormArray;
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

    let journalEntriesDetail = this.incomingChequeForm.get('journalEntriesDetail') as FormArray;
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
  get journalEntriesDetailDTOList(): FormArray { return this.incomingChequeForm.get('journalEntriesDetail') as FormArray; }

  //#region CRUD operations
  getincomingChequeById(id: any) {

    const promise = new Promise<void>((resolve, reject) => {
      this.incomingChequeService.getIncomingCheque(id).subscribe({
        next: (res: any) => {

          this.incomingChequeForm = this.fb.group({
            id: res.response?.id,
            date: formatDate(Date.parse(res.response.date)),
            code: res.response?.code,
            isActive: res.response?.isActive,
            dueDate: res.response?.dueDate,
            notes: res.response?.notes,
            bankAccountId: res.response?.bankAccountId,
            receiptAccountId: res.response?.receiptAccountId,
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


            this.counter = element.jeDetailSerial;
          });
          this.totalCredit = 0;
          const ctrl = <FormArray>this.incomingChequeForm.controls['journalEntriesDetail'];
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
          this.incomingChequeForm.get('journalEntriesDetail').valueChanges.subscribe(values => {

            this.totalCredit = 0;
            this.totalDebit = 0;
            this.totalDebitLocal = 0;
            this.totalCreditLocal = 0;
            const ctrl = <FormArray>this.incomingChequeForm.controls['journalEntriesDetail'];
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
          console.log(
            'this.incomingChequeForm.value set value',
            this.incomingChequeForm.value
          );
        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {
          console.log('complete');
        },
      });
    });
    return promise;
  }

  getincomingChequeCode() {
    const promise = new Promise<void>((resolve, reject) => {

      this.incomingChequeService.getLastCode().subscribe({

        next: (res: any) => {

          this.toolbarPathData.componentList = this.translate.instant("component-names.incomingCheque");
          this.incomingChequeForm.patchValue({
            code: res.response
          });
          this.codeSerial=res.response;
        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {
          console.log('complete');
        },
      });
    });
  }
  //#endregion

  //#region Helper Functions

  get f(): { [key: string]: AbstractControl } {
    return this.incomingChequeForm.controls;
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
            this.toolbarPathData.componentAdd = 'Add incomingCheque';
            this.defineincomingChequeForm();
            this.sharedServices.changeToolbarPath(this.toolbarPathData);
          } else if (currentBtn.action == ToolbarActions.Update) {
            this.onUpdate();
          }
        }
      },
    });
    this.subsList.push(sub);
  }
  changePath() {
    this.sharedServices.changeToolbarPath(this.toolbarPathData);
  }
  onSave() {

    // if (this.checkPeriod == null) {
    //   this.alertsService.showError(
    //     'يجب أن يكون السنة المالية مفتوحة و الفترة المحاسبية مفتوحة',
    //     "",

    //   )
    //   return;
    // }
    console.log("getRawValue=>", this.incomingChequeForm.getRawValue());
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
    //  var entity = new CreateIncomingChequeCommand();
    if (this.incomingChequeForm.valid) {
      const promise = new Promise<void>((resolve, reject) => {
        var entity = this.incomingChequeForm.value;

        this.incomingChequeService.createIncomingCheque(entity).subscribe({
          next: (result: any) => {
            this.spinner.show();
            console.log('result dataaddData ', result);

            this.defineincomingChequeForm();

            this.submited = false;
            setTimeout(() => {
              this.spinner.hide();

              navigateUrl(this.listUrl, this.router);
            }, 1000);
          },
          error: (err: any) => {
            reject(err);
          },
          complete: () => {
            console.log('complete');
          },
        });
      });
      return promise;

    } else {

      //  return this.incomingChequeForm.markAllAsTouched();
    }
  }

  onChangeCurrency(event, index) {

    console.log('Name changed:', event.target.value);

    let currencyModel = this.currencyList.find(x => x.id == event.target.value);
    const faControl =
      (<FormArray>this.incomingChequeForm.controls['journalEntriesDetail']).at(index);
    faControl['controls'].transactionFactor.setValue(currencyModel.transactionFactor);
    faControl['controls'].jEDetailCreditLocal.setValue(currencyModel.transactionFactor * faControl['controls'].jEDetailCredit.value);
    faControl['controls'].jEDetailDebitLocal.setValue(currencyModel.transactionFactor * faControl['controls'].jEDetailDebit.value);
    faControl['controls'].jEDetailSerial.setValue(index + 1);
  }
  onUpdate() {

    console.log("getRawValue=>", this.incomingChequeForm.getRawValue());
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
    //  var entity = new CreateIncomingChequeCommand();
    if (this.incomingChequeForm.valid) {
      const promise = new Promise<void>((resolve, reject) => {
        var entity = this.incomingChequeForm.value;

        this.incomingChequeService.updateIncomingCheque(entity).subscribe({
          next: (result: any) => {
            this.spinner.show();
            console.log('result dataaddData ', result);

            //  this.defineincomingChequeForm();

            this.submited = false;
            setTimeout(() => {
              this.spinner.hide();

              navigateUrl(this.listUrl, this.router);
            }, 1000);
          },
          error: (err: any) => {
            reject(err);
          },
          complete: () => {
            console.log('complete');
          },
        });
      });
      return promise;

    } else {

      //  return this.incomingChequeForm.markAllAsTouched();
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
          console.log('complete');
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
          console.log('complete');
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
          console.log('complete');
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
          console.log('complete');
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
          console.log('complete');
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
        (<FormArray>this.incomingChequeForm.controls['journalEntriesDetail']).at(i);
      faControl['controls'].jEDetailDebit.setValue(0);


    }
    else if (type == 'Debit') {
      const faControl =
        (<FormArray>this.incomingChequeForm.controls['journalEntriesDetail']).at(i);
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
        (<FormArray>this.incomingChequeForm.controls['journalEntriesDetail']).at(i);
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
        (<FormArray>this.incomingChequeForm.controls['journalEntriesDetail']).at(i);
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
}

