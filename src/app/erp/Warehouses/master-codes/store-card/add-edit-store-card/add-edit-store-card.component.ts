
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { CODE_REQUIRED_VALIDATORS, NAME_REQUIRED_VALIDATORS } from '../../../../../shared/constants/input-validators';
import { ToolbarPath } from '../../../../../shared/interfaces/toolbar-path';
import { SharedService } from '../../../../../shared/common-services/shared-service';
import { TranslateService } from '@ngx-translate/core';
import { ToolbarData } from '../../../../../shared/interfaces/toolbar-data';
import { ToolbarActions } from '../../../../../shared/enum/toolbar-actions';
import { navigateUrl } from '../../../../../shared/helper/helper-url';
import { StoreCardDto } from '../../../models/store-card';
import { StoreCardServiceProxy } from '../../../Services/store-card-service';

@Component({
  selector: 'app-add-edit-store-card',
  templateUrl: './add-edit-store-card.component.html',
  styleUrls: ['./add-edit-store-card.component.scss']
})
export class AddEditStoreCardComponent implements OnInit {
  //#region Main Declarations
  storeCardForm!: FormGroup;
  sub: any;
  url: any;
  id: any = 0;
  currnetUrl;
  public show: boolean = false;
  lang = localStorage.getItem("language")
  addUrl: string = '/warehouses-master-codes/storeCard/add-storeCard';
  addParentUrl: string = '/warehouses-master-codes/storeCard/add-storeCard/';
  updateUrl: string = '/warehouses-master-codes/storeCard/update-storeCard/';
  listUrl: string = '/warehouses-master-codes/storeCard';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.storeCard"),
    componentAdd: '',

  };
  response: any;
  errorMessage = '';
  errorClass = '';
  submited: boolean = false;
  storeCardList: StoreCardDto[] = [];
  files: any;
  logoPath: string;
  fullPathUpdate: string;
  logo: any;
  showSearchModal = false;
  parentId: any;
  routeApi = 'StoreCard/get-ddl?'
  constructor(
    private storeCardService: StoreCardServiceProxy,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private sharedServices: SharedService, private translate: TranslateService,

  ) {
    this.definestoreCardForm();
  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    
    this.spinner.show();
    Promise.all([
      this.getStoreCard()
    ]).then(a => {
      
      this.getRouteData();
      this.changePath();
      this.listenToClickedButton();
      this.currnetUrl = this.router.url;
      if (this.currnetUrl == this.addUrl) {
        this.getstoreCardCode();
      }
      this.spinner.hide();
    }).catch(err => {
      
      this.spinner.hide();
    });



  }
  getRouteData() {
    let sub = this.route.params.subscribe((params) => {
      if (params['id'] != null) {
        this.id = params['id'];

        if (this.id) {
          this.getstoreCardById(this.id).then(a => {
            this.spinner.hide();
          }).catch(err => {
            this.spinner.hide();

          });
        }
        this.url = this.router.url.split('/')[2];
        this.spinner.hide();
      }
      if (params['parentId'] != null) {
        this.parentId = params['parentId'];

        this.getstoreCardCode();
        this.url = this.router.url.split('/')[2];
      }
    });
    this.subsList.push(sub);
  }
  onSelectStoreCard(event) {

    this.parentId = event.id;
    this.storeCardForm.controls.parentId.setValue(event.id);
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
  definestoreCardForm() {
    this.storeCardForm = this.fb.group({
      id: 0,
      nameAr: NAME_REQUIRED_VALIDATORS,
      nameEn: null,
      code: CODE_REQUIRED_VALIDATORS,
      isActive: true,
      parentId: null,
      storekeeper:null,
      address:null,
      notes:null
    });

  }

  getStoreCard() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.storeCardService.getDdl().subscribe({
        next: (res) => {

          if (res.success) {
            this.storeCardList = res.response;

          }
          if (this.parentId != undefined || this.parentId != null) {
            this.storeCardForm.controls.parentId.setValue(Number(this.parentId));
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
  getstoreCardById(id: any) {

    return new Promise<void>((resolve, reject) => {
      let sub = this.storeCardService.getStoreCard(id).subscribe({
        next: (res: any) => {
          resolve();
          this.storeCardForm.setValue({
            id: res.response?.id,
            nameAr: res.response?.nameAr,
            nameEn: res.response?.nameEn,
            code: res.response?.code,
            isActive: res.response?.isActive,
            parentId: res.response?.parentId,
            storekeeper:res.response?.storekeeper,
            address:res.response?.address,
            notes:res.response?.notes,

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
  showPassword() {
    this.show = !this.show;
  }
  getstoreCardCode() {

    return new Promise<void>((resolve, reject) => {

      let sub = this.storeCardService.getLastCode(this.parentId).subscribe({

        next: (res: any) => {

          this.toolbarPathData.componentList = this.translate.instant("component-names.storeCard");
          this.storeCardForm.patchValue({
            code: res.response
          });
          if (this.parentId != undefined || this.parentId != null) {
            this.storeCardForm.controls.parentId.setValue(Number(this.parentId));
          }

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
    return this.storeCardForm.controls;
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
            this.toolbarPathData.componentAdd = 'store-cards.add-store-card';
            if (this.storeCardForm.value.code != null) {
              this.getstoreCardCode()
            }
            this.definestoreCardForm();
            this.sharedServices.changeToolbarPath(this.toolbarPathData);
          }else if (currentBtn.action == ToolbarActions.Update) {
            this.onUpdate();
          }
          else if (currentBtn.action == ToolbarActions.Copy) {
           this.getstoreCardCode();
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
    if (this.storeCardForm.valid) {

      this.spinner.show();
      this.confirmSave().then(a => {
        this.spinner.hide();
      });


    } else {

       return this.storeCardForm.markAllAsTouched();
    }
  }
  confirmSave() {
    var entity = new StoreCardDto();
    return new Promise<void>((resolve, reject) => {
      entity = this.storeCardForm.value;
      let sub = this.storeCardService.createStoreCard(entity).subscribe({
        next: (result: any) => {
          this.spinner.show();
          console.log('result dataaddData ', result);
          this.response = { ...result.response };
          this.definestoreCardForm();
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
    if (this.storeCardForm.valid) {

      this.storeCardForm.value.id = this.id;
      this.spinner.show();
      this.confirmUpdate().then(a=>{
        this.spinner.hide();
      }).catch(e=>{
        this.spinner.hide();
      });
    }

    else {

      return this.storeCardForm.markAllAsTouched();
    }
  }
  confirmUpdate() {
    var entity = new StoreCardDto();
    entity = this.storeCardForm.value;
    entity.id = this.id;
    return new Promise<void>((resolve, reject) => {
      let sub = this.storeCardService.updateStoreCard(entity).subscribe({
        next: (result: any) => {
          this.spinner.show();
          console.log('result update ', result);
          this.response = { ...result.response };
          this.definestoreCardForm();
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
}



