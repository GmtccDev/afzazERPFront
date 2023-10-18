import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import * as Tabulator from 'tabulator-tables/dist/js/tabulator';
import { SharedService } from '../../common-services/shared-service';
import { PublicService } from '../../services/public.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
@Component({
	selector: 'app-public-search-modal',
	templateUrl: './public-search-modal.component.html',
	styleUrls: ['./public-search-modal.component.scss']
})
export class PublicSearchModalComponent implements OnInit {
	@Output() emitSearch = new EventEmitter();
	@Output() emitClose = new EventEmitter();
	@Input() isVisible: boolean;
	@Input() routeApi: string;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	dataSource = new MatTableDataSource([]);
	displayedColumns = ['code','nameAr', 'nameEn', 'actions'];
	constructor(private publicService: PublicService,
		private router: Router,
		private sharedServices: SharedService,
		private modalService: NgbModal,
		private translate: TranslateService) { }

	ngOnInit(): void {
		this.dataSource.paginator = this.paginator;
	}
	ngOnChanges(changes: import("@angular/core").SimpleChanges): void {

		if (this.isVisible) {
			this.getListSearch();
		}
	}
	getListSearch() {
		return new Promise<void>((resolve, reject) => {
			let sub = this.publicService.getDdl(this.routeApi).subscribe({
				next: (res) => {
					
					if (res.success) {
						this.dataSource.data = res.response;

					}


					resolve();

				},
				error: (err: any) => {
					reject(err);
				},
				complete: () => {
					console.log('complete');
				},
			});

			//     this.subsList.push(sub);
		});

	}

	OnSelected(res) {

		this.emitSearch.emit(res);
	}
	handleCancel(): void {
		this.isVisible = false;
		this.emitClose.emit();
	}
	showModal(): void {
		this.isVisible = true;
	}

	handleOk(): void {
		this.isVisible = false;
	}
	applyFilter(filterValue: string) {
		filterValue = filterValue.trim(); // Remove whitespace
		filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
		this.dataSource.filter = filterValue;
		if (this.dataSource.paginator) {
			this.dataSource.paginator.firstPage();
		}
	}
}
