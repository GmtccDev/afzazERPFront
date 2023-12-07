import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { SharedService } from 'src/app/shared/common-services/shared-service';
import { ReportServiceProxy } from 'src/app/shared/common-services/report.service';
import { ToolbarActions } from 'src/app/shared/enum/toolbar-actions';
import { ToolbarData } from 'src/app/shared/interfaces/toolbar-data';
import { DateConverterService } from 'src/app/shared/services/date-services/date-converter.service';
import { NgbdModalContent } from 'src/app/shared/components/modal/modal-component'
import { ToolbarPath } from 'src/app/shared/interfaces/toolbar-path';
import { TranslateService } from '@ngx-translate/core';
import { GeneralConfigurationServiceProxy } from '../../services/general-configurations.services';
import { FiscalPeriodServiceProxy } from '../../services/fiscal-period.services';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-general-ledger-report',
  templateUrl: './general-ledger-report.component.html',
  styleUrls: ['./general-ledger-report.component.scss']
})
export class GeneralLedgerReportComponent implements OnInit, OnDestroy, AfterViewInit {

  //#region Main Declarations
  facialPeriodId: any;

  companyId: string = localStorage.getItem("companyId");
  lang = localStorage.getItem("language");
  subsList: Subscription[] = [];
  fromDate: any;
  toDate: any;
  currencyId: any;
  branchId: any;
  accountGroupId: any;
  mainAccountId: any;
  leafAccountId: any;
  entriesStatusId: any;
  fromEntryNo: any;
  toEntryNo: any;

  toolbarPathData: ToolbarPath = {
    listPath: '',
    addPath: '',
    updatePath: '',
    componentList: this.translate.instant("component-names.general-ledger-report"),
    componentAdd: ''
  };

  //#region Constructor
  constructor(
    private modalService: NgbModal,
    private reportService: ReportServiceProxy,
    private sharedServices: SharedService,
    private dateConverterService: DateConverterService,
    private translate: TranslateService,
    private generalConfigurationService: GeneralConfigurationServiceProxy,
    private fiscalPeriodService: FiscalPeriodServiceProxy,
    private spinner: NgxSpinnerService,

  ) {

  }


  //#endregion

  //#region ngOnInit
  ngOnInit(): void {

    this.sharedServices.changeButton({ action: 'Report' } as ToolbarData);
    this.listenToClickedButton();
    this.sharedServices.changeToolbarPath(this.toolbarPathData);
    this.spinner.show();

    Promise.all([
      this.getGeneralConfigurationsOfAccountingPeriod()

    ]).then(a => {


      this.spinner.hide();
    }).catch(err => {

      this.spinner.hide();
    });

  }

  //#endregion
  //#region ngAfterViewInit
  ngAfterViewInit(): void {



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
selectedCurrencyName:any='';
selectedEntriesStatusName='';
selectedBranchName=''
selectedLeafAccountName=''
selectedJournalName=''
JournalId: any;
  gotoViewer() {


    let monthFrom;
    let monthTo;
  
		if (this.fromDate == undefined || this.fromDate == null) {
			//  this.fromDate = this.dateConverterService.getCurrentDate();
			monthFrom = Number(this.fromDate.month + 1)
			this.fromDate = (this.fromDate.year + '-' + monthFrom + "-" + this.fromDate.day).toString();
		  }
		  else if(this.fromDate.month!=undefined) {
		
			monthFrom = Number(this.fromDate.month + 1)
			this.fromDate = (this.fromDate.year + '-' + monthFrom + "-" + this.fromDate.day).toString();
		  }
	  
		  if (this.toDate == undefined || this.toDate == null) {
			
			monthTo = Number(this.toDate.month + 1)
			this.toDate = (this.toDate.year + '-' + monthTo + "-" + this.toDate.day).toString();
	  
		  }
		  else if(this.toDate.month!=undefined) {
			monthTo = Number(this.toDate.month + 1)
			this.toDate = (this.toDate.year + '-' + monthTo + "-" + this.toDate.day).toString();
		  }


    if (this.currencyId == null || this.currencyId == undefined || this.currencyId == "") {
      this.currencyId = 0;
    }
    if (this.JournalId == null || this.JournalId == undefined || this.JournalId == "") {
      this.JournalId = 0;
    }

    if (this.branchId == null || this.branchId == undefined || this.branchId == "") {
      this.branchId = "";
    }
    if (this.entriesStatusId == null || this.entriesStatusId == undefined || this.entriesStatusId == "") {
      this.entriesStatusId = 0;
    }
    if (this.leafAccountId == null || this.leafAccountId == undefined || this.leafAccountId == "") {
      this.leafAccountId = 0;
    }
    if (this.fromEntryNo == null || this.fromEntryNo == undefined || this.fromEntryNo == "") {
      this.fromEntryNo = 0;
    }
    if (this.toEntryNo == null || this.toEntryNo == undefined || this.toEntryNo == "") {
      this.toEntryNo = 0;
    }
      debugger
    let reportParams: string =
      "reportParameter=fromDate!" + this.fromDate +
      "&reportParameter=toDate!" + this.toDate +
      "&reportParameter=currencyId!" + this.currencyId +
      "&reportParameter=branchId!" + this.branchId +
      "&reportParameter=companyId!" + this.companyId +
      "&reportParameter=entriesStatusId!" + this.entriesStatusId +
      "&reportParameter=selectedEntriesStatusName!" + this.selectedEntriesStatusName +
      "&reportParameter=selectedleafAccountName!" + this.selectedLeafAccountName +
      "&reportParameter=selectedBranchName!" + this.selectedBranchName+
      "&reportParameter=selectedCurrencyName!" + this.selectedCurrencyName +
      "&reportParameter=leafAccountId!" + this.leafAccountId +
      "&reportParameter=selectedJournalName!" + this.selectedJournalName+  
      "&reportParameter=JournalId!" + this.JournalId+
      "&reportParameter=fromEntryNo!" + this.fromEntryNo +
      "&reportParameter=toEntryNo!" + this.toEntryNo +
      "&reportParameter=lang!" + this.lang;

    const modalRef = this.modalService.open(NgbdModalContent);
    modalRef.componentInstance.reportParams = reportParams;
    modalRef.componentInstance.reportType = 1;
    modalRef.componentInstance.reportTypeID = 4;

  }
  cancelDefaultReportStatus() {
    this.reportService.cancelDefaultReport(1, 4).subscribe(resonse => {

    });
  }
  ShowOptions: {
    ShowFromDate: boolean, ShowToDate: boolean,ShowJournal: boolean;
    ShowSearch: boolean, ShowCurrency: boolean, ShowBranch: boolean
    , ShowLeafAccount: boolean, ShowEntriesStatus: boolean, ShowFromEntryNo: boolean, ShowToEntryNo: boolean
  } = {
      ShowFromDate: true, ShowToDate: true,
      ShowSearch: false,
      ShowCurrency: true,
      ShowJournal:true,
      ShowBranch: true,
      ShowLeafAccount: true,
      ShowEntriesStatus: true,
      ShowFromEntryNo: true,
      ShowToEntryNo: true
    }

  OnFilter(e: {
    fromDate, toDate, currencyId,journalName;journalId; branchId,branchName,currencyName,leafAccountName, fromEntryNo, toEntryNo, leafAccountId, entriesStatusId,
    entriesStatusName
  }) {

    this.fromDate = e.fromDate
    this.toDate = e.toDate
    this.fromEntryNo = e.fromEntryNo
    this.toEntryNo = e.toEntryNo
    this.selectedCurrencyName=e.currencyName,
    this.selectedEntriesStatusName=e.entriesStatusName,
    this.selectedLeafAccountName=e.leafAccountName
    this.currencyId = e.currencyId
    this.branchId = e.branchId,
    this.selectedBranchName=e.branchName,
    this.leafAccountId = e.leafAccountId
    this.entriesStatusId = e.entriesStatusId,
    this.JournalId = e.journalId,
		this.selectedJournalName =e.journalName

  }

  listenToClickedButton() {

    let sub = this.sharedServices.getClickedbutton().subscribe({
      next: (currentBtn: ToolbarData) => {
        currentBtn;
        if (currentBtn != null) {

          if (currentBtn.action == ToolbarActions.Print) {

            this.gotoViewer();

          }
          else if (currentBtn.action == ToolbarActions.CancelDefaultReport) {

            this.cancelDefaultReportStatus();
          }
          this.sharedServices.changeButton({ action: 'Report' } as ToolbarData);
        }
      },
    });
    this.subsList.push(sub);
  }
  getGeneralConfigurationsOfAccountingPeriod() {

    return new Promise<void>((resolve, reject) => {

      let sub = this.generalConfigurationService.getGeneralConfiguration(7).subscribe({
        next: (res: any) => {

          //console.log('result data getbyid', res);
          if (res.response.value > 0) {

            this.facialPeriodId = res.response.value;
            this.getfiscalPeriodById(this.facialPeriodId);
          }


        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {
          //console.log('complete');
        },
      });
      this.subsList.push(sub);

    });

  }
  getfiscalPeriodById(id: any) {
    return new Promise<void>((resolve, reject) => {
      let sub = this.fiscalPeriodService.getFiscalPeriod(id).subscribe({
        next: (res: any) => {

          //console.log('result data getbyid', res);
          this.fromDate = this.dateConverterService.getDateForCalender(res.response.fromDate);
          this.toDate = this.dateConverterService.getDateForCalender(res.response.toDate);
          




        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {
          //console.log('complete');
        },
      });
      this.subsList.push(sub);

    });
  }

}
