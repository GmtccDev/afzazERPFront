import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class LayoutService {

	//   public config = {
	//     settings: {
	//       layout: 'Dubai',
	//       layout_type: 'ltr',
	//       layout_version: 'light-only',
	//       sidebar_type: 'default-sidebar'
	//     },
	//     color: {
	//       primary_color: '#4bc2f1',
	//       secondary_color: '#575656'
	//     }
	//   }

	public config = {
		settings: {
			layout: 'Seoul',
			layout_type: 'rtl',
			layout_version: 'light-only',
			sidebar_type: 'default-sidebar',
		},
		color: {
			primary_color: '#4bc2f1',
			secondary_color: '#575656'
		}
	}

	constructor() {
		if (this.config.settings.layout_type == 'rtl')
			document.getElementsByTagName('html')[0].setAttribute('dir', this.config.settings.layout_type);

		document.documentElement.style.setProperty('--theme-deafult', this.config.color.primary_color);
		document.documentElement.style.setProperty('--theme-secondary', this.config.color.secondary_color);
	}


}
