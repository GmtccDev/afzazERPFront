import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router'
import { LayoutService } from '../../../services/layout.service';
import { NavService } from '../../../services/nav.service';
import { fadeInAnimation } from '../../../data/router-animation/router-animation';
import { DOCUMENT } from '@angular/common';
import * as chartData from '../../../../shared/data/dashboard/default'
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { VoucherTypeServiceProxy } from 'src/app/erp/Accounting/services/voucher-type.service';
import { Subscription } from 'rxjs';
import { BillTypeServiceProxy } from 'src/app/erp/Warehouses/Services/bill-type.service';
import { TranslateService } from '@ngx-translate/core';
@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.scss'],
	animations: [fadeInAnimation]
})
export class DashboardComponent implements OnInit, AfterViewInit {
	public elem: any;
	public dark: boolean = this.layout.config.settings.layout_version == 'dark-only' ? true : false;
	public greeting: string;
	public time: any;
	public today = new Date();
	public currentHour = this.today.getHours();
	public m = this.today.getMinutes();
	public ampm = this.currentHour >= 12 ? 'PM' : 'AM';
	public date: { year: number, month: number };
	lang = localStorage.getItem("language")

	// Charts
	public currentSales = chartData.currentSales;
	public smallBarCharts = chartData.smallBarCharts;
	public marketValue = chartData.marketValue;
	public knob = chartData.knob;
	public knobRight = chartData.knobRight;

	model: NgbDateStruct;
	disabled = true;
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


	constructor(private route: ActivatedRoute, public navServices: NavService, calendar: NgbCalendar,
		private voucherTypeService: VoucherTypeServiceProxy,
		private billTypeService: BillTypeServiceProxy,
		private translate: TranslateService,
		@Inject(DOCUMENT) private document: any,
		public layout: LayoutService) {
		this.getVoucherTypes();
		this.getBillTypes();

		this.model = calendar.getToday();
		this.elem = document.documentElement;
		this.route.queryParams.subscribe((params) => {
			this.layout.config.settings.layout = params.layout ? params.layout : this.layout.config.settings.layout
		})
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
	startTime() {
		this.currentHour = this.currentHour % 12;
		this.currentHour = this.currentHour ? this.currentHour : 12;
		this.m = this.checkTime(this.m);
		this.time = this.currentHour + ":" + this.m + ' ' + this.ampm;
	}

	checkTime(i) {
		if (i < 10) { i = "0" + i };  // add zero in front of numbers < 10
		return i;
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
		if (this.currentHour >= 0 && this.currentHour < 4) {
			this.greeting = 'Good Night'
		} else if (this.currentHour >= 4 && this.currentHour < 12) {
			this.greeting = 'Good Morning'
		} else if (this.currentHour >= 12 && this.currentHour < 16) {
			this.greeting = 'Good Afternoon'
		} else {
			this.greeting = 'Good Evening'
		}
		this.startTime();
		document.getElementById('knob').append(this.knob);
		document.getElementById('knob-right').append(this.knobRight);
	}


	sidebarToggle() {
		this.navServices.collapseSidebar = !this.navServices.collapseSidebar;
		this.navServices.megaMenu = false;
		this.navServices.levelMenu = false;
	}

	layoutToggle() {
		this.dark = !this.dark;
		this.layout.config.settings.layout_version = this.dark ? 'dark-only' : 'light';
	}

	searchToggle() {
		this.navServices.search = true;
	}

	languageToggle() {
		this.navServices.language = !this.navServices.language;
	}

	toggleFullScreen() {
		this.navServices.fullScreen = !this.navServices.fullScreen;
		if (this.navServices.fullScreen) {
			if (this.elem.requestFullscreen) {
				this.elem.requestFullscreen();
			} else if (this.elem.mozRequestFullScreen) {
				/* Firefox */
				this.elem.mozRequestFullScreen();
			} else if (this.elem.webkitRequestFullscreen) {
				/* Chrome, Safari and Opera */
				this.elem.webkitRequestFullscreen();
			} else if (this.elem.msRequestFullscreen) {
				/* IE/Edge */
				this.elem.msRequestFullscreen();
			}
		} else {
			if (!this.document.exitFullscreen) {
				this.document.exitFullscreen();
			} else if (this.document.mozCancelFullScreen) {
				/* Firefox */
				this.document.mozCancelFullScreen();
			} else if (this.document.webkitExitFullscreen) {
				/* Chrome, Safari and Opera */
				this.document.webkitExitFullscreen();
			} else if (this.document.msExitFullscreen) {
				/* IE/Edge */
				this.document.msExitFullscreen();
			}
		}
	}
	getVoucherTypes() {
		return new Promise<void>((resolve, reject) => {
			let sub = this.voucherTypeService.allVoucherTypees(undefined, undefined, undefined, undefined, undefined).subscribe({
				next: (res) => {
					console.log(res);
					if (res.success) {
						debugger
						this.voucherTypes = res.response.items
						this.depositVouchers = this.voucherTypes.filter(x => x.voucherKindId == 1);
						this.WithdrawalVouchers = this.voucherTypes.filter(x => x.voucherKindId == 2);

						if (this.depositVouchers.length > 0) {
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
						// 	debugger
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
					console.log('complete');
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
						this.salesBills = this.billTypes.filter(x => x.billKind == 1);
						this.purchasesBills = this.billTypes.filter(x => x.billKind == 2);
						this.salesReturnBills = this.billTypes.filter(x => x.billKind == 3);
						this.purchasesReturnBills = this.billTypes.filter(x => x.billKind == 4);
						this.firstPeriodGoodsBills = this.billTypes.filter(x => x.billKind == 5);


						if (this.salesBills.length > 0) {
							this.navServices.billTypes.push({ path: '/dashboard/default', title: this.translate.instant("bill-type.sales-bills"), type: 'link', active: true }),
								this.salesBills.forEach(element => {
									this.navServices.billTypes.push({ path: '/warehouses-operations/bill/' + element.id, title: this.lang == "ar" ? element.billNameAr : element.billNameEn, type: 'link', active: true },
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
									this.navServices.billTypes.push({ path: '/warehouses-operations/bill/' + element.id, title: this.lang == "ar" ? element.billNameAr : element.billNameEn, type: 'link', active: true },
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
									this.navServices.billTypes.push({ path: '/warehouses-operations/bill/' + element.id, title: this.lang == "ar" ? element.billNameAr : element.billNameEn, type: 'link', active: true },
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
									this.navServices.billTypes.push({ path: '/warehouses-operations/bill/' + element.id, title: this.lang == "ar" ? element.billNameAr : element.billNameEn, type: 'link', active: true },
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
									this.navServices.billTypes.push({ path: '/warehouses-operations/bill/' + element.id, title: this.lang == "ar" ? element.billNameAr : element.billNameEn, type: 'link', active: true },
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
					console.log('complete');
				},
			});

			this.subsList.push(sub);

		});

	}
}
