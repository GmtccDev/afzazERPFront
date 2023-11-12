import { AfterViewInit, Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { PublicService } from '../../../services/public.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
@Component({
  selector: 'app-search-modal',
  templateUrl: './search-modal.component.html',
  styleUrls: ['./search-modal.component.scss']
})
export class SearchModalComponent implements OnInit ,AfterViewInit  {

	@Output() emitSearch = new EventEmitter();
	@Output() emitClose = new EventEmitter();
	@Input() isVisible: boolean;
	@Input() routeApi: string;
	@ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
	dataSource = new MatTableDataSource([]);
	displayedColumns = ['code','nameAr', 'nameEn', 'actions'];
  @Output() cancelClicked = new EventEmitter();
  @Output() okClicked = new EventEmitter();
  res: any;

	constructor(private publicService: PublicService,@Inject(MAT_DIALOG_DATA) public data: any,
		) { }
ngAfterViewInit(): void {
  debugger
 this.dataSource.paginator = this.paginator;
  console.log(this.paginator); // Check if it's defined here
}
	ngOnInit(): void {
    
  
    if (this.data.isVisible) {
      
      this.isVisible = true;
			this.getListSearch();
		}
	
	}
	ngOnChanges(): void {
    
  
		if (this.data.isVisible) {
      
      this.isVisible = true;
			this.getListSearch();
		}
	}
  getListSearch() {
		return new Promise<void>((resolve, reject) => {
			let sub = this.publicService.getDdl(this.data.routeApi).subscribe({
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
					//console.log('complete');
				},
			});

			//     this.subsList.push(sub);
		});

	}

	OnSelected(res) {

		this.res=res;
    this.isVisible = false;
    this.selected();
	}

  selected() {
   
     this.emitSearch.emit(this.res);
      }


	applyFilter(filterValue: string) {
		filterValue = filterValue.trim(); // Remove whitespace
		filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
		this.dataSource.filter = filterValue;
		if (this.dataSource.paginator) {
			this.dataSource.paginator.firstPage();
		}
	}

  handleCancel(): void {
    this.isVisible = false;
    this.cancelClicked.emit();
  }

  handleOk(): void {
    this.isVisible = false;
    this.okClicked.emit();
  }
}
