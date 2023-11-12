import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SearchModalComponent } from './search-modal/search-modal.component';
import { MatDialog } from '@angular/material/dialog';
@Component({
	selector: 'app-public-search-modal',
	templateUrl: './public-search-modal.component.html',
	styleUrls: ['./public-search-modal.component.scss']
})
export class PublicSearchModalComponent implements OnInit {
	@Output() emitClose = new EventEmitter();
	@Input() isVisible: boolean;
	@Input() routeApi: string;
	@Output() emitSearch = new EventEmitter();
	constructor(private dialog: MatDialog) { }

	ngOnInit(): void {
	
	}
	ngOnChanges(): void {

		if (this.isVisible) {
			this.showModal()
			
		}
	}
	

	
	handleCancel(): void {
		this.isVisible = false;
		this.emitClose.emit();
	}
	showModal(): void {
		
		const dialogRef = this.dialog.open(SearchModalComponent, {
			width: '900px', 
			autoFocus: false,
			data:{isVisible:true,routeApi:this.routeApi}// Adjust the width as needed
		  });
	  
		  dialogRef.componentInstance.cancelClicked.subscribe(() => {
			
			this.dialog.closeAll();
		  });
	  
		  dialogRef.componentInstance.okClicked.subscribe(() => {
			
			this.dialog.closeAll();
		  });
		  dialogRef.componentInstance.emitSearch.subscribe((data) => {
			
			this.emitSearch.emit(data);
			this.dialog.closeAll();
		
		  });
	}
	handleOk(): void {
		this.isVisible = false;
		this.dialog.closeAll();
	}
	
}
