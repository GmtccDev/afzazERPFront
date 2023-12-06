import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';


@Component({
	selector: 'app-floors',
	templateUrl: './floors.component.html',
	styleUrls: ['./floors.component.scss']
})
export class FloorsComponent implements OnInit {

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
