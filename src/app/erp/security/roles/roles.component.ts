import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { SharedService } from '../../../shared/common-services/shared-service';
import { ToolbarPath } from '../../../shared/interfaces/toolbar-path';
import { RoleServiceProxy } from '../services/role.servies'
import { ToolbarData } from '../../../shared/interfaces/toolbar-data';
import { Subscription } from 'rxjs';
import { MessageModalComponent } from '../../../shared/components/message-modal/message-modal.component'
import { SettingMenuShowOptions } from '../../../shared/components/models/setting-menu-show-options';
import { ToolbarActions } from '../../../shared/enum/toolbar-actions'
import { DeleteListRoleCommand, RoleDto } from '../models/role';
import { NgxSpinnerService } from 'ngx-spinner';
@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit, OnDestroy, AfterViewInit {

  //#region Main Declarations
  role: RoleDto[] = [];
  currnetUrl: any;
  addUrl: string = '/security/role/add-role';
  updateUrl: string = '/security/role/update-role/';
  listUrl: string = '/security/role';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.roles-permissions"),
    componentAdd: '',

  };
  //#endregion

  //#region Constructor
  constructor(
    private roleService: RoleServiceProxy,
    private router: Router,
    private sharedServices: SharedService, private translate: TranslateService,
    private modalService: NgbModal,private spinner: NgxSpinnerService) {

  }


  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    this.spinner.show();
    Promise.all([this.getRoles()])
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
  getRoles() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.roleService.allRoles(undefined, undefined, undefined, undefined, undefined).subscribe({
        next: (res) => {
         
          this.toolbarPathData.componentList = this.translate.instant("component-names.roles-permissions");
          if (res.success) {
            this.role = res.response?.items;
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
    this.roleService.deleteRole(id).subscribe((resonse) => {
      this.getRoles();
    });
  }
  edit(id: string) {
    this.router.navigate([
      '/security/role/update-role',
      id,
    ]);
  }

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
        this.spinner.show();
        let sub = this.roleService.deleteRole(id).subscribe(
          () => {
            this.getRoles();

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
  lang = localStorage.getItem("language");
	columnNames = [
	  {
		  title: this.lang == 'ar' ? ' الكود' : 'code ',
		  field: 'code',
	  },
	  this.lang == 'ar'
		  ? { title: ' الاسم', field: 'nameAr' } : { title: ' Name  ', field: 'nameEn' },


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

  openRoless() { }
  onEdit(id) {

    if (id != undefined) {
      this.edit(id);
      this.sharedServices.changeButton({
        action: 'Update',
        componentName: 'List',
        submitMode: false
      } as ToolbarData);

      this.sharedServices.changeToolbarPath(this.toolbarPathData);
      this.router.navigate(['security/role/update-role/' + id]
      )
    }

  }

  //#endregion



  //#region Toolbar Service
  currentBtn!: string;
  subsList: Subscription[] = [];
  listenToClickedButton() {

    let sub = this.sharedServices.getClickedbutton().subscribe({
      next: (currentBtn: ToolbarData) => {
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
  onCheck(id) {
    const index = this.listIds.findIndex(item => item.id === id && item.isChecked === true);
    if (index !== -1) {
      this.listIds.splice(index, 1);
    } else {
      const newItem = { id, isChecked: true };
      this.listIds.push(newItem);
    }
    this.sharedServices.changeButton({
      action: 'Delete',
      componentName: 'List',
      submitMode: false
    } as ToolbarData);
  }
  listIds: any[] = [];
  onDelete() {

    let item = new DeleteListRoleCommand();
    item.ids = this.listIds.map(item => item.id);
    let sub = this.roleService.deleteListRole(item).subscribe(
      (resonse) => {

        //reloadPage()
        this.getRoles();
        this.listIds = [];
      });
    this.subsList.push(sub);
  }
  //#endregion
}

