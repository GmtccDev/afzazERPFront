import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { REQUIRED_VALIDATORS } from 'src/app/shared/constants/input-validators';
import { ToolbarPath } from 'src/app/shared/interfaces/toolbar-path';
import { PublicService } from 'src/app/shared/services/public.service';
import { Voucher, VoucherDetails } from 'src/app/erp/Accounting/models/voucher'
import { VoucherServiceProxy } from '../../../services/voucher.service';
import { VoucherTypeServiceProxy } from '../../../services/voucher-type.service';
import { VoucherType } from 'src/app/erp/Accounting/models/voucher-type'
import { GeneralConfigurationServiceProxy } from '../../../services/general-configurations.services';
import { BeneficiaryTypeArEnum, BeneficiaryTypeEnum, convertEnumToArray } from 'src/app/shared/constants/enumrators/enums';
import { ICustomEnum } from 'src/app/shared/interfaces/ICustom-enum';
import { SearchDialogService } from 'src/app/shared/services/search-dialog.service'
import { ToolbarData } from 'src/app/shared/interfaces/toolbar-data';
import { SharedService } from 'src/app/shared/common-services/shared-service';
import { NotificationsAlertsService } from 'src/app/shared/common-services/notifications-alerts.service';
import { ToolbarActions } from 'src/app/shared/enum/toolbar-actions';
import { formatDate, navigateUrl } from 'src/app/shared/helper/helper-url';

@Component({
  selector: 'app-add-edit-voucher',
  templateUrl: './add-edit-voucher.component.html',
  styleUrls: ['./add-edit-voucher.component.scss']
})
export class AddEditVoucherComponent implements OnInit {
  //#region Main Declarations
  branchId: string = localStorage.getItem("branchId");
  companyId: string = localStorage.getItem("companyId");
  //voucherForm!: FormGroup;
  voucherForm: FormGroup = new FormGroup({});
  currencyId: any;
  cashAccountId: any;
  voucherkindId: any;
  showSearchCashAccountModal = false;
  showSearchCostCenterAccountModal = false;
  showSearchBeneficiaryAccountsModal = false;
  showSearhBeneficiaryAccountsModal = false;
  showSearchCurrencyModal = false;
  showSearchCurrencyInDetailsModal = false;
  showSearchCostCenterAccountsInDetailsModal = false;
  enableMultiCurrencies: boolean = true
  totalDebit:number = 0;
  totalCredit:number = 0;
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
  costCenterAccountsInDetailsList: any;
  currenciesList: any;
  currenciesListInDetails: any;

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
    private searchDialog: SearchDialogService,
    private sharedServices: SharedService,
    private alertsService:NotificationsAlertsService,
    private spinnerService: NgxSpinnerService,




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
    this.listenToClickedButton();

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
        if (this.voucherTypeId) {
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
      companyId: this.companyId,
      branchId: this.branchId,
      voucherTypeId: this.voucherTypeId,
      voucherCode: REQUIRED_VALIDATORS,
      voucherDate: ['', Validators.compose([Validators.required])],
      cashAccountId: REQUIRED_VALIDATORS,
      costCenterAccountId: '',
      currencyId: REQUIRED_VALIDATORS,
      description: '',
      voucherTotal: REQUIRED_VALIDATORS

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
          this.cashAccountId = res.response.defaultAccountId;
          this.currencyId = res.response.defaultCurrencyId;
          this.voucherkindId = res.response.voucherKindId;

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
          if (res.response.value = 'true') {
            this.enableMultiCurrencies = true;
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

  openCurrencySearchDialog(i = -1) {
    debugger
    let searchTxt = '';
    if (i == -1) {
      searchTxt = this.selectedVoucherDetails?.currencyNameAr ?? '';
    } else {
      searchTxt = ''
      // this.selectedRentContractUnits[i].unitNameAr!;
    }

    let data = this.currenciesListInDetails.filter((x) => {
      return (
        (x.nameAr + ' ' + x.nameEn).toLowerCase().includes(searchTxt) ||
        (x.nameAr + ' ' + x.nameEn).toUpperCase().includes(searchTxt)
      );
    });

    if (data.length == 1) {
      if (i == -1) {
        this.selectedVoucherDetails!.currencyNameAr = data[0].nameAr;
        this.selectedVoucherDetails!.currencyId = data[0].id;
      } else {
        this.voucherDetails[i].currencyNameAr = data[0].nameAr;
        this.voucherDetails[i].currencyId = data[0].id;
      }
    } else {
      let lables = ['الكود', 'الاسم', 'الاسم الانجليزى'];
      let names = ['code', 'nameAr', 'nameEn'];
      let title = 'بحث عن العملة';
      let sub = this.searchDialog
        .showDialog(lables, names, this.currenciesListInDetails, title, searchTxt)
        .subscribe((d) => {
          if (d) {
            if (i == -1) {
              this.selectedVoucherDetails!.currencyNameAr = d.nameAr;
              this.selectedVoucherDetails!.currencyId = d.id;
            } else {
              this.voucherDetails[i].currencyNameAr = d.nameAr;
              this.voucherDetails[i].currencyId = d.id;
            }
          }
        });
      this.subsList.push(sub);
    }

  }
  openBeneficiaryAccountSearchDialog(i = -1) {
    debugger
    let searchTxt = '';
    if (i == -1) {
      searchTxt = this.selectedVoucherDetails?.beneficiaryAccountNameAr ?? '';
    } else {
      searchTxt = ''
      // this.selectedRentContractUnits[i].unitNameAr!;
    }

    let data = this.beneficiaryAccountsList.filter((x) => {
      return (
        (x.nameAr + ' ' + x.nameEn).toLowerCase().includes(searchTxt) ||
        (x.nameAr + ' ' + x.nameEn).toUpperCase().includes(searchTxt)
      );
    });

    if (data.length == 1) {
      if (i == -1) {
        this.selectedVoucherDetails!.beneficiaryAccountNameAr = data[0].nameAr;
        this.selectedVoucherDetails!.beneficiaryAccountId = data[0].id;
      } else {
        this.voucherDetails[i].beneficiaryAccountNameAr = data[0].nameAr;
        this.voucherDetails[i].beneficiaryAccountId = data[0].id;
      }
    } else {
      let lables = ['الكود', 'الاسم', 'الاسم الانجليزى'];
      let names = ['code', 'nameAr', 'nameEn'];
      let title = 'بحث عن الحساب';
      let sub = this.searchDialog
        .showDialog(lables, names, this.beneficiaryAccountsList, title, searchTxt)
        .subscribe((d) => {
          if (d) {
            if (i == -1) {
              this.selectedVoucherDetails!.beneficiaryAccountNameAr = d.nameAr;
              this.selectedVoucherDetails!.beneficiaryAccountId = d.id;
            } else {
              this.voucherDetails[i].beneficiaryAccountNameAr = d.nameAr;
              this.voucherDetails[i].beneficiaryAccountId = d.id;
            }
          }
        });
      this.subsList.push(sub);
    }

  }
  openCostCenterAccountSearchDialog(i = -1) {
    debugger
    let searchTxt = '';
    if (i == -1) {
      searchTxt = this.selectedVoucherDetails?.costCenterAccountNameAr ?? '';
    } else {
      searchTxt = ''
      // this.selectedRentContractUnits[i].unitNameAr!;
    }

    let data = this.costCenterAccountsInDetailsList.filter((x) => {
      return (
        (x.nameAr + ' ' + x.nameEn).toLowerCase().includes(searchTxt) ||
        (x.nameAr + ' ' + x.nameEn).toUpperCase().includes(searchTxt)
      );
    });

    if (data.length == 1) {
      if (i == -1) {
        this.selectedVoucherDetails!.costCenterAccountNameAr = data[0].nameAr;
        this.selectedVoucherDetails!.costCenterAccountId = data[0].id;
      } else {
        this.voucherDetails[i].costCenterAccountNameAr = data[0].nameAr;
        this.voucherDetails[i].costCenterAccountId = data[0].id;
      }
    } else {
      let lables = ['الكود', 'الاسم', 'الاسم الانجليزى'];
      let names = ['code', 'nameAr', 'nameEn'];
      let title = 'بحث عن الحساب';
      let sub = this.searchDialog
        .showDialog(lables, names, this.costCenterAccountsInDetailsList, title, searchTxt)
        .subscribe((d) => {
          if (d) {
            if (i == -1) {
              this.selectedVoucherDetails!.costCenterAccountNameAr = d.nameAr;
              this.selectedVoucherDetails!.costCenterAccountId = d.id;
            } else {
              this.voucherDetails[i].costCenterAccountNameAr = d.nameAr;
              this.voucherDetails[i].costCenterAccountId = d.id;
            }
          }
        });
      this.subsList.push(sub);
    }

  }
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
 
 
  getBeneficiaryTypes() {
    if (this.lang == 'en') {
      this.beneficiaryTypesEnum = convertEnumToArray(BeneficiaryTypeEnum);
    }
    else {
      this.beneficiaryTypesEnum = convertEnumToArray(BeneficiaryTypeArEnum);

    }
  }
  addItem() {
    debugger
    this.voucherDetails.push({
      id: 0,
      voucherId: this.selectedVoucherDetails?.voucherId ?? 0,
      debit: this.selectedVoucherDetails?.debit ?? 0,
      credit: this.selectedVoucherDetails?.credit ?? 0,
      currencyId: this.selectedVoucherDetails?.currencyId ?? 0,
      currencyConversionFactor: this.selectedVoucherDetails?.currencyConversionFactor ?? 0,
      debitAfterConversion: this.selectedVoucherDetails?.debitAfterConversion ?? 0,
      creditAfterConversion: this.selectedVoucherDetails?.creditAfterConversion ?? 0,
      beneficiaryTypeId: this.selectedVoucherDetails?.beneficiaryTypeId ?? 0,
      beneficiaryAccountId: this.selectedVoucherDetails?.beneficiaryAccountId ?? 0,
      description: this.selectedVoucherDetails?.description ?? '',
      costCenterAccountId: this.selectedVoucherDetails?.costCenterAccountId ?? 0,
      currencyNameAr:this.selectedVoucherDetails?.currencyNameAr ?? '',
      currencyNameEn: this.selectedVoucherDetails?.currencyNameEn ?? '',
      beneficiaryAccountNameAr:this.selectedVoucherDetails?.beneficiaryAccountNameAr ?? '',
      beneficiaryAccountNameEn: this.selectedVoucherDetails?.beneficiaryAccountNameEn ?? '',
      costCenterAccountNameAr:  this.selectedVoucherDetails?.costCenterAccountNameAr ?? '',
      costCenterAccountNameEn:  this.selectedVoucherDetails?.costCenterAccountNameEn ?? ''
    });
    this.voucher!.voucherDetails = this.voucherDetails;
    

    this.totalDebit += this.selectedVoucherDetails?.debit ?? 0;
    this.totalCredit += this.selectedVoucherDetails?.credit ?? 0;
    if(this.voucherkindId==1)
    {
    this.voucherForm.controls["voucherTotal"].setValue(this.totalDebit)
    }
    if(this.voucherkindId==2)
    {
    this.voucherForm.controls["voucherTotal"].setValue(this.totalCredit)
    }

    this.clearSelectedItemData();

  }
  deleteItem(index) {
    debugger
    if (this.voucherDetails.length) {
      if (this.voucherDetails.length == 1) {
        this.voucherDetails = [];
      } else {
        this.voucherDetails.splice(index, 1);
      }
    }
    debugger
    this.voucher.voucherDetails=this.voucherDetails;

    this.totalDebit =this.totalDebit- this.voucherDetails[index]?.debit ?? 0;
    this.totalCredit =this.totalDebit- this.voucherDetails[index]?.credit ?? 0;
    if(this.voucherkindId==1)
    {
    this.voucherForm.controls["voucherTotal"].setValue(this.totalDebit)
    }
    if(this.voucherkindId==2)
    {
    this.voucherForm.controls["voucherTotal"].setValue(this.totalCredit)
    }
  }
  clearSelectedItemData() {
    this.selectedVoucherDetails = {
      id: 0,
      voucherId: 0,
      debit: 0,
      credit: 0,
      currencyId: 0,
      currencyConversionFactor: 0,
      debitAfterConversion: 0,
      creditAfterConversion: 0,
      beneficiaryTypeId: 0,
      beneficiaryAccountId: 0,
      description: '',
      costCenterAccountId: 0,
      currencyNameAr: '',
      currencyNameEn: '',
      beneficiaryAccountNameAr:'',
      beneficiaryAccountNameEn:'',
      costCenterAccountNameAr: '',
      costCenterAccountNameEn: ''
    }
  }
  calculateTotal(a) {

  }
  setInputData() {
    debugger
    this.voucher = {
      id: this.voucherForm.controls["id"].value,
      companyId: this.voucherForm.controls["companyId"].value,
      branchId: this.voucherForm.controls["branchId"].value,
      voucherTypeId: this.voucherForm.controls["voucherTypeId"].value,
      voucherCode: this.voucherForm.controls["voucherCode"].value,
      voucherDate: formatDate(Date.parse(this.voucherForm.controls["voucherDate"].value)),
      cashAccountId: this.voucherForm.controls["cashAccountId"].value,
      costCenterAccountId :this.voucherForm.controls["costCenterAccountId"].value,
      currencyId: this.voucherForm.controls["currencyId"].value,
      description:  this.voucherForm.controls["description"].value,
      voucherTotal:  this.voucherForm.controls["voucherTotal"].value,
      voucherDetails: this.voucher.voucherDetails ?? [],
     

    };


  }
  onSave() {
    if(this.voucher.voucherDetails.length==0)
    {
      this.errorMessage = this.translate.instant("voucher.voucher-details-required");
      this.errorClass = 'errorMessage';
      this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
      return;
    }
    debugger
    if (this.voucherForm.valid) {
      this.spinnerService.show();
     // this.setInputData();

      this.voucherForm.controls.voucherTypeId.setValue(this.voucherTypeId);
     // this.voucherForm.controls.voucherDate.setValue(this.voucherTypeId);

      const promise = new Promise<void>((resolve, reject) => {
        var entity = this.voucherForm.value;
        console.log('voucherForm ', this.voucherForm.value);

        this.voucherService.createVoucher(entity).subscribe({
          next: (result: any) => {
            debugger
            console.log('result dataaddData ', result);
          var c=  result.data.id

            this.defineVoucherForm();

           // this.submited = false;
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
      // let sub = this.voucherServices.addWithResponse<Voucher>("AddVoucher?uniques=Code&uniques=TypeId&checkAll=true", this.voucher).subscribe({
      //   next: (res) => {
      //     debugger
      //     this.spinnerService.hide();
      //     if (res.success) {
      //       this.showResponseMessage(
      //         res.success,
      //         AlertTypes.success,
      //         this.translate.transform('messages.add-success')
      //       );
      //       this.router.navigate([this.listUrl], {
      //         queryParams: {
      //           "typeId": this.typeId
      //         }
      //       })
      //     }
      //   },
      //   error: (err: any) => {
      //     this.spinnerService.hide();
      //   }

      // });

     // this.subsList.push(sub);
    }
    else {
      this.errorMessage = this.translate.instant("validation-messages.invalid-data");
      this.errorClass = 'errorMessage';
      this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
      return this.voucherForm.markAllAsTouched();

    }
  }
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
            this.toolbarPathData.componentAdd = 'Add Voucher';
            this.defineVoucherForm();
            this.sharedServices.changeToolbarPath(this.toolbarPathData);
          } else if (currentBtn.action == ToolbarActions.Update) {
           // this.onUpdate();
          }
        }
      },
    });
    this.subsList.push(sub);
  }
  changePath() {
    this.sharedServices.changeToolbarPath(this.toolbarPathData);
  }


}

