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
import { BeneficiaryTypeArEnum, BeneficiaryTypeEnum, convertEnumToArray } from 'src/app/shared/constants/enumrators/enums';
import { ICustomEnum } from 'src/app/shared/interfaces/ICustom-enum';
import { DateCalculation, DateModel } from 'src/app/shared/services/date-services/date-calc.service';
import { CurrencyServiceProxy } from 'src/app/erp/master-codes/services/currency.servies';
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
  public show: boolean = false;
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
  routeAccountApi = "Account/get-ddl?"
  journalList: any;
  costCenterList: any;
  currencyList: any;
  fiscalPeriodList: any;
  counter: number;
  accountList: any;
  index: any;
  totalamount: number;
  totalDebit: number;
  totalDebitLocal: number;
  //totalamountLocal: number;
  checkPeriod: any;
  isMultiCurrency: boolean;
  serial: any;
  serialList: { nameAr: string; nameEn: string; value: string; }[];
  fiscalPeriod: any;
  beneficiaryTypesEnum: ICustomEnum[] = [];
  date!: DateModel;
  dueDate!: DateModel;
  currencyFactor: number;
  currency: any;
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
      this.getAccount()
    ]).then(a => {
      this.getRouteData();
      this.currnetUrl = this.router.url;
      if (this.currnetUrl == this.addUrl) {
        this.getIssuingChequeCode();
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
      let sub = this.generalConfigurationService.allGeneralConfiguration(5, undefined, undefined, undefined, undefined, undefined).subscribe({
        next: (res) => {
          resolve();
          if (res.success && res.response.result.items.length > 0) {
            this.isMultiCurrency = res.response.result.items.find(c => c.id == 2).value == "true" ? true : false;
            this.serial = res.response.result.items.find(c => c.id == 3).value;
            this.mainCurrencyId = res.response.result.items.find(c => c.id == 1).value;


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
  defineIssuingChequeForm() {
    this.issuingChequeForm = this.fb.group({
      id: 0,
      date: ['', Validators.compose([Validators.required])],
      code: CODE_REQUIRED_VALIDATORS,
      isActive: true,
      dueDate: ['', Validators.compose([Validators.required])],
      notes: null,
      accountId: ['', Validators.compose([Validators.required])],
      amount: ['', Validators.compose([Validators.required])],
      amountLocal: ['', Validators.compose([Validators.required])],
      currencyId: [null, Validators.compose([Validators.required])],
      currencyFactor: '',
      companyId: this.companyId,
      branchId: this.branchId,
      status: 0,
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
      accountId: [null, Validators.required],
      beneficiaryTypeId: [null],
      currencyId: [null],
      transactionFactor: [null],
      notes: [''],
      amount: [0.0],
      currencyLocal: [null],
      beneficiaryAccountId: [null],
      iCDetailSerial: [this.counter]
    }, {
      validator: this.atLeastOne(Validators.required, ['amount', 'amount']),

    },

    ));
    console.log(issuingChequeDetail.value)
  }
  getAmount() {
    if (this.issuingChequeForm.value.currencyId == this.mainCurrencyId) {
      this.amount = this.amountLocal;
      this.currencyFactor = 1;
    }
    else {
      let sub = this.currencyServiceProxy.getCurrency(this.issuingChequeForm.value.currencyId).subscribe({
        next: (res: any) => {
          debugger
          this.currency = res;
          let currencyModel = this.currency.response.currencyTransactionsDto.filter(x => x.currencyDetailId == this.mainCurrencyId)[0];
          this.currencyFactor = 1 / currencyModel.transactionFactor;
          this.amount =(1 / currencyModel.transactionFactor) * this.amountLocal;
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
            accountId: res.response?.accountId,
            amount: res.response?.amount,
            amountLocal: res.response?.amountLocal,
            status: res.response?.status,
            statusName: res.response?.status,
            currencyId: res.response?.currencyId,
            currencyFactor: res.response?.currencyFactor,
            issuingChequeDetail: this.fb.array([]),
            issuingChequeStatusDetail: this.fb.array([])


          });
          this.date = this.dateService.getDateForCalender(res.response.date);
          this.dueDate = this.dateService.getDateForCalender(res.response.dueDate);
          let ListDetail = res.response?.issuingChequeDetail;

          this.issuingChequeDetailDTOList.clear();
          ListDetail.forEach(element => {

            this.issuingChequeDetailDTOList.push(this.fb.group({
              id: element.id,
              issuingChequeId: element.issuingChequeId,
              accountId: element.accountId,
              currencyId: element.currencyId,
              transactionFactor: element.transactionFactor,
              notes: element.notes,
              amount: element.amount,
              beneficiaryTypeId: element.beneficiaryTypeId,
              beneficiaryAccountId: element.beneficiaryAccountId,
              // amount: element.amount,
              // costCenterId: element.costCenterId,
              currencyLocal: element.currencyLocal,
              // amountLocal: element.amountLocal,
              iCDetailSerial: this.counter
            }, { validator: this.atLeastOne(Validators.required, ['amount', 'amount']) }
            ));


            this.counter = element.jeDetailSerial;
          });

          let ListDetailStatus = res.response?.issuingChequeStatusDetails;
          this.issuingChequeDetailStatusDTOList.clear();
          ListDetailStatus.forEach(element => {

            if (element.status == 0) {
              element.statusName = this.translate.instant("incoming-cheque.registered");
            }
            if (element.status == 1) {
              element.statusName = this.translate.instant("incoming-cheque.edit-registered");
            }
            else if (element.status == 2) {
              element.statusName = this.translate.instant("incoming-cheque.collected");

            }
            else if (element.status == 3) {
              element.statusName = this.translate.instant("incoming-cheque.rejected");

            }
            this.issuingChequeDetailStatusDTOList.push(this.fb.group({
              date: element.date,
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
          console.log('complete');
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
          console.log('complete');
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
            this.defineIssuingChequeForm();
            this.sharedServices.changeToolbarPath(this.toolbarPathData);
          }else if (currentBtn.action == ToolbarActions.Update) {
            this.onUpdate();
          }
          else if (currentBtn.action == ToolbarActions.Copy) {
           this.getIssuingChequeCode();
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
          console.log('complete');
        },
      });
      this.subsList.push(sub);

    });

  }
  onSave() {

    // if (this.checkPeriod == null) {
    //   this.alertsService.showError(
    //     'يجب أن يكون السنة المالية مفتوحة و الفترة المحاسبية مفتوحة',
    //     "",

    //   )
    //   return;
    // }

    console.log("getRawValue=>", this.issuingChequeForm.getRawValue());
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
    if (this.issuingChequeForm.valid) {
      this.spinner.show();
      this.confirmSave().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });

    } else {

      return this.issuingChequeForm.markAllAsTouched();
    }
  }

  onChangeCurrency(event, index) {
    console.log('Name changed:', event.target.value);
    this.amount = 0;
    this.amountLocal = 0;
    this.currencyFactor = 0;
    this.currencyId = null;
    return new Promise<void>((resolve, reject) => {
      debugger
      let sub = this.currencyServiceProxy.getCurrency(event.target.value).subscribe({
        next: (res: any) => {
          resolve();
          debugger
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
            this.amountLocal = this.amountLocal + this.issuingChequeForm.get('issuingChequeDetail').value[index].currencyLocal;
            if (event.target.value== this.mainCurrencyId) {
              this.amount = this.amountLocal;

            }
            else {
              let currencyModel =this.currency.find(x => x.id == event.target.value);
              this.amount = currencyModel.transactionFactor * this.amountLocal;

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
  confirmUpdate() {
    return new Promise<void>((resolve, reject) => {
      var entity = this.issuingChequeForm.value;
      if (entity.status > 1) {
        this.spinner.hide();
        this.alertsService.showError(
          this.translate.instant("incoming-cheque.cannot-edit"),
          ""
        )
        return;
      }
      entity.status = 1;
      entity.date = this.dateService.getDateForInsert(entity.date);
      entity.dueDate = this.dateService.getDateForInsert(entity.dueDate);
      let sub = this.issuingChequeService.updateIssuingCheque(entity).subscribe({
        next: (result: any) => {
          this.spinner.show();

          //  this.defineissuingChequeForm();

          this.submited = false;
          this.spinner.hide();

          navigateUrl(this.listUrl, this.router);
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

    console.log("getRawValue=>", this.issuingChequeForm.getRawValue());
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
    if (this.issuingChequeForm.valid) {

      this.spinner.show();
      this.confirmUpdate().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });
    } else {

      return this.issuingChequeForm.markAllAsTouched();
    }
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
    const faControl =
      (<FormArray>this.issuingChequeForm.controls['issuingChequeDetail']).at(i);
    //   faControl['controls'].amount.setValue(0);

    let amount = faControl['controls'].amount.value;
    // let amount = faControl['controls'].amount.value;
    let transactionFactor = faControl['controls'].transactionFactor.value;
    if (transactionFactor != null) {
      faControl['controls'].currencyLocal.setValue(amount * transactionFactor);
      // faControl['controls'].amountLocal.setValue(amount * transactionFactor);
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

