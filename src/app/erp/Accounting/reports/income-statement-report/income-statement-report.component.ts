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
  selector: 'app-income-statement-report',
  templateUrl: './income-statement-report.component.html',
  styleUrls: ['./income-statement-report.component.scss']
})
export class IncomeStatementReportComponent implements OnInit, OnDestroy, AfterViewInit {

  //#region Main Declarations
  lang = localStorage.getItem("language");
  companyId: string = localStorage.getItem("companyId");
  userId: any = localStorage.getItem("userId");
  facialPeriodId: any;

  subsList: Subscription[] = [];
  fromDate: any;
  toDate: any;
  accountGroupId: any;
  mainAccountId: any;
  leafAccountId: any;
  costCenterId: any;
  entriesStatusId: any;
  levelId: any;
  branchId: any;
  toolbarPathData: ToolbarPath = {
    listPath: '',
    addPath: '',
    updatePath: '',
    componentList: this.translate.instant("component-names.income-statement-report"),
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

  gotoViewer() {


    let monthFrom;
    let monthTo;

    if (this.fromDate == undefined || this.fromDate == null) {
      //  this.fromDate = this.dateConverterService.getCurrentDate();
      monthFrom = Number(this.fromDate.month + 1)
      this.fromDate = (this.fromDate.year + '-' + monthFrom + "-" + this.fromDate.day).toString();
    }
    else if (this.fromDate.month != undefined) {

      monthFrom = Number(this.fromDate.month + 1)
      this.fromDate = (this.fromDate.year + '-' + monthFrom + "-" + this.fromDate.day).toString();
    }

    if (this.toDate == undefined || this.toDate == null) {

      monthTo = Number(this.toDate.month + 1)
      this.toDate = (this.toDate.year + '-' + monthTo + "-" + this.toDate.day).toString();

    }
    else if (this.toDate.month != undefined) {
      monthTo = Number(this.toDate.month + 1)
      this.toDate = (this.toDate.year + '-' + monthTo + "-" + this.toDate.day).toString();
    }
    if (this.branchId == null || this.branchId == undefined || this.branchId == "undefined" || this.branchId == "") {
      this.branchId = 0;
    }
    if (this.branchId == null || this.branchId == undefined || this.branchId == "undefined" || this.branchId == "") {
      this.branchId = 0;
    }
    if (this.entriesStatusId == null || this.entriesStatusId == undefined) {
      this.entriesStatusId = 0;
    }
    if (this.levelId == null || this.levelId == undefined) {
      this.levelId = 1;
    }
    let reportParams: string =
      "reportParameter=fromDate!" + this.fromDate +
      "&reportParameter=toDate!" + this.toDate +
      "&reportParameter=entriesStatusId!" + this.entriesStatusId +
      "&reportParameter=levelId!" + this.levelId +
      "&reportParameter=branchId!" + this.branchId +
      "&reportParameter=companyId!" + this.companyId +
      "&reportParameter=userId!" + this.userId +
      "&reportParameter=lang!" + this.lang;




    const modalRef = this.modalService.open(NgbdModalContent);
    modalRef.componentInstance.reportParams = reportParams;
    modalRef.componentInstance.reportType = 1;
    modalRef.componentInstance.reportTypeID = 2;

  }
  cancelDefaultReportStatus() {
    this.reportService.cancelDefaultReport(1, 2).subscribe(resonse => {

    });
  }
  ShowOptions: {
    ShowFromDate: boolean, ShowToDate: boolean
    ShowSearch: boolean, ShowEntriesStatus, ShowLevel, ShowBranch: boolean;

  } = {
      ShowFromDate: true, ShowToDate: true,
      ShowSearch: false,
      ShowEntriesStatus: true,
      ShowLevel: true,
      ShowBranch: true

    }

  OnFilter(e: {
    fromDate, toDate, entriesStatusId, level
  }) {


    this.fromDate = e.fromDate,
      this.toDate = e.toDate,
      this.entriesStatusId = e.entriesStatusId
    this.levelId = e.level
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

          //formatDate(Date.parse(res.response.fromDate)),
          // this.selectedToDate=formatDate(Date.parse(res.response.toDate)),


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
