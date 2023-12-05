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
import { BillsRolePermissionsVm, RoleDto, VouchersRolePermissionsVm } from '../../models/role';
import { SubscriptionService } from 'src/app/shared/components/layout/subscription/services/subscription.services';
import { VoucherTypeServiceProxy } from 'src/app/erp/Accounting/services/voucher-type.service';
import { BillTypeServiceProxy } from 'src/app/erp/Warehouses/Services/bill-type.service';
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
  vouchersRolePermissions:VouchersRolePermissionsVm[]=[]
  billsRolesPermissions:BillsRolePermissionsVm[]=[]
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
  modulesType: any;
  screensList: any;
  applications: { descriptionAr: string; descriptionEn: string; value: string; check: boolean; image: string; link: string; }[];
  applicationsRoute: any[];
  constructor(
    private roleService: RoleServiceProxy,
    private router: Router,
	private billTypeService: BillTypeServiceProxy,
    private fb: FormBuilder,
    private voucherTypeService: VoucherTypeServiceProxy,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private sharedServices: SharedService, private translate: TranslateService, public service: SubscriptionService,
  ) {
    this.defineRoleForm();
  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    
    this.spinner.show();
    this.currnetUrl = this.router.url;
    if (this.currnetUrl == this.addUrl) {
      this.getRoleCode();
    }
    this.getLastSubscription();
    Promise.all([
      this.getVoucherTypes(),
	  this.getBillTypes()
    ]).then(a => {
      debugger
      this.preparePermissions();
      this.getRouteData();
      this.changePath();
      this.listenToClickedButton();
    })
      .catch(e => {
  
        this.spinner.hide();
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
	getApplications() {
		this.applications = [
			{ descriptionAr: 'اعددات', descriptionEn: 'Settings', value: '0', check: false, image: 'assets/images/applications/settings.png', link: '/dashboard/default' },
			{ descriptionAr: 'نقط البيع', descriptionEn: 'POS', value: '1', check: true, image: 'assets/images/applications/pos.png', link: '/dashboard/default' },
			{ descriptionAr: "إدارة علاقات العملاء", descriptionEn: 'CRM', value: '2', check: false, image: 'assets/images/applications/crm.png', link: '/dashboard/default' },
			{ descriptionAr: "رواتب", descriptionEn: 'Payroll', value: '3', check: false, image: 'assets/images/applications/payroll.png', link: '/dashboard/default' },
			{ descriptionAr: "مشتريات", descriptionEn: 'Purchase', value: '4', check: false, image: 'assets/images/applications/purchase.png', link: '/dashboard/default' },
			{ descriptionAr: "محاسبة", descriptionEn: 'Accounting', value: '5', check: false, image: 'assets/images/applications/account.png', link: '/dashboard/default' },
			{ descriptionAr: "مستودعات", descriptionEn: 'Warehouses', value: '6', check: false, image: 'assets/images/applications/warehouses.png', link: '/dashboard/default' },

		];
	}
	getLastSubscription() {

		this.service.getLastSubscription().subscribe(
			next => {


				if (next.success == true) {
					this.getApplications();
					//   this.router.navigate(['/dashboard/default']);
					if (next.response != null) {
						this.applicationsRoute = [...next.response?.applications?.split(",")]
						for (var i = 0; i < this.applications.length; i++) {

							var find = this.applicationsRoute.includes(this.applications[i].value);

							if (find) {

								this.applications[i].check = true;

							}

						}
					}

					this.modulesType = this.applications.filter(c => c.check == true)
				}
			},
			error => {


			}
		)

  }
    voucherTypes: any[] = [];
  getVoucherTypes() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.voucherTypeService.allVoucherTypees(undefined, undefined, undefined, undefined, undefined).subscribe({
        next: (res) => {
          if (res.success) {
         
            this.voucherTypes = res.response.items

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
  billTypes: any[] = [];
  getBillTypes() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.billTypeService.allBillTypees(undefined, undefined, undefined, undefined, undefined).subscribe({
        next: (res) => {
          if (res.success) {
            this.billTypes = res.response.items
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
  getRouteData() {
    let sub = this.route.params.subscribe((params) => {
      if (params['id'] != null) {
        this.id = params['id'];
        if (this.id) {
          this.getRoleById(this.id).then(a => {
			this.getRoleVoucherPermissions();
			this.getRoleBillssPermissions();


			this.sharedServices.changeButton({ action: 'Update',submitMode:false } as ToolbarData);
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
					debugger
					
					this.permission = res.response?.permissions?.items;
					this.screens = res.response?.screens;
					this.screensList = res.response?.screens;
					const moduleTypeToFilter = this.modulesType.map(module => Number(module.value));
					this.permission = res.response?.permissions?.items;
					this.screens = res.response?.screens.filter(screenDto => moduleTypeToFilter.includes(screenDto.moduleType));
					this.screensList = res.response?.screens.filter(screenDto => moduleTypeToFilter.includes(screenDto.moduleType));
					this.vouchersRolePermissionsList = res.response?.vouchersRolesPermissions;
					this.billsPermissionsList = res.response?.billsRolesPermissions;

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
          const moduleTypeToFilter = this.modulesType.map(module => Number(module.value));
          // this.permission = res.response?.permissions?.items;
          this.screens = res.response?.screens.filter(screenDto => moduleTypeToFilter.includes(screenDto.moduleType));
          //  this.screensList = res.response?.screens.filter(screenDto => moduleTypeToFilter.includes(screenDto.moduleType));


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
					} else if (currentBtn.action == ToolbarActions.Update && currentBtn.submitMode) {
						this.onUpdate();
					}
					else if (currentBtn.action == ToolbarActions.Copy) {
						this.getRoleCode();
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
			this.setBillsTypesPermissions();
			this.setVouchersRolePermissions();
			debugger
			let sub = this.roleService.createRole(this.roleForm.value).subscribe({
				next: (result: any) => {
					this.spinner.show();
					this.defineRoleForm();

					this.submited = false;
					this.spinner.hide();

					navigateUrl(this.listUrl, this.router);
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
		this.setBillsTypesPermissions();
		this.setVouchersRolePermissions();
		return new Promise<void>((resolve, reject) => {
			let sub = this.roleService.updateRole(this.roleForm.value).subscribe({
				next: (result: any) => {
					this.defineRoleForm();
					this.submited = false;
					this.spinner.hide();
					navigateUrl(this.listUrl, this.router);
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
		// evt.isChecked = true;
		if (this.screens != null) {
			this.screens.forEach(
				item => item.permissions.forEach(
					(c) => {

						c.isChecked = evt.target.checked;
						let entity = this.permission.find(x => x.id == c.id);
						entity.isChecked = evt.target.checked;
					}
				)
			)
			this.screens.forEach(item => {
				item.isChecked = evt.target.checked
			})
			this.onSelecetAllVoucherTypesPermissions(evt);
			this.onSelecetAllBillsTypesPermissions(evt)
		}

		// this.permission.forEach((c) => c.isChecked = evt.target.checked)
	}

	updateCheckedOptions(item, evt) {

		// this.permission[item.id].isChecked = evt.target.checked
		let entity = this.permission.find(c => c.id == item.id);
		entity.isChecked = evt.target.checked;
		//  this.masterSelected = this.permission.every((item) => item.isChecked == true);
	}
	updateCheckedOption(item, evt) {

		// this.permission[item.id].isChecked = evt.target.checked
		item.permissions.forEach(
			(c) => {

				c.isChecked = evt.target.checked;
				let entity = this.permission.find(x => x.id == c.id);
				entity.isChecked = evt.target.checked;
			}
		)


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

		if (this.screensList != undefined) {

			this.screens = this.screensList.filter(x => x.moduleType == Number(event));

		}

  }
  preparePermissions() {
 
    this.voucherTypes.forEach(c => {
      this.vouchersRolePermissions.push({
        voucherTypeId: c.id,
        isUserChecked: false,
        id: c.id,
        permissionsJson: JSON.parse(`{"isAdd":false, "isUpdate":false,"isDelete":false, "isShow":false,"isPrint":false}`),
        roleId: 0,
        voucherArName: c.nameAr,
        voucherEnName: c.nameEn


      });
    });


    this.billTypes.forEach(c => {
      this.billsRolesPermissions.push({
        billTypeId: c.id,
        isUserChecked: false,
        id: c.id,
        permissionsJson: JSON.parse(`{"isAdd":false,"isUpdate":false,"isDelete":false,"isShow":false}`),
        roleId: 0,
        billArName: c.nameAr,
        billEnName: c.nameEn,
      });
    });




  }
  onCheckboxBillTypesChange(e: any, billsPermissions: BillsRolePermissionsVm, key) {
    
    billsPermissions.permissionsJson[key] = e.target.checked;

  }
  onSelecetPageAllBillsTypePermissions(event, billsPermissions: BillsRolePermissionsVm) {
    
    billsPermissions.isUserChecked = event.target.checked;
    for (let [key, value] of Object.entries(billsPermissions.permissionsJson)) {
    
		billsPermissions.permissionsJson[key] = event.target.checked;
    }



  }
  onCheckboxVouchersTypesChange(e: any, voucherPermissions: VouchersRolePermissionsVm, key) {
    
    voucherPermissions.permissionsJson[key] = e.target.checked;

  }
  onSelecetAllVouchersRolePermissions(event, voucherPermissions: VouchersRolePermissionsVm) {
    
    voucherPermissions.isUserChecked = event.target.checked;
    for (let [key, value] of Object.entries(voucherPermissions.permissionsJson)) {
    
		voucherPermissions.permissionsJson[key] = event.target.checked;
    }



  }
  billsPermissionsList:BillsRolePermissionsVm[]=[];
  setBillsTypesPermissions(){
	debugger;
	this.roleForm.value.billsRolesPermissions=[];
	this.billsPermissionsList=[];
    this.billsRolesPermissions.forEach(a => {
		this.billsPermissionsList.push({
        billTypeId: a.billTypeId,
		billArName:a.billArName,
		billEnName:a.billEnName,
		roleId:a.roleId,
        id: 0,
        isUserChecked: a.isUserChecked,
        permissionsJson: JSON.stringify(a.permissionsJson),
      });
    });
	this.roleForm.value.billsRolesPermissions = this.billsPermissionsList;
  }
  vouchersRolePermissionsList:VouchersRolePermissionsVm[]=[];
  setVouchersRolePermissions(){
	debugger;
	this.roleForm.value.vouchersRolePermissions=[];
	this.vouchersRolePermissionsList=[];
    this.vouchersRolePermissions.forEach(a => {
		this.vouchersRolePermissionsList.push({
        voucherTypeId: a.voucherTypeId,
		voucherArName:a.voucherArName,
		voucherEnName:a.voucherEnName,
		roleId:a.roleId,
        id: 0,
        isUserChecked: a.isUserChecked,
        permissionsJson: JSON.stringify(a.permissionsJson),
      });
    });
	this.roleForm.value.vouchersRolesPermissions = this.vouchersRolePermissionsList;
  }
  getRoleVoucherPermissions() {

    if (this.role) {
      if (this.vouchersRolePermissions) {
        this.vouchersRolePermissionsList.forEach(x => {

          let c = this.vouchersRolePermissions.find(a => a.voucherTypeId == x.voucherTypeId);

          if (c) {
            c.permissionsJson = JSON.parse(x.permissionsJson);
			c.isUserChecked=x.isUserChecked;
          }
        })
      }


    }
}

	getRoleBillssPermissions() {
	
		if (this.role) {
		  if (this.billsPermissionsList) {
			this.billsPermissionsList.forEach(x => {
	
			  let c = this.billsRolesPermissions.find(a => a.billTypeId == x.billTypeId);
	
			  if (c) {
				c.permissionsJson = JSON.parse(x.permissionsJson);
				c.isUserChecked=x.isUserChecked;
			  }
			})
		  }
	
	
		}
  }
  onSelecetAllVoucherTypesPermissions(event) {
    const checkAllPerPage = document.getElementsByClassName('choose-all-voucher-type') as HTMLCollectionOf<HTMLInputElement>;
    if (event.target.checked) {
      for (let i = 0; i < checkAllPerPage.length; i++) {
        checkAllPerPage[i].checked = true
      }
    }

    if (!event.target.checked) {
      for (let i = 0; i < checkAllPerPage.length; i++) {
        checkAllPerPage[i].checked = false
      }
    }

    this.vouchersRolePermissions.forEach(c => {
      for (let [key, value] of Object.entries(c.permissionsJson)) {
        c.permissionsJson[key] = event.target.checked;
        c.isUserChecked = event.target.checked;
      }


    });

  }
  onSelecetAllBillsTypesPermissions(event) {
    const checkAllPerPage = document.getElementsByClassName('choose-all-bill-type') as HTMLCollectionOf<HTMLInputElement>;
    if (event.target.checked) {
      for (let i = 0; i < checkAllPerPage.length; i++) {
        checkAllPerPage[i].checked = true
      }
    }

    if (!event.target.checked) {
      for (let i = 0; i < checkAllPerPage.length; i++) {
        checkAllPerPage[i].checked = false
      }
    }

    this.billsRolesPermissions.forEach(c => {
      for (let [key, value] of Object.entries(c.permissionsJson)) {
        c.permissionsJson[key] = event.target.checked;
        c.isUserChecked = event.target.checked;
      }


    });

  }

}



