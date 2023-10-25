import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'
import { LayoutService } from '../../../services/layout.service';
import { NavService } from '../../../services/nav.service';
import { fadeInAnimation } from '../../../data/router-animation/router-animation';
import { UserService } from 'src/app/shared/common-services/user.service';
import { TranslateService } from '@ngx-translate/core';
import { VoucherTypeServiceProxy } from 'src/app/erp/Accounting/services/voucher-type.service';
import { BillTypeServiceProxy } from 'src/app/erp/Warehouses/Services/bill-type.service';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-content',
	templateUrl: './content.component.html',
	styleUrls: ['./content.component.scss'],
	animations: [fadeInAnimation]
})
export class ContentComponent implements OnInit, AfterViewInit {
	lang = localStorage.getItem("language")
	subsList: Subscription[] = [];
	voucherTypes: any = [];
	depositVouchers: any = [];
	WithdrawalVouchers: any = [];
	billTypes: any = [];
	salesBills: any = [];
	purchasesBills: any = [];
	salesReturnBills: any = [];
	purchasesReturnBills: any = [];
	firstPeriodGoodsBills: any = [];

	constructor(private route: ActivatedRoute, private userService: UserService, private translate: TranslateService,
		public navServices: NavService, private router: Router,
		private voucherTypeService: VoucherTypeServiceProxy,
		private billTypeService: BillTypeServiceProxy,

		public layout: LayoutService) {
		this.customizeLayoutType()
		// this.route.queryParams.subscribe((params) => {
		//
		//   this.layout.config.settings.layout = params.layout ? params.layout : this.layout.config.settings.layout
		// })
	}
	//#region ngOnDestroy
	ngOnDestroy() {
		this.subsList.forEach((s) => {
			if (s) {
				s.unsubscribe();
			}
		});
	}
	//#endregion
	getVoucherTypes() {
		return new Promise<void>((resolve, reject) => {
			let sub = this.voucherTypeService.allVoucherTypees(undefined, undefined, undefined, undefined, undefined).subscribe({
				next: (res) => {
					console.log(res);
					if (res.success) {
						
						this.voucherTypes = res.response.items
						this.depositVouchers = this.voucherTypes.filter(x => x.voucherKindId == 1);
						this.WithdrawalVouchers = this.voucherTypes.filter(x => x.voucherKindId == 2);

						if (this.depositVouchers.length > 0) {
							// this.navServices.voucherTypes.push({
							// 	 title: this.translate.instant("voucher-type.deposit-vouchers"), icon: 'users', type: 'sub', active: false, children:
							// 		//[
							// 			this.depositVouchers.forEach(element => {
							// 			[	this.navServices.voucherTypes.push({ path: '/accounting-operations/vouchers/' + element.id, title: this.lang == "ar" ? element.voucherNameAr : element.voucherNameEn, type: 'link', active: true },
							// 					{ queryParams: { voucherTypeId: element.id } })
							// 			]
							// 				this.navServices.voucherTypes.filter((value, index, self) => {
							// 					return index === self.findIndex(obj => (
							// 						obj.path === value.path && obj.title === value.title
							// 					));
							// 				})
										
							// 			})
							// 		//]
							// })
							this.navServices.voucherTypes.push({ path: '/dashboard/default', title: this.translate.instant("voucher-type.deposit-vouchers"), type: 'link', active: true }),
								this.depositVouchers.forEach(element => {
									this.navServices.voucherTypes.push({ path: '/accounting-operations/vouchers/' + element.id, title: this.lang == "ar" ? element.voucherNameAr : element.voucherNameEn, type: 'link', active: true },
										{ queryParams: { voucherTypeId: element.id } })
									this.navServices.voucherTypes.filter((value, index, self) => {
										return index === self.findIndex(obj => (
											obj.path === value.path && obj.title === value.title
										));
									});
								});

						}
						if (this.WithdrawalVouchers.length > 0) {
							this.navServices.voucherTypes.push({ path: '/dashboard/default', title: this.translate.instant("voucher-type.withdrawal-vouchers"), type: 'link', active: true }),
							this.WithdrawalVouchers.forEach(element => {
								this.navServices.voucherTypes.push({ path: '/accounting-operations/vouchers/' + element.id, title: this.lang == "ar" ? element.voucherNameAr : element.voucherNameEn, type: 'link', active: true },
									{ queryParams: { voucherTypeId: element.id } })
								this.navServices.voucherTypes.filter((value, index, self) => {
									return index === self.findIndex(obj => (
										obj.path === value.path && obj.title === value.title
									));
								});
							});
						}
						// res.response.items.forEach(element => {
						// 	this.navServices.voucherTypes.push({ path: '/accounting-operations/vouchers/' + element.id, title: this.lang == "ar" ? element.voucherNameAr : element.voucherNameEn, type: 'link', active: true },
						// 		{ queryParams: { voucherTypeId: element.id } }
						// 	)
						// 	this.navServices.voucherTypes.filter((value, index, self) => {
						// 		return index === self.findIndex(obj => (
						// 			obj.path === value.path && obj.title === value.title
						// 		));
						// 	});
						// });


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
	getBillTypes() {
		return new Promise<void>((resolve, reject) => {
			let sub = this.billTypeService.allBillTypees(undefined, undefined, undefined, undefined, undefined).subscribe({
				next: (res) => {
					console.log(res);
					if (res.success) {
						this.billTypes = res.response.items
						this.salesBills = this.billTypes.filter(x => x.kind == 1);
						this.purchasesBills = this.billTypes.filter(x => x.kind == 2);
						this.salesReturnBills = this.billTypes.filter(x => x.kind == 3);
						this.purchasesReturnBills = this.billTypes.filter(x => x.kind == 4);
						this.firstPeriodGoodsBills = this.billTypes.filter(x => x.kind == 5);


						if (this.salesBills.length > 0) {
							this.navServices.billTypes.push({ path: '/dashboard/default', title: this.translate.instant("bill-type.sales-bills"), type: 'link', active: true }),
								this.salesBills.forEach(element => {
									this.navServices.billTypes.push({ path: '/warehouses-operations/bill/' + element.id, title: this.lang == "ar" ? element.nameAr : element.nameEn, type: 'link', active: true },
										{ queryParams: { billTypeId: element.id } })
									this.navServices.billTypes.filter((value, index, self) => {
										return index === self.findIndex(obj => (
											obj.path === value.path && obj.title === value.title
										));
									});
								});

						}
						if (this.purchasesBills.length > 0) {
							this.navServices.billTypes.push({ path: '/dashboard/default', title: this.translate.instant("bill-type.purchases-bills"), type: 'link', active: true }),
								this.purchasesBills.forEach(element => {
									this.navServices.billTypes.push({ path: '/warehouses-operations/bill/' + element.id, title: this.lang == "ar" ? element.nameAr : element.nameEn, type: 'link', active: true },
										{ queryParams: { billTypeId: element.id } })
									this.navServices.billTypes.filter((value, index, self) => {
										return index === self.findIndex(obj => (
											obj.path === value.path && obj.title === value.title
										));
									});
								});

						}
						if (this.salesReturnBills.length > 0) {
							this.navServices.billTypes.push({ path: '/dashboard/default', title: this.translate.instant("bill-type.sales-return-bills"), type: 'link', active: true }),
								this.salesReturnBills.forEach(element => {
									this.navServices.billTypes.push({ path: '/warehouses-operations/bill/' + element.id, title: this.lang == "ar" ? element.nameAr : element.nameEn, type: 'link', active: true },
										{ queryParams: { billTypeId: element.id } })
									this.navServices.billTypes.filter((value, index, self) => {
										return index === self.findIndex(obj => (
											obj.path === value.path && obj.title === value.title
										));
									});
								});

						}
						if (this.purchasesReturnBills.length > 0) {
							this.navServices.billTypes.push({ path: '/dashboard/default', title: this.translate.instant("bill-type.purchases-return-bills"), type: 'link', active: true }),
								this.purchasesReturnBills.forEach(element => {
									this.navServices.billTypes.push({ path: '/warehouses-operations/bill/' + element.id, title: this.lang == "ar" ? element.nameAr : element.nameEn, type: 'link', active: true },
										{ queryParams: { billTypeId: element.id } })
									this.navServices.billTypes.filter((value, index, self) => {
										return index === self.findIndex(obj => (
											obj.path === value.path && obj.title === value.title
										));
									});
								});

						}
						if (this.firstPeriodGoodsBills.length > 0) {
							this.navServices.billTypes.push({ path: '/dashboard/default', title: this.translate.instant("bill-type.first-period-goods-bills"), type: 'link', active: true }),
								this.firstPeriodGoodsBills.forEach(element => {
									this.navServices.billTypes.push({ path: '/warehouses-operations/bill/' + element.id, title: this.lang == "ar" ? element.nameAr : element.nameEn, type: 'link', active: true },
										{ queryParams: { billTypeId: element.id } })
									this.navServices.billTypes.filter((value, index, self) => {
										return index === self.findIndex(obj => (
											obj.path === value.path && obj.title === value.title
										));
									});
								});

						}
						// res.response.items.forEach(element => {
						// 	this.navServices.billTypes.push({ path: '/warehouses-operations/bill/' + element.id, title: this.lang == "ar" ? element.billNameAr : element.billNameEn, type: 'link', active: true },
						// 		{ queryParams: { billTypeId: element.id } }
						// 	)
						// 	this.navServices.billTypes.filter((value, index, self) => {
						// 		return index === self.findIndex(obj => (
						// 			obj.path === value.path && obj.title === value.title
						// 		));
						// 	});
						// });


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
	customizeLayoutType() {


		this.getVoucherTypes();
		this.getBillTypes();

		// this.layout.config.settings.layout_type = "rtl";
		if (localStorage.getItem("language") == "ar") {
			// this.translate.setDefaultLang(localStorage.getItem("language"));
			this.layout.config.settings.layout_type = "rtl";
			document.getElementsByTagName('html')[0].setAttribute('dir', "rtl");
		} else {
			this.translate.setDefaultLang("en");
			this.layout.config.settings.layout_type = "ltr";
			document.getElementsByTagName('html')[0].removeAttribute('dir');
		}
		//     const currentRoute = this.router.url;

		// this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
		// 	this.router.navigate([currentRoute]); // navigate to same route
		// });
	}

	ngAfterViewInit() {
		setTimeout(() => {
			// feather.replace();
		});
	}

	public getRouterOutletState(outlet) {
		return outlet.isActivated ? outlet.activatedRoute : '';
	}

	get layoutClass() {
		switch (this.layout.config.settings.layout) {
			case "Dubai":
				return "compact-wrapper"
			case "London":
				return "only-body"
			case "Seoul":
				return "compact-wrapper modern-type"
			case "LosAngeles":
				return this.navServices.horizontal ? "horizontal-wrapper material-type" : "compact-wrapper material-type"
			case "Paris":
				return "compact-wrapper dark-sidebar"
			case "Tokyo":
				return "compact-sidebar"
			case "Madrid":
				return "compact-wrapper color-sidebar"
			case "Moscow":
				return "compact-sidebar compact-small"
			case "NewYork":
				return "compact-wrapper box-layout"
			case "Singapore":
				return this.navServices.horizontal ? "horizontal-wrapper enterprice-type" : "compact-wrapper enterprice-type"
			case "Rome":
				return "compact-sidebar compact-small material-icon"
			case "Barcelona":
				return this.navServices.horizontal ? "horizontal-wrapper enterprice-type advance-layout" : "compact-wrapper enterprice-type advance-layout"
		}
	}

	ngOnInit() {

	}

}
