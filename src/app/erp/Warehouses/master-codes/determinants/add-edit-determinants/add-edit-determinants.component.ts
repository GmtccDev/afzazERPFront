import { Component, OnInit } from '@angular/core';

@Component({
	selector: 'app-add-edit-determinants',
	templateUrl: './add-edit-determinants.component.html',
	styleUrls: ['./add-edit-determinants.component.scss']
})
export class AddEditDeterminantsComponent implements OnInit {
	addUrl: string = '/warehouses-master-codes/determinants/add-determinants';
	updateUrl: string = '/warehouses-master-codes/determinants/update-determinants/';
	listUrl: string = '/warehouses-master-codes/determinants';
	countries = ['USA', 'Canada', 'Mexico', 'Brazil'];
	selectedCountry: string;
	constructor() { }

	ngOnInit(): void {
	}

}
