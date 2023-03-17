import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { SharedService } from 'src/app/shared/common-services/shared-service';
import { ToolbarPath } from 'src/app/shared/interfaces/toolbar-path';
import { NotificationsAlertsService } from '../../../shared/common-services/notifications-alerts.service';
import {BranchServiceProxy } from '../services/branch.service';
import { BranchDto, DeleteListBranchCommand } from '../models/branch';
import { ToolbarData } from 'src/app/shared/interfaces/toolbar-data';
import { Subscription } from 'rxjs';
import { ITabulatorActionsSelected } from '../../../shared/interfaces/ITabulator-action-selected';
import { MessageModalComponent } from '../../../shared/components/message-modal/message-modal.component'
import { SettingMenuShowOptions } from 'src/app/shared/components/models/setting-menu-show-options';
import { ToolbarActions } from '../../../shared/enum/toolbar-actions'
@Component({
  selector: 'app-branches',
  templateUrl: './branches.component.html',
  styleUrls: ['./branches.component.scss']
})
export class BranchesComponent implements OnInit, OnDestroy, AfterViewInit {

  //#region Main Declarations
  branches: BranchDto[] = [];
  currnetUrl: any;
  addUrl: string = '/master-codes/branches/add-branch';
  updateUrl: string = '/master-codes/branches/update-branch/';
  listUrl: string = '/master-codes/branches';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.branches"),
    componentAdd: '',

  };
  listIds: any[] = [];
  //#endregion

  //#region Constructor
  constructor(
    private branchService: BranchServiceProxy,
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

    this.getBranches();
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
  getBranches() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.branchService.allBranches(undefined, undefined, undefined, undefined, undefined).subscribe({
        next: (res) => {
          
          console.log(res);
          //let data =
          //   res.data.map((res: PeopleOfBenefitsVM[]) => {
          //   return res;
          // });
          this.toolbarPathData.componentList = this.translate.instant("component-names.branches");
          if (res.success) {
            this.branches = res.response.items
            ;

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
    this.branchService.deleteBranch(id).subscribe((resonse) => {
      console.log('delet response', resonse);
      this.getBranches();
    });
  }
  edit(id: string) {
    this.router.navigate([
      '/master-codes/branches/update-branch',
      id,
    ]);
  }

  //#endregion



  showConfirmDeleteMessage(id) {
    const modalRef = this.modalService.open(MessageModalComponent);
    modalRef.result.then((rs) => {
      console.log(rs);
      if (rs == 'Confirm') {
        let sub = this.branchService.deleteBranch(id).subscribe(
          (resonse) => {

            //reloadPage()
            this.getBranches();

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
    }

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

  openBranches() { }
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
      this.edit(id);
      this.sharedServices.changeButton({
        action: 'Update',
        componentName: 'List',
        submitMode: false
      } as ToolbarData);

      // this.toolbarPathData.updatePath = "/control-panel/definitions/update-benefit-person/"
      this.sharedServices.changeToolbarPath(this.toolbarPathData);
      this.router.navigate(['master-codes/branches/update-branch/' + id])
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
        this.router.navigate(['master-codes/branches/update-branch/' + event.item.id])

      } else if (event.actionName == 'Delete') {
        this.showConfirmDeleteMessage(event.item.id);
      }
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
    
    let item = new DeleteListBranchCommand();
    item.ids = this.listIds;
    let sub = this.branchService.deleteListBranch( item).subscribe(
      (resonse) => {

        //reloadPage()
        this.getBranches();
        this.listIds = [];
      });
    this.subsList.push(sub);
  }
  //#endregion
}
