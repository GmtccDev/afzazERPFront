import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';


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

	) {
	}

	ngOnInit(): void {
	}

}
