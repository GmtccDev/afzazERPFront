import { Component, OnInit, Output, Input, EventEmitter, OnDestroy, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { DateModel } from '../../model/date-model';
import { SharedService } from '../../common-services/shared-service';
import { DateConverterService } from 'src/app/shared/services/date-services/date-converter.service';
import { PublicService } from '../../services/public.service';
import { ICustomEnum } from '../../interfaces/ICustom-enum';
import { EntriesStatusEnum, EntriesStatusArEnum, convertEnumToArray, VoucherTypeEnum, VoucherTypeArEnum, ReportOptionsEnum, ReportOptionsArEnum } from '../../constants/enumrators/enums';
import { GeneralConfigurationServiceProxy } from 'src/app/erp/Accounting/services/general-configurations.services';
import { FiscalPeriodServiceProxy } from 'src/app/erp/Accounting/services/fiscal-period.services';
import { BranchDto } from 'src/app/erp/master-codes/models/branch';


@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.css']
})
export class FiltersComponent implements OnInit, AfterViewInit, OnDestroy {

  selectedFromDate!: DateModel;
  selectedToDate!: DateModel;

  voucherTypes: ICustomEnum[] = [];
  branchIds: any = '';

  dateType: number = 1;
  enableFilters: boolean = false;
  lang = localStorage.getItem("language")
  selectedAccountGroupId: any;
  level:any=1;
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
  selectedReportOptionId: any;

  entriesStatusEnum: ICustomEnum[] = [];
  reportOptionsEnum: ICustomEnum[] = [];

  selectedCurrencyId: any;

  routeCurrencyApi = "Currency/get-ddl?"
  currenciesList: any;

 // selectedBranchId: any;
  selectedBranchId: BranchDto[];

  branchesList: any;
  routeBranchApi = "Branch/get-ddl?"
  selectedVoucherId: any;
  selectedVoucherKindId: any;

  vouchersList: any;
  routeVoucherApi = "Voucher/get-ddl?"
  facialPeriodId:any;
  fromEntryNo:any;
  toEntryNo:any;
  costCenterId:any;
  @Output() OnFilter: EventEmitter<{

    fromDate, toDate, accountGroupId,mainAccountId, leafAccountId, entriesStatusId, currencyId, branchId,
    voucherKindId, voucherId,level,reportOptionId,fromEntryNo,toEntryNo,costCenterId
  }> = new EventEmitter();

  @Input() ShowOptions: {
    ShowFromDate: boolean,
    ShowToDate: boolean, ShowSearch: boolean, ShowAccountGroup: boolean, ShowMainAccount: boolean, ShowLeafAccount: boolean,
    ShowCostCenter: boolean, ShowEntriesStatus: boolean, ShowCurrency: boolean, ShowBranch: boolean, ShowVoucherKind: boolean, ShowVoucher: boolean,ShowLevel:boolean,
    ShowReportOptions:boolean,ShowFromEntryNo:boolean,ShowToEntryNo:boolean
  } = {

      ShowFromDate: false,
      ShowToDate: false,
      ShowSearch: false,
      ShowAccountGroup: false,
      ShowMainAccount: false,
      ShowLeafAccount: false,
      ShowCostCenter: false,
      ShowEntriesStatus: false,
      ShowCurrency: false,
      ShowBranch: false,
      ShowVoucherKind:false,
      ShowVoucher: false,
      ShowLevel:false,
      ShowReportOptions:false,
      ShowFromEntryNo:false,
      ShowToEntryNo:false
    }

  subsList: Subscription[] = [];
  lblFromDate: string = "من تاريخ";
  lblToDate: string = "إلى تاريخ";


  constructor(
    private sharedServices: SharedService,
    private dateConverterService: DateConverterService,
    private publicService: PublicService,
    private generalConfigurationService: GeneralConfigurationServiceProxy,
    private fiscalPeriodService: FiscalPeriodServiceProxy,

    private spinner: NgxSpinnerService) {
    this.GetData();
  }


  ngOnInit() {
   // this.getLanguage();
    //this.GetData();
    this.getGeneralConfigurationsOfAccountingPeriod()
    debugger
  


  }
  ngAfterViewInit(): void {

  }
  ngOnDestroy() {
    this.subsList.forEach(s => {
      if (s) {
        s.unsubscribe();
      }
    })
  }
 



  GetData() {
    this.spinner.show();
    this.getVoucherType();
    this.getEntriesStatusEnum();
    this.getReportOptionsEnum();

    Promise.all([
      this.getAccountGroup(),
      this.getAccounts(),
      this.getCostCenter(),
      this.getCurrencies(),
      this.getBranches(),
      this.getVouchers()


    ]).then(a => {
      this.enableFilters = true;
      this.spinner.hide();
    }).catch((err) => {
      this.spinner.hide();
    })
  }
  getVoucherType() {
    if (this.lang == 'en') {
      this.voucherTypes = convertEnumToArray(VoucherTypeEnum);
    }
    else {
      this.voucherTypes = convertEnumToArray(VoucherTypeArEnum);

    }
  }

  getAccountGroup() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeAccountGroupApi).subscribe({
        next: (res) => {

          if (res.success) {
            
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
  getReportOptionsEnum() {
    if (this.lang == 'en') {
      this.reportOptionsEnum = convertEnumToArray(ReportOptionsEnum);
    }
    else {
      this.reportOptionsEnum = convertEnumToArray(ReportOptionsArEnum);

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
  getGeneralConfigurationsOfAccountingPeriod() {
    debugger
    const promise = new Promise<void>((resolve, reject) => {
      debugger
      this.generalConfigurationService.getGeneralConfiguration(7).subscribe({
        next: (res: any) => {
          debugger
          console.log('result data getbyid', res);
          if (res.response.value > 0) {
            debugger
            this.facialPeriodId = res.response.value;
            this.getfiscalPeriodById(this.facialPeriodId);
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
  getfiscalPeriodById(id: any) {
    const promise = new Promise<void>((resolve, reject) => {
      this.fiscalPeriodService.getFiscalPeriod(id).subscribe({
        next: (res: any) => {
          debugger
          console.log('result data getbyid', res);
          this.selectedFromDate=this.dateConverterService.getDateForCalender(res.response.fromDate);
          this.selectedToDate=this.dateConverterService.getDateForCalender(res.response.toDate);


        
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
  FireSearch() {
    debugger
    if (!this.selectedFromDate) {
    //  this.selectedFromDate = this.dateConverterService.getCurrentDate();
    }
    if (!this.selectedToDate) {
    //  this.selectedToDate = this.dateConverterService.getCurrentDate();
    }
    this.OnFilter.emit({

      fromDate: this.selectedFromDate,
      toDate: this.selectedToDate,
      accountGroupId: this.selectedAccountGroupId,
      mainAccountId: this.selectedMainAccountId,
      leafAccountId: this.selectedLeafAccountId,
      entriesStatusId: this.selectedEntriesStatusId,
      currencyId: this.selectedCurrencyId,
      branchId: this.branchIds,
      voucherKindId: this.selectedVoucherKindId,
      voucherId: this.selectedVoucherId,
      level:this.level,
      fromEntryNo:this.fromEntryNo,
      toEntryNo:this.toEntryNo,

      reportOptionId: this.selectedReportOptionId,
      costCenterId:this.selectedCostCenterId




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
  onSelectVoucherKind()
  {
    this.FireSearch()

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
  onSelectReportOption() {
    this.FireSearch()

  }
  onSelectCurrency() {
    this.FireSearch()

  }
  onSelectBranch() {
    debugger
    this.branchIds=''
    this.selectedBranchId?.forEach(c => {
      this.branchIds += c.id + ",";
    })

    this.branchIds = this.branchIds.substring(0, this.branchIds.length - 1);

    this.FireSearch()
   
  }
  onSelectVoucher() {
    this.FireSearch()

  }
  onChangeLevel()
  {
    this.FireSearch()

  }
  onChangeFromEntryNo() {
    this.FireSearch()

  }
  onChangeToEntryNo() {
    this.FireSearch()

  }
}
