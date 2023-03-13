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

		// {
		// 	title: 'Dashboards', icon: 'home', type: 'sub', badgeType: 'success', badgeValue: '2', active: true, children: [
		// 		{ path: '/dashboard/default', title: 'Dashboard', type: 'link' },

		// 	]
		// },
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


			]
		}


	];

	MEGAMENUITEMS: Menu[] = [
		{
			title: 'Error Pages', type: 'sub', active: true, children: [
				{ path: '/error-page/error-400', title: 'Error Page 400', type: 'link' },
				{ path: '/error-page/error-401', title: 'Error Page 401', type: 'link' },
				{ path: '/error-page/error-403', title: 'Error Page 403', type: 'link' },
				{ path: '/error-page/error-404', title: 'Error Page 404', type: 'link' },
				{ path: '/error-page/error-500', title: 'Error Page 500', type: 'link' },
				{ path: '/error-page/error-503', title: 'Error Page 503', type: 'link' },
			]
		},
		{
			title: 'Authentication', type: 'sub', active: false, children: [
				{ path: '/authentication/simple-login', title: 'Login Simple', type: 'link' },
				{ path: '/authentication/login-with-background-image', title: 'Login BG Image', type: 'link' },
				{ path: '/authentication/login-with-background-video', title: 'Login BG Video', type: 'link' },
				{ path: '/authentication/simple-register', title: 'Simple Register', type: 'link' },
				{ path: '/authentication/register-with-background-image', title: 'Register BG Image', type: 'link' },
				{ path: '/authentication/register-with-background-video', title: 'Register BG Video', type: 'link' }
			]
		},
		{
			title: 'Usefull Pages', type: 'sub', active: false, children: [
				{ path: '/search-pages', title: 'Search Pages', type: 'link' },
				{ path: '/authentication/unlock-user', title: 'Unlock User', type: 'link' },
				{ path: '/authentication/forgot-password', title: 'Forgot Password', type: 'link' },
				{ path: '/authentication/reset-password', title: 'Reset Password', type: 'link' },
				{ path: '/maintenance', title: 'Maintenance', type: 'link' }
			]
		},

	];

	LEVELMENUITEMS: Menu[] = [
		{
			path: '/file-manager', title: 'File Manager', icon: 'git-pull-request', type: 'link'
		},
		// {
		// 	title: 'Users', icon: 'users', type: 'sub', active: false, children: [
		// 		{ path: '/user/team-details', title: 'All Users', icon: 'users', type: 'link' },
		// 		{ path: '/user/profile', title: 'User Profile', icon: 'users', type: 'link' },
		// 		{ path: '/user/edit-profile', title: 'Edit Profile', icon: 'users', type: 'link' },
		// 	]
		// },
		{ path: '/bookmarks', title: 'Bookmarks', icon: 'heart', type: 'link' },
		{ path: '/calender', title: 'Calender', icon: 'calendar', type: 'link' },
		{ path: '/social-app', title: 'Social App', icon: 'zap', type: 'link' }
	];

	// Array
	items = new BehaviorSubject<Menu[]>(this.MENUITEMS);
	megaItems = new BehaviorSubject<Menu[]>(this.MEGAMENUITEMS);
	levelmenuitems = new BehaviorSubject<Menu[]>(this.LEVELMENUITEMS);

}
