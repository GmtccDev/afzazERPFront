import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DeleteListAccountCommand, AccountDto, TreeNodeInterface } from '../../models/account';
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
import { AccountServiceProxy } from '../../services/account.services';
import { NgxSpinnerService } from 'ngx-spinner';
import { NzTableComponent } from 'ng-zorro-antd/table';
@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss']
})
export class AccountsComponent implements OnInit, OnDestroy, AfterViewInit {

  //#region Main Declarations
  account: AccountDto[] = [];
  currnetUrl: any;
  addUrl: string = '/accounting-master-codes/account/add-account';
  updateUrl: string = '/accounting-master-codes/account/update-account/';
  listUrl: string = '/accounting-master-codes/account';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.account"),
    componentAdd: '',

  };
  listIds: any[] = [];
  listOfMapData: any[];
  expandAll: boolean = true;
  listOfMapDataNotSearch: any;
  //#endregion

  //#region Constructor
  constructor(
    private accountService: AccountServiceProxy,
    private router: Router,
    private sharedServices: SharedService,
    private alertsService: NotificationsAlertsService,
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
    Promise.all([this.getAccounts()])
      .then(a => {
        this.spinner.hide();
        this.sharedServices.changeButton({ action: 'List' } as ToolbarData);
        this.sharedServices.changeToolbarPath(this.toolbarPathData);
        this.listenToClickedButton();
      }).catch(err => {
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
  filter: any = { id: null, name: null, selectedId: null };
  getAccounts() {
    return new Promise<void>((resolve, reject) => {

      let sub = this.accountService.getAllTree(this.filter).subscribe({
        next: (res) => {



          this.toolbarPathData.componentList = this.translate.instant("component-names.account");
          if (res.success) {

            this.listOfMapData = res.response
            this.listOfMapDataNotSearch = res.response
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

        },
      });

      this.subsList.push(sub);
    });

  }
  getAccountsList() {
    return new Promise<void>((resolve, reject) => {

      let sub = this.accountService.getAllTree(this.filter).subscribe({
        next: (res) => {



       
          if (res.success) {

           
            this.listOfMapDataNotSearch = res.response
           
          }


          resolve();

        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {

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
      ;
      if (rs == 'Confirm') {
        this.spinner.show();

        let sub = this.accountService.deleteAccount(id).subscribe(
          (resonse) => {
            this.getAccounts();

          });
        this.subsList.push(sub);
        this.spinner.hide();

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



  onEdit(id) {

    if (id != undefined) {
      // this.edit(id);
      this.sharedServices.changeButton({
        action: 'Update',
        componentName: 'List',
        submitMode: false
      } as ToolbarData);

      this.sharedServices.changeToolbarPath(this.toolbarPathData);
      this.router.navigate(['accounting-master-codes/account/update-account/' + id])
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
        this.router.navigate(['accounting-master-codes/account/update-account/' + event.item.id])

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
      this.router.navigate(['accounting-master-codes/account/add-account/' + parentId])
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

    let item = new DeleteListAccountCommand();
    item.ids = this.listIds.map(item => item.id);
    let sub = this.accountService.deleteListAccount(item).subscribe(
      (resonse) => {

        //reloadPage()
        this.getAccounts();
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
    stack.push({ ...root, levelId: root.levelId, expanded: false });
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
  convertTreeToListExpanded(root: TreeNodeInterface): TreeNodeInterface[] {

    const stack: TreeNodeInterface[] = [];
    const array: TreeNodeInterface[] = [];
    const hashMap = {};
    stack.push({ ...root, levelId: 0, expanded: true });
    while (stack.length !== 0) {
      const node = stack.pop()!;
      this.visitNode(node, hashMap, array);
      if (node.children) {

        for (let i = node.children.length - 1; i >= 0; i--) {
          stack.push({ ...node.children[i], levelId: node.levelId! + 1, expanded: true, parent: node });

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

  expandAllRows() {
    if (this.expandAll) {
      this.listOfMapData.forEach(item => {
        this.mapOfExpandedData[item.treeId] = this.convertTreeToListExpanded(item);
      });
      this.expandAll = false;
    }
    else {
      this.listOfMapData.forEach(item => {
        this.mapOfExpandedData[item.treeId] = this.convertTreeToList(item);
      });
      this.expandAll = true;
    }

  }
  codeSearchText: string = ''; // Search input text for code
  nameSearchText: string = ''; // Search input text for name
  levelSearchText: string = ''; // Search input text for level

  // Function to perform the search

  onKeyUp(event: any) {
    // Perform your action here
    if (this.levelSearchText !== '') {
      this.getAccountsList()
      
    }


  }
  searchData() {
    if (this.codeSearchText === '' && this.nameSearchText === '' && this.levelSearchText == '') {
      this.getAccounts()
    }

    var listOfMapDataSearch = this.searchRecursive(this.listOfMapDataNotSearch);
    const filteredData = listOfMapDataSearch.filter(item => {
      const codeMatch = item.code.toLowerCase().includes(this.codeSearchText.toLowerCase());
      const nameMatch = item.nameAr.toLowerCase().includes(this.nameSearchText.toLowerCase()) ||
        item.nameEn.toLowerCase().includes(this.nameSearchText.toLowerCase());
      const levelMatch = ((item.levelId + 1).toString().toLowerCase()).includes(this.levelSearchText.toLowerCase());

      return codeMatch && nameMatch && levelMatch;
    });

    // Update the data source used in the template

    this.listOfMapData = this.convertToTree(filteredData);
    this.listOfMapData.forEach(item => {
      this.mapOfExpandedData[item.treeId] = this.convertTreeToList(item);
    });
  }
  convertToTree(data: any[]): any[] {
    const map = new Map();
    const roots: any[] = [];

    data.forEach(item => {
      map.set(item.id, item);
      item.children = [];
    });

    data.forEach(item => {
      const parent = map.get(item.parentId);
      if (parent) {
        parent.children.push(item);
      } else {
        roots.push(item);
      }
    });

    return roots;
  }
  // Recursive function to search the tree structure
  searchRecursive(data: any[]): any[] {
    let filteredData: any[] = [];

    for (const item of data) {
      {
        filteredData.push(item);
      }

      if (item.children && item.children.length > 0) {
        const childResults = this.searchRecursive(item.children);
        if (childResults.length > 0) {
          // Add the matched children to the filteredData array
          filteredData = filteredData.concat(childResults);
        }
      }
    }

    return filteredData;
  }
}
