import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'app-shifts',
	templateUrl: './shifts.component.html',
	styleUrls: ['./shifts.component.scss']
})
export class ShiftsComponent implements OnInit {


	constructor(
		private translate: TranslateService
	) { }

	ngOnInit(): void {
	}

}

