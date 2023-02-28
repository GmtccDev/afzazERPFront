import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NotificationsAlertsService } from '../../../../shared/common-services/notifications-alerts.service';
import { SharedService } from '../../../../shared/common-services/shared-service';
import { ToolbarPath } from '../../../../shared/interfaces/toolbar-path';
import { NgxSpinnerService } from 'ngx-spinner';
import { CODE_REQUIRED_VALIDATORS, NAME_REQUIRED_VALIDATORS } from '../../../../shared/constants/input-validators';
import { Subscription } from 'rxjs';
import { ToolbarData } from '../../../../shared/interfaces/toolbar-data';
import { ToolbarActions } from '../../../../shared/enum/toolbar-actions';
import { navigateUrl } from '../../../../shared/helper/helper-url';
import { RoleServiceProxy } from '../../services/role.servies'
import { CreateRoleCommand, RoleDto } from '../../models/role';
import * as Tabulator from 'tabulator-tables/dist/js/tabulator';
import { PermissionServiceProxy } from '../../services/permission.servies';
import { IGetAllPermissionDTO } from '../../models/permission';
@Component({
  selector: 'app-add-edit-role',
  templateUrl: './add-edit-role.component.html',
  styleUrls: ['./add-edit-role.component.scss']
})
export class AddEditRoleComponent implements OnInit {
  //#region Main Declarations
  roleForm!: FormGroup;
  sub: any;
  url: any;
  id: any = 0;
  currnetUrl;
  role: RoleDto[] = [];
  addUrl: string = '/security/role/add-role';
  updateUrl: string = '/security/role/update-role/';
  listUrl: string = '/security/role';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: "component-names.users-permissions",
    componentAdd: '',

  };
  Response: any;
  errorMessage = '';
  errorClass = '';
  submited: boolean = false;
  constructor(
    private roleService: RoleServiceProxy,
    private router: Router,
    private sharedServices: SharedService,
    private alertsService: NotificationsAlertsService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private SharedServices: SharedService, private translate: TranslateService,
    private permissionService: PermissionServiceProxy,
  ) {
    this.defineRoleForm();
  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {

    this.currnetUrl = this.router.url;
    this.listenToClickedButton();
    this.changePath();
    if (this.currnetUrl == this.addUrl) {
      this.getRoleCode();
    }
    this.sub = this.route.params.subscribe((params) => {
      if (params['id'] != null) {
        this.id = params['id'];

        if (this.id) {
          this.getRoleById(this.id);
        }
        this.url = this.router.url.split('/')[2];
      }
    });
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
  defineRoleForm() {
    this.roleForm = this.fb.group({
      id: 0,
      nameAr: NAME_REQUIRED_VALIDATORS,
      nameEn: NAME_REQUIRED_VALIDATORS,
      code: CODE_REQUIRED_VALIDATORS,
      isActive: true
    });
  }

  //#endregion

  //#region CRUD Operations
  getRoleById(id: any) {
    const promise = new Promise<void>((resolve, reject) => {
      this.roleService.getRole(id).subscribe({
        next: (res: any) => {

          console.log('result data getbyid', res);
          this.roleForm.setValue({
            id: res.response?.id,
            nameAr: res.response?.nameAr,
            nameEn: res.response?.nameEn,
            code: res.response?.code,
            isActive: res.response?.isActive
          });
          console.log(
            'this.roleForm.value set value',
            this.roleForm.value
          );

          this.permission = res.response?.permissions?.items;
          this.drawTable();
          this.exTable?.setData(this.permission);
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
  }
  getRoleCode() {
    const promise = new Promise<void>((resolve, reject) => {
      this.roleService.getLastCode().subscribe({

        next: (res: any) => {

          this.toolbarPathData.componentList = "component-names.roles-permissions";
          this.roleForm.patchValue({
            code: res.response.code
          });
          this.drawTable();
          this.permission = res.response.permissions
          this.exTable?.setData(this.permission);
        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {
          console.log('complete');
        },
      });
    });

  }
  //#endregion

  //#region Helper Functions

  get f(): { [key: string]: AbstractControl } {
    return this.roleForm.controls;
  }


  //#endregion
  //#region Tabulator
  subsList: Subscription[] = [];
  currentBtnResult;
  listenToClickedButton() {
    let sub = this.SharedServices.getClickedbutton().subscribe({
      next: (currentBtn: ToolbarData) => {
        currentBtn;

        if (currentBtn != null) {
          if (currentBtn.action == ToolbarActions.List) {
            this.SharedServices.changeToolbarPath({
              listPath: this.listUrl,
            } as ToolbarPath);
            this.router.navigate([this.listUrl]);
          } else if (currentBtn.action == ToolbarActions.Save) {
            this.onSave();
          } else if (currentBtn.action == ToolbarActions.New) {
            this.toolbarPathData.componentAdd = 'Add Role';
            this.defineRoleForm();
            this.SharedServices.changeToolbarPath(this.toolbarPathData);
          } else if (currentBtn.action == ToolbarActions.Update) {
            this.onUpdate();
          }
        }
      },
    });
    this.subsList.push(sub);
  }
  changePath() {
    this.SharedServices.changeToolbarPath(this.toolbarPathData);
  }
  onSave() {
    this.permissionSelectAll();
    if (this.roleForm.valid) {
      const promise = new Promise<void>((resolve, reject) => {
        this.roleForm.value.permissions = this.permission;
        this.roleService.createRole(this.roleForm.value).subscribe({
          next: (result: any) => {
            this.spinner.show();
            console.log('result dataaddData ', result);
            this.Response = { ...result.response };
            this.defineRoleForm();

            this.submited = false;
            setTimeout(() => {
              this.spinner.hide();

              navigateUrl(this.listUrl, this.router);
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


  onUpdate() {
    this.permissionSelectAll();
    if (this.roleForm.valid) {

      this.roleForm.value.id = this.id;

      this.roleForm.value.permissions = this.permission;
      console.log("this.VendorCommissionsForm.value", this.roleForm.value)
      const promise = new Promise<void>((resolve, reject) => {
        this.roleService.updateRole(this.roleForm.value).subscribe({
          next: (result: any) => {
            this.spinner.show();
            console.log('result update ', result);
            this.Response = { ...result.response };
            this.defineRoleForm();
            this.submited = false;
            setTimeout(() => {
              this.spinner.hide();

              navigateUrl(this.listUrl, this.router);
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
    }

    else {

      // return this.roleForm.markAllAsTouched();
    }
  }

  //#endregion
  //Permission region
  permission: any = [];
  lang = localStorage.getItem("language");
  columnNames = [
    this.lang == 'ar'
    ? { title: ' الشاشة', field: 'controllerNameAr',width:100} : { title: ' Name  Screen', field: 'controllerNameEn', width:100 },

    this.lang == 'ar'
      ? { title: 'اسم العملية ', field: 'actionNameAr', width:100 } : { title: ' Name Action  ', field: 'actionNameEn', width:100 },

  
    this.lang == "ar" ? {

      title: ' <input type="checkbox" class="select-all-row" aria-label="select all rows" />',

      headerSort: false,
      headerFilter: false,

      frozen: true,
      tooltips: false,
      resizable: false,
      field: "isChecked", formatter: function (cell, formatterParams) {

        var value = cell.getRow().getData();
          if (value.isChecked) {
            return `<input id= ${value.id} type='checkbox' checked/>`;
          } else {
            return `<input id= ${value.id} type='checkbox'/>`;
          }
      }, cellClick: (e, cell) => {
        debugger
        this.onCheckItem(cell.getRow().getData());
      }
    }
      :

      {
        title: '<input type="checkbox" id="all" class="select-all-row" aria-label="select all rows" />',

        headerSort: false,
        headerFilter: false,

        field: "isChecked", formatter: function (cell, formatterParams) {

          var value = cell.getRow().getData();
          if (value.isChecked) {
            return `<input id= ${value.id} type='checkbox' checked/>`;
          } else {
            return `<input id= ${value.id} type='checkbox'/>`;
          }
        }, cellClick: (e, cell) => {

          debugger
          this.onCheckItem(cell.getRow().getData());
        },
        headerClick: this.selectAll

      },

  ];
  exTable: any;
  filterParam: string = '';
  // permissionData=[]
  tab = document.createElement('div');
  drawTable() {
    this.exTable = new Tabulator(this.tab, {
      height: 130,
      layout: 'fitColumns',
      columns: this.columnNames,
      movableColumns: true,
      data: this.permission,
      //Local Pagination
      pagination: "local",
      paginationSize: 50,
      paginationSizeSelector: [5, 10, 20, 50, 100, 1000, 10000, 100000],

      paginationCounter: "rows",
    });
    //    this.exTable.setData(persons);
    document.getElementById('ex-table-div').appendChild(this.tab);
  }
  onCheckItem(item) {
    debugger
    let entity = this.permission.find(c => c.id == item.id);
    entity.isChecked = !entity.isChecked;
  }
  selectAll(e, column) {

    const all = document.getElementById('all') as HTMLInputElement;
    // all.onclick = (e) => this.onCheckItem(e);
    //  this.selectAll(all.checked)
    column.getCells().forEach(
      cell => {

        var value = cell.getData();
        const ele = document.getElementById(value.id) as HTMLInputElement;
        if (all.checked) {
          ele.checked = true;


        }

        else {
          ele.checked = false;


        }

      }
    );


  }
  permissionSelectAll() {
    debugger
    this.permission.forEach(
      cell => {


        const ele = document.getElementById(cell.id) as HTMLInputElement;
        if (ele.checked) {
          cell.isChecked = true;

        }

        else {
          cell.isChecked = false;


        }

      })
  }
}



