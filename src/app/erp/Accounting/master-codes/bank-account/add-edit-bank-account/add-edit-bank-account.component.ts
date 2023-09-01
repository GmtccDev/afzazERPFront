import {  Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
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
import { PublicService } from '../../../../../shared/services/public.service';
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
  addUrl: string = '/accounting-master-codes/bankAccount/add-bankAccount';
  updateUrl: string = '/accounting-master-codes/bankAccount/update-bankAccount/';
  listUrl: string = '/accounting-master-codes/bankAccount';
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
  showSearchModalCountry = false;
  companyId: any;
  routeApi = 'Company/get-ddl?'
  routeApiCountry = 'Country/get-ddl?'
  accountList: any;
  routeAccountApi = "account/get-ddl?"
  constructor(
    private bankAccountService: BankAccountServiceProxy,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private sharedServices: SharedService, private translate: TranslateService,
    private publicService: PublicService

  ) {
    this.definebankAccountForm();
  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    this.spinner.show();
    Promise.all([
      this.getAccount()

    ]).then(a => {
      this.getRouteData();
      this.currnetUrl = this.router.url;

      if (this.currnetUrl == this.addUrl) {
        this.getbankAccountCode();
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
          
          this.getbankAccountById(this.id).then(a => {
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
        this.spinner.hide();
        this.sharedServices.changeButton({ action: 'New' } as ToolbarData);
      }

    });
    this.subsList.push(sub);

  }
  onSelectCompany(event) {

    this.companyId = event.id;
    this.bankAccountForm.controls.companyId.setValue(event.id);
    this.showSearchModal = false;
  }
  onSelectAccount(event) {


    this.bankAccountForm.controls.accountId.setValue(event.id);
    this.showSearchModal = false;
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
      accountId: REQUIRED_VALIDATORS
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

  //#endregion

  //#region CRUD master-codes
  getbankAccountById(id: any) {
    return new Promise<void>((resolve, reject) => {
      let sub = this.bankAccountService.getBankAccount(id).subscribe({
        next: (res: any) => {
          resolve();
          this.bankAccountForm.setValue({
            id: res.response?.id,
            nameAr: res.response?.nameAr,
            nameEn: res.response?.nameEn,
            code: res.response?.code,
            isActive: res.response?.isActive,
            accountId: res.response?.accountId

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
      this.subsList.push(sub);

    });
  }
  showPassword() {
    this.show = !this.show;
  }
  getbankAccountCode() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.bankAccountService.getLastCode().subscribe({

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
      this.subsList.push(sub);

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
  confirmSave() {
    return new Promise<void>((resolve, reject) => {
      var entity = this.bankAccountForm.value;
      let sub = this.bankAccountService.createBankAccount(entity).subscribe({
        next: (result: any) => {
          this.spinner.show();
          this.definebankAccountForm();
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
    if (this.bankAccountForm.valid) {
      this.spinner.show();
      this.confirmSave().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });


    } else {

      return this.bankAccountForm.markAllAsTouched();
    }
  }
  confirmUpdate() {
    this.bankAccountForm.value.id = this.id;
    var entityDb = this.bankAccountForm.value;
    entityDb.id = this.id;

    return new Promise<void>((resolve, reject) => {

      let sub = this.bankAccountService.updateBankAccount(entityDb).subscribe({
        next: (result: any) => {
          this.spinner.show();
          this.definebankAccountForm();
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

    if (this.bankAccountForm.valid) {
      this.spinner.show();
      this.confirmUpdate().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });
    }

    else {

      return this.bankAccountForm.markAllAsTouched();
    }
  }


}

