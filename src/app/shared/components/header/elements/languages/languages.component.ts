import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from 'src/app/shared/common-services/user.service';
import { LayoutService } from 'src/app/shared/services/layout.service';
import { NavService } from '../../../../services/nav.service';

@Component({
	selector: 'app-languages',
	templateUrl: './languages.component.html',
	styleUrls: ['./languages.component.scss']
})
export class LanguagesComponent implements OnInit {

	public language: boolean = false;

	public languages: any[] = [{
		language: 'English',
		code: 'en',
		type: 'US',
		icon: 'us'
	},
	{
		language: 'Arabic',
		code: 'ar',
		type: 'AR',
		icon: 'sa'
	}
	]

	public selectedLanguage: any = {
		language: 'English',
		code: 'en',
		type: 'US',
		icon: 'us'
	}

	public layoutType: string = 'ltr';
	currentSystemLanguage = 'en';
	constructor(public navServices: NavService, private router: Router, private userService: UserService,
		private translate: TranslateService, public layout: LayoutService) {
     ;
		this.currentSystemLanguage = this.userService.getCurrentSystemLanguage();
		this.translate.use(this.currentSystemLanguage);
		this.translate.setDefaultLang(this.currentSystemLanguage);
		if (this.currentSystemLanguage === 'ar') {
			document.getElementsByTagName("html")[0].setAttribute("dir", "rtl");
			
		}
		else {
			document.getElementsByTagName("html")[0].setAttribute("dir", "ltr");
		}
		
	}
	//
	ngOnInit() {

	}


	changeLanguage(lang) {
		
		localStorage.setItem('language', lang);
		this.translate.use(lang);
		window.location.reload();
		// this.selectedLanguage = lang;
		// if (lang.type == 'AR') {
		// 	this.customizeLayoutType('rtl')
		// } else {
		// 	this.customizeLayoutType('ltr')
		// }

	}

	customizeLayoutType(val) {

		this.layoutType = val;
		this.layout.config.settings.layout_type = val;
		if (val == 'rtl') {
			document.getElementsByTagName('html')[0].setAttribute('dir', val);
		} else {
			document.getElementsByTagName('html')[0].removeAttribute('dir');
		}

	}

}
