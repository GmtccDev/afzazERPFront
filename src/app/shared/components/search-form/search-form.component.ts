import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-search-form',
  templateUrl: './search-form.component.html',
  styleUrls: ['./search-form.component.scss']
})
export class SearchFormComponent implements OnInit {

  @Input() title: string="";
  @Input() dataList: any[]=[];
  @Input() searchDataList: any[]=[];
  @Input() searchText: string = "";
  @Input() colomnLables: string[]=[];
  @Input() colomnNames: string[]=[];
  @Output() OnSelect: EventEmitter<any> = new EventEmitter<any>();


  constructor(private matDialogRef: MatDialogRef<SearchFormComponent>) { }

  ngOnInit(): void {
    if (this.searchText) {
      if (this.dataList) {
        this.Search();
      }

    }
  }

  OnDataSelect(selectedItem) {
    ////(("Selected Item is", selectedItem);
    this.OnSelect.emit(selectedItem);
    this.matDialogRef.close()
  }

  Search() {
    if (this.searchText) {
      this.dataList = this.searchDataList.filter(a => {
        let txt: string = "";
        this.colomnNames.forEach(name => {
          txt = txt + " " + (a[name] ? a[name] : "");
        });
        ////((txt);
        return txt.toUpperCase().includes(this.searchText) || txt.toLowerCase().includes(this.searchText);
      });
    }
    else {
      this.dataList = this.searchDataList.filter(a => true);
    }
  }


}
