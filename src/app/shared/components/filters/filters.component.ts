import { Component, OnInit, Output, Input, EventEmitter, OnDestroy, ViewChild, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { DateModel } from '../../model/date-model';
import { SharedService } from '../../common-services/shared-service';
import { DateConverterService } from 'src/app/shared/services/date-services/date-converter.service';
import { PublicService } from '../../services/public.service';
import { ICustomEnum } from '../../interfaces/ICustom-enum';
import { EntriesStatusEnum, EntriesStatusArEnum, convertEnumToArray } from '../../constants/enumrators/enums';


@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.css']
})
export class FiltersComponent implements OnInit, AfterViewInit, OnDestroy {

  selectedFromDate!: DateModel;
  selectedToDate!: DateModel;
  dateType: number = 1;
  enableFilters: boolean = false;
  lang = localStorage.getItem("language")
  selectedAccountGroupId: any;
  level:any;
  accountGroupList: any;
  routeAccountGroupApi = "AccountGroup/get-ddl?"

  selectedLeafAccountId: any;
  selectedMainAccountId: any;
  mainAccountsList: any;
  leafAccountsList: any;
  routeAccountApi = "Account/get-ddl?"


  selectedCostCenterId: any;
  costCenterList: any;

  routeCostCenterApi = "CostCenter/get-ddl?"
  selectedEntriesStatusId: any;
  entriesStatusEnum: ICustomEnum[] = [];

  selectedCurrencyId: any;

  routeCurrencyApi = "Currency/get-ddl?"
  currenciesList: any;

  selectedBranchId: any;
  branchesList: any;
  routeBranchApi = "Branch/get-ddl?"
  selectedVoucherId: any;
  vouchersList: any;
  routeVoucherApi = "Voucher/get-ddl?"

  @Output() OnFilter: EventEmitter<{

    fromDate, toDate, accountGroupId,mainAccountId, leafAccountId, entriesStatusId, currencyId, branchId, voucherId,level
  }> = new EventEmitter();

  @Input() ShowOptions: {
    ShowFromDate: boolean,
    ShowToDate: boolean, ShowSearch: boolean, ShowAccountGroup: boolean, ShowMainAccount: boolean, ShowLeafAccount: boolean,
    ShowCostCenter: boolean, ShowEntriesStatus: boolean, ShowCurrency: boolean, ShowBranch: boolean, ShowVoucher: boolean,ShowLevel:boolean
  } = {

      ShowFromDate: false,
      ShowToDate: false,
      ShowSearch: true,
      ShowAccountGroup: false,
      ShowMainAccount: false,
      ShowLeafAccount: false,
      ShowCostCenter: false,
      ShowEntriesStatus: false,
      ShowCurrency: false,
      ShowBranch: false,
      ShowVoucher: false,
      ShowLevel:false
    }

  subsList: Subscription[] = [];
  lblFromDate: string = "من تاريخ";
  lblToDate: string = "إلى تاريخ";


  constructor(
    private sharedServices: SharedService,
    private dateConverterService: DateConverterService,
    private publicService: PublicService,

    private spinner: NgxSpinnerService) {
    this.GetData();
  }

  getLanguage() {
    this.sharedServices.getLanguage().subscribe(res => {
      this.lang = res
    })
  }
  ngOnInit() {
    this.getLanguage();
    //this.GetData();

  }
  ngAfterViewInit(): void {
    debugger;
    this.selectedFromDate = this.dateConverterService.getCurrentDate();
    this.selectedToDate = this.dateConverterService.getCurrentDate();
  }
  ngOnDestroy() {
    this.subsList.forEach(s => {
      if (s) {
        s.unsubscribe();
      }
    })
  }
  onSelectFromDate(e: DateModel) {
    debugger
    this.selectedFromDate = e
    this.FireSearch()
  }

  onSelectToDate(e: DateModel) {
    this.selectedToDate = e;
    this.FireSearch()
  }



  GetData() {
    this.spinner.show();
    this.getEntriesStatusEnum();
    Promise.all([
      this.getAccountGroup(),
      this.getAccounts(),
      this.getCostCenter(),
      this.getCurrencies(),
      this.getBranches(),
      this.getVouchers()


    ]).then(a => {
      ////(("All Data have been loaded. Enable Filters")
      this.enableFilters = true;
      this.spinner.hide();
    }).catch((err) => {
      this.spinner.hide();
    })
  }


  getAccountGroup() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeAccountGroupApi).subscribe({
        next: (res) => {

          if (res.success) {
            debugger
            this.accountGroupList = res.response;

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

  getAccounts() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeAccountApi).subscribe({
        next: (res) => {
          if (res.success) {
            if (this.selectedAccountGroupId != null && this.selectedAccountGroupId != undefined) {
              this.mainAccountsList = res.response.filter(x => x.accountGroupId == this.selectedAccountGroupId && x.isLeafAccount != true && x.isActive==true);
              if (this.selectedMainAccountId != null && this.selectedMainAccountId != undefined) {
                this.leafAccountsList = res.response.filter(x => x.accountGroupId == this.selectedAccountGroupId && x.isLeafAccount == true && x.parentId == this.selectedMainAccountId && x.isActive==true);
              }
              else {
                this.leafAccountsList = res.response.filter(x => x.accountGroupId == this.selectedAccountGroupId && x.isLeafAccount == true && x.isActive==true);

              }
            }
             else {
              this.mainAccountsList = res.response.filter(x => x.isLeafAccount != true && x.isActive==true);
               if (this.selectedMainAccountId != null && this.selectedMainAccountId != undefined) {
                 this.leafAccountsList = res.response.filter(x => x.isLeafAccount == true && x.parentId == this.selectedMainAccountId && x.isActive==true);

               }
               else {
                this.leafAccountsList = res.response.filter(x => x.isLeafAccount == true && x.isActive==true);
              }

            }

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

  getAccountsByAccountGroup()
  {
    debugger
    if (this.selectedAccountGroupId != null && this.selectedAccountGroupId != undefined) {
        this.mainAccountsList = this.mainAccountsList.filter(x => x.accountGroupId == this.selectedAccountGroupId);
        this.leafAccountsList = this.leafAccountsList.filter(x => x.accountGroupId == this.selectedAccountGroupId);

    }
    else
    {
      this.mainAccountsList = this.mainAccountsList;
      this.leafAccountsList = this.leafAccountsList;
    }
            
 }
 getLeafAccountsByMainAccount()
 {
   debugger
   if (this.selectedMainAccountId != null && this.selectedMainAccountId != undefined) {
       this.leafAccountsList = this.leafAccountsList.filter(x => x.parentId == this.selectedMainAccountId);

   }
   else
   {
     this.leafAccountsList = this.leafAccountsList;
   }
           
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

  getEntriesStatusEnum() {
    if (this.lang == 'en') {
      this.entriesStatusEnum = convertEnumToArray(EntriesStatusEnum);
    }
    else {
      this.entriesStatusEnum = convertEnumToArray(EntriesStatusArEnum);

    }
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
  getBranches() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeBranchApi).subscribe({
        next: (res) => {
          if (res.success) {

            this.branchesList = res.response;
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
  getVouchers() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeVoucherApi).subscribe({
        next: (res) => {
          if (res.success) {

            this.vouchersList = res.response;
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
  FireSearch() {
    debugger
    if (!this.selectedFromDate) {
      this.selectedFromDate = this.dateConverterService.getCurrentDate();
    }
    if (!this.selectedToDate) {
      this.selectedToDate = this.dateConverterService.getCurrentDate();
    }
    this.OnFilter.emit({

      fromDate: this.selectedFromDate,
      toDate: this.selectedToDate,
      accountGroupId: this.selectedAccountGroupId,
      mainAccountId: this.selectedMainAccountId,

      leafAccountId: this.selectedLeafAccountId,
      entriesStatusId: this.selectedEntriesStatusId,
      currencyId: this.selectedCurrencyId,
      branchId: this.selectedBranchId,
      voucherId: this.selectedVoucherId,
      level:this.level



    })
  }
  onSelectAccountGroup() {
    this.FireSearch()

  }
  onSelectMainAccount() {
    this.FireSearch()

  }
  onSelectLeafAccount() {
    this.FireSearch()

  }
  onSelectCostCenter() {
    this.FireSearch()

  }
  onSelectEntriesStatus() {
    this.FireSearch()

  }
  onSelectCurrency() {
    this.FireSearch()

  }
  onSelectBranch() {
    this.FireSearch()

  }
  onSelectVoucher() {
    this.FireSearch()

  }
  onChangeLevel() {
    this.FireSearch()

  }
}
