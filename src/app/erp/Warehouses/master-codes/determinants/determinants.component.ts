import { Component, OnInit } from '@angular/core';

@Component({
	selector: 'app-determinants',
	templateUrl: './determinants.component.html',
	styleUrls: ['./determinants.component.scss']
})
export class DeterminantsComponent implements OnInit {
	addUrl: string = '/warehouses-master-codes/determinants/add-determinants';
	updateUrl: string = '/warehouses-master-codes/determinants/update-determinants/';
	listUrl: string = '/warehouses-master-codes/determinants';
	constructor() { }

	ngOnInit(): void {
	}

}
