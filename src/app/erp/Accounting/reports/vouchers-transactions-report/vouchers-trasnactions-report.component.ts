import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { SharedService } from 'src/app/shared/common-services/shared-service';
import {ReportServiceProxy} from 'src/app/shared/common-services/report.service';
import { ToolbarActions } from 'src/app/shared/enum/toolbar-actions';
import { ToolbarData } from 'src/app/shared/interfaces/toolbar-data';
import { DateConverterService } from 'src/app/shared/services/date-services/date-converter.service';
import {NgbdModalContent} from 'src/app/shared/components/modal/modal-component'
import { ToolbarPath } from 'src/app/shared/interfaces/toolbar-path';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-vouchers-trasnactions-report',
  templateUrl: './vouchers-trasnactions-report.component.html',
  styleUrls: ['./vouchers-trasnactions-report.component.scss']
})
export class VouchersTransactionsReportComponent implements OnInit, OnDestroy, AfterViewInit {

  //#region Main Declarations
  subsList: Subscription[] = [];
  fromDate: any;
  toDate: any;
  mainAccountId:any;
  leafAccountId:any;

  currencyId:any;
  branchId:any;

  toolbarPathData: ToolbarPath = {
    listPath: '',
    addPath: '',
    updatePath: '',
    componentList:this.translate.instant("component-names.vouchers-transactions-report"),
    componentAdd: ''
  };
  // this.toolbarPathData={
  //   listPath: '',
  //   addPath: '',
  //   updatePath: '',
  //   componentList:this.translate.instant("component-names.income-statement-report"),
  //   componentAdd: ''
  // }
  //#region Constructor
  constructor(
    private modalService: NgbModal,
    private reportService: ReportServiceProxy,
    private sharedServices: SharedService,
    private dateConverterService: DateConverterService,
    private translate: TranslateService

  ) {
   
  }


  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
   
   this.sharedServices.changeButton({ action: 'Report' } as ToolbarData);
   this.listenToClickedButton();
   this.sharedServices.changeToolbarPath(this.toolbarPathData);
  
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
 
    debugger
    let monthFrom;
    let monthTo;

    if (this.fromDate == undefined || this.fromDate == null) {
      this.fromDate = this.dateConverterService.getCurrentDate();
      monthFrom = Number(this.fromDate.month + 1)
      this.fromDate = (this.fromDate.year+'-'+ monthFrom + "-" + this.fromDate.day).toString();
    }
    else
    {
      monthFrom = Number(this.fromDate.month + 1)
      this.fromDate = (this.fromDate.year+'-'+ monthFrom + "-" + this.fromDate.day).toString();

    }

    if (this.toDate == undefined || this.toDate == null) {
      this.toDate = this.dateConverterService.getCurrentDate();
      monthTo = Number(this.toDate.month + 1)
      this.toDate = (this.toDate.year+'-'+monthTo+ "-" + this.toDate.day).toString();

    }
    else
    {
      monthTo = Number(this.toDate.month + 1)
      this.toDate = (this.toDate.year+'-'+monthTo + "-" + this.toDate.day).toString();
    }

    let reportParams: string =
      "reportParameter=fromDate!" + this.fromDate +
      "&reportParameter=toDate!" + this.toDate
    debugger
    const modalRef = this.modalService.open(NgbdModalContent);
    modalRef.componentInstance.reportParams = reportParams;
    modalRef.componentInstance.reportType = 1;
    modalRef.componentInstance.reportTypeID = 3;

  }
  cancelDefaultReportStatus() {
    this.reportService.cancelDefaultReport(1,3).subscribe(resonse => {

    });
  }
  ShowOptions: {
     ShowFromDate: boolean, ShowToDate: boolean
    ShowSearch: boolean,ShowMainAccount:boolean,ShowLeafAccount:boolean,ShowCurrency,ShowBranch,ShowVoucher
  } = {
    ShowFromDate: true, ShowToDate: true,
    ShowSearch: false,
    ShowMainAccount:true,
    ShowCurrency:true,
    ShowBranch:true,
    ShowVoucher:true,
    ShowLeafAccount:true
  }

  OnFilter(e: {
    fromDate, toDate,mainAccountId,leafAccountId,currencyId,branchId
  }) {
    debugger
    
      this.fromDate = e.fromDate,
      this.toDate = e.toDate,
      this.mainAccountId=e.mainAccountId,
      this.leafAccountId=e.leafAccountId,
      this.currencyId=e.currencyId
      this.branchId=e.branchId

  }

  listenToClickedButton() {
    
    let sub = this.sharedServices.getClickedbutton().subscribe({
      next: (currentBtn: ToolbarData) => {
        currentBtn;
        if (currentBtn != null) {
          
          if (currentBtn.action == ToolbarActions.View) {
            this.gotoViewer();

          }
          else if (currentBtn.action == ToolbarActions.CancelDefaultReport) {
            debugger
            this.cancelDefaultReportStatus();
          }
          this.sharedServices.changeButton({ action: 'Report' } as ToolbarData);
        }
      },
    });
    this.subsList.push(sub);
  }

}
