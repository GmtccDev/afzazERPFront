import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ToolbarData } from '../../../../../shared/interfaces/toolbar-data';
import { ToolbarPath } from '../../../../../shared/interfaces/toolbar-path';
import { NgxSpinnerService } from 'ngx-spinner';
import { SharedService } from '../../../../../shared/common-services/shared-service';
import { ToolbarActions } from '../../../../../shared/enum/toolbar-actions';
import { VoucherServiceProxy } from '../../../services/voucher.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageModalComponent } from 'src/app/shared/components/message-modal/message-modal.component';
import { format } from 'date-fns';
import { SettingMenuShowOptions } from 'src/app/shared/components/models/setting-menu-show-options';
import { ITabulatorActionsSelected } from 'src/app/shared/interfaces/ITabulator-action-selected';

@Component({
	selector: 'app-post-voucher',
	templateUrl: './post-voucher.component.html',
	styleUrls: ['./post-voucher.component.scss']
})
export class PostVoucherComponent implements OnInit, OnDestroy, AfterViewInit {
	//#region Main Declarations
	noPostvouchers: any[] = [];
	


	addUrl: string = '/accounting-operations/vouchers/add-voucher/';
	updateUrl: string = '/accounting-operations/vouchers/update-voucher/';
	listUrl: string = '/accounting-operations/postVoucher/';
	toolbarPathData: ToolbarPath = {
		listPath: '',
		updatePath: this.updateUrl,
		addPath: this.addUrl,
		componentList: this.translate.instant("component-names.post-vouchers"),
		componentAdd: '',

	};
	listIds: any[] = [];

	//#endregion

	//#region Constructor
	constructor(
		private voucherService: VoucherServiceProxy,
		private router: Router,
		private route: ActivatedRoute,
		private sharedServices: SharedService,
		private modalService: NgbModal,
		private translate: TranslateService,
		private spinner: NgxSpinnerService
	) {

	}


	//#endregion

	//#region ngOnInit
	ngOnInit(): void {

		this.spinner.show();
		Promise.all([this.getNotPostVouchers()])
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




	//#endregion

	getNotPostVouchers() {
		return new Promise<void>((resolve, reject) => {
			let sub = this.voucherService.allNotPostedVouchers(undefined, undefined, undefined, undefined, undefined).subscribe({
				next: (res) => {
					if (res.success) {
						this.noPostvouchers = res.response.data.result

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
		this.voucherService.deleteVoucher(id).subscribe((resonse) => {
			// this.getVouchers();
			this.router.navigate([this.listUrl])
				.then(() => {
					window.location.reload();
				});
		});
	}
	edit(id: string) {

		this.router.navigate([
			'/accounting-operations/vouchers/update-voucher/', id,
		]);
	}

	//#endregion



	showConfirmGenerateEntryMessage(voucher) {
		const modalRef = this.modalService.open(MessageModalComponent);
		modalRef.componentInstance.message = this.translate.instant('voucher.confirm-generate-entry');
		modalRef.componentInstance.title = this.translate.instant('messageTitle.generate-entry');
		modalRef.componentInstance.btnConfirmTxt = this.translate.instant('messageTitle.generate-entry');
		modalRef.componentInstance.isYesNo = true;
		modalRef.result.then((rs) => {
			if (rs == 'Confirm') {

				this.spinner.show();
				debugger
				let sub = this.voucherService.generateEntry(voucher).subscribe(
					(resonse) => {
					  this.getNotPostVouchers();
						this.router.navigate([this.listUrl])
							.then(() => {
							});
					});
				this.subsList.push(sub);
				this.spinner.hide();

			}
		});
	}
	editFormatIcon() { //plain text value
		return "<i class=' fa fa-edit'></i>";
	  };
	//#endregion
	//#region Tabulator

	panelId: number = 1;
	sortByCols: any[] = [];
	searchFilters: any;
	groupByCols: string[] = [];
	lang: string = localStorage.getItem("language");
	
	columnNames = [
		{
			title: this.lang == 'ar' ? ' كود' : 'Code ',
			field: 'code',
		},
		{
			title: this.lang == 'ar' ? ' تاريخ' : 'Date ',
			field: 'voucherDate', width: 300, formatter: function (cell, formatterParams, onRendered) {
				var value = cell.getValue();
				value = format(new Date(value), 'dd-MM-yyyy');;
				return value;
			}

		},
		this.lang == 'ar'
			? {
				title: 'نمط السند', field: 'voucherNameAr'
			} : {
				title: 'Voucher Type', field: 'voucherNameEn'
			},

		this.lang == 'ar'
			? {
				title: 'نوع السند',  field: 'voucherKindAr'
			} : {
				title: 'Voucher Kind',  field: 'voucherKindEn'
			},
		{
			title: this.lang == 'ar' ? ' قيمة السند محلى' : 'Voucher Total Local',
			field: 'voucherTotalLocal'
		},
		this.lang == "ar" ? {
			title: "توليد القيد",
			field: "", formatter: this.editFormatIcon, cellClick: (e, cell) => {
			  this.showConfirmGenerateEntryMessage(cell.getRow().getData());
			}
		  } :
			{
			  title: "Generate Entry",
			  field: "", formatter: this.editFormatIcon, cellClick: (e, cell) => {
				this.showConfirmGenerateEntryMessage(cell.getRow().getData());
			  },
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
				{ field: 'code', type: 'like', value: searchTxt },
				{ field: 'voucherNameAr', type: 'like', value: searchTxt },
				{ field: 'voucherNameEn', type: 'like', value: searchTxt },
				{ field: 'voucherKindAr', type: 'like', value: searchTxt },
				{ field: 'voucherKindEn', type: 'like', value: searchTxt },
				{ field: 'voucherTotalLocal', type: 'like', value: searchTxt },
				,
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
	onEdit(id) {
		if (id != undefined) {
			this.edit(id);
			this.sharedServices.changeButton({
				action: 'Update',
				componentName: 'List',
				submitMode: false
			} as ToolbarData);

			this.sharedServices.changeToolbarPath(this.toolbarPathData);
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

			} else if (event.actionName == 'Delete') {
				//this.showConfirmDeleteMessage(event.item.id);
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

				//currentBtn;
				if (currentBtn != null) {
					if (currentBtn.action == ToolbarActions.List) {

					} else if (currentBtn.action == ToolbarActions.New) {

						//this.router.navigate([this.addUrl + this.voucherTypeId]);
						//  this.router.navigate(['/control-panel/accounting/update-account', id]);

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
		var ids = this.listIds.map(item => item.id);
		let sub = this.voucherService.deleteListVoucher(ids).subscribe(
			(resonse) => {
				this.router.navigate([this.listUrl])
					.then(() => {
						window.location.reload();
					});
				//this.getVouchers();
				this.listIds = [];
			});
		this.subsList.push(sub);
	}
	//#endregion
}
