import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { CODE_REQUIRED_VALIDATORS, NAME_REQUIRED_VALIDATORS } from '../../../../../shared/constants/input-validators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToolbarPath } from '../../../../../shared/interfaces/toolbar-path';
import { SharedService } from '../../../../../shared/common-services/shared-service';
import { TranslateService } from '@ngx-translate/core';
import { ToolbarData } from '../../../../../shared/interfaces/toolbar-data';
import { ToolbarActions } from '../../../../../shared/enum/toolbar-actions';
import { navigateUrl } from '../../../../../shared/helper/helper-url';
import { CostCenterDto, CreateCostCenterCommand, EditCostCenterCommand } from '../../../models/cost-Center';
import { CostCenterServiceProxy } from '../../../services/cost-Center.services';
import { CompanyDto } from 'src/app/erp/master-codes/models/company';
import { CompanyServiceProxy } from 'src/app/erp/master-codes/services/company.service';
@Component({
  selector: 'app-add-edit-cost-center',
  templateUrl: './add-edit-cost-center.component.html',
  styleUrls: ['./add-edit-cost-center.component.scss']
})
export class AddEditCostCenterComponent implements OnInit {
  //#region Main Declarations
  costCenterForm!: FormGroup;
  sub: any;
  url: any;
  id: any = 0;
  currnetUrl;
  public show: boolean = false;
  lang = localStorage.getItem("language")
  addUrl: string = '/accounting-master-codes/costCenter/add-costCenter';
  addParentUrl: string = '/accounting-master-codes/costCenter/add-costCenter/';
  updateUrl: string = '/accounting-master-codes/costCenter/update-costCenter/';
  listUrl: string = '/accounting-master-codes/costCenter';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.costCenter"),
    componentAdd: '',

  };
  response: any;
  errorMessage = '';
  errorClass = '';
  submited: boolean = false;
  costCenterList: CostCenterDto[] = [];
  files: any;
  logoPath: string;
  fullPathUpdate: string;
  logo: any;
  showSearchModal = false;
  showSearchModalCompanyy = false;
  parentId: any;
  companyList: CompanyDto[] = [];
  routeApi = 'CostCenter/get-ddl?'
  companyId: any;
  routeCompanyApi = 'Company/get-ddl?'
  constructor(private companyService: CompanyServiceProxy,
    private costCenterService: CostCenterServiceProxy,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private sharedServices: SharedService, private translate: TranslateService,
    private modelService: NgbModal,
    private cd: ChangeDetectorRef

  ) {
    this.definecostCenterForm();
  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    this.spinner.show();
    Promise.all([
      this.getCompanies(),
      this.getCostCenter()
    ]).then(a => {
      this.getRouteData();
      this.currnetUrl = this.router.url;
      if (this.currnetUrl == this.addUrl) {
        this.getCostCenterCode();
      }
      this.changePath();
      this.listenToClickedButton();
    }).catch(err => {
      this.spinner.hide();
    });


  }
  getRouteData() {
    let sub = this.route.params.subscribe((params) => {
      if (params['id'] != null) {
        this.id = params['id'];

        if (this.id > 0) {
          this.getCostCenterById(this.id).then(a => {
            
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
        this.spinner.hide();
        this.sharedServices.changeButton({ action: 'New' } as ToolbarData);
      }
      if (params['parentId'] != null) {
        this.parentId = params['parentId'];

        this.getCostCenterCode();
      }
    });
    this.subsList.push(sub);

  }
  onSelectCostCenter(event) {

    this.parentId = event.id;
    this.costCenterForm.controls.parentId.setValue(event.id);
    this.showSearchModal = false;
  }
  getCompanies() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.companyService.getDdl().subscribe({
        next: (res) => {

          if (res.success) {
            this.companyList = res.response;

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
  definecostCenterForm() {
    this.costCenterForm = this.fb.group({
      id: 0,
      nameAr: NAME_REQUIRED_VALIDATORS,
      nameEn: null,
      code: CODE_REQUIRED_VALIDATORS,
      isActive: true,
      parentId: null,
      companyId: null
    });

  }

  getCostCenter() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.costCenterService.getDdl().subscribe({
        next: (res) => {

          if (res.success) {
            this.costCenterList = res.response;

          }
          if (this.parentId != undefined || this.parentId != null) {
            this.costCenterForm.controls.parentId.setValue(Number(this.parentId));
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
  getCostCenterById(id: any) {
   
    return new Promise<void>((resolve, reject) => {
      let sub = this.costCenterService.getCostCenter(id).subscribe({
        next: (res: any) => {
          resolve();
          
          this.costCenterForm.setValue({
            id: res.response?.id,
            nameAr: res.response?.nameAr,
            nameEn: res.response?.nameEn,
            code: res.response?.code,
            isActive: res.response?.isActive,
            parentId: res.response?.parentId,
            companyId: res.response?.companyId

          });

        
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

  getCostCenterCode() {

    return new Promise<void>((resolve, reject) => {

      let sub = this.costCenterService.getLastCode(this.parentId).subscribe({

        next: (res: any) => {

          this.toolbarPathData.componentList = this.translate.instant("component-names.costCenter");
          this.costCenterForm.patchValue({
            code: res.response
          });


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
    return this.costCenterForm.controls;
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
          } else if (currentBtn.action == ToolbarActions.New || this.currnetUrl == this.addParentUrl) {
            this.toolbarPathData.componentAdd = 'Add costCenter';
            this.definecostCenterForm();
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
    var entity = new CreateCostCenterCommand();
    return new Promise<void>((resolve, reject) => {
      entity.inputDto = this.costCenterForm.value;
      
      let sub = this.costCenterService.createCostCenter(entity).subscribe({
        next: (result: any) => {
          this.spinner.show();
          console.log('result dataaddData ', result);
          this.response = { ...result.response };
          this.definecostCenterForm();

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
    if (this.costCenterForm.valid) {
      this.spinner.show();
      this.confirmSave().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });

    } else {

      return this.costCenterForm.markAllAsTouched();
    }
  }
  confirmUpdate() {
    var entity = new EditCostCenterCommand();
    this.costCenterForm.value.id = this.id;
    entity.inputDto = this.costCenterForm.value;
    entity.inputDto.id = this.id;

    return new Promise<void>((resolve, reject) => {
      let sub = this.costCenterService.updateCostCenter(entity).subscribe({
        next: (result: any) => {
          this.spinner.show();
          this.response = { ...result.response };
          this.definecostCenterForm();
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
    if (this.costCenterForm.valid) {
      this.spinner.show();
      this.confirmUpdate().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });

    }

    else {

       return this.costCenterForm.markAllAsTouched();
    }
  }
  onSelectCompany(event) {

    this.companyId = event.id;
    this.costCenterForm.controls.companyId.setValue(event.id);
    this.showSearchModalCompanyy = false;
  }

}

