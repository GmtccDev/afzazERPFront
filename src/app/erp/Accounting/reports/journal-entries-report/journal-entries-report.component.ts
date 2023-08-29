import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ReportServiceProxy } from 'src/app/shared/common-services/report.service';
import { SharedService } from 'src/app/shared/common-services/shared-service';
import { ToolbarPath } from 'src/app/shared/interfaces/toolbar-path';
import { DateConverterService } from 'src/app/shared/services/date-services/date-converter.service';
import { GeneralConfigurationServiceProxy } from '../../services/general-configurations.services';
import { FiscalPeriodServiceProxy } from '../../services/fiscal-period.services';
import { ToolbarData } from 'src/app/shared/interfaces/toolbar-data';
import { NgbdModalContent } from 'src/app/shared/components/modal/modal-component';
import { ToolbarActions } from 'src/app/shared/enum/toolbar-actions';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
	selector: 'app-journal-entries-report',
	templateUrl: './journal-entries-report.component.html',
	styleUrls: ['./journal-entries-report.component.scss']
})
export class JournalEntriesReportComponent implements OnInit, OnDestroy, AfterViewInit {

	//#region Main Declarations
	facialPeriodId: any;
	userId: any = "2e992e3d-3bc9-41f5-9b6e-98fbc97d770a";
	orderBy: any;
	companyId: string = localStorage.getItem("companyId");
	lang = localStorage.getItem("language");
	subsList: Subscription[] = [];
	fromDate: any;
	toDate: any;
	currencyId: any;
	branchId: any;
	entriesStatusId: any;
	fromEntryNo: any;
	toEntryNo: any;
	JournalId: any;
	toolbarPathData: ToolbarPath = {
		listPath: '',
		addPath: '',
		updatePath: '',
		componentList: this.translate.instant("component-names.journal-entries-report"),
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
			this.fromDate = this.dateConverterService.getCurrentDate();
			monthFrom = Number(this.fromDate.month + 1)
			this.fromDate = (this.fromDate.year + '-' + monthFrom + "-" + this.fromDate.day).toString();
		}
		else {
			monthFrom = Number(this.fromDate.month + 1)
			this.fromDate = (this.fromDate.year + '-' + monthFrom + "-" + this.fromDate.day).toString();

		}

		if (this.toDate == undefined || this.toDate == null) {
			this.toDate = this.dateConverterService.getCurrentDate();
			monthTo = Number(this.toDate.month + 1)
			this.toDate = (this.toDate.year + '-' + monthTo + "-" + this.toDate.day).toString();

		}
		else {
			monthTo = Number(this.toDate.month + 1)
			this.toDate = (this.toDate.year + '-' + monthTo + "-" + this.toDate.day).toString();
		}


		if (this.currencyId == null || this.currencyId == undefined || this.currencyId == "") {
			this.currencyId = 0;
		}

		if (this.branchId == null || this.branchId == undefined || this.branchId == "") {
			this.branchId = 0;
		}
		if (this.entriesStatusId == null || this.entriesStatusId == undefined || this.entriesStatusId == "") {
			this.entriesStatusId = 0;
		}

		if (this.fromEntryNo == null || this.fromEntryNo == undefined || this.fromEntryNo == "") {
			this.fromEntryNo = '';
		}
		if (this.toEntryNo == null || this.toEntryNo == undefined || this.toEntryNo == "") {
			this.toEntryNo = '';
		}
		if (this.JournalId == null || this.JournalId == undefined || this.JournalId == "") {
			this.JournalId = 0;
		}
		/*
	@FromDate DATE = NULL,
	  @ToDate DATE = NULL,
	  @BranchId BIGINT = NULL,
	  @AccountId BIGINT = NULL,
	  @JournalId BIGINT = NULL,
	  @FromEntryNo NVARCHAR(50) = NULL,
	  @ToEntryNo NVARCHAR(50) = NULL,
	  @lang VARCHAR(10) = 'en',
	  @CompanyId BIGINT,
	  @UserId BIGINT,
	  @OrderBy NVARCHAR(50)
  
		*/


		let reportParams: string =
			"reportParameter=fromDate!" + this.fromDate +
			"&reportParameter=toDate!" + this.toDate +
			"&reportParameter=currencyId!" + this.currencyId +
			"&reportParameter=branchId!" + this.branchId +
			"&reportParameter=companyId!" + this.companyId +
			"&reportParameter=entriesStatusId!" + this.entriesStatusId +
			"&reportParameter=JournalId!" + this.JournalId +
			"&reportParameter=fromEntryNo!" + this.fromEntryNo +
			"&reportParameter=toEntryNo!" + this.toEntryNo +
			"&reportParameter=lang!" + this.lang +
			"&reportParameter=userId!" + this.userId;
		// "&reportParameter=orderBy!" + this.userId;

		const modalRef = this.modalService.open(NgbdModalContent);
		modalRef.componentInstance.reportParams = reportParams;
		modalRef.componentInstance.reportType = 1;
		modalRef.componentInstance.reportTypeID = 6;

	}
	cancelDefaultReportStatus() {
		this.reportService.cancelDefaultReport(1, 6).subscribe(resonse => {

		});
	}
	ShowOptions: {
		ShowFromDate: boolean, ShowToDate: boolean
		ShowSearch: boolean, ShowCurrency: boolean, ShowBranch: boolean
		, ShowEntriesStatus: boolean, ShowFromEntryNo: boolean, ShowToEntryNo: boolean
	} = {
			ShowFromDate: true, ShowToDate: true,
			ShowSearch: false,
			ShowCurrency: true,
			ShowBranch: true,
			ShowEntriesStatus: true,
			ShowFromEntryNo: true,
			ShowToEntryNo: true
		}

	OnFilter(e: {
		fromDate, toDate, currencyId, branchId, fromEntryNo, toEntryNo, leafAccountId, entriesStatusId
	}) {

		this.fromDate = e.fromDate
		this.toDate = e.toDate
		this.fromEntryNo = e.fromEntryNo
		this.toEntryNo = e.toEntryNo
		this.currencyId = e.currencyId
		this.branchId = e.branchId
		this.entriesStatusId = e.entriesStatusId


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

					console.log('result data getbyid', res);
					if (res.response.value > 0) {

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
			this.subsList.push(sub);

		});

	}
	getfiscalPeriodById(id: any) {
		return new Promise<void>((resolve, reject) => {
			let sub = this.fiscalPeriodService.getFiscalPeriod(id).subscribe({
				next: (res: any) => {

					this.fromDate = this.dateConverterService.getDateForCalender(res.response.fromDate);
					this.toDate = this.dateConverterService.getDateForCalender(res.response.toDate);




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

}
