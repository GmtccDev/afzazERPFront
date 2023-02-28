import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { MenuItem } from '../../models/menu-item';

@Component({
  selector: 'app-tabulator-setting',
  templateUrl: './tabulator-setting.component.html',
  styleUrls: ['./tabulator-setting.component.scss']
})
export class TabulatorSettingComponent implements OnInit, OnChanges, AfterViewInit {

  @Input() columnSettings: any[] = [];
  @Input() componentName: string = "";
  @Input() sortByList: { column: string, dir: string }[] = [];
  @Input() isLoadDefaultSetting: boolean = false;
  sorterList: { field: string, sort: string }[] = [];
  @Input() groupByList: string[] = []
  @Output() onSortItemsChange: EventEmitter<any[]> = new EventEmitter();
  @Output() onColumnItemsChange: EventEmitter<any[]> = new EventEmitter();
  @Output() onGroupbyItemsChange: EventEmitter<any[]> = new EventEmitter();


  @Output() onSortItemsSave: EventEmitter<any[]> = new EventEmitter();
  @Output() onColumnItemsSave: EventEmitter<any[]> = new EventEmitter();
  @Output() onGroupbyItemsSave: EventEmitter<any[]> = new EventEmitter();

  colMenuItems: MenuItem[] = [];
  sortMenuItems: MenuItem[] = [];
  groupByMenuItems: MenuItem[] = [];
  isMenuOpened:boolean = false;


  constructor() { }

  ngOnInit(): void {
  }

  toggleMenu()
  {
    this.isMenuOpened = !this.isMenuOpened;
  }

  saveGroupbySetting(e:any) {    
    this.onGroupbyItemsSave.emit(e);

  }
  saveSortSetting(e:any) {
    
    this.onSortItemsSave.emit(e);
  }
  saveColumnSetting(e:any) {
    
    this.onColumnItemsSave.emit(e);
  }

  sortItemChange(e:any) {

    this.sortMenuItems = e;

    this.onSortItemsChange.emit(e);

  }

  columnItemsChange(e:any) {

    this.onColumnItemsChange.emit(e);
  }

  groupbyItemsChange(e:any) {

    this.onGroupbyItemsChange.emit(e);
  }

  ngOnChanges() {
    if (this.columnSettings) {
      //console.log(this.columnSettings); 

      if (this.columnSettings.length && (!this.sortMenuItems.length || !this.groupByMenuItems.length || !this.colMenuItems.length)) {
        this.colMenuItems = [];
        this.sortMenuItems = [];
        this.groupByMenuItems = [];
        let index = 0;
        this.columnSettings.forEach(col => {

          this.colMenuItems.push({
            field: col.field,
            title: col.title,
            checked: this.isLoadDefaultSetting ? true : col.visible,
            sort: "asc",
            order: index

          });

          this.sortMenuItems.push({
            field: col.field,
            title: col.title,
            checked: col.visible,
            sort: "asc",
            order: index

          });

          this.groupByMenuItems.push({
            field: col.field,
            title: col.title,
            checked: col.visible,
            sort: "asc",
            order: index

          });
          index++;

        });
      }


    }


    if (this.sortByList) {
      this.sorterList = [];
      this.sortByList.forEach(s => {
        this.sorterList.push({
          field: s.column,
          sort: s.dir
        });
      })
    }

  }



  ngAfterViewInit() {

  }

}

// export class MenuItem {
//   order: number;
//   title: string;
//   field: string;
//   sort: string;
//   checked: any

// }



