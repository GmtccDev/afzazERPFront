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
import { AccountClassificationServiceProxy } from '../../../services/account-classification';
import { ICustomEnum } from 'src/app/shared/interfaces/ICustom-enum';
import { AccountClassificationsForIncomeStatementArEnum, AccountClassificationsForIncomeStatementEnum, VoucherTypeEnum, convertEnumToArray } from 'src/app/shared/constants/enumrators/enums';
@Component({
  selector: 'app-add-edit-account-classification',
  templateUrl: './add-edit-account-classification.component.html',
  styleUrls: ['./add-edit-account-classification.component.scss']
})
export class AddEditAccountClassificationComponent implements OnInit {
  //#region Main Declarations
  accountClassificationForm!: FormGroup;
  accountClassificationsTypes: ICustomEnum[] = [];

  sub: any;
  url: any;
  id: any = 0;
  currnetUrl;
  public show: boolean = false;
  lang = localStorage.getItem("language")
  accountClassification: [] = [];
  addUrl: string = '/accounting-master-codes/accountClassification/add-accountClassification';
  updateUrl: string = '/accounting-master-codes/accountClassification/update-accountClassification/';
  listUrl: string = '/accounting-master-codes/accountClassification';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.accountClassification"),
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
    private accountClassificationService: AccountClassificationServiceProxy,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private sharedServices: SharedService, private translate: TranslateService,
    private cd: ChangeDetectorRef

  ) {
    this.defineaccountClassificationForm();
  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    this.currnetUrl = this.router.url;
    this.listenToClickedButton();
    this.changePath();
    this.getAccountClassificationsTypes();
    if (this.currnetUrl == this.addUrl) {
      this.getaccountClassificationCode();
    }
    this.sub = this.route.params.subscribe((params) => {
      if (params['id'] != null) {
        this.id = params['id'];

        if (this.id) {
          this.getaccountClassificationById(this.id);
        }
        this.url = this.router.url.split('/')[2];
      }
    });
  }
  onSelectCompany(event) {

    this.companyId = event.id;
    this.accountClassificationForm.controls.companyId.setValue(event.id);
    this.showSearchModal = false;
  }
  onSelectCountry(event) {
    
       
        this.accountClassificationForm.controls.countryId.setValue(event.id);
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
  defineaccountClassificationForm() {
    this.accountClassificationForm = this.fb.group({
      id: 0,
      nameAr: NAME_REQUIRED_VALIDATORS,
      nameEn: NAME_REQUIRED_VALIDATORS,
      code: CODE_REQUIRED_VALIDATORS,
      type:REQUIRED_VALIDATORS,
      isActive: true
    });

  }


  //#endregion

  //#region CRUD Operations
  getaccountClassificationById(id: any) {

    const promise = new Promise<void>((resolve, reject) => {
      this.accountClassificationService.getAccountClassification(id).subscribe({
        next: (res: any) => {
          
          this.accountClassificationForm.setValue({
            id: res.response?.id,
            nameAr: res.response?.nameAr,
            nameEn: res.response?.nameEn,
            code: res.response?.code,
            type: res.response?.type,
            isActive: res.response?.isActive

          });

          console.log(
            'this.accountClassificationForm.value set value',
            this.accountClassificationForm.value
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
  getAccountClassificationsTypes() {
    if (this.lang == 'en') {
      this.accountClassificationsTypes = convertEnumToArray(AccountClassificationsForIncomeStatementEnum);
    }
    else {
      this.accountClassificationsTypes = convertEnumToArray(AccountClassificationsForIncomeStatementArEnum);

    }
  }
  showPassword() {
    this.show = !this.show;
  }
  getaccountClassificationCode() {
    const promise = new Promise<void>((resolve, reject) => {

      this.accountClassificationService.getLastCode().subscribe({

        next: (res: any) => {

          this.toolbarPathData.componentList = this.translate.instant("component-names.accountClassification");
          this.accountClassificationForm.patchValue({
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
    return this.accountClassificationForm.controls;
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
            this.toolbarPathData.componentAdd = this.translate.instant("account-classification.add-account-classification");
            this.defineaccountClassificationForm();
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
  //  var entity = new CreateAccountClassificationCommand();
    if (this.accountClassificationForm.valid) {
      const promise = new Promise<void>((resolve, reject) => {
        var entity= this.accountClassificationForm.value;
       
        this.accountClassificationService.createAccountClassification(entity).subscribe({
          next: (result: any) => {
            this.spinner.show();
            console.log('result dataaddData ', result);
           
            this.defineaccountClassificationForm();

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

       return this.accountClassificationForm.markAllAsTouched();
    }
  }


  onUpdate() {
  
    if (this.accountClassificationForm.valid) {

      this.accountClassificationForm.value.id = this.id;
   var   entityDb = this.accountClassificationForm.value;
      entityDb.id = this.id;
   
      console.log("this.VendorCommissionsForm.value", this.accountClassificationForm.value)
      const promise = new Promise<void>((resolve, reject) => {

        this.accountClassificationService.updateAccountClassification(entityDb).subscribe({
          next: (result: any) => {
            this.spinner.show();
            console.log('result update ', result);
           
            this.defineaccountClassificationForm();
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

       return this.accountClassificationForm.markAllAsTouched();
    }
  }
 

}

