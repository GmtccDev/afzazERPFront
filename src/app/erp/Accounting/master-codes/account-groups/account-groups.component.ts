import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { DeleteListAccountGroupCommand, AccountGroupDto, TreeNodeInterface } from '../../models/account-group';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { SharedService } from '../../../../shared/common-services/shared-service';
import { ToolbarPath } from '../../../../shared/interfaces/toolbar-path';
import { NotificationsAlertsService } from '../../../../shared/common-services/notifications-alerts.service';
import { ToolbarData } from '../../../../shared/interfaces/toolbar-data';
import { Subscription } from 'rxjs';
import { ITabulatorActionsSelected } from '../../../../shared/interfaces/ITabulator-action-selected';
import { MessageModalComponent } from '../../../../shared/components/message-modal/message-modal.component'
import { SettingMenuShowOptions } from '../../../../shared/components/models/setting-menu-show-options';
import { ToolbarActions } from '../../../../shared/enum/toolbar-actions'
import { AccountGroupServiceProxy } from '../../services/account-group.services';

@Component({
  selector: 'app-account-groups',
  templateUrl: './account-groups.component.html',
  styleUrls: ['./account-groups.component.scss']
})
export class AccountGroupsComponent implements OnInit, OnDestroy, AfterViewInit {

  //#region Main Declarations
  accountGroup: AccountGroupDto[] = [];
  currnetUrl: any;
  addUrl: string = '/accounting-master-codes/accountGroup/add-accountGroup';
  updateUrl: string = '/accounting-master-codes/accountGroup/update-accountGroup/';
  listUrl: string = '/accounting-master-codes/accountGroup';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.accountGroup"),
    componentAdd: '',

  };
  listIds: any[] = [];
  listOfMapData: any[];
  //#endregion

  //#region Constructor
  constructor(
    private accountGroupService: AccountGroupServiceProxy,
    private router: Router,
    private sharedServices: SharedService,
    private alertsService: NotificationsAlertsService,
    private modalService: NgbModal,
    private translate: TranslateService
  ) {

  }


  //#endregion

  //#region ngOnInit
  ngOnInit(): void {

  }

  ngAfterViewInit(): void {

    this.listenToClickedButton();

    this.getAccountGroupes();
    setTimeout(() => {

      this.sharedServices.changeButton({ action: 'List' } as ToolbarData);
      this.sharedServices.changeToolbarPath(this.toolbarPathData);
    }, 300);


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
  filter: any = { id: null, name: null, selectedId: null };
  getAccountGroupes() {
    return new Promise<void>((resolve, reject) => {

      let sub = this.accountGroupService.getAllTree(this.filter).subscribe({
        next: (res) => {

          console.log(res);

          this.toolbarPathData.componentList = this.translate.instant("component-names.accountGroup");
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
  delete(id: any) {
    this.accountGroupService.deleteAccountGroup(id).subscribe((resonse) => {
      console.log('delet response', resonse);
      this.getAccountGroupes();
    });
  }
  edit(id: string) {
    this.router.navigate([
      '/accounting-master-codes/accountGroup/update-accountGroup',
      id,
    ]);
  }

  //#endregion



  showConfirmDeleteMessage(id) {
    const modalRef = this.modalService.open(MessageModalComponent);
    modalRef.result.then((rs) => {
      console.log(rs);
      if (rs == 'Confirm') {
        let sub = this.accountGroupService.deleteAccountGroup(id).subscribe(
          (resonse) => {

            //reloadPage()
            this.getAccountGroupes();

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
  columnNames = [
    this.lang == 'ar'
      ? { title: ' الاسم', field: 'nameAr' } :
      { title: ' Name  ', field: 'nameEn' },

    {
      title: this.lang == 'ar' ? ' الكود' : 'code ',
      field: 'code',
    },
    this.lang == 'ar'
      ? { title: ' العنوان', field: 'address' } :
      { title: ' Address  ', field: 'address' },

    // this.lang == 'ar'
    //   ? { title: ' الدولة', field: 'countryNameAr' } :
    //   { title: ' Country  ', field: 'countryNameEn' },
  ];

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

  openAccountGroupes() { }
  onCheck(id) {

    this.listIds.push(id);
    this.sharedServices.changeButton({
      action: 'Delete',
      componentName: 'List',
      submitMode: false
    } as ToolbarData);
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
      this.router.navigate(['accounting-master-codes/accountGroup/update-accountGroup/' + id])
    }

  }
  onMenuActionSelected(event: ITabulatorActionsSelected) {

    if (event != null) {
      if (event.actionName == 'Edit') {
        this.edit(event.item.id);
        this.sharedServices.changeButton({
          action: 'Update',
          componentName: 'List',
          submitMode: false
        } as ToolbarData);

        // this.toolbarPathData.updatePath = "/control-panel/definitions/update-benefit-person/"
        this.sharedServices.changeToolbarPath(this.toolbarPathData);
        this.router.navigate(['accounting-master-codes/accountGroup/update-accountGroup/' + event.item.id])

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

      // this.toolbarPathData.updatePath = "/control-panel/definitions/update-benefit-person/"
      this.sharedServices.changeToolbarPath(this.toolbarPathData);
      this.router.navigate(['accounting-master-codes/accountGroup/add-accountGroup/' + parentId])
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

    let item = new DeleteListAccountGroupCommand();
    item.ids = this.listIds;
    let sub = this.accountGroupService.deleteListAccountGroup(item).subscribe(
      (resonse) => {

        //reloadPage()
        this.getAccountGroupes();
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