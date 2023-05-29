import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { REQUIRED_VALIDATORS } from 'src/app/shared/constants/input-validators';
import { ToolbarPath } from 'src/app/shared/interfaces/toolbar-path';
import { PublicService } from 'src/app/shared/services/public.service';
import {Voucher, VoucherDetails} from 'src/app/erp/Accounting/models/voucher'

@Component({
  selector: 'app-add-edit-voucher',
  templateUrl: './add-edit-voucher.component.html',
  styleUrls: ['./add-edit-voucher.component.scss']
})
export class AddEditVoucherComponent implements OnInit {
  //#region Main Declarations
  branchId:string= localStorage.getItem("branchId");
  companyId:string= localStorage.getItem("companyId");
  //voucherForm!: FormGroup;
  voucherForm: FormGroup = new FormGroup({});

  voucher: Voucher = new Voucher();
  voucherDetails: VoucherDetails[] = [];
  _voucherDetails: VoucherDetails = new VoucherDetails();
  sub: any;
  url: any;
  id: any = 0;
  currnetUrl;
  errorMessage = '';
  errorClass = '';
  lang = localStorage.getItem("language")
  routeApi = 'Account/get-ddl?'
  routeCurrencyApi = "currency/get-ddl?"

  cashAccountsList: any;
  costCenterAccountsList: any;
  currenciesList:any;
  queryParams: any;
  voucherTypeId: any;

  addUrl: string = '/accounting-operations/vouchers/add-voucher';
  updateUrl: string = '/accounting-operations/vouchers/update-voucher/';
  listUrl: string = '/accounting-operations/vouchers';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.vouchers"),
    componentAdd: '',

  };
 
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
     private translate: TranslateService,
    private cd: ChangeDetectorRef,
    private publicService: PublicService,
  

  ) {
    this.defineVoucherForm();
  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    debugger
    this.queryParams = this.route.queryParams.subscribe(params => {
      debugger
        if (params['voucherTypeId'] != null) {
          this.voucherTypeId = params['voucherTypeId'];
        }
      })

    this.spinner.show();
    Promise.all([
      this.getAccounts(),
      this.getCurrencies()

    ]).then(a => {
      this.spinner.hide();
    }).catch((err) => {

      this.spinner.hide();
    })
    this.currnetUrl = this.router.url;
    //this.listenToClickedButton();
    //this.changePath();
    if (this.currnetUrl == this.addUrl) {
     // this.getaccountClassificationCode();
    }
    this.sub = this.route.params.subscribe((params) => {
      if (params['id'] != null) {
        this.id = params['id'];

        if (this.id) {
        //  this.getaccountClassificationById(this.id);
        }
      }
    });
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
 defineVoucherForm() {
  this.voucherForm = this.fb.group({
    id: 0,
    companyId:this.companyId,
    branchId:this.branchId,
    voucherTypeId:1,
    voucherCode:REQUIRED_VALIDATORS,
    voucherDate:REQUIRED_VALIDATORS,
    cashAccountId:REQUIRED_VALIDATORS,
    costCenterAccountId:'',
    currencyId:REQUIRED_VALIDATORS,
    description:'',
    voucherTotal:REQUIRED_VALIDATORS
   
  });

}

  



  //#region Helper Functions

  get f(): { [key: string]: AbstractControl } {
    return this.voucherForm.controls;
  }


  //#endregion

  getAccounts() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeApi).subscribe({
        next: (res) => {

          if (res.success) {
            this.cashAccountsList = res.response;
            this.costCenterAccountsList = res.response;

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
  getCurrencies() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeCurrencyApi).subscribe({
        next: (res) => {
          if (res.success) {
            this.currenciesList = res.response;

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

  //#region Tabulator
  subsList: Subscription[] = [];
  currentBtnResult;
  // listenToClickedButton() {
  //   let sub = this.sharedServices.getClickedbutton().subscribe({
  //     next: (currentBtn: ToolbarData) => {
  //       currentBtn;

  //       if (currentBtn != null) {
  //         if (currentBtn.action == ToolbarActions.List) {
  //           this.sharedServices.changeToolbarPath({
  //             listPath: this.listUrl,
  //           } as ToolbarPath);
  //           this.router.navigate([this.listUrl]);
  //         } else if (currentBtn.action == ToolbarActions.Save) {
  //          // this.onSave();
  //         } else if (currentBtn.action == ToolbarActions.New) {
  //           this.toolbarPathData.componentAdd = 'Add accountClassification';
  //          // this.defineaccountClassificationForm();
  //           this.sharedServices.changeToolbarPath(this.toolbarPathData);
  //         } else if (currentBtn.action == ToolbarActions.Update) {
  //          // this.onUpdate();
  //         }
  //       }
  //     },
  //   });
  //   this.subsList.push(sub);
  // }
  // changePath() {
  //   this.sharedServices.changeToolbarPath(this.toolbarPathData);
  // }


}

