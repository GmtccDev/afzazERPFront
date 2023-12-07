import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
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
import format from 'date-fns/format';
import { NgxSpinnerService } from 'ngx-spinner';
import { AccountingPeriodDto, DeleteListAccountingPeriodCommand } from '../../models/accounting-period';
import { AccountingPeriodServiceProxy } from '../../services/accounting-period.service';
import { GeneralConfigurationEnum } from 'src/app/shared/constants/enumrators/enums';
import { GeneralConfigurationServiceProxy } from '../../services/general-configurations.services';

@Component({
	selector: 'app-closed-accounting-period',
	templateUrl: './closed-accounting-period.component.html',
	styleUrls: ['./closed-accounting-period.component.scss']
})
export class ClosedAccountingPeriodComponent implements OnInit, OnDestroy, AfterViewInit {

	//#region Main Declarations
	companyId = localStorage.getItem("companyId")

	closedAccountingPeriods: AccountingPeriodDto[] = [];
	currnetUrl: any;
	addUrl: string = '/accounting-operations/closedAccountingPeriod/add-closedAccountingPeriod';
	updateUrl: string = '/accounting-operations/closedAccountingPeriod/update-closedAccountingPeriod/';
	listUrl: string = '/accounting-operations/closedAccountingPeriod';
	toolbarPathData: ToolbarPath = {
		listPath: '',
		updatePath: this.updateUrl,
		addPath: this.addUrl,
		componentList: this.translate.instant("component-names.close-accounting-period"),
		componentAdd: '',

	};
	listIds: any[] = [];
	fiscalPeriodId: any;
	//#endregion

	//#region Constructor
	constructor(
		private accountingPeriodService: AccountingPeriodServiceProxy,
		private generalConfigurationService: GeneralConfigurationServiceProxy,
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
		Promise.all([this.getGeneralConfigurationsOfFiscalPeriod(), this.getAccountingPeriods()])
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
	getGeneralConfigurationsOfFiscalPeriod() {
		return new Promise<void>((resolve, reject) => {
			let sub = this.generalConfigurationService.getGeneralConfiguration(GeneralConfigurationEnum.AccountingPeriod).subscribe({
				next: (res: any) => {
					resolve();
					if (res.response.value > 0) {
						this.fiscalPeriodId = res.response.value;

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
	getAccountingPeriods() {
		return new Promise<void>((resolve, reject) => {
			let sub = this.accountingPeriodService.allAccountingPeriods(undefined, undefined, undefined, undefined, undefined).subscribe({
				next: (res) => {

					this.toolbarPathData.componentList = this.translate.instant("component-names.close-accounting-period");
					if (res.success) {
						this.closedAccountingPeriods = res.response.items.filter(x => x.companyId == this.companyId && x.fiscalPeriodId == this.fiscalPeriodId)

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
		this.accountingPeriodService.deleteAccountingPeriod(id).subscribe((resonse) => {
			this.getAccountingPeriods();
		});
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
		//	this.router.navigate(['accounting-operations/closedAccountingPeriod/update-closedAccountingPeriod/' + id])
		}

	}
	edit(id: string) {
		this.router.navigate([
			'/accounting-operations/closedAccountingPeriod/update-closedAccountingPeriod',
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
					tableName: "AccountingPeriods",
					id: id,
					idName: "Id"
				};
				let sub = this.accountingPeriodService.deleteEntity(input).subscribe(
					(resonse) => {

						this.getAccountingPeriods();

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
	columnNames = [

		{
			title: this.lang == 'ar' ? 'من تاريخ' : 'From Date', width: 300, field: 'fromDate', formatter: function (cell, formatterParams, onRendered) {
				var value = cell.getValue();
				value = format(new Date(value), 'dd-MM-yyyy');;
				return value;
			}
		},
		{
			title: this.lang == 'ar' ? 'الى تاريخ' : 'To Date', width: 300, field: 'toDate', formatter: function (cell, formatterParams, onRendered) {
				var value = cell.getValue();
				value = format(new Date(value), 'dd-MM-yyyy');;
				return value;
			}
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
				{ field: 'fromDate', type: 'like', value: searchTxt },
				{ field: 'toDate', type: 'like', value: searchTxt },

			],
		];
	}

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

			}
			else if (event.actionName == 'Delete') {

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

		let item = new DeleteListAccountingPeriodCommand();
		var ids = this.listIds.map(item => item.id);
		const input = {
			tableName: "AccountingPeriods",
			ids: ids,
			idName: "Id"
		};

		let sub = this.accountingPeriodService.deleteListEntity(input).subscribe(
			(resonse) => {

				this.getAccountingPeriods();
				this.listIds = [];
			});
		this.subsList.push(sub);
	}

	//#endregion
}
