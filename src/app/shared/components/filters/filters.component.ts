import { Component, OnInit, Output, Input, EventEmitter, OnDestroy, AfterViewInit } from '@angular/core';
import { Subscription, filter } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { DateModel } from '../../model/date-model';
import { SharedService } from '../../common-services/shared-service';
import { DateConverterService } from 'src/app/shared/services/date-services/date-converter.service';
import { PublicService } from '../../services/public.service';
import { ICustomEnum } from '../../interfaces/ICustom-enum';
import { EntriesStatusEnum, EntriesStatusArEnum, convertEnumToArray, VoucherTypeEnum, VoucherTypeArEnum, ReportOptionsEnum, ReportOptionsArEnum, GeneralConfigurationEnum } from '../../constants/enumrators/enums';
import { GeneralConfigurationServiceProxy } from 'src/app/erp/Accounting/services/general-configurations.services';
import { FiscalPeriodServiceProxy } from 'src/app/erp/Accounting/services/fiscal-period.services';
import { BranchDto } from 'src/app/erp/master-codes/models/branch';
import { AccountDto } from 'src/app/erp/Accounting/models/account';
import { VoucherTypeServiceProxy } from 'src/app/erp/Accounting/services/voucher-type.service';


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
  level: any = 1;
  accountGroupList: any;
  VoucherTypesList:any[]=[];
  routeAccountGroupApi = "AccountGroup/get-ddl?"
  routeVoucherTypespApi = "VoucherType/get-ddl?"
  routeJournalApi = 'Journal/get-ddl?'
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
  facialPeriodId: any;
  fromEntryNo: any;
  toEntryNo: any;
  costCenterId: any;
  @Output() OnFilter: EventEmitter<{

    fromDate, toDate,journalName, accountGroupId,accountGroupName, mainAccountId, mainAccountName,leafAccountId,leafAccountName, entriesStatusId,entriesStatusName, currencyId, branchId,branchName
    voucherKindId, voucherId, journalId,level, currencyName,costCenterName,voucherKindName, reportOptionId, fromEntryNo, toEntryNo, costCenterId
  }> = new EventEmitter();

  @Input() ShowOptions: {
    ShowFromDate: boolean,
    ShowJournal: boolean,
    ShowToDate: boolean, ShowSearch: boolean, ShowAccountGroup: boolean, ShowMainAccount: boolean, ShowLeafAccount: boolean,
    ShowCostCenter: boolean, ShowEntriesStatus: boolean, ShowCurrency: boolean, ShowBranch: boolean, ShowVoucherKind: boolean, ShowVoucher: boolean, ShowLevel: boolean,
    ShowReportOptions: boolean, ShowFromEntryNo: boolean, ShowToEntryNo: boolean
  } = {

      ShowFromDate: false,
      ShowJournal:false,
      ShowToDate: false,
      ShowSearch: false,
      ShowAccountGroup: false,
      ShowMainAccount: false,
      ShowLeafAccount: false,
      ShowCostCenter: false,
      ShowEntriesStatus: false,
      ShowCurrency: false,
      ShowBranch: false,
      ShowVoucherKind: false,
      ShowVoucher: false,
      ShowLevel: false,
      ShowReportOptions: false,
      ShowFromEntryNo: false,
      ShowToEntryNo: false
    }

  subsList: Subscription[] = [];
  lblFromDate: string = "من تاريخ";
  lblToDate: string = "إلى تاريخ";


  constructor(
    private sharedServices: SharedService,
    private dateConverterService: DateConverterService,
    private voucherTypeService: VoucherTypeServiceProxy,
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
      this.getVouchers(),
      this.getVoucherTypes(),
      this.getJournals()


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

  getVoucherTypes() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.voucherTypeService.allVoucherTypees(undefined, undefined, undefined, undefined, undefined).subscribe({
        next: (res) => {
          if (res.success) {
            this.VoucherTypesList = res.response.items

          }
          resolve();

        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {
        },
      });

      this.subsList.push(sub);
    });

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
          
        },
      });

      this.subsList.push(sub);
    });

  }
  journalList:any[]=[];
  getJournals() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeJournalApi).subscribe({
        next: (res) => {
          debugger
          if (res.success) {

            this.journalList = res.response.filter(x => x.isActive && (x.nameAr != null || x.nameEn != null));
       
          }


          resolve();

        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {

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
            
            console.log("getAccounts",res.response)
            if (this.selectedAccountGroupId != null && this.selectedAccountGroupId != undefined) {
              this.mainAccountsList = res.response.filter(x => x.accountGroupId == this.selectedAccountGroupId && x.isLeafAccount != true && x.isActive == true);
              if (this.selectedMainAccountId != null && this.selectedMainAccountId != undefined) {
                this.leafAccountsList = res.response.filter(x => x.accountGroupId == this.selectedAccountGroupId && x.isLeafAccount == true && x.parentId == this.selectedMainAccountId && x.isActive == true);
              }
              else {
                this.leafAccountsList = res.response.filter(x => x.accountGroupId == this.selectedAccountGroupId && x.isLeafAccount == true && x.isActive == true);

              }
            }
            else {
              this.mainAccountsList = res.response.filter(x => x.isLeafAccount== false && x.isActive == true);
              if (this.selectedMainAccountId != null && this.selectedMainAccountId != undefined) {
                this.leafAccountsList = res.response.filter(x => x.isLeafAccount == true && x.parentId == this.selectedMainAccountId && x.isActive == true);

              }
              else {
                this.leafAccountsList = res.response.filter(x => x.isLeafAccount == true && x.isActive == true);
              }

            }

          }


          resolve();

        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {
          
        },
      });

      this.subsList.push(sub);
    });

  }

  getAccountsByAccountGroup() {

    if (this.selectedAccountGroupId != null && this.selectedAccountGroupId != undefined) {
      this.mainAccountsList = this.mainAccountsList.filter(x => x.accountGroupId == this.selectedAccountGroupId);
      this.leafAccountsList = this.leafAccountsList.filter(x => x.accountGroupId == this.selectedAccountGroupId);

    }
    else {
      this.mainAccountsList = this.mainAccountsList;
      this.leafAccountsList = this.leafAccountsList;
    }

  }
  setLevelLimit:boolean=false;
  levelLimit:number
  getAccountLevels()
  {
    debugger;
    this.setLevelLimit= true;
    let AccountItem:AccountDto= this.mainAccountsList.find(x=>x.id==this.selectedMainAccountId);
    if(AccountItem!=null)
    {
      this.levelLimit = AccountItem?.levelId+1;
      this.level = AccountItem?.levelId+1;
    }
 
  }

  getLeafAccountsByMainAccount() {

    if (this.selectedMainAccountId != null && this.selectedMainAccountId != undefined) {
      this.leafAccountsList = this.leafAccountsList.filter(x => x.parentId == this.selectedMainAccountId);

    }
    else {
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
          
        },
      });

      this.subsList.push(sub);
    });

  }
  selectedJournalId
  getGeneralConfigurationsOfAccountingPeriod() {

    return new Promise<void>((resolve, reject) => {

      let sub = this.generalConfigurationService.getGeneralConfiguration(GeneralConfigurationEnum.AccountingPeriod).subscribe({
        next: (res: any) => {
          resolve();
  
          if (res.response.value > 0) {
              
            this.facialPeriodId = res.response.value;
            this.getfiscalPeriodById(this.facialPeriodId);
          }


        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {
          
        },
      });
      this.subsList.push(sub);

    });

  }
  
  getfiscalPeriodById(id: any) {
    
    return new Promise<void>((resolve, reject) => {
      let sub = this.fiscalPeriodService.getFiscalPeriod(id).subscribe({
        next: (res: any) => {


          this.selectedFromDate = this.dateConverterService.getDateForCalender(res.response.fromDate);
          this.selectedToDate = this.dateConverterService.getDateForCalender(res.response.toDate);



        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {
          
        },
      });
      this.subsList.push(sub);

    });
  }
  FireSearch() {

    if (!this.selectedFromDate) {
      //  this.selectedFromDate = this.dateConverterService.getCurrentDate();
    }
    if (!this.selectedToDate) {
      //  this.selectedToDate = this.dateConverterService.getCurrentDate();
    }
    debugger
    this.OnFilter.emit({
    
      fromDate: this.selectedFromDate,
      toDate: this.selectedToDate,
      accountGroupId: this.selectedAccountGroupId,
      mainAccountId: this.selectedMainAccountId,
      leafAccountId: this.selectedLeafAccountId,
      leafAccountName: this.selectedLeafAccountName,
      entriesStatusId: this.selectedEntriesStatusId,
      entriesStatusName:this.selectedEntriesStatusName,
      currencyId: this.selectedCurrencyId,
      currencyName:this.selectedCurrencyName,
      branchId: this.branchIds,
      branchName:this.selectedBranchName,
      voucherKindId: this.selectedVoucherKindId,
      voucherId: this.selectedVoucherId,
      level: this.level,
      fromEntryNo: this.fromEntryNo,
      toEntryNo: this.toEntryNo,
      reportOptionId: this.selectedReportOptionId,
      costCenterId: this.selectedCostCenterId,
      voucherKindName:this.selectedVoucherKindName,
      mainAccountName:this.selectedMainAccountName,
      accountGroupName:this.selectedAccountGroupName,
      costCenterName:this.selectedCostCenterName,
      journalId:this.selectedJournalId,
      journalName:this.selectedJournalName




    })
  }
  onSelectJournal() {

    this.getJouranlName();
    this.FireSearch()
  }

  onSelectFromDate(e: DateModel) {

    this.selectedFromDate = e
    this.FireSearch()
  }

  onSelectToDate(e: DateModel) {
    this.selectedToDate = e;
    this.FireSearch()
  }
  onSelectVoucherKind() {
    this.getSelectedVoucherKindName();
    this.FireSearch()

  }
  onSelectAccountGroup() {
    this.getAccountGroupName()
    this.FireSearch()

  }
  onSelectMainAccount() {
    debugger;
    this.getMainAccounName();
    this.getAccountLevels();
    this.FireSearch()

  }
  onSelectLeafAccount() {
    this.getLeafAccounName();
    this.FireSearch()

  }
  onSelectCostCenter() {
    this.getCostCenterName()
    this.FireSearch()

  }
  onSelectEntriesStatus() {
    this.getEntriesStatusName()
    this.FireSearch()

  }
  onSelectReportOption() {
    this.FireSearch()

  }
  onSelectCurrency() {
    this.getCurrencyName();
    this.FireSearch()

  }
  onSelectBranch() {
    this.getSelectedBranchName();
    this.branchIds = ''
     if(this.selectedBranchId.length==1)
     {
      this.branchIds = this.selectedBranchId
     }else{
      this.selectedBranchId?.forEach(selectedId => {
        if(this.selectedBranchId.length>=2)
        {
          this.branchIds += selectedId + ",";
        }else{
          this.branchIds =selectedId;
        }
        
      })
  
      this.branchIds = this.branchIds.substring(0, this.branchIds.length - 1);
     }
   

    this.FireSearch();

  }
  onSelectVoucher() {
    this.FireSearch()

  }
  onChangeLevel() {
    if(this.setLevelLimit)
    {
      
    }
    this.FireSearch()

  }
  onChangeFromEntryNo() {
    this.FireSearch()

  }
  onChangeToEntryNo() {
    this.FireSearch()

  }
  selectedCurrencyName:any='';
  getCurrencyName()
  {
    let item= this.currenciesList.find(x=>x.id==this.selectedCurrencyId)
    if(item!=null && item!=undefined)
    {
      this.selectedCurrencyName= this.lang=='ar'?item.nameAr:item.nameEn;
    }else{
      this.selectedCurrencyName=''
    }
  
  }
  selectedLeafAccountName:any='';
  getLeafAccounName()
  {
    
    if(this.selectedLeafAccountId!=null && this.selectedLeafAccountId!=undefined)
    {
      let item= this.leafAccountsList.find(x=>x.id==this.selectedLeafAccountId)
      this.selectedLeafAccountName= this.lang=='ar'?item.nameAr:item.nameEn;
    }else{
      this.selectedLeafAccountName=''
    }
  
  }
  selectedEntriesStatusName:any='';
  getEntriesStatusName()
  {

   if(this.selectedEntriesStatusId!=undefined && this.selectedEntriesStatusId!=null)
   {
    let itemName =this.entriesStatusEnum.find(x=>x.id==this.selectedEntriesStatusId).name;
    this.selectedEntriesStatusName = itemName;
   }else{
    this.selectedEntriesStatusName=''
   }

  }
  selectedBranchName:any='';
  getSelectedBranchName()
  {

    let item= this.branchesList.find(x=>x.id==this.selectedBranchId)
    if(item!=null && item!=undefined)
    {
      this.selectedBranchName= this.lang=='ar'?item.nameAr:item.nameEn;
    }else{
      this.selectedBranchName=''
    }
  
   
  }
  selectedVoucherKindName:any='';
  getSelectedVoucherKindName()
  {

    debugger
    if(this.selectedVoucherKindId!=null && this.selectedVoucherKindId!=undefined)
    {
      let item =this.VoucherTypesList.find(x=>x.id==this.selectedVoucherKindId);
      this.selectedVoucherKindName= this.lang=='ar'?item.nameAr:item.nameEn;
    }else{
      this.selectedVoucherKindName=''
    }
  
   
  }
  selectedMainAccountName:any='';
  getMainAccounName()
  {
    
    if(this.selectedMainAccountId!=null && this.selectedMainAccountId!=undefined)
    {
      let item= this.mainAccountsList.find(x=>x.id==this.selectedMainAccountId)
      this.selectedMainAccountName= this.lang=='ar'?item.nameAr:item.nameEn;
    }else{
      this.selectedMainAccountName=''
    }
  
  }
  selectedAccountGroupName:any='';
  getAccountGroupName()
  {
    
    if(this.selectedAccountGroupId!=null && this.selectedAccountGroupId!=undefined)
    {
      let item= this.accountGroupList.find(x=>x.id==this.selectedAccountGroupId)
      this.selectedAccountGroupName= this.lang=='ar'?item.nameAr:item.nameEn;
    }else{
      this.selectedAccountGroupName=''
    }
  
  }
  selectedCostCenterName:any='';
  getCostCenterName()
  {
   
    if(this.selectedCostCenterId!=null && this.selectedCostCenterId!=undefined)
    {
      let item= this.costCenterList.find(x=>x.id==this.selectedCostCenterId)
      this.selectedCostCenterName= this.lang=='ar'?item.nameAr:item.nameEn;
    }else{
      this.selectedCostCenterName=''
    }
  
  }
  selectedJournalName:any='';
  getJouranlName()
  {
   debugger
    if(this.selectedJournalId!=null && this.selectedJournalId!=undefined)
    {
      let item= this.journalList.find(x=>x.id==this.selectedJournalId)
      this.selectedJournalName= this.lang=='ar'?item.nameAr:item.nameEn;
    }else{
      this.selectedJournalName=''
    }
  
  }

}
