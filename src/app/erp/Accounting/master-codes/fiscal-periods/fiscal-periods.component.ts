import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { DeleteListFiscalPeriodCommand, FiscalPeriodDto } from '../../models/fiscal-period';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { SharedService } from '../../../../shared/common-services/shared-service';
import { ToolbarPath } from '../../../../shared/interfaces/toolbar-path';
import { NotificationsAlertsService } from '../../../../shared/common-services/notifications-alerts.service';
import { ToolbarData } from '../../../../shared/interfaces/toolbar-data';
import { Subscription } from 'rxjs';
import { ITabulatorActionsSelected } from '../../../../shared/interfaces/ITabulator-action-selected';
import { MessageModalComponent } from '../../../../shared/components/message-modal/message-modal.component'
import { SettingMenuShowOptions } from '../../../../shared/components/models/setting-menu-show-options';
import { ToolbarActions } from '../../../../shared/enum/toolbar-actions'
import { FiscalPeriodServiceProxy } from '../../services/fiscal-period.services';
import format from 'date-fns/format';
import { NgxSpinnerService } from 'ngx-spinner';
@Component({
	selector: 'app-fiscal-periods',
	templateUrl: './fiscal-periods.component.html',
	styleUrls: ['./fiscal-periods.component.scss']
})
export class FiscalPeriodsComponent implements OnInit, OnDestroy, AfterViewInit {

	//#region Main Declarations
	fiscalPeriods: FiscalPeriodDto[] = [];
	currnetUrl: any;
	addUrl: string = '/accounting-master-codes/fiscalPeriod/add-fiscalPeriod';
	updateUrl: string = '/accounting-master-codes/fiscalPeriod/update-fiscalPeriod/';
	listUrl: string = '/accounting-master-codes/fiscalPeriod';
	toolbarPathData: ToolbarPath = {
		listPath: '',
		updatePath: this.updateUrl,
		addPath: this.addUrl,
		componentList: this.translate.instant("component-names.fiscalPeriod"),
		componentAdd: '',

	};
	listIds: any[] = [];
	//#endregion

	//#region Constructor
	constructor(
		private fiscalPeriodService: FiscalPeriodServiceProxy,
		private router: Router,
		private sharedServices: SharedService,
		private alertsService: NotificationsAlertsService,
		private modalService: NgbModal,
		private translate: TranslateService,
		private spinner: NgxSpinnerService,

	) {

	}


	//#endregion

	//#region ngOnInit
	ngOnInit(): void {

		this.spinner.show();
		Promise.all([this.getFiscalPeriods()])
			.then(a => {
				this.spinner.hide();
				this.sharedServices.changeButton({ action: 'List' } as ToolbarData);
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
	getFiscalPeriods() {
		return new Promise<void>((resolve, reject) => {
			let sub = this.fiscalPeriodService.allFiscalPeriodes(undefined, undefined, undefined, undefined, undefined).subscribe({
				next: (res) => {

					this.toolbarPathData.componentList = this.translate.instant("component-names.fiscalPeriod");
					if (res.success) {
						this.fiscalPeriods = res.response.items

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

	//#region CRUD Operations
	delete(id: any) {
		this.fiscalPeriodService.deleteFiscalPeriod(id).subscribe((resonse) => {
			this.getFiscalPeriods();
		});
	}
	edit(id: string) {
		this.router.navigate([
			'/accounting-master-codes/fiscalPeriod/update-fiscalPeriod',
			id,
		]);
	}

	//#endregion



	showConfirmDeleteMessage(id) {
		const modalRef = this.modalService.open(MessageModalComponent);
		modalRef.componentInstance.message = this.translate.instant('messages.confirm-delete');
		modalRef.componentInstance.title = this.translate.instant('messageTitle.delete');
		modalRef.componentInstance.btnConfirmTxt = this.translate.instant('messageTitle.delete');
		modalRef.componentInstance.isYesNo = true;
		modalRef.result.then((rs) => {
			if (rs == 'Confirm') {
				this.spinner.show();
				const input = {
					tableName: "FiscalPeriods",
					id: id,
					idName: "Id"
				};
				let sub = this.fiscalPeriodService.deleteEntity(input).subscribe(
					(resonse) => {

						//reloadPage()
						this.getFiscalPeriods();

					});
				this.subsList.push(sub);
				this.spinner.hide();

			}
		});
	}
	//#endregion
	//#region Tabulator

	panelId: number = 1;
	sortByCols: any[] = [];
	searchFilters: any;
	groupByCols: string[] = [];
	lang = localStorage.getItem("language");
	columnNames = [{
		title: this.lang == 'ar' ? ' الكود' : 'code ',
		field: 'code',
	},
	this.lang == 'ar'
		? { title: ' الاسم', field: 'nameAr' } :
		{ title: ' Name  ', field: 'nameEn' },
	this.lang == 'ar'
		? {
			title: '  تاريخ  ', width: 300, field: 'fromDate', formatter: function (cell, formatterParams, onRendered) {
				var value = cell.getValue();
				value = format(new Date(value), 'dd-MM-yyyy');;
				return value;
			}
		} : {
			title: ' from Date', width: 300, field: 'fromDate', formatter: function (cell, formatterParams, onRendered) {
				var value = cell.getValue();
				value = format(new Date(value), 'dd-MM-yyyy');;
				return value;
			}
		},
	this.lang == 'ar'
		? {
			title: ' الي تاريخ  ', width: 300, field: 'toDate', formatter: function (cell, formatterParams, onRendered) {
				var value = cell.getValue();
				value = format(new Date(value), 'dd-MM-yyyy');;
				return value;
			}
		} : {
			title: '  To Date', width: 300, field: 'toDate', formatter: function (cell, formatterParams, onRendered) {
				var value = cell.getValue();
				value = format(new Date(value), 'dd-MM-yyyy');;
				return value;
			}
		},
	///
	this.lang == 'ar'
		? {
			title: '  الحالة  ', width: 300, field: 'fiscalPeriodStatusName', formatter: this.translateEnum
		} : {
			title: '   Status', width: 300, field: 'fiscalPeriodStatusName'
		},
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

	openFiscalPeriodes() { }
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
	onEdit(id) {

		if (id != undefined) {
			this.edit(id);
			this.sharedServices.changeButton({
				action: 'Update',
				componentName: 'List',
				submitMode: false
			} as ToolbarData);

			this.sharedServices.changeToolbarPath(this.toolbarPathData);
			this.router.navigate(['accounting-master-codes/fiscalPeriod/update-fiscalPeriod/' + id])
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
				this.router.navigate(['accounting-master-codes/fiscalPeriod/update-fiscalPeriod/' + event.item.id])

			} else if (event.actionName == 'Delete') {
				this.showConfirmDeleteMessage(event.item.id);
			}
		}
	}

	//#endregion



	//#region Toolbar Service
	currentBtn!: string;
	subsList: Subscription[] = [];
	listenToClickedButton() {

		let sub = this.sharedServices.getClickedbutton().subscribe({
			next: (currentBtn: ToolbarData) => {

				if (currentBtn != null) {
					if (currentBtn.action == ToolbarActions.List) {

					} else if (currentBtn.action == ToolbarActions.New) {
						this.router.navigate([this.addUrl]);
					}
					else if (currentBtn.action == ToolbarActions.DeleteCheckList) {
						this.onDelete();
					}
				}
			},
		});
		this.subsList.push(sub);
	}
	onDelete() {

		let item = new DeleteListFiscalPeriodCommand();
		item.ids = this.listIds.map(item => item.id);
		const input = {
			tableName: "FiscalPeriods",
			ids: this.listIds,
			idName: "Id"
		};
		let sub = this.fiscalPeriodService.deleteListEntity(input).subscribe(
			(resonse) => {

				this.getFiscalPeriods();
				this.listIds = [];
			});
		this.subsList.push(sub);
	}
	translateEnum(cell, formatterParams, onRendered) {
		const status = cell.getValue();
		let text;
		switch (status) {
			case 'Opened':
				text = 'مفتوحة';
				break;
			case 'Closed':
				text = 'مغلقة';
				break;
			case 'ClosedForRevision':
				text = 'مغلقة للمراجعة ';
				break;
			default:
				text = status;
				break;
		}
		return text;

	}
	//#endregion
}
