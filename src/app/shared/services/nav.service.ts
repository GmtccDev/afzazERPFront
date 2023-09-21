import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { Subject, BehaviorSubject, fromEvent, Subscription } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { VoucherTypeServiceProxy } from 'src/app/erp/Accounting/services/voucher-type.service';


// Menu
export interface Menu {
	headTitle1?: string,
	headTitle2?: string,
	path?: string;
	title?: string;
	icon?: string;
	type?: string;
	badgeType?: string;
	badgeValue?: string;
	active?: boolean;
	bookmark?: boolean;
	children?: Menu[];
}

@Injectable({
	providedIn: 'root'
})

export class NavService implements OnInit, OnDestroy {
	voucherType: any[] = [];
	subsList: Subscription[] = [];
	voucherTypes: any = [];
	private unsubscriber: Subject<any> = new Subject();
	public screenWidth: BehaviorSubject<number> = new BehaviorSubject(window.innerWidth);

	// Search Box
	public search: boolean = false;

	// Language
	public language: boolean = false;

	// Mega Menu
	public megaMenu: boolean = false;
	public levelMenu: boolean = false;
	public megaMenuColapse: boolean = window.innerWidth < 1199 ? true : false;

	// Collapse Sidebar
	public collapseSidebar: boolean = window.innerWidth < 991 ? true : false;

	// For Horizontal Layout Mobile
	public horizontal: boolean = window.innerWidth < 991 ? false : true;

	// Full screen
	public fullScreen: boolean = false;

	constructor(private router: Router, private translate: TranslateService,
		private voucherTypeService: VoucherTypeServiceProxy) {
		//	this.getVoucherTypes();

		// this.voucherTypes.push(
		// 	 { path: '/accounting-operations/vouchers', title: this.translate.instant("component-names.vouchers"), type: 'link', active: true },

		// )
		this.voucherTypes.push(
			{ path: '/accounting-operations/journalEntry', title: this.translate.instant("component-names.journalEntry"), type: 'link', active: true },
			{ path: '/accounting-operations/journalEntryPost', title: this.translate.instant("component-names.journalEntryPost"), type: 'link', active: true },
			{ path: '/accounting-operations/closeFiscalPeriod', title: this.translate.instant("component-names.close-fiscal-period"), type: 'link', active: true },
			{ path: '/accounting-operations/incomingCheque', title: this.translate.instant("component-names.incomingCheque"), type: 'link', active: true },//
			{ path: '/accounting-operations/issuingCheque', title: this.translate.instant("component-names.issuing-cheque"), type: 'link', active: true },//

		)
		this.setScreenWidth(window.innerWidth);
		fromEvent(window, 'resize').pipe(
			debounceTime(1000),
			takeUntil(this.unsubscriber)
		).subscribe((evt: any) => {
			this.setScreenWidth(evt.target.innerWidth);
			if (evt.target.innerWidth < 991) {
				this.collapseSidebar = true;
				this.megaMenu = false;
				this.levelMenu = false;
			}
			if (evt.target.innerWidth < 1199) {
				this.megaMenuColapse = true;
			}
		});
		if (window.innerWidth < 991) { // Detect Route change sidebar close
			this.router.events.subscribe(_event => {
				this.collapseSidebar = true;
				this.megaMenu = false;
				this.levelMenu = false;
			});
		}
		;

	}

	//#region ngOnInit
	ngOnInit(): void {
		;
		// this.getVoucherTypes();
	}
	//#endregion

	ngOnDestroy() {
		// this.unsubscriber.next();
		this.unsubscriber.complete();
		this.subsList.forEach((s) => {
			if (s) {
				s.unsubscribe();
			}
		});
	}

	getVoucherTypes() {
		;
		return new Promise<void>((resolve, reject) => {
			;

			let sub = this.voucherTypeService.allVoucherTypees(undefined, undefined, undefined, undefined, undefined).subscribe({
				next: (res) => {


					console.log(res);
					if (res.success) {

						this.voucherType = res.response.items
						this.voucherType.forEach(element => {
							;
							this.voucherTypes += "{path: '/accounting-operations/vouchers', title: " + element.voucherNameEn + ", type: 'link', active: true },"

						});

					}
					resolve();
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

	private setScreenWidth(width: number): void {
		this.screenWidth.next(width);
	}

	MENUITEMS: Menu[] = [


		{
			path: '/Subscription', title: this.translate.instant("component-names.subscriptions"), type: 'link', icon: 'home', active: true,
		},
		{
			path: '/dashboard/default', title: this.translate.instant("component-names.dashboard"), type: 'link', icon: 'home', active: true,
		},

		{
			title: this.translate.instant("component-names.users-permissions"), icon: 'users', type: 'sub', active: false, children: [

				{ path: '/security/user', title: this.translate.instant("component-names.user"), type: 'link', active: true },
				{ path: '/security/role/', title: this.translate.instant("component-names.roles-permissions"), type: 'link', active: true },
				//	{ path: '/security/permission/', title: this.translate.instant("component-names.permissions"), type: 'link', active: true },

			]
		},

		{
			title: this.translate.instant("component-names.master-code"), type: 'sub', icon: 'MasterCode', active: false, children: [
				{ path: '/master-codes/countries', title: this.translate.instant("component-names.countries"), type: 'link', active: true },
				{ path: '/master-codes/business/', title: this.translate.instant("component-names.business"), type: 'link', active: true },
				{ path: '/master-codes/currencies/', title: this.translate.instant("component-names.currencies"), type: 'link', active: true },

				{ path: '/master-codes/companies/', title: this.translate.instant("component-names.companies"), type: 'link', active: true },
				{ path: '/master-codes/branches/', title: this.translate.instant("component-names.branches"), type: 'link', active: true },
			]
		}


	];

	MENUITEMSAccount: Menu[] = [


		{
			path: '/Subscription', title: this.translate.instant("component-names.subscriptions"), type: 'link', icon: 'home', active: true,
		},
		{
			path: '/dashboard/default', title: this.translate.instant("component-names.dashboard"), type: 'link', icon: 'home', active: true,
		},

		{
			title: this.translate.instant("component-names.configurations"), type: 'sub', icon: 'MasterCode', active: false, children: [

				{ path: '/configurations/accounting-configurations/', title: this.translate.instant("component-names.configurations"), type: 'link', active: true },
			]

		},

		{
			title: this.translate.instant("component-names.master-code"), type: 'sub', icon: 'MasterCode', active: false, children: [
				{ path: '/accounting-master-codes/journal', title: this.translate.instant("component-names.journal"), type: 'link', active: true },
				{ path: '/accounting-master-codes/fiscalPeriod', title: this.translate.instant("component-names.fiscalPeriod"), type: 'link', active: true },
				{ path: '/accounting-master-codes/accountGroup', title: this.translate.instant("component-names.accountGroup"), type: 'link', active: true },
				{ path: '/accounting-master-codes/costCenter', title: this.translate.instant("component-names.costCenter"), type: 'link', active: true },
				{ path: '/accounting-master-codes/accountClassification', title: this.translate.instant("component-names.accountClassification"), type: 'link', active: true },
				{ path: '/accounting-master-codes/account', title: this.translate.instant("component-names.account"), type: 'link', active: true },
				{ path: '/accounting-master-codes/voucherType', title: this.translate.instant("component-names.voucher-types"), type: 'link', active: true },
				//	{ path: '/accounting-master-codes/bankAccount', title: this.translate.instant("component-names.bankAccount"), type: 'link', active: true },

			]
		},
		{
			title: this.translate.instant("general.operations"), type: 'sub', icon: 'Operations', active: false, children:
				this.voucherTypes,
			// [
			// { path: '/accounting-operations/endYear', title: this.translate.instant("component-names.end-year"), type: 'link', active: true },
			// ]



		},
		{
			title: this.translate.instant("component-names.reports"), type: 'sub', icon: 'Reports', active: false, children: [
				{ path: '/accounting-reports/budgetReport', title: this.translate.instant("component-names.budget-report"), type: 'link', active: true },
				{ path: '/accounting-reports/incomeStatementReport', title: this.translate.instant("component-names.income-statement-report"), type: 'link', active: true },
				{ path: '/accounting-reports/vouchersTransactionsReport', title: this.translate.instant("component-names.vouchers-transactions-report"), type: 'link', active: true },
				{ path: '/accounting-reports/generalLedgerReport', title: this.translate.instant("component-names.general-ledger-report"), type: 'link', active: true },
				{ path: '/accounting-reports/journalEntriesReport', title: this.translate.instant("component-names.journal-entries-report"), type: 'link', active: true },
				{ path: '/accounting-reports/costCentersReport', title: this.translate.instant("component-names.cost-centers-report"), type: 'link', active: true },
				{ path: '/accounting-reports/accountsBalanceReport', title: this.translate.instant("component-names.accounts-balance-report"), type: 'link', active: true },

			]
		}
		


	];
	MENUITEMSWarehouses: Menu[] = [
		{
			path: '/Subscription', title: this.translate.instant("component-names.subscriptions"), type: 'link', icon: 'home', active: true,
		},
		{
			path: '/dashboard/default', title: this.translate.instant("component-names.dashboard"), type: 'link', icon: 'home', active: true,
		},

		{
			title: this.translate.instant("component-names.master-code"), type: 'sub', icon: 'MasterCode', active: false, children: [
				{ path: '/warehouses-master-codes/warehousesPeriod', title: this.translate.instant("component-names.warehouses-period"), type: 'link', active: true },
				{ path: '/warehouses-master-codes/warehousesUnit', title: this.translate.instant("component-names.units"), type: 'link', active: true },
				{ path: '/warehouses-master-codes/warehousesTax', title: this.translate.instant("component-names.taxes"), type: 'link', active: true },
				{ path: '/warehouses-master-codes/storeCard', title: this.translate.instant("component-names.storeCard"), type: 'link', active: true },

			]
		}


	];
	// Array

	itemsSettings = new BehaviorSubject<Menu[]>(this.MENUITEMS);
	itemsAccount = new BehaviorSubject<Menu[]>(this.MENUITEMSAccount);
	itemsWarehouses = new BehaviorSubject<Menu[]>(this.MENUITEMSWarehouses);

}
