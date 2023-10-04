import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { SharedService } from 'src/app/shared/common-services/shared-service';
import { MessageModalComponent } from 'src/app/shared/components/message-modal/message-modal.component';
import { SettingMenuShowOptions } from 'src/app/shared/components/models/setting-menu-show-options';
import { ToolbarActions } from 'src/app/shared/enum/toolbar-actions';
import { ITabulatorActionsSelected } from 'src/app/shared/interfaces/ITabulator-action-selected';
import { ToolbarData } from 'src/app/shared/interfaces/toolbar-data';
import { ToolbarPath } from 'src/app/shared/interfaces/toolbar-path';
import {ItemGroupsCardServiceProxy} from '../../Services/item-groups-card.service'
import {ItemGroupsCardDto,DeleteListItemGroupsCard, TreeNodeInterface} from '../../models/item-groups-card'

@Component({
  selector: 'app-item-groups-card',
  templateUrl: './item-groups-card.component.html',
  styleUrls: ['./item-groups-card.component.scss']
})
export class ItemGroupsCardComponent implements OnInit, OnDestroy, AfterViewInit {

  //#region Main Declarations
  itemGroupsCard:[] = [];
  currnetUrl: any;
  addUrl: string = '/warehouses-master-codes/itemGroupsCard/add-itemGroupsCard';
  updateUrl: string = '/warehouses-master-codes/itemGroupsCard/update-itemGroupsCard/';
  listUrl: string = '/warehouses-master-codes/itemGroupsCard';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.item-groups-card"),
    componentAdd: '',

  };
  listIds: any[] = [];
  listOfMapData: any[];
  filter: any = { id: null, name: null, selectedId: null };

  //#endregion

  //#region Constructor
  constructor(
    private itemGroupsCardService: ItemGroupsCardServiceProxy,
    private router: Router,
    private sharedServices: SharedService,
    private modalService: NgbModal,
    private translate: TranslateService,
    private spinner: NgxSpinnerService

  ) {

  }


  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
   // this.defineGridColumn();
    this.spinner.show();
    Promise.all([ this.getItemGroupsCards()])
    .then(a=>{
      this.spinner.hide();
      this.sharedServices.changeButton({ action: 'List' } as ToolbarData);
      this.sharedServices.changeToolbarPath(this.toolbarPathData);
      this.listenToClickedButton();
    }).catch(err=>{
      this.spinner.hide();
    })
  }

  ngAfterViewInit(): void {

    
  }


  //#endregion

  //#region ngOnDestroy
  ngOnDestroy() {
    this.subsList.forEach((s) => {
      if (s) {
        s.unsubscribe();
      }
    });
  }
  //#endregion

  //#region Authentications

  //#endregion

  //#region Permissions

  //#endregion

  //#region  State Management
  //#endregion

  //#region Basic Data
  ///Geting form dropdown list data
  getItemGroupsCards() {
    return new Promise<void>((resolve, reject) => {

      let sub = this.itemGroupsCardService.getAllTree(this.filter).subscribe({
        next: (res) => {

          console.log(res);

          this.toolbarPathData.componentList = this.translate.instant("component-names.item-groups-card");
          if (res.success) {

            this.listOfMapData = res.response
            this.listOfMapData.forEach(item => {
              this.mapOfExpandedData[item.treeId] = this.convertTreeToList(item);
            });
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

      this.subsList.push(sub);
    });

  }

  //#endregion

  //#region CRUD Operations


  //#endregion



  showConfirmDeleteMessage(id) {
    const modalRef = this.modalService.open(MessageModalComponent);
    modalRef.componentInstance.message = this.translate.instant('messages.confirm-delete');
    modalRef.componentInstance.title = this.translate.instant('messageTitle.delete');
    modalRef.componentInstance.btnConfirmTxt = this.translate.instant('messageTitle.delete');
    modalRef.componentInstance.isYesNo = true;
    modalRef.result.then((rs) => {
      console.log(rs);
      if (rs == 'Confirm') {
        var entity={
          tableName:"ItemGroupsCards",
          id:id,
          idName:"Id"
        }
        let sub = this.itemGroupsCardService.deleteItemGroupsCard(id).subscribe(
          (resonse) => {

            //reloadPage()
            this.getItemGroupsCards();

          });
        this.subsList.push(sub);
      }
    });
  }
  //#endregion
  //#region Tabulator
 
  panelId: number = 1;
  sortByCols: any[] = [];
  searchFilters: any;
  groupByCols: string[] = [];
  lang: string = localStorage.getItem("language");
 
  menuOptions: SettingMenuShowOptions = {
    showDelete: true,
    showEdit: true,
  };

  direction: string = 'ltr';

  onSearchTextChange(searchTxt: string) {
    this.searchFilters = [
      [
        { field: 'nameEn', type: 'like', value: searchTxt },
        { field: 'nameAr', type: 'like', value: searchTxt },
        { field: 'code', type: 'like', value: searchTxt },
        ,
      ],
    ];
  }

 
  onEdit(id) {

    if (id != undefined) {
      // this.edit(id);
      this.sharedServices.changeButton({
        action: 'Update',
        componentName: 'List',
        submitMode: false
      } as ToolbarData);

      // this.toolbarPathData.updatePath = "/control-panel/definitions/update-benefit-person/"
      this.sharedServices.changeToolbarPath(this.toolbarPathData);
      this.router.navigate(['warehouses-master-codes/itemGroupsCard/update-itemGroupsCard/' + id])
    }

  }
  onMenuActionSelected(event: ITabulatorActionsSelected) {

    if (event != null) {
      if (event.actionName == 'Edit') {
     
        this.sharedServices.changeButton({
          action: 'Update',
          componentName: 'List',
          submitMode: false
        } as ToolbarData);

        this.sharedServices.changeToolbarPath(this.toolbarPathData);
        this.router.navigate(['warehouses-master-codes/itemGroupsCard/update-itemGroupsCard/' + event.item.id])

      } else if (event.actionName == 'Delete') {
        this.showConfirmDeleteMessage(event.item.id);
      }
    }
  }
  addNode(parentId) {

    if (parentId != undefined) {
      // this.edit(id);
      this.sharedServices.changeButton({
        action: 'New',
        componentName: 'List',
        submitMode: false
      } as ToolbarData);

      this.sharedServices.changeToolbarPath(this.toolbarPathData);
      this.router.navigate(['warehouses-master-codes/itemGroupsCard/add-itemGroupsCard/' + parentId])
    }
  }
  //#endregion



  //#region Toolbar Service
  currentBtn!: string;
  subsList: Subscription[] = [];
  listenToClickedButton() {

    let sub = this.sharedServices.getClickedbutton().subscribe({
      next: (currentBtn: ToolbarData) => {

        //currentBtn;
        if (currentBtn != null) {
          if (currentBtn.action == ToolbarActions.List) {

          } else if (currentBtn.action == ToolbarActions.New) {
            this.router.navigate([this.addUrl]);
          }
          else if (currentBtn.action == ToolbarActions.DeleteCheckList) {
            this.onDelete();
          }
        }
      },
    });
    this.subsList.push(sub);
  }
  onDelete() {

    let item = new DeleteListItemGroupsCard();
    item.ids = this.listIds;
    let sub = this.itemGroupsCardService.deleteListItemGroupsCard(item).subscribe(
      (resonse) => {

        //reloadPage()
        this.getItemGroupsCards();
        this.listIds = [];
      });
    this.subsList.push(sub);
  }
  //#endregion
  mapOfExpandedData: { [key: string]: TreeNodeInterface[] } = {};
  collapse(array: TreeNodeInterface[], data: TreeNodeInterface, $event: boolean): void {

    if (!$event) {
      if (data.children) {
        data.children.forEach(d => {
          const target = array.find(a => a.treeId === d.treeId)!;
          target.expanded = false;
          this.collapse(array, target, false);
        });
      } else {

        return;
      }
    }
  }
  convertTreeToList(root: TreeNodeInterface): TreeNodeInterface[] {

    const stack: TreeNodeInterface[] = [];
    const array: TreeNodeInterface[] = [];
    const hashMap = {};
    stack.push({ ...root, levelId: 0, expanded: false });
    while (stack.length !== 0) {
      const node = stack.pop()!;
      this.visitNode(node, hashMap, array);
      if (node.children) {
        
        for (let i = node.children.length - 1; i >= 0; i--) {
          stack.push({ ...node.children[i], levelId: node.levelId! + 1, expanded: false, parent: node });
         
        }
        if (node.children.length == 0) {
          node.children = null;
        }
      }
    }
    return array;
  }
  visitNode(node: TreeNodeInterface, hashMap: { [key: string]: boolean }, array: TreeNodeInterface[]): void {
    if (!hashMap[node.treeId]) {
      hashMap[node.treeId] = true;
      array.push(node);
    }
  }





}

