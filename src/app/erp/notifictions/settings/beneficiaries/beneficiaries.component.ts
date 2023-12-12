import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
@Component({
	selector: 'app-beneficiaries',
	templateUrl: './beneficiaries.component.html',
	styleUrls: ['./beneficiaries.component.scss']
})
export class BeneficiariesComponent implements OnInit {

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
