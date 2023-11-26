import { DOCUMENT } from '@angular/common';
import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SubscriptionService } from '../subscription/services/subscription.services'
import { LayoutService } from '../../../services/layout.service';
import { NavService } from '../../../services/nav.service';
import { fadeInAnimation } from '../../../data/router-animation/router-animation';
import * as chartData from '../../../../shared/data/dashboard/default'
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import * as feather from 'feather-icons';
@Component({
	selector: 'app-subscription',
	templateUrl: './subscription.component.html',
	styleUrls: ['./subscription.component.scss']
})
export class SubscriptionComponent implements OnInit, OnInit, AfterViewInit {
	public elem: any;
	public dark: boolean = this.layout.config.settings.layout_version == 'dark-only' ? true : false;
	public greeting: string;
	public time: any;
	public today = new Date();
	public currentHour = this.today.getHours();
	public m = this.today.getMinutes();
	public ampm = this.currentHour >= 12 ? 'PM' : 'AM';
	public date: { year: number, month: number };

	// Charts
	public currentSales = chartData.currentSales;
	public smallBarCharts = chartData.smallBarCharts;
	public marketValue = chartData.marketValue;
	public knob = chartData.knob;
	public knobRight = chartData.knobRight;

	model: NgbDateStruct;
	disabled = true;
	applications: { descriptionAr: string; descriptionEn: string; value: string; check: boolean; image: string; link: string; }[];
	applicationsRoute: any[];
	lang = localStorage.getItem("language");
	constructor(private fb: FormBuilder, public service: SubscriptionService,
		private route: ActivatedRoute, public navServices: NavService, calendar: NgbCalendar,
		public layout: LayoutService,
		@Inject(DOCUMENT) private document: any,
		public router: Router, private translate: TranslateService) {
		this.model = calendar.getToday();
		this.elem = document.documentElement;
		this.route.queryParams.subscribe((params) => {
			this.layout.config.settings.layout = params.layout ? params.layout : this.layout.config.settings.layout
		})
	}
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
	ngOnInit(): void {
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
		// document.getElementById('knob').append(this.knob);
		// document.getElementById('knob-right').append(this.knobRight);

		this.getLastSubscription();

	}
	getApplications() {
		this.applications = [
			{ descriptionAr: 'اعددات', descriptionEn: 'Settings', value: '0', check: false, image: 'assets/images/applications/settings.png', link: '/dashboard/default' },
			{ descriptionAr: 'نقط البيع', descriptionEn: 'POS', value: '1', check: true, image: 'assets/images/applications/pos.png', link: '/dashboard/default' },
			{ descriptionAr: "إدارة علاقات العملاء", descriptionEn: 'CRM', value: '2', check: false, image: 'assets/images/applications/crm.png', link: '/dashboard/default' },
			{ descriptionAr: "رواتب", descriptionEn: 'Payroll', value: '3', check: false, image: 'assets/images/applications/payroll.png', link: '/dashboard/default' },
			{ descriptionAr: "مشتريات", descriptionEn: 'Purchase', value: '4', check: false, image: 'assets/images/applications/purchase.png', link: '/dashboard/default' },
			{ descriptionAr: "محاسبة", descriptionEn: 'Accounting', value: '5', check: false, image: 'assets/images/applications/account.png', link: '/dashboard/default' },
			{ descriptionAr: "مستودعات", descriptionEn: 'Warehouses', value: '6', check: true, image: 'assets/images/applications/warehouses.png', link: '/dashboard/default' },

		];
	}
	openLink(object) {

		//let	subdomain=localStorage.getItem('subDomain');
		localStorage.setItem("Menu", object.value)
		this.router.navigate([object.link]);

	}
	getLastSubscription() {

		this.service.getLastSubscription().subscribe(
			next => {


				if (next.success == true) {
					this.getApplications();
					//   this.router.navigate(['/dashboard/default']);
					if (next.response != null) {

						this.applicationsRoute = [...next.response?.applications?.split(",")]
						//console.log(this.applicationsRoute);
						for (var i = 0; i < this.applications.length; i++) {

							var find = this.applicationsRoute.includes(this.applications[i].value);

							if (find) {

								this.applications[i].check = true;

							}

						}
					}

					this.applications = this.applications.filter(c => c.check == true)
				}
			},
			error => {

				//this.showLoader = false;
				//console.log(error)

			}
		)

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


}
