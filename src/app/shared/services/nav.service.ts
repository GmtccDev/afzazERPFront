import { Injectable, OnDestroy } from '@angular/core';
import { Subject, BehaviorSubject, fromEvent } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

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

export class NavService implements OnDestroy {

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

	constructor(private router: Router, private translate: TranslateService) {
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
			this.router.events.subscribe(event => {
				this.collapseSidebar = true;
				this.megaMenu = false;
				this.levelMenu = false;
			});
		}
	}

	ngOnDestroy() {
		// this.unsubscriber.next();
		this.unsubscriber.complete();
	}

	private setScreenWidth(width: number): void {
		this.screenWidth.next(width);
	}

	MENUITEMS: Menu[] = [


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
			path: '/dashboard/default', title: this.translate.instant("component-names.dashboard"), type: 'link', icon: 'home', active: true,
		},

		{
			title: this.translate.instant("component-names.configurations"), type: 'sub', icon: 'MasterCode', active: false, children: [
			
				{ path: '/configurations/accounting-configurations/', title: this.translate.instant("component-names.configurations"), type: 'link', active: true },
			]
			
		},

		{
			
		}


	];
	// Array

	itemsSettings = new BehaviorSubject<Menu[]>(this.MENUITEMS);
    itemsAccount=  new BehaviorSubject<Menu[]>(this.MENUITEMSAccount);

}
