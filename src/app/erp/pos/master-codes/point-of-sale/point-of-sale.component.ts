import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';


@Component({
	selector: 'app-point-of-sale',
	templateUrl: './point-of-sale.component.html',
	styleUrls: ['./point-of-sale.component.scss']
})
export class PointOfSaleComponent implements OnInit {

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
