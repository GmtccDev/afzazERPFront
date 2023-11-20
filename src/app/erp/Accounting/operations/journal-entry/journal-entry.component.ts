import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
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
import { GeneralConfigurationEnum } from 'src/app/shared/constants/enumrators/enums';
import { GeneralConfigurationServiceProxy } from '../../services/general-configurations.services';
import { FiscalPeriodServiceProxy } from '../../services/fiscal-period.services';
import { FiscalPeriodStatus } from 'src/app/shared/enum/fiscal-period-status';
@Component({
	selector: 'app-journal-entry',
	templateUrl: './journal-entry.component.html',
	styleUrls: ['./journal-entry.component.scss']
})
export class JournalEntryComponent implements OnInit, OnDestroy, AfterViewInit {

	//#region Main Declarations
	journalEntry: any[] = [];
	currnetUrl: any;
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
	listIds: any[] = [];
	listUpdateIds: any[] = [];
	errorMessage = '';
	errorClass = '';
	subsList: Subscription[] = [];
	fiscalPeriodId: any;
	fiscalPeriodName: any;
	fiscalPeriodStatus: any;
	//#endregion

	//#region Constructor
	constructor(
		private journalEntryService: JournalEntryServiceProxy,
		private router: Router,
		private sharedServices: SharedService,
		private alertsService: NotificationsAlertsService,
		private modalService: NgbModal,
		private translate: TranslateService,
		private spinner: NgxSpinnerService,
		private reportViewerService: ReportViewerService,
		private generalConfigurationService: GeneralConfigurationServiceProxy,
		private fiscalPeriodService: FiscalPeriodServiceProxy,

	) {

	}


	//#endregion

	//#region ngOnInit
	ngOnInit(): void {
		//  this.defineGridColumn();
		this.spinner.show();
		Promise.all([this.getGeneralConfigurationsOfFiscalPeriod(), this.getJournalEntryes()])
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
						debugger
						this.journalEntry = res.response.items.filter(x => x.isCloseFiscalPeriod != true && x.fiscalPeriodId == this.fiscalPeriodId);


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
				title: '  تاريخ  ', width: 300, field: 'date', formatter: function (cell, formatterParams, onRendered) {
					var value = cell.getValue();
					value = format(new Date(value), 'dd-MM-yyyy');;
					return value;
				}
			} : {
				title: 'Date', width: 300, field: 'date', formatter: function (cell, formatterParams, onRendered) {
					var value = cell.getValue();
					value = format(new Date(value), 'dd-MM-yyyy');;
					return value;
				}
			},
		this.lang == 'ar'
			? { title: ' اسم اليومية', field: 'journalNameAr' } : { title: ' Name Journal ', field: 'journalNameEn' },


		this.lang == 'ar'
			? {
				title: '  الحالة  ', width: 300, field: 'postType', formatter: this.translateArEnum
			} : {
				title: '   Status', width: 300, field: 'postType', formatter: this.translateEnEnum
			},
		this.lang == 'ar'
			? {
				title: '  النوع  ', width: 300, field: 'parentType', formatter: this.translateParentArEnum, cellClick: (e, cell) => {

					this.onViewClicked(cell.getRow().getData().parentType, cell.getRow().getData().parentTypeId);
				}
			} : {
				title: '   Type', width: 300, field: 'parentType', formatter: this.translateParentEnEnum, cellClick: (e, cell) => {

					this.onViewClicked(cell.getRow().getData().parentType, cell.getRow().getData().parentTypeId);
				}
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
		let reportTypeId = 6;
		this.reportViewerService.gotoViewer(reportType, reportTypeId, id);
	}
	onViewClicked(parentType, id) {
		debugger
		if (parentType == 1) {
			window.open('accounting-operations/vouchers/update-voucher/1/' + id, "")
		}
		if (parentType == 2) {
			window.open('accounting-operations/incomingCheque/update-incomingCheque/' + id, "_blank")
		}
		if (parentType == 3) {
			window.open('accounting-operations/issuingCheque/update-issuingCheque/' + id, "_blank")
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
				text = '  قيد';
				break;
		}
		return text;

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
				text = ' Journal Entry';
				break;
		}
		return text;

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
}
