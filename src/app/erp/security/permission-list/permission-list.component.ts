import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { SharedService } from '../../../shared/common-services/shared-service';
import { ToolbarPath } from '../../../shared/interfaces/toolbar-path';
import { PermissionServiceProxy } from '../services/permission.servies'
import { ToolbarData } from '../../../shared/interfaces/toolbar-data';
import { Subscription } from 'rxjs';
import { ITabulatorActionsSelected } from '../../../shared/interfaces/ITabulator-action-selected';
import { MessageModalComponent } from '../../../shared/components/message-modal/message-modal.component'
import { SettingMenuShowOptions } from '../../../shared/components/models/setting-menu-show-options';
import { ToolbarActions } from '../../../shared/enum/toolbar-actions'
import { DeleteListPermissionCommand, IGetAllPermissionDTO, ICreatePermissionCommand } from '../models/permission';
import { RoleServiceProxy } from '../services/role.servies';
import { RoleDto } from '../models/role';
@Component({
  selector: 'app-permission-list',
  templateUrl: './permission-list.component.html',
  styleUrls: ['./permission-list.component.scss']
})
export class PermissionListComponent implements OnInit, OnDestroy, AfterViewInit {

  //#region Main Declarations
  permission: IGetAllPermissionDTO[] = [];
  currnetUrl: any;
  addUrl: string = '/security/permission';
  updateUrl: string = '/security/permission';
  listUrl: string = '/security/permission';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: "component-names.permissions",
    componentAdd: '',

  };
  //#endregion
  rolesList: RoleDto[] = [];
  roleId: any;
  //#region Constructor
  constructor(private roleService: RoleServiceProxy,
    private permissionService: PermissionServiceProxy,
    private router: Router,
    private sharedServices: SharedService, private translate: TranslateService,
    private modalService: NgbModal) {

  }


  //#endregion

  //#region ngOnInit
  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    this.listenToClickedButton();
    this.getRoles();

    setTimeout(() => {
      this.sharedServices.changeButton({ action: 'List' } as ToolbarData);
      this.sharedServices.changeToolbarPath(this.toolbarPathData);
    }, 300);


  }

  onChange(event) {
    
    this.roleId = event;
    this.getPermissionss(event);
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
  getPermissionss(roleId) {
    return new Promise<void>((resolve, reject) => {
      let sub = this.permissionService.allPermissions(roleId, 1, 100000, undefined, undefined, undefined).subscribe({
        next: (res) => {
          console.log(res);
          //let data =
          //   res.data.map((res: PeopleOfBenefitsVM[]) => {
          //   return res;
          // });
          this.toolbarPathData.componentList = "component-names.permissions-permissions";
          if (res.success) {
            this.permission = res.response?.items;
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
    debugger
    this.permissionService.deletePermission(id).subscribe((resonse) => {
      console.log('delet response', resonse);
      this.getPermissionss(this.roleId);
    });
  }
  edit(id: string) {
    this.router.navigate([
      '/security/permission/update-permission',
      id,
    ]);
  }

  //#endregion

  getRoles() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.roleService.allDLLRoles().subscribe({
        next: (res) => {

          if (res) {
            
            this.rolesList = res.response;

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

  showConfirmDeleteMessage(id) {
    const modalRef = this.modalService.open(MessageModalComponent);
    modalRef.result.then((rs) => {
      console.log(rs);
      if (rs == 'Confirm') {
      debugger
        let sub = this.permissionService.deletePermission(id).subscribe(
          () => {
            //reloadPage()
              this.getPermissionss(this.roleId);

          });
        this.subsList.push(sub);
      }
    });
  }
  //#endregion
  //#region Tabulator
  checkBoxFormatIcon() { //plain text value

    return "<input id='yourID' type='checkbox' />";
  };
  panelId: number = 1;
  sortByCols: any[] = [];
  searchFilters: any;
  groupByCols: string[] = [];
  lang = localStorage.getItem("language");
  columnNames = [

    this.lang == 'ar'
      ? { title: 'اسم العملية ', field: 'actionNameAr' } : { title: ' Name Action  ', field: 'actionNameEn' },

    this.lang == 'ar'
      ? { title: ' الشاشة', field: 'controllerNameAr' } : { title: ' Name  Screen', field: 'controllerNameEn' },

    this.lang == "ar" ? {
      title: "اختار",
      field: "isChecked", formatter: function (cell, formatterParams) {
        
        var value = cell.getRow().getData();
        if (value.isChecked) {
          return "<input id='yourID' type='checkbox' checked/>";
        } else {
          return "<input id='yourID' type='checkbox' />";
        }
      }, cellClick: (e, cell) => {

        this.onCheckItem(cell.getRow().getData());
      }
    }
      :

      {
        title: "isChecked",
        field: "isChecked", formatter: function (cell, formatterParams) {
          
          var value = cell.getRow().getData();
          if (value.isChecked) {
            return "<input id='yourID' type='checkbox' checked/>";
          } else {
            return "<input id='yourID' type='checkbox' />";
          }
        }, cellClick: (e, cell) => {


          this.onCheckItem(cell.getRow().getData());
        }
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

  onSave() {
    
    var permissionEntity = new ICreatePermissionCommand();
    if (this.permission.length > 0) {
      const promise = new Promise<void>((resolve, reject) => {
        permissionEntity.permissions = this.permission;
        permissionEntity.roleId = this.roleId;
        this.permissionService.createPermission(permissionEntity).subscribe({
          next: (result: any) => {

            console.log('result dataaddData ', result);

            this.getPermissionss(this.roleId);

            setTimeout(() => {
              //this.getPermissionss();
            }, 1000);
          },
          error: (err: any) => {
            reject(err);
          },
          complete: () => {
            console.log('complete');
          },
        });
      });
      return promise;

    } else {

      //  return this.roleForm.markAllAsTouched();
    }
  }
  onEdit(id) {

    // if (id != undefined) {
    //   this.edit(id);
    //   this.sharedServices.changeButton({
    //     action: 'Update',
    //     componentName: 'List',
    //     submitMode: false
    //   } as ToolbarData);

    //   // this.toolbarPathData.updatePath = "/control-panel/definitions/update-benefit-person/"
    //   this.sharedServices.changeToolbarPath(this.toolbarPathData);
    //   this.router.navigate(['security/permission/update-permission/' + id]
    //   )
    // }

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
            this.sharedServices.changeToolbarPath(this.toolbarPathData);
          }
          // else if (currentBtn.action == ToolbarActions.DeleteCheckList) {
          //   //  this.onDelete();
          // }
          else if (currentBtn.action == ToolbarActions.Save) {
            this.onSave();
          }
        }
      },
    });
    this.subsList.push(sub);
  }
  onCheckItem(item) {
    this.sharedServices.changeButton({
      action: 'New',
      componentName: 'List',
      submitMode: false
    } as ToolbarData);
    this.sharedServices.changeToolbarPath(this.toolbarPathData);
    let entity = this.permission.find(c => c.id == item.id);
    entity.isChecked = !entity.isChecked;
  }
  onCheck(id) {


    // this.listIds.push(id);
    // this.sharedServices.changeButton({
    //   action: 'Delete',
    //   componentName: 'List',
    //   submitMode: false
    // } as ToolbarData);
  }
  listIds: any[] = [];
  onDelete() {

    // let item = new DeleteListPermissionCommand();
    // item.ids = this.listIds;
    // let sub = this.permissionService.deleteListPermission(item).subscribe(
    //   (resonse) => {

    //     //reloadPage()
    //     //  this.getPermissionss();
    //     this.listIds = [];
    //   });
    // this.subsList.push(sub);
  }
  //#endregion
}

