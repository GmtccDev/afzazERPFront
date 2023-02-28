import {
  Component, OnInit, AfterViewInit,
  Input, Output, EventEmitter, OnChanges
} from '@angular/core';

@Component({
  selector: 'app-draggable-menu-items',
  templateUrl: './draggable-menu-items.component.html',
  styleUrls: ['./draggable-menu-items.component.scss']


})
export class DraggableMenuItemsComponent implements AfterViewInit, OnInit, OnChanges {


  @Input() menuItems: MenuItem[] = [];
  @Input() enableSort: boolean = false;

  @Input() containerId: string = "";
  @Input() componentName: string = "";

  @Output() onMenuItemChange: EventEmitter<MenuItem[]> = new EventEmitter();
  @Output() onSave: EventEmitter<MenuItem[]> = new EventEmitter();
  @Input() autoArrangeChecked: boolean = false;
  @Input() sortBy: { field: string, sort: string }[] = [];
  @Input() groupBy: string[] = [];
  @Input() enableGroup: boolean = false;

  // currentMenuItem: any;
  // afterMenuItem: any;
  constructor() { }

  ngOnInit() {

  }

  ngAfterViewInit() {
    if (this.menuItems.length) {
      this.addDragEvents();
      this.createMenuItems();
    }

  }

  getDragAfterElement(container:any, y:any) //Container where element dropped and y=> to determine where the drop will be
  {
    const drggableElement = [...container.querySelectorAll('.draggable' + this.containerId + this.componentName + ':not(.dragging)')];
    return drggableElement.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      }
      else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }//Initial value
    ).element;

  }


  getNewMenuItems() {
    const container = document.querySelector('.dragableContainer' + this.containerId + this.componentName);
    const newMenuItems = container?.querySelectorAll('.draggable' + this.containerId + this.componentName);
    // const newMenuItems = document.querySelectorAll('.draggable');
    let newMenuItemList: MenuItem[] = [];
    //console.log(newMenuItems);
    let index = 0;
    newMenuItems?.forEach(item => {
      let id = item.getAttribute("id");
      let chekBoxElement = item.querySelector(".chk" + id);
      let title = item.querySelector(".spn" + id);
      let sort = item.querySelector('.spnSort' + id);

      newMenuItemList.push({
        field: id!,
        checked: (chekBoxElement?.getAttribute("value")) == "true" ? true : false,
        title: title ? title.innerHTML : id!,
        sort: sort ? sort.innerHTML : 'asc',
        order: index
      });
      index++;

    });
    //console.log(newMenuItemList);
    return newMenuItemList;
  }

  changeValue(index:any) {
    this.menuItems[index].checked = this.menuItems[index].checked ? false : true;
    if (this.autoArrangeChecked) {
      this.menuItems = this.arrangeCheckedMenuItems(this.menuItems);
      setTimeout(() => {
        this.addDragEvents()
      }, 200)
    }

    this.onMenuItemChange.emit(this.menuItems);
  }



  setSort(index:any, e:Event) {
    e.stopPropagation();
    this.menuItems[index].sort = this.menuItems[index].sort == "asc" ? "desc" : "asc";
    //this.menuItems = this.arrangeCheckedMenuItems(this.menuItems);
    this.onMenuItemChange.emit(this.menuItems);

  }

  createMenuItems() {
    let self = this;

    const menuContainer = document.querySelector('.dragableContainer' + this.containerId + this.componentName);
    menuContainer?.addEventListener('dragover', (e: any) => {
      //console.log("dragg over Menu Container")
      //Get Current Dragging element
      e.preventDefault(); //Because of dropping inside container disabled by default, then we must enable it by prevent default
      e.stopImmediatePropagation();
      //console.log("Objects", e);      
      const afterElement = self.getDragAfterElement(menuContainer, e.clientY);
      const currentDragElement = document.querySelector('.dragging');
      if (afterElement == null) {
        menuContainer.appendChild(currentDragElement!);
      }
      else {
        //console.log("Insert Child");
        menuContainer.insertBefore(currentDragElement!, afterElement);
      }






    });

    menuContainer?.addEventListener('drop', (e) => {

      //console.log("Drop event");
      // e.stopImmediatePropagation();
      // setTimeout(()=>{
      //   this.menuItems = this.getNewMenuItems();
      // }, 5000);

    }, false);
  }

  addDragEvents() {
    //Add Events to draggable Items
    let self = this;
    const draggableItems = document.querySelectorAll(".draggable" + this.containerId + this.componentName);
    //const container = document.querySelector('.dragableContainer');
    draggableItems.forEach(draggable => {
      draggable.addEventListener('dragstart', () => {
        //console.log("drag start event")
        //add class dragging 
        draggable.classList.add('dragging');

      });

      draggable.addEventListener('dragend', (e) => {
        //remove dragging class when drag end
        draggable.classList.remove('dragging');
        //self.newMenuItems = self.getNewMenuItems();
        e.stopImmediatePropagation();
        //console.log("drag stopped")
        //
        // console.log("Current Menu Item", self.currentMenuItem);
        // console.log("After menus item", self.afterMenuItem)

        self.menuItems = self.getNewMenuItems();
        // 
        if (self.autoArrangeChecked) {
          self.menuItems = self.arrangeCheckedMenuItems(self.menuItems);
        }
        // 
        self.onMenuItemChange.emit(self.menuItems);
        setTimeout(() => {
          self.addDragEvents();
        }, 200);
        //self.menuItems = self.getNewMenuItems();
        ;
      }, false);
    });


  }

  saveMenuOptions() {
    
    this.onSave.emit(this.menuItems);
  }

  undoChanges() {

    //console.log(this.getNewMenuItems());
  }

  resetMenu() {

  }

  ngOnChanges() {
    if (this.menuItems.length) {
      if (this.enableSort) {
        // 
        //console.log("sort by from mmeu Items", this.sortBy);
        this.getSortableMenuItem();
        if (this.autoArrangeChecked) {
          this.menuItems = this.arrangeCheckedMenuItems(this.menuItems);
        }


      }
      if (this.enableGroup) {
        this.getGroupedByMenuItems();
        if (this.autoArrangeChecked) {
          this.menuItems = this.arrangeCheckedMenuItems(this.menuItems);
        }
      }



      setTimeout(() => {
        this.addDragEvents();
        this.createMenuItems();
      }, 200);

      //this.createMenuItems();
      //this.addDragEvents();
    }
  }

  arrangeCheckedMenuItems(currentMenuItems: MenuItem[]) {
    let arrangedCheckedMenuItems: MenuItem[] = [];
    let index = 0;
    currentMenuItems.forEach(m => {
      if (m.checked) {
        arrangedCheckedMenuItems.push({
          checked: m.checked,
          field: m.field,
          sort: m.sort,
          title: m.title,
          order: index
        });
        index++;
      }
    });

    currentMenuItems.forEach(m => {
      if (!m.checked) {
        arrangedCheckedMenuItems.push({
          checked: m.checked,
          field: m.field,
          sort: m.sort,
          title: m.title,
          order: index
        });
        index++;
      }
    });

    return arrangedCheckedMenuItems;
  }

  getSortableMenuItem() {
    if(this.enableSort)
    {
      let newSortBy: MenuItem[] = [];
    let index = 0;
    this.sortBy.forEach(s => {
      let sortItem:MenuItem|undefined = this.menuItems.find(x=>x.field == s.field);
      newSortBy.push({
        order:index,
        checked:true,
        field:s.field,
        sort:s.sort,
        title:sortItem?sortItem.title:""
      });
      index++;
    });
    this.menuItems.forEach(item => {
      let sortable = newSortBy.find(x => x.field == item.field);
      
      if (!sortable) {
        newSortBy.push({
          checked:false,
          field:item.field,
          title:item.title,
          order:index,
          sort:item.sort

        });
        index++;
      }
      
      

    });
    this.menuItems = newSortBy;
    }
    

    //return this.arrangeCheckedMenuItems(currentMenuItems);
  }

  getGroupedByMenuItems() {
    if(this.enableGroup )
    {
      
      let newGroupBy: MenuItem[] = [];
      let index = 0;
      this.groupBy.forEach(s=>{
       // let g = s.replaceAll('&#34;', '"');
        let groupByItem:MenuItem|undefined = this.menuItems.find(x=>x.field == s);
        if(groupByItem)
        {
          newGroupBy.push({
            order:index,
            checked:true,
            field:s,
            sort:groupByItem.sort,
            title:groupByItem.title
          });
          index++;
        }
        
      });
      this.menuItems.forEach(item => {
        let sortable = newGroupBy.find(x => x.field == item.field);
        if (!sortable) {
          newGroupBy.push({
            checked:false,
            field:item.field,
            title:item.title,
            order:index,
            sort:item.sort
  
          });
          index++;
        }
       
      });

      this.menuItems = newGroupBy;
    }
    


  }





}


export class MenuItem {
  order?: number;
  title?: string;
  field?: string;
  sort?: string;
  checked: any

}