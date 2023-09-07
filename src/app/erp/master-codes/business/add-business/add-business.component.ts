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
import { BusinessServiceProxy } from '../../services/business-field.servies'
import { BusinessDto } from '../../models/Business';
@Component({
  selector: 'app-add-business',
  templateUrl: './add-business.component.html',
  styleUrls: ['./add-business.component.css']
})
export class AddBusinessComponent implements OnInit {
  //#region Main Declarations
  businessFieldForm!: FormGroup;
  sub: any;
  url: any;
  id: any = 0;
  currnetUrl;
  business: BusinessDto[] = [];
  addUrl: string = '/master-codes/business/add-business';
  updateUrl: string = '/master-codes/business/update-business/';
  listUrl: string = '/master-codes/business';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.business"),
    componentAdd: '',

  };
  response: any;
  errorMessage = '';
  errorClass = '';
  submited: boolean = false;
  constructor(
    private businessService: BusinessServiceProxy,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private SharedServices: SharedService, private translate: TranslateService
  ) {
    this.defineBusinessForm();
  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    this.spinner.show();
    this.getRouteData();
    this.currnetUrl = this.router.url;
    if (this.currnetUrl == this.addUrl) {
      this.getBusinessCode();
    }
    this.changePath();
    this.listenToClickedButton();
    this.spinner.hide();

  }

  //#endregion
  getRouteData() {
    let sub = this.route.params.subscribe((params) => {
      if (params['id'] != null) {
        this.id = params['id'];

        if (this.id) {
          this.getBusinessById(this.id).then(a => {

            this.spinner.hide();

          }).catch(err => {
            this.spinner.hide();

          });
        }
        else {
          this.SharedServices.changeButton({ action: 'New' } as ToolbarData);
          this.spinner.hide();
        }
      }
      else {
        this.SharedServices.changeButton({ action: 'New' } as ToolbarData);
        this.spinner.hide();
      }
    });
    this.subsList.push(sub);
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

  //#region Permissions

  //#endregion

  //#region  State Management
  //#endregion

  //#region Basic Data
  ///Geting form dropdown list data
  defineBusinessForm() {
    this.businessFieldForm = this.fb.group({
      id: 0,
      nameAr: NAME_REQUIRED_VALIDATORS,
      nameEn: NAME_REQUIRED_VALIDATORS,
      code: CODE_REQUIRED_VALIDATORS,
      isActive: true
    });
  }

  //#endregion

  //#region CRUD Operations
  getBusinessById(id: any) {
    return new Promise<void>((resolve, reject) => {
      let sub = this.businessService.getBusiness(id).subscribe({
        next: (res: any) => {
          console.log('result data getbyid', res);
          this.businessFieldForm.setValue({
            id: res.response?.id,
            nameAr: res.response?.nameAr,
            nameEn: res.response?.nameEn,
            code: res.response?.code,
            isActive: res.response?.isActive
          });
          console.log(
            'this.businessFieldForm.value set value',
            this.businessFieldForm.value
          );
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
  getBusinessCode() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.businessService.getLastCode().subscribe({

        next: (res: any) => {
          this.toolbarPathData.componentList = this.translate.instant("component-names.business");
          this.businessFieldForm.patchValue({
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
    return this.businessFieldForm.controls;
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
            this.toolbarPathData.componentAdd = this.translate.instant("business.add-business");
            this.defineBusinessForm();
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
  confirmSave() {
    return new Promise<void>((resolve, reject) => {

      let sub = this.businessService.createBusiness(this.businessFieldForm.value).subscribe({
        next: (result: any) => {
          this.spinner.show();
          this.response = { ...result.response };
          this.defineBusinessForm();

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
    if (this.businessFieldForm.valid) {
      this.spinner.show();
      this.confirmSave().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });
    } else {

      return this.businessFieldForm.markAllAsTouched();
    }
  }
  confirmUpdate() {
    this.businessFieldForm.value.id = this.id;
    return new Promise<void>((resolve, reject) => {
      let sub = this.businessService.updateBusiness(this.businessFieldForm.value).subscribe({
        next: (result: any) => {
          this.spinner.show();
          console.log('result update ', result);
          this.response = { ...result.response };
          this.defineBusinessForm();
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
      this.subsList.push(sub);

    });
  }

  onUpdate() {

    if (this.businessFieldForm.valid) {
      this.spinner.show();
      this.confirmUpdate().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });

    }

    else {

      return this.businessFieldForm.markAllAsTouched();
    }
  }

  //#endregion
}

