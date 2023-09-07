import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SharedService } from '../../../../shared/common-services/shared-service';
import { ToolbarPath } from '../../../../shared/interfaces/toolbar-path';
import { NgxSpinnerService } from 'ngx-spinner';
import { CODE_REQUIRED_VALIDATORS, NAME_REQUIRED_VALIDATORS } from '../../../../shared/constants/input-validators';
import { Subscription } from 'rxjs';
import { ToolbarData } from '../../../../shared/interfaces/toolbar-data';
import { ToolbarActions } from '../../../../shared/enum/toolbar-actions';
import { navigateUrl } from '../../../../shared/helper/helper-url';
import { RoleServiceProxy } from '../../services/role.servies'
import { RoleDto } from '../../models/role';
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
    componentList: this.translate.instant("component-names.roles-permissions"),
    componentAdd: '',

  };
  response: any;
  errorMessage = '';
  errorClass = '';
  submited: boolean = false;
  modulesType: {}[];
  screensList: any;
  constructor(
    private roleService: RoleServiceProxy,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private sharedServices: SharedService, private translate: TranslateService,
  ) {
    this.defineRoleForm();
  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    this.getModulesType();
    this.spinner.show();
    this.getRouteData();
    this.changePath();
    this.listenToClickedButton();
    this.currnetUrl = this.router.url;
    if (this.currnetUrl == this.addUrl) {
      this.getRoleCode();
    }
    this.spinner.hide();

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
  getRouteData() {
    let sub = this.route.params.subscribe((params) => {
      if (params['id'] != null) {
        this.id = params['id'];

        if (this.id) {
          this.getRoleById(this.id).then(a => {

            this.spinner.hide();

          }).catch(err => {
            this.spinner.hide();

          });
        }
        else {
          this.sharedServices.changeButton({ action: 'New' } as ToolbarData);
          this.spinner.hide();
        }
      }
      else {
        this.sharedServices.changeButton({ action: 'New' } as ToolbarData);
        this.spinner.hide();
      }
    });
    this.subsList.push(sub);
  }
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
    return new Promise<void>((resolve, reject) => {
      let sub = this.roleService.getRole(id).subscribe({
        next: (res: any) => {
          resolve();
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
          this.screens = res.response?.screens;
          this.screensList = res.response?.screens;

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

  getRoleCode() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.roleService.getLastCode().subscribe({

        next: (res: any) => {

          this.toolbarPathData.componentList = this.translate.instant("component-names.roles-permissions");
          this.roleForm.patchValue({
            code: res.response.code
          });

          this.permission = res.response.permissions
          this.screens = res.response.screens;

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

  //#region Helper Functions

  get f(): { [key: string]: AbstractControl } {
    return this.roleForm.controls;
  }


  //#endregion
  //#region Tabulator
  subsList: Subscription[] = [];
  currentBtnResult;
  listenToClickedButton() {
    let sub = this.sharedServices.getClickedbutton().subscribe({
      next: (currentBtn: ToolbarData) => {
        currentBtn;

        if (currentBtn != null) {
          if (currentBtn.action == ToolbarActions.List) {
            this.sharedServices.changeToolbarPath({
              listPath: this.listUrl,
            } as ToolbarPath);
            this.router.navigate([this.listUrl]);
          } else if (currentBtn.action == ToolbarActions.Save) {
            this.onSave();
          } else if (currentBtn.action == ToolbarActions.New) {
            this.toolbarPathData.componentAdd = this.translate.instant("user-manager.add-role");
            this.defineRoleForm();
            this.sharedServices.changeToolbarPath(this.toolbarPathData);
          } else if (currentBtn.action == ToolbarActions.Update) {
            this.onUpdate();
          }
        }
      },
    });
    this.subsList.push(sub);
  }
  changePath() {
    this.sharedServices.changeToolbarPath(this.toolbarPathData);
  }
  confirmSave() {
    return new Promise<void>((resolve, reject) => {
      this.roleForm.value.permissions = this.permission;
      let sub = this.roleService.createRole(this.roleForm.value).subscribe({
        next: (result: any) => {
          this.spinner.show();
          this.response = { ...result.response };
          this.defineRoleForm();

          this.submited = false;
          this.spinner.hide();

          navigateUrl(this.listUrl, this.router);
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
  onSave() {
    if (this.roleForm.valid) {
      this.spinner.show();
      this.confirmSave().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });

    } else {

      return this.roleForm.markAllAsTouched();
    }
  }
  confirmUpdate() {
    this.roleForm.value.id = this.id;
    this.roleForm.value.permissions = this.permission;
    return new Promise<void>((resolve, reject) => {
      let sub = this.roleService.updateRole(this.roleForm.value).subscribe({
        next: (result: any) => {
          this.response = { ...result.response };
          this.defineRoleForm();
          this.submited = false;
          this.spinner.hide();
          navigateUrl(this.listUrl, this.router);
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

  onUpdate() {
    if (this.roleForm.valid) {
      this.spinner.show();
      this.confirmUpdate().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });

    }

    else {

      return this.roleForm.markAllAsTouched();
    }
  }

  //#endregion
  //Permission region
  permission: any = [];
  screens: any = [];
  lang = localStorage.getItem("language");
  masterSelected = false;
  searchText: string;
  checkUncheckAll(evt) {

    this.screens.forEach(
      item => item.permissions.forEach(
        (c) => {

          c.isChecked = evt.target.checked;
          let entity = this.permission.find(x => x.id == c.id);
          entity.isChecked = evt.target.checked;
        }
      )

    )
    // this.permission.forEach((c) => c.isChecked = evt.target.checked)
  }

  updateCheckedOptions(item, evt) {

    // this.permission[item.id].isChecked = evt.target.checked
    let entity = this.permission.find(c => c.id == item.id);
    entity.isChecked = evt.target.checked;
    //  this.masterSelected = this.permission.every((item) => item.isChecked == true);
  }


  getModulesType() {
    this.modulesType = [
      { descriptionAr: 'اعددات', descriptionEn: 'Settings', value: '0' },
      { descriptionAr: 'مبيعات', descriptionEn: 'Sales', value: '1' },
      { descriptionAr: "إدارة علاقات العملاء", descriptionEn: 'CRM', value: '2' },
      { descriptionAr: "رواتب", descriptionEn: 'Payroll', value: '3', },
      { descriptionAr: "مشتريات", descriptionEn: 'Purchase', value: '4' },
      { descriptionAr: "محاسبة", descriptionEn: 'Accounting', value: '5' }
    ];
  }
  onChange(event) {
    this.screens = this.screensList.filter(x => x.moduleType == Number(event));

  }


}



