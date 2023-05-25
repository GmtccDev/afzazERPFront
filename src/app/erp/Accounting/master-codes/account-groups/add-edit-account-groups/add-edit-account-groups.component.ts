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
import { AccountGroupDto, CreateAccountGroupCommand, EditAccountGroupCommand } from '../../../models/account-group';
import { AccountGroupServiceProxy } from '../../../services/account-group.services';
@Component({
  selector: 'app-add-edit-account-groups',
  templateUrl: './add-edit-account-groups.component.html',
  styleUrls: ['./add-edit-account-groups.component.scss']
})
export class AddEditAccountGroupsComponent implements OnInit {
  //#region Main Declarations
  accountGroupForm!: FormGroup;
  sub: any;
  url: any;
  id: any = 0;
  currnetUrl;
  public show: boolean = false;
  lang = localStorage.getItem("language")
  addUrl: string = '/accounting-master-codes/accountGroup/add-accountGroup';
  addParentUrl: string = '/accounting-master-codes/accountGroup/add-accountGroup/';
  updateUrl: string = '/accounting-master-codes/accountGroup/update-accountGroup/';
  listUrl: string = '/accounting-master-codes/accountGroup';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.accountGroup"),
    componentAdd: '',

  };
  Response: any;
  errorMessage = '';
  errorClass = '';
  submited: boolean = false;
  accountGroupList: AccountGroupDto[] = [];
  files: any;
  logoPath: string;
  fullPathUpdate: string;
  logo: any;
  showSearchModal = false;
  parentId: any;
  routeApi = 'AccountGroup/get-ddl?'
  constructor(
    private accountGroupService: AccountGroupServiceProxy,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private sharedServices: SharedService, private translate: TranslateService,
    private modelService: NgbModal,
    private cd: ChangeDetectorRef

  ) {
    this.defineaccountGroupForm();
  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {

    this.getAccountGroup();
    this.currnetUrl = this.router.url;
    this.listenToClickedButton();
    this.changePath();
    if (this.currnetUrl == this.addUrl) {
      this.getaccountGroupCode();
    }

    this.sub = this.route.params.subscribe((params) => {
      if (params['id'] != null) {
        this.id = params['id'];

        if (this.id) {
          this.getaccountGroupById(this.id);
        }
        this.url = this.router.url.split('/')[2];
      }
      if (params['parentId'] != null) {
        this.parentId = params['parentId'];

        this.getaccountGroupCode();
        this.url = this.router.url.split('/')[2];
      }
    });
  }
  onSelectAccountGroup(event) {

    this.parentId = event.id;
    this.accountGroupForm.controls.parentId.setValue(event.id);
    this.showSearchModal = false;
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
  defineaccountGroupForm() {
    this.accountGroupForm = this.fb.group({
      id: 0,
      nameAr: NAME_REQUIRED_VALIDATORS,
      nameEn: null,
      code: CODE_REQUIRED_VALIDATORS,
      isActive: true,
      parentId: null,
    });

  }

  getAccountGroup() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.accountGroupService.getDdl().subscribe({
        next: (res) => {

          if (res.success) {
            this.accountGroupList = res.response;

          }
          if (this.parentId != undefined || this.parentId != null) {
            this.accountGroupForm.controls.parentId.setValue(Number(this.parentId));
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
  getaccountGroupById(id: any) {

    const promise = new Promise<void>((resolve, reject) => {
      this.accountGroupService.getAccountGroup(id).subscribe({
        next: (res: any) => {

          this.accountGroupForm.setValue({
            id: res.response?.id,
            nameAr: res.response?.nameAr,
            nameEn: res.response?.nameEn,
            code: res.response?.code,
            isActive: res.response?.isActive,
            parentId: res.response?.parentId

          });

          console.log(
            'this.accountGroupForm.value set value',
            this.accountGroupForm.value
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
  getaccountGroupCode() {

    const promise = new Promise<void>((resolve, reject) => {

      this.accountGroupService.getLastCode(this.parentId).subscribe({

        next: (res: any) => {

          this.toolbarPathData.componentList = this.translate.instant("component-names.accountGroup");
          this.accountGroupForm.patchValue({
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
    return this.accountGroupForm.controls;
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
          } else if (currentBtn.action == ToolbarActions.New ||this.currnetUrl==this.addParentUrl) {
            this.toolbarPathData.componentAdd = 'Add accountGroup';
            this.defineaccountGroupForm();
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
    var entity = new CreateAccountGroupCommand();
    if (this.accountGroupForm.valid) {
      const promise = new Promise<void>((resolve, reject) => {
        entity.inputDto = this.accountGroupForm.value;

        this.accountGroupService.createAccountGroup(entity).subscribe({
          next: (result: any) => {
            this.spinner.show();
            console.log('result dataaddData ', result);
            this.Response = { ...result.response };
            this.defineaccountGroupForm();

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

      //  return this.accountGroupForm.markAllAsTouched();
    }
  }


  onUpdate() {
    var entity = new EditAccountGroupCommand();
    if (this.accountGroupForm.valid) {

      this.accountGroupForm.value.id = this.id;
      entity.inputDto = this.accountGroupForm.value;
      entity.inputDto.id = this.id;

      console.log("this.VendorCommissionsForm.value", this.accountGroupForm.value)
      const promise = new Promise<void>((resolve, reject) => {

        this.accountGroupService.updateAccountGroup(entity).subscribe({
          next: (result: any) => {
            this.spinner.show();
            console.log('result update ', result);
            this.Response = { ...result.response };
            this.defineaccountGroupForm();
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

      // return this.accountGroupForm.markAllAsTouched();
    }
  }


}

