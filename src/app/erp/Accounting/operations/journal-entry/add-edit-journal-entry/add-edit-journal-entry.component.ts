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
import { JournalEntryServiceProxy } from '../../../services/journal-entry'
import { PublicService } from 'src/app/shared/services/public.service';
@Component({
  selector: 'app-add-edit-journal-entry',
  templateUrl: './add-edit-journal-entry.component.html',
  styleUrls: ['./add-edit-journal-entry.component.scss']
})
export class AddEditJournalEntryComponent implements OnInit {
  //#region Main Declarations
  journalEntryForm!: FormGroup;
  sub: any;
  url: any;
  id: any = 0;
  currnetUrl;
  public show: boolean = false;
  lang = localStorage.getItem("language")
  journalEntry: [] = [];
  addUrl: string = '/accounting-opertaions/journalEntry/add-journalEntry';
  updateUrl: string = '/accounting-opertaions/journalEntry/update-journalEntry/';
  listUrl: string = '/accounting-opertaions/journalEntry';
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
  showSearchModalCountry=false;
  
  routeFiscalPeriodApi = "FiscalPeriod/get-ddl?"
  routeJournalApi = 'Journal/get-ddl?'
  routeCostCenterApi = 'CostCenter/get-ddl?'
  routeCurrencyApi = "Currency/get-ddl?"
  journalList: any;
  costCenterList: any;
  currencyList: any;
  fiscalPeriodList: any;
  counter: number;
  constructor(
    private journalEntryService: JournalEntryServiceProxy,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private sharedServices: SharedService, private translate: TranslateService,
    private cd: ChangeDetectorRef,
    private publicService: PublicService,

  ) {
    this.definejournalEntryForm();
  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    this.getCostCenter();
    this.getCurrency();
    this.getFiscalPeriod();
    this.getJournals();
    this.currnetUrl = this.router.url;
    this.listenToClickedButton();
    this.changePath();
    if (this.currnetUrl == this.addUrl) {
      this.getjournalEntryCode();
    }
    this.sub = this.route.params.subscribe((params) => {
      if (params['id'] != null) {
        this.id = params['id'];

        if (this.id) {
          this.getjournalEntryById(this.id);
        }
        this.url = this.router.url.split('/')[2];
      }
    });
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
  definejournalEntryForm() {
    this.journalEntryForm = this.fb.group({
      id: 0,
      date:['', Validators.compose([ Validators.required])],
      code: CODE_REQUIRED_VALIDATORS,
      isActive: true,
      openBalance:true,
      notes:null,
      journalId:['', Validators.compose([ Validators.required])],
      fiscalPeriodId:['', Validators.compose([ Validators.required])],
      journalEntriesDetailDTO: this.fb.array([])
    });

  }
 get jEMasterStatusId() {

    return this.journalEntryForm.controls['jEMasterStatusId'].value;
  }
  get accJournalEntriesDetailDTOList(): FormArray { return this.journalEntryForm.get('accJournalEntriesDetailDTO') as FormArray; }
  initGroup() {

    this.counter += 1;
    let accJournalEntriesDetailDTO = this.journalEntryForm.get('accJournalEntriesDetailDTO') as FormArray;
    accJournalEntriesDetailDTO.push(this.fb.group({
      id: [null],
      journalEntriesMasterId: [null],
      accountId: [null, Validators.required],
      currencyId: [null],
      transactionFactor: [null],
      notes: [''],
      jEDetailCredit: [0.0],
      jEDetailDebit: [0.0],
      costCenterId: [''],
      jEDetailCreditLocal: [0.0],
      jEDetailDebitLocal: [0.0],
    }, { validator: this.atLeastOne(Validators.required, ['jEDetailCredit', 'jEDetailDebit']) ,
    
  },
    
    ));
    console.log(accJournalEntriesDetailDTO.value)
  }
 onDeleteRow(rowIndex) {
    debugger
    let accJournalEntriesDetailDTO = this.journalEntryForm.get('accJournalEntriesDetailDTO') as FormArray;
    accJournalEntriesDetailDTO.removeAt(rowIndex);
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

  //#region CRUD Operations
  getjournalEntryById(id: any) {

    const promise = new Promise<void>((resolve, reject) => {
      this.journalEntryService.getJournalEntry(id).subscribe({
        next: (res: any) => {
          
          this.journalEntryForm.setValue({
            id: res.response?.id,
            date:formatDate(Date.parse(res.response.date)),
            code: res.response?.code,
            isActive: res.response?.isActive,
            openBalance:res.response?.openBalance,
            notes:res.response?.notes,
            journalId:res.response?.journalId,
            fiscalPeriodId:res.response?.fiscalPeriodId,
           

          });

          console.log(
            'this.journalEntryForm.value set value',
            this.journalEntryForm.value
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
  showPassword() {
    this.show = !this.show;
  }
  getjournalEntryCode() {
    const promise = new Promise<void>((resolve, reject) => {

      this.journalEntryService.getLastCode().subscribe({

        next: (res: any) => {

          this.toolbarPathData.componentList = this.translate.instant("component-names.journalEntry");
          this.journalEntryForm.patchValue({
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
            this.toolbarPathData.componentAdd = 'Add journalEntry';
            this.definejournalEntryForm();
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
  //  var entity = new CreateJournalEntryCommand();
    if (this.journalEntryForm.valid) {
      const promise = new Promise<void>((resolve, reject) => {
        var entity= this.journalEntryForm.value;
       
        this.journalEntryService.createJournalEntry(entity).subscribe({
          next: (result: any) => {
            this.spinner.show();
            console.log('result dataaddData ', result);
           
            this.definejournalEntryForm();

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

      //  return this.journalEntryForm.markAllAsTouched();
    }
  }


  onUpdate() {
  
    if (this.journalEntryForm.valid) {

      this.journalEntryForm.value.id = this.id;
   var   entityDb = this.journalEntryForm.value;
      entityDb.id = this.id;
   
      console.log("this.VendorCommissionsForm.value", this.journalEntryForm.value)
      const promise = new Promise<void>((resolve, reject) => {

        this.journalEntryService.updateJournalEntry(entityDb).subscribe({
          next: (result: any) => {
            this.spinner.show();
            console.log('result update ', result);
           
            this.definejournalEntryForm();
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
    }

    else {

      // return this.journalEntryForm.markAllAsTouched();
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

}

