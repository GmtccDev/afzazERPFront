import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import * as Tabulator from 'tabulator-tables/dist/js/tabulator';
import { SharedService } from '../../common-services/shared-service';
import {PublicService} from '../../services/public.service';
import { MatPaginator } from '@angular/material/paginator';
import { NzMessageService } from 'ng-zorro-antd';
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
  displayedColumns = ['nameAr', 'nameEn','code', 'actions'];
  constructor(  private publicService: PublicService,
    private router: Router,
    private sharedServices: SharedService,
    private modalService: NgbModal,
    private translate: TranslateService) { }

  ngOnInit(): void {
    this.dataSource.paginator = this.paginator;
  }
  ngOnChanges(changes: import("@angular/core").SimpleChanges): void {
    debugger
    if (this.isVisible) {
      this.getListSearch();
    }
  }
  getListSearch() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeApi).subscribe({
        next: (res) => {
          debugger
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
  lang = localStorage.getItem("language")
  editFormatIcon() { //plain text value

    return "<i class='fa fa-edit'></i>";
  };
  deleteFormatIcon() { //plain text value

    return "<i class='fa fa-trash'></i>";
  };
  CheckBoxFormatIcon() { //plain text value

    return "<input id='yourID' type='checkbox' />";
  };
  resultSearch: any = [];
  columnNames = [
    this.lang == 'ar'
      ? { title: ' الاسم', field: 'nameAr' } :
      { title: ' Name  ', field: 'nameEn' },

    {
      title: this.lang == 'ar' ? ' الكود' : 'code ',
      field: 'code',
    },
    // {
    //   title: this.lang == 'ar' ? ' رمز العملة' : 'Symbol ',
    //   field: 'symbol',
    // }

  ];
  exTable: any;
  filterParam: string = '';
  // subscriptionsData=[]
  tab = document.createElement('div');
  drawTable() {
    this.exTable = new Tabulator(this.tab, {
      height: 130,
      layout: 'fitColumns',
      columns: this.columnNames,
      movableColumns: true,
      data: this.resultSearch,
      //Local Pagination
      pagination: "local",
      paginationSize: 50,
      paginationSizeSelector: [5, 10, 20, 50, 100, 1000, 10000, 100000],

      paginationCounter: "rows",
    });
    //    this.exTable.setData(persons);
    document.getElementById('ex-table-div').appendChild(this.tab);
    
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
