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
import { VoucherServiceProxy } from '../../../services/voucher.service';
import { VoucherTypeServiceProxy } from '../../../services/voucher-type.service';
import {VoucherType} from 'src/app/erp/Accounting/models/voucher-type'
import { GeneralConfigurationServiceProxy } from '../../../services/general-configurations.services';
import { BeneficiaryTypeArEnum, BeneficiaryTypeEnum, convertEnumToArray } from 'src/app/shared/constants/enumrators/enums';
import { ICustomEnum } from 'src/app/shared/interfaces/ICustom-enum';

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
  currencyId:any;
  cashAccountId:any;
  voucherkindId:any;
  showSearchCashAccountModal = false;
  showSearchCostCenterAccountModal = false;
  showSearchBeneficiaryAccountsModal = false;
  showSearhBeneficiaryAccountsModal=false;
  showSearchCurrencyModal=false;
  showSearchCurrencyInDetailsModal=false;
  showSearchCostCenterAccountsInDetailsModal=false;
  enableMultiCurrencies:boolean=true

  voucher: Voucher = new Voucher();
  voucherDetails: VoucherDetails[] = [];
  _voucherDetails: VoucherDetails = new VoucherDetails();
  selectedVoucherDetails: VoucherDetails = new VoucherDetails();
  beneficiaryTypesEnum: ICustomEnum[] = [];

  sub: any;
  url: any;
  id: any = 0;
  currnetUrl;
  errorMessage = '';
  errorClass = '';
  lang = localStorage.getItem("language")
  routeAccountApi = 'Account/get-ddl?'
  routeCurrencyApi = "currency/get-ddl?"

  cashAccountsList: any;
  costCenterAccountsList: any;
  beneficiaryAccountsList: any;
  costCenterAccountsInDetailsList:any;
  currenciesList:any;
  currenciesListInDetails:any;

  queryParams: any;
  voucherTypeId: any;
  voucherType: VoucherType[] = [];


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
    private voucherService: VoucherServiceProxy,
    private voucherTypeService: VoucherTypeServiceProxy,
    private generalConfigurationService: GeneralConfigurationServiceProxy,


  

  ) {
    this.defineVoucherForm();
  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    debugger
    // this.sub = this.route.params.subscribe(params => {
    //   debugger
    //     if (params['voucherTypeId'] != null) {
    //       this.voucherTypeId = params['voucherTypeId'];
    //     }
    //   })
    this.getBeneficiaryTypes();
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
      if (params['voucherTypeId'] != null) {
        this.voucherTypeId = params['voucherTypeId'];
        if(this.voucherTypeId)
        {
          this.getVoucherTypes(this.voucherTypeId);
         // this.getGeneralConfigurations();
        }
      }
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
    voucherTypeId:this.voucherTypeId,
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
  getVoucherTypes(id) {

    const promise = new Promise<void>((resolve, reject) => {
      this.voucherTypeService.getVoucherType(id).subscribe({
        next: (res: any) => {
          debugger
          console.log('result data getbyid', res);
           this.cashAccountId=res.response.defaultAccountId;
           this.currencyId= res.response.defaultCurrencyId;
           this.voucherkindId=res.response.voucherKindId;

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
  getGeneralConfigurations() {
    debugger
    const promise = new Promise<void>((resolve, reject) => {
      debugger
      this.generalConfigurationService.getGeneralConfiguration(2).subscribe({
        next: (res: any) => {
          debugger
          console.log('result data getbyid', res);
          if(res.response.value='true')
          {
            this.enableMultiCurrencies=true;
          }
        

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
  getAccounts() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeAccountApi).subscribe({
        next: (res) => {

          if (res.success) {
            this.cashAccountsList = res.response;
            this.costCenterAccountsList = res.response;
            this.beneficiaryAccountsList = res.response;
            this.costCenterAccountsInDetailsList = res.response;

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
            this.currenciesListInDetails = res.response;

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

  // openCurrencySearchDialog(i = -1) {
  //   let searchTxt = '';
  //   if (i == -1) {
  //     searchTxt = this.selectedVoucherDetails?.currencyNameAr ?? '';
  //   } else {
  //     searchTxt = ''
  //     // this.selectedRentContractUnits[i].unitNameAr!;
  //   }

  //   let data = this.currenciesList.filter((x) => {
  //     return (
  //       (x.nameAr + ' ' + x.nameEn).toLowerCase().includes(searchTxt) ||
  //       (x.nameAr + ' ' + x.nameEn).toUpperCase().includes(searchTxt)
  //     );
  //   });

  //   if (data.length == 1) {
  //     if (i == -1) {
  //       this.selectedVoucherDetails!.currencyNameAr = data[0].nameAr;
  //       this.selectedVoucherDetails!.currencyId = data[0].id;
  //     } else {
  //       this.voucherDetails[i].currencyNameAr = data[0].nameAr;
  //       this.voucherDetails[i].currencyId = data[0].id;
  //     }
  //   } else {
  //     let lables = ['الكود', 'الاسم', 'الاسم الانجليزى'];
  //     let names = ['code', 'nameAr', 'nameEn'];
  //     let title = 'بحث عن العملة';
  //     let sub = this.searchDialog
  //       .showDialog(lables, names, this.currenciesList, title, searchTxt)
  //       .subscribe((d) => {
  //         if (d) {
  //           if (i == -1) {
  //             this.selectedVoucherDetails!.currencyNameAr = d.nameAr;
  //       this.selectedVoucherDetails!.currencyId = d.id;
  //           } else {
  //             this.voucherDetails[i].currencyNameAr = d.nameAr;
  //             this.voucherDetails[i].currencyId = d.id;
  //           }
  //         }
  //       });
  //     this.subsList.push(sub);
  //   }

  // }
  onSelectCashAccount(event) {
    this.voucherForm.controls.cashAccountId.setValue(event.id);
    this.showSearchCashAccountModal = false;
  }
  onSelectCostCenterAccount(event) {
    this.voucherForm.controls.costCenterAccountId.setValue(event.id);
    this.showSearchCostCenterAccountModal = false;
  }
  onSelectCurrency(event) {
    this.voucherForm.controls.currencyId.setValue(event.id);
    this.showSearchCurrencyModal = false;
  }
  onSelectCurrencyInDetails(event) {
     this.selectedVoucherDetails.currencyId=(event.id);
    // this.showSearchCurrencyModal = false;
  }
  onSelectBeneficiaryAccounts(event) {
    this.selectedVoucherDetails.beneficiaryAccountId=(event.id);
   // this.showSearchCurrencyModal = false;
 }
  onSelectBeneficiaryAccount(event) {
  //  this.selectedVoucherDetails.currencyId=(event.id);
   // this.showSearchCurrencyModal = false;
 }
 onSelectCostCenterAccountsInDetails(event)
 {
  
 }
  getBeneficiaryTypes() {
    if (this.lang == 'en') {
      this.beneficiaryTypesEnum = convertEnumToArray(BeneficiaryTypeEnum);
    }
    else {
      this.beneficiaryTypesEnum = convertEnumToArray(BeneficiaryTypeArEnum);

    }
  }
  addItem()
  {

  }
  calculateTotal(a)
  {

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

