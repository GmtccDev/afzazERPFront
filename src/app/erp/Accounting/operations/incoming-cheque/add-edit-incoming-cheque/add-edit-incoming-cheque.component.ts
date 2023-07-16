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
import { BeneficiaryTypeArEnum, BeneficiaryTypeEnum, convertEnumToArray } from 'src/app/shared/constants/enumrators/enums';
import { ICustomEnum } from 'src/app/shared/interfaces/ICustom-enum';
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
  totalamount: number;
  totalDebit: number;
  totalDebitLocal: number;
  //totalamountLocal: number;
  checkPeriod: any;
  isMultiCurrency: boolean;
  serial: any;
  serialList: { nameAr: string; nameEn: string; value: string; }[];
  fiscalPeriod: any;
  beneficiaryTypesEnum: ICustomEnum[]=[];
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
    this.getAccount();
    this.currnetUrl = this.router.url;
    this.listenToClickedButton();
    this.changePath();
    this.getBeneficiaryTypes();

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

    this.incomingChequeForm.controls.accountId.setValue(event.id);
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
      let sub = this.generalConfigurationService.allGeneralConfiguration(1, undefined, undefined, undefined, undefined, undefined).subscribe({
        next: (res) => {

          console.log(res);

          if (res.success && res.response.items.length>0)  {


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
      dueDate:['', Validators.compose([Validators.required])],
      notes: null,
      accountId: ['', Validators.compose([Validators.required])],
      amount: ['', Validators.compose([Validators.required])],
      currencyId: [null, Validators.compose([Validators.required])],
      incomingChequeDetail: this.fb.array([])
    });
    this.initGroup();
   
    
    const ctrl = <FormArray>this.incomingChequeForm.controls['incomingChequeDetail'];
   
    this.incomingChequeForm.get('incomingChequeDetail').valueChanges.subscribe(values => {
      debugger
      // this.totalamount = 0;
      // const ctrl = <FormArray>this.incomingChequeForm.controls['incomingChequeDetail'];
      // ctrl.controls.forEach(x => {
      //   let parsed = parseInt(x.get('amount').value)
      //   this.totalamount += parsed
      
      //   this.cd.detectChanges()
      // });
    })
  }
  get jEMasterStatusId() {

    return this.incomingChequeForm.controls['jEMasterStatusId'].value;
  }
  get incomingChequeDetailList(): FormArray { return this.incomingChequeForm.get('incomingChequeDetail') as FormArray; }
  initGroup() {
    debugger
    this.counter += 1;
    let incomingChequeDetail = this.incomingChequeForm.get('incomingChequeDetail') as FormArray;
    incomingChequeDetail.push(this.fb.group({
      id: [null],
      incomingChequeId: [null],
      accountId: [null, Validators.required],
      beneficiaryTypeId:[null],
      currencyId: [null],
      transactionFactor: [null],
      notes: [''],
      amount: [0.0],
      currencyLocal:[null],
      beneficiaryAccountId:[null],
      iCDetailSerial: [this.counter]
    }, {
      validator: this.atLeastOne(Validators.required, ['amount', 'amount']),

    },

    ));
    console.log(incomingChequeDetail.value)
  }
  onDeleteRow(rowIndex) {

    let incomingChequeDetail = this.incomingChequeForm.get('incomingChequeDetail') as FormArray;
    incomingChequeDetail.removeAt(rowIndex);
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
  get incomingChequeDetailDTOList(): FormArray { return this.incomingChequeForm.get('incomingChequeDetail') as FormArray; }

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
            dueDate: formatDate(Date.parse(res.response.dueDate)),
            notes: res.response?.notes,
            accountId: res.response?.accountId,
            amount: res.response?.amount,
            currencyId: res.response?.currencyId,
            incomingChequeDetail: this.fb.array([])

          });
          let ListDetail = res.response?.incomingChequeDetail;

          this.incomingChequeDetailDTOList.clear();
          ListDetail.forEach(element => {

            this.incomingChequeDetailDTOList.push(this.fb.group({
              id: element.id,
              incomingChequeId: element.incomingChequeId,
              accountId: element.accountId,
              currencyId: element.currencyId,
              transactionFactor: element.transactionFactor,
              notes: element.notes,
              amount: element.amount,
              beneficiaryTypeId:element.beneficiaryTypeId,
              beneficiaryAccountId:element.beneficiaryAccountId,
              // amount: element.amount,
              // costCenterId: element.costCenterId,
              currencyLocal: element.currencyLocal,
              // amountLocal: element.amountLocal,
              iCDetailSerial: this.counter
            }, { validator: this.atLeastOne(Validators.required, ['amount', 'amount']) }
            ));


            this.counter = element.jeDetailSerial;
          });
      
          
          const ctrl = <FormArray>this.incomingChequeForm.controls['incomingChequeDetail'];
       
          this.incomingChequeForm.get('incomingChequeDetail').valueChanges.subscribe(values => {
            // this.totalamount = 0;
            // const ctrl = <FormArray>this.incomingChequeForm.controls['incomingChequeDetail'];
            // ctrl.controls.forEach(x => {
            //   let parsed = parseInt(x.get('amount').value)
            //   this.totalamount += parsed
            
            //   this.cd.detectChanges()
            // });
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
    debugger
    console.log("getRawValue=>", this.incomingChequeForm.getRawValue());
    this.totalamount = 0;
    const ctrl = <FormArray>this.incomingChequeForm.controls['incomingChequeDetail'];
  
    ctrl.controls.forEach(x => {
      let parsed = parseInt(x.get('amount').value)
      this.totalamount += parsed
    
      this.cd.detectChanges()
    });
    if ((this.totalamount == 0 )) {
      this.alertsService.showError(
        ' مجموع القيم ف المجموع الكلي يجب يكون متساوي مع تفاصيل الشيك',
        ""
      )
      return;
    }
    if ((this.totalamount !== this.incomingChequeForm.value.amount)) {
      this.alertsService.showError(
        ' مجموع القيم ف المجموع الكلي يجب يكون متساوي مع تفاصيل الشيك',
        ""
      )
      return;
    }
    debugger
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
      (<FormArray>this.incomingChequeForm.controls['incomingChequeDetail']).at(index);
    faControl['controls'].transactionFactor.setValue(currencyModel.transactionFactor);
    faControl['controls'].currencyLocal.setValue(currencyModel.transactionFactor * faControl['controls'].amount.value);
  //  faControl['controls'].amountLocal.setValue(currencyModel.transactionFactor * faControl['controls'].amount.value);
    faControl['controls'].iCDetailSerial.setValue(index + 1);
  }
  onUpdate() {

    console.log("getRawValue=>", this.incomingChequeForm.getRawValue());
    this.totalamount = 0;
    const ctrl = <FormArray>this.incomingChequeForm.controls['incomingChequeDetail'];
    ctrl.controls.forEach(x => {
      let parsed = parseInt(x.get('amount').value)
      this.totalamount += parsed
    
      this.cd.detectChanges()
    });
   
    if ((this.totalamount!= this.incomingChequeForm.value.amount)) {
      this.alertsService.showError(
        ' مجموع القيم ف المجموع الكلي يجب يكون متساوي مع تفاصيل الشيك',
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
        (<FormArray>this.incomingChequeForm.controls['incomingChequeDetail']).at(i);
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

