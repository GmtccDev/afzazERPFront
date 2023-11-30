import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ChangePasswordComponent } from 'src/app/erp/authentication/change-password/change-password.component';
import { ModalComponent } from 'src/app/shared/modal/modal.component';


@Component({
	selector: 'app-my-account',
	templateUrl: './my-account.component.html',
	styleUrls: ['./my-account.component.scss']
})
export class MyAccountComponent implements OnInit {
	isMenuOpen: boolean = false;
	public userName: string;
	public profileImg: 'assets/images/dashboard/profile.png';

	constructor(public router: Router, private modelService: NgbModal) {
		//console.log("12 localstorage", (localStorage.getItem('userName')))
		this.userName = localStorage.getItem('userName');
		if ((localStorage.getItem('user'))) {
			//console.log("true");
		} else {
			//console.log("NO ");
		}

	}

	toggleMenu() {
		this.isMenuOpen = !this.isMenuOpen;
	}
	logoutFunc() {
		//localStorage.clear();
		this.router.navigate(['/auth/login']);
	}

	ngOnInit() {
	}

	showModalFrom() {
		const modalRef = this.modelService.open(ChangePasswordComponent);
		modalRef.componentInstance.name = 'World';
	}
}
