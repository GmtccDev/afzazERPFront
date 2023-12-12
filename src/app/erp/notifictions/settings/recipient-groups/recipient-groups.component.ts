import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
@Component({
	selector: 'app-recipient-groups',
	templateUrl: './recipient-groups.component.html',
	styleUrls: ['./recipient-groups.component.scss']
})
export class RecipientGroupsComponent implements OnInit {
	beneficiaryTypeList = ['مستخدم', 'عميل', 'مورد', 'جهة']
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
