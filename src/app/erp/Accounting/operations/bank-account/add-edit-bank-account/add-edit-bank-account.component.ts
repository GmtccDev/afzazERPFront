import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, RequiredValidator } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SharedService } from '../../../../../shared/common-services/shared-service';
import { ToolbarPath } from '../../../../../shared/interfaces/toolbar-path';
import { NgxSpinnerService } from 'ngx-spinner';
import { CODE_REQUIRED_VALIDATORS, NAME_REQUIRED_VALIDATORS, REQUIRED_VALIDATORS } from '../../../../../shared/constants/input-validators';
import { Subscription } from 'rxjs';
import { ToolbarData } from '../../../../../shared/interfaces/toolbar-data';
import { ToolbarActions } from '../../../../../shared/enum/toolbar-actions';
import { navigateUrl } from '../../../../../shared/helper/helper-url';
import { BankAccountServiceProxy } from '../../../services/bank-account-services';
@Component({
  selector: 'app-add-edit-bank-account',
  templateUrl: './add-edit-bank-account.component.html',
  styleUrls: ['./add-edit-bank-account.component.scss']
})
export class AddEditBankAccountComponent implements OnInit {
  //#region Main Declarations
  bankAccountForm!: FormGroup;
  sub: any;
  url: any;
  id: any = 0;
  currnetUrl;
  public show: boolean = false;
  lang = localStorage.getItem("language")
  bankAccount: [] = [];
  addUrl: string = '/accounting-operations/bankAccount/add-bankAccount';
  updateUrl: string = '/accounting-operations/bankAccount/update-bankAccount/';
  listUrl: string = '/accounting-operations/bankAccount';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.bankAccount"),
    componentAdd: '',

  };
  errorMessage = '';
  errorClass = '';
  submited: boolean = false;
  showSearchModal = false;
  showSearchModalCountry=false;
  companyId: any;
  routeApi='Company/get-ddl?'
  routeApiCountry='Country/get-ddl?'
  constructor(
    private bankAccountService: BankAccountServiceProxy,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private sharedServices: SharedService, private translate: TranslateService,
    private cd: ChangeDetectorRef

  ) {
    this.definebankAccountForm();
  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    this.currnetUrl = this.router.url;
    this.listenToClickedButton();
    this.changePath();
    if (this.currnetUrl == this.addUrl) {
      this.getbankAccountCode();
    }
    this.sub = this.route.params.subscribe((params) => {
      if (params['id'] != null) {
        this.id = params['id'];

        if (this.id) {
          this.getbankAccountById(this.id);
        }
        this.url = this.router.url.split('/')[2];
      }
    });
  }
  onSelectCompany(event) {

    this.companyId = event.id;
    this.bankAccountForm.controls.companyId.setValue(event.id);
    this.showSearchModal = false;
  }
  onSelectCountry(event) {
    
       
        this.bankAccountForm.controls.countryId.setValue(event.id);
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
  definebankAccountForm() {
    this.bankAccountForm = this.fb.group({
      id: 0,
      nameAr: NAME_REQUIRED_VALIDATORS,
      nameEn: null,
      code: CODE_REQUIRED_VALIDATORS,
      isActive: true,
      accountId:REQUIRED_VALIDATORS
    });

  }


  //#endregion

  //#region CRUD Operations
  getbankAccountById(id: any) {

    const promise = new Promise<void>((resolve, reject) => {
      this.bankAccountService.getBankAccount(id).subscribe({
        next: (res: any) => {
          
          this.bankAccountForm.setValue({
            id: res.response?.id,
            nameAr: res.response?.nameAr,
            nameEn: res.response?.nameEn,
            code: res.response?.code,
            isActive: res.response?.isActive,
            accountId:res.response?.accountId

          });

          console.log(
            'this.bankAccountForm.value set value',
            this.bankAccountForm.value
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
  getbankAccountCode() {
    const promise = new Promise<void>((resolve, reject) => {

      this.bankAccountService.getLastCode().subscribe({

        next: (res: any) => {

          this.toolbarPathData.componentList = this.translate.instant("component-names.bankAccount");
          this.bankAccountForm.patchValue({
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
    return this.bankAccountForm.controls;
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
            this.toolbarPathData.componentAdd = 'Add bankAccount';
            this.definebankAccountForm();
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
  //  var entity = new CreateBankAccountCommand();
    if (this.bankAccountForm.valid) {
      const promise = new Promise<void>((resolve, reject) => {
        var entity= this.bankAccountForm.value;
       
        this.bankAccountService.createBankAccount(entity).subscribe({
          next: (result: any) => {
            this.spinner.show();
            console.log('result dataaddData ', result);
           
            this.definebankAccountForm();

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

      //  return this.bankAccountForm.markAllAsTouched();
    }
  }


  onUpdate() {
  
    if (this.bankAccountForm.valid) {

      this.bankAccountForm.value.id = this.id;
   var   entityDb = this.bankAccountForm.value;
      entityDb.id = this.id;
   
      console.log("this.VendorCommissionsForm.value", this.bankAccountForm.value)
      const promise = new Promise<void>((resolve, reject) => {

        this.bankAccountService.updateBankAccount(entityDb).subscribe({
          next: (result: any) => {
            this.spinner.show();
            console.log('result update ', result);
           
            this.definebankAccountForm();
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

      // return this.bankAccountForm.markAllAsTouched();
    }
  }
 

}

