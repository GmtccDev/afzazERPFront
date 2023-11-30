import { Component, OnInit } from '@angular/core';

@Component({
	selector: 'app-shifts',
	templateUrl: './shifts.component.html',
	styleUrls: ['./shifts.component.scss']
})
export class ShiftsComponent implements OnInit {
	accountList: any[] = [
		{ id: 1, name: 'Account 1' },
		{ id: 2, name: 'Account 2' },
		{ id: 3, name: 'Account 3' }
	];

	accountId: number; // Define the accountId property

	constructor() { }

	ngOnInit(): void {
	}

}

