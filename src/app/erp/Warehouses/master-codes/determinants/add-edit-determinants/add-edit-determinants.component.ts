import { DeterminantsValueTypesArEnum, DeterminantsValueTypesEnEnum } from './../../../../../shared/constants/enumrators/enums';
import { DeterminantsDetail, DeterminantsMaster } from './../../../models/determinants';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToolbarPath } from 'src/app/shared/interfaces/toolbar-path';
import { PublicService } from 'src/app/shared/services/public.service';
import { DeterminantsServiceProxy } from '../../../Services/determinants-service';
import { SharedService } from 'src/app/shared/common-services/shared-service';
import { NotificationsAlertsService } from 'src/app/shared/common-services/notifications-alerts.service';
import { CODE_REQUIRED_VALIDATORS } from 'src/app/shared/constants/input-validators';
import { ToolbarData } from 'src/app/shared/interfaces/toolbar-data';
import { navigateUrl } from 'src/app/shared/helper/helper-url';
import { Subscription } from 'rxjs';
import { ToolbarActions } from 'src/app/shared/enum/toolbar-actions';
import { convertEnumToArray } from 'src/app/shared/constants/enumrators/enums';

@Component({
	selector: 'app-add-edit-determinants',
	templateUrl: './add-edit-determinants.component.html',
	styleUrls: ['./add-edit-determinants.component.scss']
})
export class AddEditDeterminantsComponent implements  OnInit, AfterViewInit {
	//#region Main Declarations
	determinantsForm: FormGroup = new FormGroup({});
	companyId: any = localStorage.getItem("companyId");

	showSearchAccountModal = false;
	determinantsMaster: DeterminantsMaster = new DeterminantsMaster();
	determinantsDetail: DeterminantsDetail[] = [];
	selectedDeterminantsDetail: DeterminantsDetail = new DeterminantsDetail();
	//valueType = ['Select of list', 'Number', 'Text', 'Date', 'Select Yes/No'];
	determinantsValueTypes=[]
	selectValueType: string;
	id: any = 0;
	currnetUrl;
	errorMessage = '';
	errorClass = '';
	lang = localStorage.getItem("language")

	submitMode: boolean = false;
	addUrl: string = '/warehouses-master-codes/determinants/add-determinants';
	updateUrl: string = '/warehouses-master-codes/determinants/update-determinants/';
	listUrl: string = '/warehouses-master-codes/determinants';
	toolbarPathData: ToolbarPath = {
	  listPath: '',
	  updatePath: this.updateUrl,
	  addPath: this.addUrl,
	  componentList: "component-names.determinants",
	  componentAdd: '',
  
	};
  
	constructor(
	  private router: Router,
	  private fb: FormBuilder,
	  private route: ActivatedRoute,
	  private spinner: NgxSpinnerService,
	  private translate: TranslateService,
	  private publicService: PublicService,
	  private determinantsService: DeterminantsServiceProxy,
	  private sharedService: SharedService,
	  private alertsService: NotificationsAlertsService,
  
	) {
	  this.defineDeterminantForm();
	  this.clearSelectedItemData();
	  this.determinantsDetail = [];
  
	}
	//#endregion
  
	//#region ngOnInit
	ngOnInit(): void {
	  this.spinner.show();
	  Promise.all([
		this.getDeterminantsValueTypes(),
  
	  ]).then(a => {
		this.getRouteData();
		this.changePath();
		this.listenToClickedButton();
	  }).catch((err) => {
  
		this.spinner.hide();
	  })
  
  
	}
	getRouteData() {
	  let sub = this.route.params.subscribe((params) => {
		if (params['id'] != null) {
		  this.id = params['id'];
		  if (this.id) {
			this.getDeterminantsById(this.id).then(a => {
			  this.spinner.hide();
			  this.sharedService.changeButton({ action: 'Update',submitMode:false } as ToolbarData);
  
			}).catch(err => {
			  this.spinner.hide();
  
			});
		  }
		  else {
			this.sharedService.changeButton({ action: 'New' } as ToolbarData);
			this.spinner.hide();
		  }
		}
		else {
		  this.getDeterminantCode();
		  this.sharedService.changeButton({ action: 'New' } as ToolbarData);
		  this.spinner.hide();
		}
	  });
	  this.subsList.push(sub);
  
	}
  
	//#endregion
	ngAfterViewInit(): void {
  
	}
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
  
	//#region Subscriptionss
  
	//#endregion
  
	//#region  State Management
	//#endregion
  
	//#region Basic Data
	///Geting form dropdown list data
	defineDeterminantForm() {
	  this.determinantsForm = this.fb.group({
		id: 0,
		code: CODE_REQUIRED_VALIDATORS,
		nameAr: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50)])],
		nameEn: '',
		valueType:'',
		status: true,
  
	  });
  
	}
	getDeterminantsValueTypes() {
		if (this.lang == 'en') {
		  this.determinantsValueTypes = convertEnumToArray(DeterminantsValueTypesEnEnum);
		}
		else {
		  this.determinantsValueTypes = convertEnumToArray(DeterminantsValueTypesArEnum);
	
		}
	  }
  
	//#region Helper Functions
  
	get f(): { [key: string]: AbstractControl } {
	  return this.determinantsForm.controls;
	}
  
  
	//#endregion
  
	getDeterminantsById(id: any) {
	  return new Promise<void>((resolve, reject) => {
		let sub = this.determinantsService.getDeterminant(id).subscribe({
		  next: (res: any) => {
			resolve();
			this.determinantsForm.setValue({
			  id: res.response.id,
			  code: res.response.code,
			  nameAr: res.response.nameAr,
			  nameEn: res.response?.nameEn,
			  valueType: res.response.valueType,
			  status: res.response?.status,
			});
			this.determinantsDetail = res.response?.determinantsDetails;
  
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
  
  
	getDeterminantCode() {
	  return new Promise<void>((resolve, reject) => {
		let sub = this.determinantsService.getLastCode().subscribe({
		  next: (res: any) => {
			resolve();
  
			this.determinantsForm.patchValue({
			  code: res.response
			});
  
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

  
  

  
	addItem() {
	  debugger
		
		this.determinantsDetail.push({
			id:0,
			nameAr:this.selectedDeterminantsDetail?.nameAr??'',
			nameEn:this.selectedDeterminantsDetail?.nameEn??'',
			determinantsMasterId:this.selectedDeterminantsDetail?.determinantsMasterId??0
		
		});
		this.determinantsMaster!.determinantsDetails = this.determinantsDetail;
		this.clearSelectedItemData();
	  

	}
	deleteItem(index) {
	  if (this.determinantsDetail.length) {
		if (this.determinantsDetail.length == 1) {
		  this.determinantsDetail = [];
		} else {
		  this.determinantsDetail.splice(index, 1);
		}
	  }
  
	  this.determinantsMaster.determinantsDetails = this.determinantsDetail;
  
  
	}
	clearSelectedItemData() {
	  this.selectedDeterminantsDetail = {
		id: 0,
		nameAr:'',
		nameEn:'',
		determinantsMasterId:0

  
	  }
	}
  
	setInputData() {
		debugger
	  this.determinantsMaster = {
		id: this.determinantsForm.controls["id"].value,
		code: this.determinantsForm.controls["code"].value,
		nameAr: this.determinantsForm.controls["nameAr"].value,
		nameEn: this.determinantsForm.controls["nameEn"].value,
		valueType: this.determinantsForm.controls["valueType"].value,
		status: this.determinantsForm.controls["status"].value,
		determinantsDetails: this.determinantsDetail ?? [],
  
	  };
  
  
	}
	confirmSave() {
		debugger
	  return new Promise<void>((resolve, reject) => {
		debugger
		let sub = this.determinantsService.createDeterminant(this.determinantsMaster).subscribe({
		  next: (result: any) => {
			this.defineDeterminantForm();
			this.clearSelectedItemData();
			this.determinantsDetail = [];
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
		debugger;
	  if (this.determinantsForm.valid) {
		if (this.determinantsMaster.determinantsDetails.length == 0) {
		  this.errorMessage = this.translate.instant("determinants.determinants-details-required");
		  this.errorClass = 'errorMessage';
		  this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
		  return;
		}
		this.setInputData();
		this.spinner.show();
		this.confirmSave().then(a => {
		  this.spinner.hide();
		}).catch(e => {
		  this.spinner.hide();
		});
	  }
	  else {
		this.errorMessage = this.translate.instant("validation-messages.invalid-data");
		this.errorClass = 'errorMessage';
		this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
		return this.determinantsForm.markAllAsTouched();
  
	  }
	}
	confirmUpdate() {
	  return new Promise<void>((resolve, reject) => {
		let sub = this.determinantsService.updateDeterminants(this.determinantsMaster).subscribe({
		  next: (result: any) => {
			this.defineDeterminantForm();
			this.clearSelectedItemData();
			this.determinantsDetail = [];
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
  
	  if (this.determinantsForm.valid) {
		debugger
		if (this.determinantsDetail.length == 0) {
		  this.errorMessage = this.translate.instant("determinants.determinants-details-required");
		  this.errorClass = 'errorMessage';
		  this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
		  return;
		}
		this.setInputData();
		this.spinner.show();
		this.confirmUpdate().then(a => {
		  this.spinner.hide();
		}).catch(e => {
		  this.spinner.hide();
		});
	  }
	  else {
		// this.errorMessage = this.translate.instant("validation-messages.invalid-data");
		// this.errorClass = 'errorMessage';
		// this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
		return this.determinantsForm.markAllAsTouched();
  
	  }
	}
	//#region Tabulator
	subsList: Subscription[] = [];
	currentBtnResult;
	listenToClickedButton() {
	  let sub = this.sharedService.getClickedbutton().subscribe({
		next: (currentBtn: ToolbarData) => {
		  currentBtn;
  
		  if (currentBtn != null) {
			if (currentBtn.action == ToolbarActions.List) {
			  this.sharedService.changeToolbarPath({
				listPath: this.listUrl,
			  } as ToolbarPath);
			  this.router.navigate([this.listUrl]);
			} else if (currentBtn.action == ToolbarActions.Save) {
			  this.onSave();
			} else if (currentBtn.action == ToolbarActions.New) {
			  this.toolbarPathData.componentAdd = this.translate.instant('determinants.add-determinant');
			  this.defineDeterminantForm();
			  this.clearSelectedItemData();
			  this.determinantsDetail = [];
  
			  this.sharedService.changeToolbarPath(this.toolbarPathData);
			} else if (currentBtn.action == ToolbarActions.Update && currentBtn.submitMode) {
  
			  this.onUpdate();
	
			}
		  }
		},
	  });
	  this.subsList.push(sub);
	}
	changePath() {
	  this.sharedService.changeToolbarPath(this.toolbarPathData);
	}

  

}
