import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { CODE_REQUIRED_VALIDATORS, REQUIRED_VALIDATORS } from '../../../../../shared/constants/input-validators';
import { ToolbarPath } from '../../../../../shared/interfaces/toolbar-path';
import { PublicService } from '../../../../../shared/services/public.service';
import { ToolbarData } from '../../../../../shared/interfaces/toolbar-data';
import { SharedService } from '../../../../../shared/common-services/shared-service';
import { NotificationsAlertsService } from '../../../../../shared/common-services/notifications-alerts.service';
import { ToolbarActions } from '../../../../../shared/enum/toolbar-actions';
import { DateCalculation, DateModel } from '../../../../../shared/services/date-services/date-calc.service';
import { WarehousesTaxesDetail, WarehousesTaxesMaster } from '../../../models/warehouses-tax';
import { WarehousesTaxServiceProxy } from '../../../Services/warehousestax.service';
import {  formatDate, navigateUrl } from '../../../../../shared/helper/helper-url';

@Component({
  selector: 'app-add-edit-warehouses-tax',
  templateUrl: './add-edit-warehouses-tax.component.html',
  styleUrls: ['./add-edit-warehouses-tax.component.scss']
})
export class AddEditWarehousesTaxComponent implements OnInit, AfterViewInit {
  //#region Main Declarations

  warehousesTaxForm: FormGroup = new FormGroup({});
  accountId: any;
  fromDate!: DateModel;
  toDate!: DateModel;
  showSearchAccountModal = false;
  warehousesTaxesMaster: WarehousesTaxesMaster = new WarehousesTaxesMaster();
  warehousesTaxesDetail: WarehousesTaxesDetail[] = [];
  selectedWarehousesTaxDetail: WarehousesTaxesDetail = new WarehousesTaxesDetail();

  id: any = 0;
  currnetUrl;
  errorMessage = '';
  errorClass = '';
  lang = localStorage.getItem("language")
  routeAccountApi = 'Account/get-ddl?'
  accountsList: any;
  submitMode:boolean=false;
  addUrl: string = '/warehouses-master-codes/warehousesTax/add-warehouses-tax';
  updateUrl: string = '/warehouses-master-codes/warehousesTax/update-warehouses-tax/';
  listUrl: string = '/warehouses-master-codes/warehousesTax/';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.taxes"),
    componentAdd: '',

  };

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private translate: TranslateService,
    private publicService: PublicService,
    private warehousesTaxService: WarehousesTaxServiceProxy,
    private dateService: DateCalculation,
    private sharedService: SharedService,
    private alertsService: NotificationsAlertsService,

  ) {
    this.defineWarehousesTaxForm();
    this.clearSelectedItemData();
    this.warehousesTaxesDetail = [];

  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    this.spinner.show();
    Promise.all([
      this.getAccounts()

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
          this.getWarehousesTaxById(this.id).then(a => {
            this.spinner.hide();

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
        this.getWarehousesTaxCode();
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
  defineWarehousesTaxForm() {
    this.warehousesTaxForm = this.fb.group({
      id: 0,
      nameAr: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(10)])],
      nameEn: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(10)])],
      code: CODE_REQUIRED_VALIDATORS,
      accountId: REQUIRED_VALIDATORS,
      isActive: true,

    });

  }

  //#region Helper Functions

  get f(): { [key: string]: AbstractControl } {
    return this.warehousesTaxForm.controls;
  }


  //#endregion

  getWarehousesTaxById(id: any) {
    return new Promise<void>((resolve, reject) => {
      let sub = this.warehousesTaxService.getWarehousesTax(id).subscribe({
        next: (res: any) => {
          resolve();
          this.warehousesTaxForm.setValue({
            id: res.response.id,
            code: res.response.code,
            nameAr: res.response.nameAr,
            nameEn: res.response?.nameEn,
            accountId: res.response.accountId,
            isActive: res.response?.isActive,
          });
          this.warehousesTaxesDetail = res.response?.warehousesTaxesDetail;
          this.warehousesTaxesMaster.warehousesTaxesDetail = res.response?.warehousesTaxesDetail;
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


  getWarehousesTaxCode() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.warehousesTaxService.getLastCode().subscribe({
        next: (res: any) => {
          resolve();
          debugger
          this.warehousesTaxForm.patchValue({
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
  getAccounts() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeAccountApi).subscribe({
        next: (res) => {

          if (res.success) {
            this.accountsList = res.response.filter(x => x.isLeafAccount == true && x.isActive == true);

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


  onSelectAccount(event) {
    this.warehousesTaxForm.controls.accountId.setValue(event.id);
    this.showSearchAccountModal = false;
  }


  addItem() {
    debugger
    this.warehousesTaxesDetail.push({
      id: 0,
      warehousesTaxId: this.selectedWarehousesTaxDetail?.warehousesTaxId ?? 0,
      fromDate:formatDate(this.dateService.getDateForInsert(this.selectedWarehousesTaxDetail?.fromDate)),
      toDate: formatDate(this.dateService.getDateForInsert(this.selectedWarehousesTaxDetail?.toDate)),
      taxRatio: this.selectedWarehousesTaxDetail?.taxRatio ?? 0,

    });

    debugger
    this.warehousesTaxesMaster!.warehousesTaxesDetail = this.warehousesTaxesDetail;
    this.clearSelectedItemData();

  }
  deleteItem(index) {
    debugger
    if (this.warehousesTaxesDetail.length) {
      if (this.warehousesTaxesDetail.length == 1) {
        this.warehousesTaxesDetail = [];
      } else {
        this.warehousesTaxesDetail.splice(index, 1);
      }
    }

    this.warehousesTaxesMaster.warehousesTaxesDetail = this.warehousesTaxesDetail;


  }
  clearSelectedItemData() {
    this.selectedWarehousesTaxDetail = {
      id: 0,
      warehousesTaxId: 0,
      fromDate: this.dateService.getCurrentDate(),
      toDate: this.dateService.getCurrentDate(),
      taxRatio: 0

    }
  }

  setInputData() {

    this.warehousesTaxesMaster = {
      id: this.warehousesTaxForm.controls["id"].value,
      code: this.warehousesTaxForm.controls["code"].value,
      nameAr: this.warehousesTaxForm.controls["nameAr"].value,
      nameEn: this.warehousesTaxForm.controls["nameEn"].value,
      accountId: this.warehousesTaxForm.controls["accountId"].value,
      isActive: this.warehousesTaxForm.controls["isActive"].value,

      warehousesTaxesDetail: this.warehousesTaxesMaster.warehousesTaxesDetail ?? [],

    };


  }
  confirmSave() {
    return new Promise<void>((resolve, reject) => {
      debugger
      let sub = this.warehousesTaxService.createWarehousesTax(this.warehousesTaxesMaster).subscribe({
        next: (result: any) => {
          this.defineWarehousesTaxForm();
          this.clearSelectedItemData();
          this.warehousesTaxesDetail = [];
          // this.submited = false;

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
    if (this.warehousesTaxForm.valid) {
      if (this.warehousesTaxesMaster.warehousesTaxesDetail.length == 0) {
        this.errorMessage = this.translate.instant("warehouses-tax.tax-details-required");
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
      return this.warehousesTaxForm.markAllAsTouched();

    }
  }
  confirmUpdate() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.warehousesTaxService.updateWarehousesTax(this.warehousesTaxesMaster).subscribe({
        next: (result: any) => {
          this.defineWarehousesTaxForm();
          this.clearSelectedItemData();
          this.warehousesTaxesDetail = [];

          // this.submited = false;

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
    debugger
    if (this.warehousesTaxForm.valid) {
      if (this.warehousesTaxesMaster.warehousesTaxesDetail.length == 0) {
        this.errorMessage = this.translate.instant("warehouses-tax.tax-details-required");
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
      this.errorMessage = this.translate.instant("validation-messages.invalid-data");
      this.errorClass = 'errorMessage';
      this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
      return this.warehousesTaxForm.markAllAsTouched();

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
            this.toolbarPathData.componentAdd = this.translate.instant('warehouses-tax.add-tax');
            this.defineWarehousesTaxForm();
            this.sharedService.changeToolbarPath(this.toolbarPathData);
          } else if (currentBtn.action == ToolbarActions.Update) {
            debugger
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
  getFromDate(selectedDate: DateModel, i: any) {
    this.warehousesTaxesDetail[i].fromDate = selectedDate;
  }
  getToDate(selectedDate: DateModel, i: any) {
    this.warehousesTaxesDetail[i].toDate = selectedDate;
  }
  getSelectedFromDate(selectedDate: DateModel) {
    this.selectedWarehousesTaxDetail.fromDate = selectedDate;
  }
  getSelectedToDate(selectedDate: DateModel) {
    this.selectedWarehousesTaxDetail.toDate = selectedDate;
  }

}

