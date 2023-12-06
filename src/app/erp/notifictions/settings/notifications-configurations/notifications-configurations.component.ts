import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'app-notifications-configurations',
	templateUrl: './notifications-configurations.component.html',
	styleUrls: ['./notifications-configurations.component.scss']
})
export class NotificationsConfigurationsComponent implements OnInit {

	constructor(
		private router: Router,
		private fb: FormBuilder,
		private route: ActivatedRoute,
		private translate: TranslateService

	) {
	}

	ngOnInit(): void {
	}

}
