import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { SharedService } from 'src/app/shared/common-services/shared-service';
import { ToolbarPath } from 'src/app/shared/interfaces/toolbar-path';
import { NotificationsAlertsService } from '../../../../shared/common-services/notifications-alerts.service';
import { ToolbarData } from 'src/app/shared/interfaces/toolbar-data';
import { Subscription } from 'rxjs';
import { ITabulatorActionsSelected } from '../../../../shared/interfaces/ITabulator-action-selected';
import { MessageModalComponent } from '../../../../shared/components/message-modal/message-modal.component'
import { SettingMenuShowOptions } from 'src/app/shared/components/models/setting-menu-show-options';
import { ToolbarActions } from '../../../../shared/enum/toolbar-actions';
import { JournalEntryServiceProxy } from '../../services/journal-entry'
import format from 'date-fns/format';
import { NgxSpinnerService } from 'ngx-spinner';
import { ReportViewerService } from '../../reports/services/report-viewer.service';
import { EntryTypesEnum, GeneralConfigurationEnum } from 'src/app/shared/constants/enumrators/enums';
import { GeneralConfigurationServiceProxy } from '../../services/general-configurations.services';
import { FiscalPeriodServiceProxy } from '../../services/fiscal-period.services';
import { FiscalPeriodStatus } from 'src/app/shared/enum/fiscal-period-status';
import { CompanyServiceProxy } from 'src/app/erp/master-codes/services/company.service';
import { UserService } from 'src/app/shared/common-services/user.service';
import { FullDateComponent } from 'src/app/shared/date/full-date/full-date.component';
import { IslamicI18n } from 'src/app/shared/services/date-services/hijriservice';
import { DateCalculation } from 'src/app/shared/services/date-services/date-calc.service';
@Component({
	selector: 'app-journal-entry',
	templateUrl: './journal-entry.component.html',
	styleUrls: ['./journal-entry.component.scss']
})
export class JournalEntryComponent implements OnInit, OnDestroy, AfterViewInit {
	@ViewChild(FullDateComponent) fullDate;
	//#region Main Declarations
	journalEntry: any[] = [];
	currnetUrl: any;
	dateType: any;
	addUrl: string = '/accounting-operations/journalEntry/add-journalEntry';
	updateUrl: string = '/accounting-operations/journalEntry/update-journalEntry/';
	listUrl: string = '/accounting-operations/journalEntry';
	toolbarPathData: ToolbarPath = {
		listPath: '',
		updatePath: this.updateUrl,
		addPath: this.addUrl,
		componentList: this.translate.instant("component-names.journalEntry"),
		componentAdd: '',

	};
	companyId: string = this.userService.getCompanyId()
	listIds: any[] = [];
	listUpdateIds: any[] = [];
	errorMessage = '';
	errorClass = '';
	subsList: Subscription[] = [];
	fiscalPeriodId: any;
	fiscalPeriodName: any;
	fiscalPeriodStatus: any;
	refreshGrid: boolean = false;

	//#endregion

	//#region Constructor
	constructor(
		private journalEntryService: JournalEntryServiceProxy,
		private router: Router,
		private companyService: CompanyServiceProxy,
		private sharedServices: SharedService,
		private alertsService: NotificationsAlertsService,
		private modalService: NgbModal,
		private userService: UserService,
		private translate: TranslateService,
		private spinner: NgxSpinnerService,
		private reportViewerService: ReportViewerService,
		private generalConfigurationService: GeneralConfigurationServiceProxy,
		private fiscalPeriodService: FiscalPeriodServiceProxy,
		private dateCalculation: DateCalculation

	) {

	}


	//#endregion

	//#region ngOnInit
	ngOnInit(): void {
		//  this.defineGridColumn();
		this.spinner.show();
		Promise.all([
			this.getGeneralConfigurationsOfFiscalPeriod(),
			this.getCompanyById(this.companyId),
			this.getJournalEntryes(),
		])
			.then(a => {
				this.spinner.hide();
				this.sharedServices.changeButton({ action: 'List' } as ToolbarData);
				// this.sharedServices.changeButton({ action: 'Post' } as ToolbarData);
				this.sharedServices.changeToolbarPath(this.toolbarPathData);
				this.listenToClickedButton();
			}).catch(err => {
				this.spinner.hide();
			})
	}

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

	//#region Authentications

	//#endregion

	//#region Permissions

	//#endregion

	//#region  State Management
	//#endregion

	//#region Basic Data
	///Geting form dropdown list data
	getJournalEntryes() {
		return new Promise<void>((resolve, reject) => {
			let sub = this.journalEntryService.allJournalEntryes(undefined, undefined, undefined, undefined, undefined).subscribe({
				next: (res) => {
					this.toolbarPathData.componentList = this.translate.instant("component-names.journalEntry");
					if (res.success) {

						this.journalEntry = res.response.data.result;
						//res.response.items.filter(x => x.isCloseFiscalPeriod != true && x.fiscalPeriodId == this.fiscalPeriodId);


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
	getCompanyById(id: any) {
		return new Promise<void>((resolve, reject) => {

			let sub = this.companyService.getCompany(id).subscribe({
				next: (res: any) => {
					debugger;

					res?.response?.useHijri
					if (res?.response?.useHijri) {
						this.dateType = 2
					} else {
						this.dateType = 1
					}

					resolve();



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



	//#endregion

	//#region CRUD operations
	delete(id: any) {
		this.journalEntryService.deleteJournalEntry(id).subscribe((resonse) => {
			this.getJournalEntryes();
		});
	}
	edit(id: string) {
		this.router.navigate([
			'/accounting-operations/journalEntry/update-journalEntry',
			id,
		]);
	}

	//#endregion



	showConfirmDeleteMessage(id) {

		if (this.fiscalPeriodStatus != FiscalPeriodStatus.Opened) {
			this.errorMessage = this.translate.instant("journalEntry.no-delete-entry-fiscal-period-closed") + " : " + this.fiscalPeriodName;
			this.errorClass = 'errorMessage';
			this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
			return;
		}
		return new Promise<void>((resolve, reject) => {

			let sub = this.journalEntryService.getJournalEntry(id).subscribe({
				next: (res: any) => {
					resolve();

					if (res.response?.parentType == null) {
						const modalRef = this.modalService.open(MessageModalComponent);
						modalRef.componentInstance.message = this.translate.instant('messages.confirm-delete');
						modalRef.componentInstance.title = this.translate.instant('messageTitle.delete');
						modalRef.componentInstance.btnConfirmTxt = this.translate.instant('messageTitle.delete');
						modalRef.componentInstance.isYesNo = true;
						modalRef.result.then((rs) => {
							if (rs == 'Confirm') {

								this.spinner.show();

								let sub = this.journalEntryService.deleteJournalEntry(id).subscribe(
									(resonse) => {

										this.getJournalEntryes();

									});
								this.spinner.hide();

							}
						});
					}
					else {
						this.errorMessage = this.translate.instant("journalEntry.no-delete-entry");
						this.errorClass = 'errorMessage';
						this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
						return;
					}
				}
			})
			this.subsList.push(sub);

		})

	}
	//#endregion
	//#region Tabulator

	panelId: number = 1;
	sortByCols: any[] = [];
	searchFilters: any;
	groupByCols: string[] = [];
	lang: string = localStorage.getItem("language");


	columnNames = [

		{
			title: this.lang == 'ar' ? ' الكود' : 'code ',
			field: 'code',
		},
		this.lang == 'ar'
			? {
				title: '  تاريخ  ', width: 300, field: 'date', formatter: (cell, formatterParams, onRendered) => {

					if (this.dateType == 2) {
						return this.dateCalculation.getHijriDate(new Date(cell.getValue()));
					}
					else {
						return format(new Date(cell.getValue()), 'dd-MM-yyyy')

					}




				}
			} : {
				title: 'Date', width: 300, field: 'date', formatter: (cell, formatterParams, onRendered) => {
					if (this.dateType == 2) {
						return this.dateCalculation.getHijriDate(new Date(cell.getValue()));
					}
					else {
						return format(new Date(cell.getValue()), 'dd-MM-yyyy')

					}
				}
			},
		this.lang == 'ar'
			? { title: ' اسم اليومية', field: 'journalNameAr' } : { title: 'Journal Name', field: 'journalNameEn' },


		this.lang == 'ar'
			? {
				title: '  الحالة  ', width: 300, field: 'statusAr'
				//, formatter: this.translateArEnum
			} : {
				title: '   Status', width: 300, field: 'statusEn'
				//, formatter: this.translateEnEnum
			},
		this.lang == 'ar'
			? {
				title: '  النوع  ', width: 300, field: 'entryTypeAr'
				//, formatter: this.translateParentArEnum
				, cellClick: (e, cell) => {

					this.onViewClicked(cell.getRow().getData().parentType, cell.getRow().getData().parentTypeId, cell.getRow().getData().settingId);
				}
			} : {
				title: '   Type', width: 300, field: 'entryTypeEn'
				//formatter: this.translateParentEnEnum
				, cellClick: (e, cell) => {

					this.onViewClicked(cell.getRow().getData().parentType, cell.getRow().getData().parentTypeId, cell.getRow().getData().settingId);
				}
			},
		this.lang == 'ar'
			? {
				title: '  النمط  ', width: 300, field: 'settingAr'
			} : {
				title: 'Setting', width: 300, field: 'settingEn'
			},
		this.lang == "ar" ? {
			title: "عرض التقرير",
			field: "id", formatter: this.printReportFormatIcon, cellClick: (e, cell) => {

				this.onViewReportClicked(cell.getRow().getData().id);
			}
		}
			:

			{
				title: "View Report",
				field: "id", formatter: this.printReportFormatIcon, cellClick: (e, cell) => {


					this.onViewReportClicked(cell.getRow().getData().id);
				}
			}
	];

	menuOptions: SettingMenuShowOptions = {
		showDelete: true,
		showEdit: true,
	};

	direction: string = 'ltr';

	onSearchTextChange(searchTxt: string) {
		this.searchFilters = [
			[
				{ field: 'nameEn', type: 'like', value: searchTxt },
				{ field: 'nameAr', type: 'like', value: searchTxt },
				{ field: 'code', type: 'like', value: searchTxt },
				,
			],
		];
	}

	openJournalEntryes() { }
	onCheck(id) {

		const index = this.listIds.findIndex(item => item.id === id && item.isChecked === true);
		if (index !== -1) {
			this.listIds.splice(index, 1);
		} else {
			const newItem = { id, isChecked: true };
			this.listIds.push(newItem);
		}
		this.sharedServices.changeButton({
			action: 'Delete',
			componentName: 'List',
			submitMode: false
		} as ToolbarData);
	}

	onCheckEdit(id) {

		localStorage.removeItem("itemId");
		localStorage.setItem("itemId", id);
		const index = this.listUpdateIds.findIndex(item => item.id === id && item.isChecked === true);
		if (index !== -1) {
			this.listUpdateIds.splice(index, 1);
		} else {
			const newItem = { id, isChecked: true };
			this.listUpdateIds.push(newItem);
		}

		this.sharedServices.changeButton({
			action: 'Post',
			componentName: 'List',
			submitMode: false
		} as ToolbarData);

	}

	onViewReportClicked(id) {

		localStorage.removeItem("itemId")
		localStorage.setItem("itemId", id)
		let reportType = 1;
		let reportTypeId = 12;
		this.reportViewerService.gotoViewer(reportType, reportTypeId, id);
	}
	onViewClicked(parentType, id, settingId) {

		if (parentType == EntryTypesEnum.Voucher) {
			window.open('accounting-operations/vouchers/update-voucher/' + settingId + '/' + id, "")
		}
		if (parentType == EntryTypesEnum.IncomingCheque) {
			window.open('accounting-operations/incomingCheque/update-incomingCheque/' + id, "_blank")
		}
		if (parentType == EntryTypesEnum.IssuingCheque) {
			window.open('accounting-operations/issuingCheque/update-issuingCheque/' + id, "_blank")
		}
		if (parentType == EntryTypesEnum.SalesBill || parentType == EntryTypesEnum.SalesReturnBill
			|| parentType == EntryTypesEnum.PurchasesBill || parentType == EntryTypesEnum.PurchasesReturnBill) {

			window.open('warehouses-operations/bill/update-bill/' + settingId + '/' + id, "_blank")
		}
	}
	onCheckUpdate() {


		var ids = this.listUpdateIds.map(item => item.id);
		if (ids.length > 0) {
			let sub = this.journalEntryService.updateList(ids).subscribe(
				(resonse) => {

					this.getJournalEntryes();
					this.listUpdateIds = [];
				});
			this.subsList.push(sub);
		}

	}
	onEdit(id) {

		if (id != undefined) {
			this.edit(id);
			this.sharedServices.changeButton({
				action: 'Update',
				componentName: 'List',
				submitMode: false
			} as ToolbarData);

			this.sharedServices.changeToolbarPath(this.toolbarPathData);
			this.router.navigate(['accounting-operations/journalEntry/update-journalEntry/' + id])
		}

	}
	onMenuActionSelected(event: ITabulatorActionsSelected) {

		if (event != null) {
			if (event.actionName == 'Edit') {
				this.edit(event.item.id);
				this.sharedServices.changeButton({
					action: 'Update',
					componentName: 'List',
					submitMode: false
				} as ToolbarData);

				this.sharedServices.changeToolbarPath(this.toolbarPathData);
				this.router.navigate(['accounting-operations/journalEntry/update-journalEntry/' + event.item.id])

			} else if (event.actionName == 'Delete') {

				this.showConfirmDeleteMessage(event.item.id);
			}
		}
	}

	//#endregion



	//#region Toolbar Service
	currentBtn!: string;
	listenToClickedButton() {

		let sub = this.sharedServices.getClickedbutton().subscribe({
			next: (currentBtn: ToolbarData) => {

				if (currentBtn != null) {
					if (currentBtn.action == ToolbarActions.List) {

					} else if (currentBtn.action == ToolbarActions.New) {
						this.router.navigate([this.addUrl]);
					}
					else if (currentBtn.action == ToolbarActions.DeleteCheckList) {
						if (this.fiscalPeriodStatus != FiscalPeriodStatus.Opened) {
							this.errorMessage = this.translate.instant("journalEntry.no-delete-entry-fiscal-period-closed") + " : " + this.fiscalPeriodName;
							this.errorClass = 'errorMessage';
							this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
							return;
						}
						else {
							this.onDelete();
						}
					}
					else if (currentBtn.action == ToolbarActions.Post) {
						this.onCheckUpdate();
					}
				}
			},
		});
		this.subsList.push(sub);
	}
	onDelete() {
		var ids = this.listIds.map(item => item.id);
		let sub = this.journalEntryService.deleteListJournalEntry(ids).subscribe(
			(resonse) => {

				this.getJournalEntryes();
				this.listIds = [];
			});
		this.subsList.push(sub);
	}
	translateArEnum(cell, formatterParams, onRendered) {

		const status = cell.getValue();
		let text;
		switch (status) {
			case 1:
				text = 'مرحل';
				break;
			case 2:
				text = 'غير مرحل';
				break;

			default:
				text = 'غير مرحل';
				break;
		}
		return text;

	}
	translateEnEnum(cell, formatterParams, onRendered) {

		const status = cell.getValue();
		let text;
		switch (status) {
			case 1:
				text = 'Post';
				break;
			case 2:
				text = 'Not Post';
				break;

			default:
				text = 'Not Post';
				break;
		}
		return text;

	}
	translateParentArEnum(cell, formatterParams, onRendered) {

		const status = cell.getValue();
		let text;
		switch (status) {
			case 1:
				text = 'سندات';
				break;
			case 2:
				text = 'شيكات ورداة ';
				break;
			case 3:
				text = ' شيكات صادرة';
				break;
			default:
				text = 'قيد';
				break;
		}
		if (text == 'قيد') {
			return text;
		}
		const iconHtml = `<span style="color: blue; text-decoration: underline; cursor: pointer;" class="customLink">${text}</span>`;
		return iconHtml;

	}
	translateParentEnEnum(cell, formatterParams, onRendered) {

		const status = cell.getValue();
		let text;
		switch (status) {
			case 1:
				text = 'Voucher';
				break;
			case 2:
				text = 'Incoming Cheque';
				break;
			case 3:
				text = ' Issuing Cheque ';
				break;
			default:
				text = 'Journal Entry';
				break;
		}
		if (text == 'Journal Entry') {
			return text;
		}
		const iconHtml = `<span style="color: blue; text-decoration: underline; cursor: pointer;" class="customLink">${text}</span>`;
		return iconHtml;
	}
	CheckBoxFormatIcon() { //plain text value

		return "<input id='checkId' type='checkbox' />";
	};
	printReportFormatIcon() { //plain text value

		return "<i class='fa fa-print' aria-hidden='true'></i>";
	};
	//#endregion
	getGeneralConfigurationsOfFiscalPeriod() {
		return new Promise<void>((resolve, reject) => {
			let sub = this.generalConfigurationService.getGeneralConfiguration(GeneralConfigurationEnum.AccountingPeriod).subscribe({
				next: (res: any) => {
					resolve();
					if (res.response.value > 0) {
						this.fiscalPeriodId = res.response.value;
						if (this.fiscalPeriodId != null) {
							this.getfiscalPeriodById(this.fiscalPeriodId);

						}
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
					resolve();
					this.fiscalPeriodName = this.lang == 'ar' ? res.response?.nameAr : res.response?.nameEn
					this.fiscalPeriodStatus = res.response?.fiscalPeriodStatus.toString()

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
	kuwaiticalendar(adjust: any) {
		debugger
		var today = new Date();
		if (adjust) {
			var adjustmili = 1000 * 60 * 60 * 24 * adjust;
			var todaymili = today.getTime() + adjustmili;
			today = new Date(todaymili);
		}
		var day = today.getDate();
		var month = today.getMonth();
		var year = today.getFullYear();
		var m = month + 1;
		var y = year;
		if (m < 3) {
			y -= 1;
			m += 12;
		}

		var a = Math.floor(y / 100.);
		var b = 2 - a + Math.floor(a / 4.);
		if (y < 1583) b = 0;
		if (y == 1582) {
			if (m > 10) b = -10;
			if (m == 10) {
				b = 0;
				if (day > 4) b = -10;
			}
		}

		var jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524;

		b = 0;
		if (jd > 2299160) {
			a = Math.floor((jd - 1867216.25) / 36524.25);
			b = 1 + a - Math.floor(a / 4.);
		}
		var bb = jd + b + 1524;
		var cc = Math.floor((bb - 122.1) / 365.25);
		var dd = Math.floor(365.25 * cc);
		var ee = Math.floor((bb - dd) / 30.6001);
		day = (bb - dd) - Math.floor(30.6001 * ee);
		month = ee - 1;
		if (ee > 13) {
			cc += 1;
			month = ee - 13;
		}
		year = cc - 4716;

		if (adjust) {
			var wd = this.gmod(jd + 1 - adjust, 7) + 1;
		} else {
			var wd = this.gmod(jd + 1, 7) + 1;
		}

		var iyear = 10631. / 30.;
		var epochastro = 1948084;
		var epochcivil = 1948085;

		var shift1 = 8.01 / 60.;

		var z = jd - epochastro;
		var cyc = Math.floor(z / 10631.);
		z = z - 10631 * cyc;
		var j = Math.floor((z - shift1) / iyear);
		var iy = 30 * cyc + j;
		z = z - Math.floor(j * iyear + shift1);
		var im = Math.floor((z + 28.5001) / 29.5);
		if (im == 13) im = 12;
		var id = z - Math.floor(29.5001 * im - 29);

		//var myRes = new Array(8);

		// myRes[0] = day; //calculated day (CE)
		// myRes[1] = month-1; //calculated month (CE)
		// myRes[2] = year; //calculated year (CE)
		// myRes[3] = jd-1; //julian day number
		// myRes[4] = wd-1; //weekday number
		// myRes[5] = id; //islamic date
		// myRes[6] = im-1; //islamic month
		// myRes[7] = iy; //islamic year

		return id;
	}
	gmod(n, m) {
		return ((n % m) + m) % m;
	}


}


