import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ReportServiceProxy } from 'src/app/shared/common-services/report.service';
import { SharedService } from 'src/app/shared/common-services/shared-service';
import { NgbdModalContent } from 'src/app/shared/components/modal/modal-component';
import { ToolbarActions } from 'src/app/shared/enum/toolbar-actions';
import { ToolbarData } from 'src/app/shared/interfaces/toolbar-data';
import { ToolbarPath } from 'src/app/shared/interfaces/toolbar-path';
import { DateConverterService } from 'src/app/shared/services/date-services/date-converter.service';
import { GeneralConfigurationServiceProxy } from '../../services/general-configurations.services';
import { FiscalPeriodServiceProxy } from '../../services/fiscal-period.services';

@Component({
  selector: 'app-trail-balance-report',
  templateUrl: './trail-balance-report.component.html',
  styleUrls: ['./trail-balance-report.component.scss']
})
export class TrailBalanceReportComponent  implements OnInit, OnDestroy, AfterViewInit {
	//#region Main Declarations
	facialPeriodId: any;
	userId: any = localStorage.getItem("userId");
	// = "2e992e3d-3bc9-41f5-9b6e-98fbc97d770a";

	companyId: string = localStorage.getItem("companyId");
	lang = localStorage.getItem("language");

	subsList: Subscription[] = [];
	fromDate: any;
	toDate: any;
	branchId: any;
	levelId: any=1;
	entriesStatusId: any;
	fromEntryNo: any = "";
	toEntryNo: any = "";
	JournalId: any;
	toolbarPathData: ToolbarPath = {
		listPath: "",
		addPath: "",
		updatePath: "",
		componentList: this.translate.instant("component-names.trail-balance-report"),
		componentAdd: "",
	};

	//#region Constructor
	constructor(private modalService: NgbModal, private reportService: ReportServiceProxy, private sharedServices: SharedService, private dateConverterService: DateConverterService, private translate: TranslateService, private generalConfigurationService: GeneralConfigurationServiceProxy, private fiscalPeriodService: FiscalPeriodServiceProxy) {}

	//#endregion

	//#region ngOnInit
	ngOnInit(): void {
		this.sharedServices.changeButton({ action: "Report" } as ToolbarData);
		this.listenToClickedButton();
		this.sharedServices.changeToolbarPath(this.toolbarPathData);
	}

	//#endregion
	//#region ngAfterViewInit
	ngAfterViewInit(): void {
		this.getGeneralConfigurationsOfAccountingPeriod();
	}
	getFromDate() {
		let monthFrom;
		this.fromDate = this.dateConverterService.getCurrentDate();
		monthFrom = Number(this.fromDate.month + 1);
		this.fromDate = (this.fromDate.year + "-" + monthFrom + "-" + this.fromDate.day).toString();
		return this.fromDate;
	}
	getDateTo() {
		let monthTo;
		this.toDate = this.dateConverterService.getCurrentDate();
		monthTo = Number(this.toDate.month + 1);
		this.toDate = (this.toDate.year + "-" + monthTo + "-" + this.toDate.day).toString();
		return this.toDate;
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
	isContainsDate(input: string): boolean {
		const date = new Date(input);
		let reuslt= date instanceof Date && !isNaN(date.getTime());
		 return reuslt;
	  }
	gotoViewer() {

		let monthFrom;
		let monthTo;
     debugger
	 if (this.fromDate == undefined || this.fromDate == null) {

		monthFrom = Number(this.fromDate.month + 1)
		this.fromDate = (this.fromDate.year + '-' + monthFrom + "-" + this.fromDate.day).toString();
	  }
	  else if(!this.isContainsDate(this.fromDate)) {
			monthFrom = Number(this.fromDate.month + 1);
			this.fromDate = (this.fromDate.year + "-" + monthFrom + "-" + this.fromDate.day).toString();
		}

	  if (this.toDate == undefined || this.toDate == null) {
		//  this.toDate = this.dateConverterService.getCurrentDate();
		monthTo = Number(this.toDate.month + 1)
		this.toDate = (this.toDate.year + '-' + monthTo + "-" + this.toDate.day).toString();

	  }
	  else if(!this.isContainsDate(this.toDate)) {
		monthTo = Number(this.toDate.month + 1);
		this.toDate = (this.toDate.year + "-" + monthTo + "-" + this.toDate.day).toString();
	}



		if (this.branchId == null || this.branchId == undefined || this.branchId == "") {
			this.branchId = 0;
		}
		if (this.entriesStatusId == null || this.entriesStatusId == undefined || this.entriesStatusId == "") {
			this.entriesStatusId = 0;
		}



		let reportParams: string =
		 "reportParameter=fromDate!" + this.fromDate
		+ "&reportParameter=toDate!" + this.toDate
		+ "&reportParameter=entriesStatusId!" + this.entriesStatusId
		+ "&reportParameter=levelId!" + this.levelId
		+ "&reportParameter=branchId!" + this.branchId
		+ "&reportParameter=companyId!" + this.companyId
		+ "&reportParameter=lang!" + this.lang
		+ "&reportParameter=userId!" + this.userId;
		const modalRef = this.modalService.open(NgbdModalContent);
		modalRef.componentInstance.reportParams = reportParams;
		modalRef.componentInstance.reportType = 1;
		modalRef.componentInstance.reportTypeID = 8;
	}
	cancelDefaultReportStatus() {
		this.reportService.cancelDefaultReport(1, 8).subscribe((resonse) => {});
	}
	accountId
	ShowOptions: {
		ShowFromDate: boolean;
		ShowToDate: boolean;
		ShowBranch: boolean;
		ShowLevel: boolean;
		ShowEntriesStatus: boolean;
	} = {
		ShowFromDate: true,
		ShowToDate: true,
		ShowLevel:true,
		ShowBranch: true,
		ShowEntriesStatus:true

	};

	OnFilter(e: { fromDate; toDate;entriesStatusId, branchId,level}) {
		debugger
		this.fromDate = e.fromDate;
		this.toDate = e.toDate;
		this.branchId = e.branchId;
		this.levelId = e.level;
		this.entriesStatusId = e.entriesStatusId
	}

	listenToClickedButton() {
		let sub = this.sharedServices.getClickedbutton().subscribe({
			next: (currentBtn: ToolbarData) => {
				currentBtn;
				if (currentBtn != null) {
					if (currentBtn.action == ToolbarActions.Print) {
						this.gotoViewer();
					} else if (currentBtn.action == ToolbarActions.CancelDefaultReport) {
						this.cancelDefaultReportStatus();
					}
					this.sharedServices.changeButton({ action: "Report" } as ToolbarData);
				}
			},
		});
		this.subsList.push(sub);
	}
	getGeneralConfigurationsOfAccountingPeriod() {
		;
		const promise = new Promise<void>((resolve, reject) => {
			;
			this.generalConfigurationService.getGeneralConfiguration(6).subscribe({
				next: (res: any) => {
					;
					console.log("result data getbyid", res);
					if (res.response.value > 0) {
						;
						this.facialPeriodId = res.response.value;
						this.getfiscalPeriodById(this.facialPeriodId);
					}
				},
				error: (err: any) => {
					reject(err);
				},
				complete: () => {
					console.log("complete");
				},
			});
		});
		return promise;
	}
	getfiscalPeriodById(id: any) {
		const promise = new Promise<void>((resolve, reject) => {
			this.fiscalPeriodService.getFiscalPeriod(id).subscribe({
				next: (res: any) => {
					;
					console.log("result data getbyid", res);
					debugger;
					this.fromDate = this.dateConverterService.getDateForCalender(res.response.fromDate);
					this.toDate = this.dateConverterService.getDateForCalender(res.response.toDate);
				},
				error: (err: any) => {
					reject(err);
				},
				complete: () => {
					console.log("complete");
				},
			});
		});
		return promise;
	}
}
