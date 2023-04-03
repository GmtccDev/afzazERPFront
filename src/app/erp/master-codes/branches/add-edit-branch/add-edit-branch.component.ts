import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SharedService } from '../../../../shared/common-services/shared-service';
import { ToolbarPath } from '../../../../shared/interfaces/toolbar-path';
import { NgxSpinnerService } from 'ngx-spinner';
import { CODE_REQUIRED_VALIDATORS, EMAIL_VALIDATORS, NAME_REQUIRED_VALIDATORS, PHONE_VALIDATORS, REQUIRED_VALIDATORS } from '../../../../shared/constants/input-validators';
import { Subscription } from 'rxjs';
import { ToolbarData } from '../../../../shared/interfaces/toolbar-data';
import { ToolbarActions } from '../../../../shared/enum/toolbar-actions';
import { navigateUrl } from '../../../../shared/helper/helper-url';
import { BranchServiceProxy } from '../../services/branch.service'
import { BranchDto, CreateBranchCommand, EditBranchCommand } from '../../models/branch';
import { CountryServiceProxy } from '../../../master-codes/services/country.servies';
import { CountryDto } from '../../../master-codes/models/country';
import { CompanyServiceProxy } from '../../../master-codes/services/company.service';
import * as Tabulator from 'tabulator-tables/dist/js/tabulator';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MessageModalComponent } from 'src/app/shared/components/message-modal/message-modal.component';
import format from 'date-fns/format';
import { CompanyDto } from '../../models/company';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-add-edit-branch',
  templateUrl: './add-edit-branch.component.html',
  styleUrls: ['./add-edit-branch.component.scss']
})
export class AddEditBranchComponent implements OnInit {
  //#region Main Declarations
  branchForm!: FormGroup;
  sub: any;
  url: any;
  id: any = 0;
  currnetUrl;
  public show: boolean = false;
  lang = localStorage.getItem("language")
  branch: BranchDto[] = [];
  addUrl: string = '/master-codes/branches/add-branch';
  updateUrl: string = '/master-codes/branches/update-branch/';
  listUrl: string = '/master-codes/branches';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.branch"),
    componentAdd: '',

  };
  Response: any;
  errorMessage = '';
  errorClass = '';
  submited: boolean = false;
  countriesList: CountryDto[] = [];
  companyList: CompanyDto[] = [];
  files: any;
  logoPath: string;
  fullPathUpdate: string;
  logo: any;
  showSearchModal = false;
  showSearchModalCountry=false;
  companyId: any;
  routeApi='Company/get-ddl?'
  routeApiCountry='Country/get-ddl?'
  constructor(
    private countryService: CountryServiceProxy,
    private companyService: CompanyServiceProxy,
    private branchService: BranchServiceProxy,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private sharedServices: SharedService, private translate: TranslateService,
    private modelService: NgbModal,
    private cd: ChangeDetectorRef

  ) {
    this.definebranchForm();
  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {

    this.getCountries();
    this.getCompanies();
    this.currnetUrl = this.router.url;
    this.listenToClickedButton();
    this.changePath();
    if (this.currnetUrl == this.addUrl) {
      this.getbranchCode();
    }
    this.sub = this.route.params.subscribe((params) => {
      if (params['id'] != null) {
        this.id = params['id'];

        if (this.id) {
          this.getbranchById(this.id);
        }
        this.url = this.router.url.split('/')[2];
      }
    });
  }
  onSelectCompany(event) {
debugger
    this.companyId = event.id;
    this.branchForm.controls.companyId.setValue(event.id);
    this.showSearchModal = false;
  }
  onSelectCountry(event) {
    debugger
       
        this.branchForm.controls.countryId.setValue(event.id);
        this.showSearchModalCountry = false;
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
  definebranchForm() {
    this.branchForm = this.fb.group({
      id: 0,
      nameAr: NAME_REQUIRED_VALIDATORS,
      nameEn: null,
      code: CODE_REQUIRED_VALIDATORS,
      isActive: true,
      phoneNumber: null,
      countryId: null,
      companyId: null,
      address:null
    });

  }
  getCountries() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.countryService.getDdl().subscribe({
        next: (res) => {

          if (res.success) {
            this.countriesList = res.response;

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

  //#region CRUD Operations
  getbranchById(id: any) {

    const promise = new Promise<void>((resolve, reject) => {
      this.branchService.getBranch(id).subscribe({
        next: (res: any) => {
          
          this.branchForm.setValue({
            id: res.response?.id,
            nameAr: res.response?.nameAr,
            nameEn: res.response?.nameEn,
            code: res.response?.code,
            isActive: res.response?.isActive,
            phoneNumber: res.response?.phoneNumber,
            countryId: res.response?.countryId,
            companyId: res.response?.companyId,
            address:res.response?.address

          });

          console.log(
            'this.branchForm.value set value',
            this.branchForm.value
          );
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
  showPassword() {
    this.show = !this.show;
  }
  getbranchCode() {
    const promise = new Promise<void>((resolve, reject) => {

      this.branchService.getLastCode().subscribe({

        next: (res: any) => {

          this.toolbarPathData.componentList = this.translate.instant("component-names.branch");
          this.branchForm.patchValue({
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
    });
  }
  //#endregion

  //#region Helper Functions

  get f(): { [key: string]: AbstractControl } {
    return this.branchForm.controls;
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
            this.toolbarPathData.componentAdd = 'Add branch';
            this.definebranchForm();
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
  onSave() {
    var entity = new CreateBranchCommand();
    if (this.branchForm.valid) {
      const promise = new Promise<void>((resolve, reject) => {
        entity.inputDto = this.branchForm.value;
       
        this.branchService.createBranch(entity).subscribe({
          next: (result: any) => {
            this.spinner.show();
            console.log('result dataaddData ', result);
            this.Response = { ...result.response };
            this.definebranchForm();

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

      //  return this.branchForm.markAllAsTouched();
    }
  }


  onUpdate() {
    var entity = new EditBranchCommand();
    if (this.branchForm.valid) {

      this.branchForm.value.id = this.id;
      entity.inputDto = this.branchForm.value;
      entity.inputDto.id = this.id;
     
      console.log("this.VendorCommissionsForm.value", this.branchForm.value)
      const promise = new Promise<void>((resolve, reject) => {

        this.branchService.updateBranch(entity).subscribe({
          next: (result: any) => {
            this.spinner.show();
            console.log('result update ', result);
            this.Response = { ...result.response };
            this.definebranchForm();
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

      // return this.branchForm.markAllAsTouched();
    }
  }
 

}

