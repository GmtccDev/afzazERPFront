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
import { TaxDetail, TaxMaster } from '../../../models/tax';
import { TaxServiceProxy } from '../../../Services/tax.service';
import { formatDate, navigateUrl } from '../../../../../shared/helper/helper-url';

@Component({
  selector: 'app-add-edit-tax',
  templateUrl: './add-edit-tax.component.html',
  styleUrls: ['./add-edit-tax.component.scss']
})
export class AddEditTaxComponent implements OnInit, AfterViewInit {
  //#region Main Declarations
  taxForm: FormGroup = new FormGroup({});
  companyId: any = localStorage.getItem("companyId");
  branchId: any = localStorage.getItem("branchId");
  accountId: any;
  fromDate!: DateModel;
  toDate!: DateModel;
  showSearchAccountModal = false;
  taxMaster: TaxMaster = new TaxMaster();
  taxDetail: TaxDetail[] = [];
  selectedTaxDetail: TaxDetail = new TaxDetail();

  id: any = 0;
  currnetUrl;
  errorMessage = '';
  errorClass = '';
  lang = localStorage.getItem("language")
  routeAccountApi = 'Account/GetLeafAccounts?'
  accountsList: any;
  submitMode: boolean = false;
  addUrl: string = '/warehouses-master-codes/tax/add-tax';
  updateUrl: string = '/warehouses-master-codes/tax/update-tax/';
  listUrl: string = '/warehouses-master-codes/tax/';
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
    private taxService: TaxServiceProxy,
    private dateService: DateCalculation,
    private sharedService: SharedService,
    private alertsService: NotificationsAlertsService,

  ) {
    this.defineTaxForm();
    this.clearSelectedItemData();
    this.taxDetail = [];

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
          this.getTaxById(this.id).then(a => {
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
        this.getTaxCode();
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
  defineTaxForm() {
    this.taxForm = this.fb.group({
      id: 0,
      companyId: this.companyId,
      branchId: this.branchId,
      nameAr: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(10)])],
      nameEn: '',
      code: CODE_REQUIRED_VALIDATORS,
      accountId: REQUIRED_VALIDATORS,
      isActive: true,

    });

  }

  //#region Helper Functions

  get f(): { [key: string]: AbstractControl } {
    return this.taxForm.controls;
  }


  //#endregion

  getTaxById(id: any) {
    return new Promise<void>((resolve, reject) => {
      let sub = this.taxService.getTax(id).subscribe({
        next: (res: any) => {
          resolve();
          this.taxForm.setValue({
            id: res.response.id,
            companyId: res.response?.companyId,
            branchId: res.response?.branchId,
            code: res.response.code,
            nameAr: res.response.nameAr,
            nameEn: res.response?.nameEn,
            accountId: res.response.accountId,
            isActive: res.response?.isActive,
          });
          this.taxDetail = res.response?.taxDetail;

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


  getTaxCode() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.taxService.getLastCode().subscribe({
        next: (res: any) => {
          resolve();

          this.taxForm.patchValue({
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
  getAccounts() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.publicService.getDdl(this.routeAccountApi).subscribe({
        next: (res) => {
          if (res.success) {
            this.accountsList = res.response;

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


  onSelectAccount(event) {
    this.taxForm.controls.accountId.setValue(event.id);
    this.showSearchAccountModal = false;
  }


  addItem() {
    debugger
    // if (this.taxDetail.length > 0 && this.taxDetail != null) {
    //   this.taxDetail.forEach(element => {
    //     debugger
    //     let fromDate = element.fromDate;
    //     let toDate = element.toDate;
    //     let date =this.selectedTaxDetail?.fromDate.year +'-0'+(this.selectedTaxDetail?.fromDate.month + 1) +'-'+ this.selectedTaxDetail?.fromDate.day
    //     //formatDate(this.selectedTaxDetail?.fromDate);

    //     if (date >= fromDate && date <= toDate) {
    //       debugger
    //       this.errorMessage = this.translate.instant("tax.date-exist");
    //       this.errorClass = 'errorMessage';
    //       this.alertsService.showError(this.errorMessage, this.translate.instant("message-title.wrong"));
    //       return;
    //     }

    //   });

    // }
    if (this.selectedTaxDetail?.fromDate)

      this.taxDetail.push({
        id: 0,
        taxId: this.selectedTaxDetail?.taxId ?? 0,
        fromDate: formatDate(this.dateService.getDateForInsert(this.selectedTaxDetail?.fromDate)),
        toDate: formatDate(this.dateService.getDateForInsert(this.selectedTaxDetail?.toDate)),
        taxRatio: this.selectedTaxDetail?.taxRatio ?? 0,

      });


    this.taxMaster!.taxDetail = this.taxDetail;
    this.clearSelectedItemData();

  }
  deleteItem(index) {
    if (this.taxDetail.length) {
      if (this.taxDetail.length == 1) {
        this.taxDetail = [];
      } else {
        this.taxDetail.splice(index, 1);
      }
    }

    this.taxMaster.taxDetail = this.taxDetail;


  }
  clearSelectedItemData() {
    this.selectedTaxDetail = {
      id: 0,
      taxId: 0,
      fromDate: this.dateService.getCurrentDate(),
      toDate: this.dateService.getCurrentDate(),
      taxRatio: 0

    }
  }

  setInputData() {
    this.taxMaster = {
      id: this.taxForm.controls["id"].value,
      companyId: this.taxForm.controls["companyId"].value,
      branchId: this.taxForm.controls["branchId"].value,
      code: this.taxForm.controls["code"].value,
      nameAr: this.taxForm.controls["nameAr"].value,
      nameEn: this.taxForm.controls["nameEn"].value,
      accountId: this.taxForm.controls["accountId"].value,
      isActive: this.taxForm.controls["isActive"].value,

      taxDetail: this.taxMaster.taxDetail ?? [],

    };


  }
  confirmSave() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.taxService.createTax(this.taxMaster).subscribe({
        next: (result: any) => {
          this.defineTaxForm();
          this.clearSelectedItemData();
          this.taxDetail = [];
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
    if (this.taxForm.valid) {
      if (this.taxMaster.taxDetail.length == 0) {
        this.errorMessage = this.translate.instant("tax.tax-details-required");
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
      return this.taxForm.markAllAsTouched();

    }
  }
  confirmUpdate() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.taxService.updateTax(this.taxMaster).subscribe({
        next: (result: any) => {
          this.defineTaxForm();
          this.clearSelectedItemData();
          this.taxDetail = [];
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

    if (this.taxForm.valid) {
      if (this.taxMaster.taxDetail.length == 0) {
        this.errorMessage = this.translate.instant("tax.tax-details-required");
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
      return this.taxForm.markAllAsTouched();

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
            this.toolbarPathData.componentAdd = this.translate.instant('tax.add-tax');
            this.defineTaxForm();
            this.sharedService.changeToolbarPath(this.toolbarPathData);
          } else if (currentBtn.action == ToolbarActions.Update) {

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
    this.taxDetail[i].fromDate = selectedDate;
  }
  getToDate(selectedDate: DateModel, i: any) {
    this.taxDetail[i].toDate = selectedDate;
  }
  getSelectedFromDate(selectedDate: DateModel) {
    this.selectedTaxDetail.fromDate = selectedDate;
  }
  getSelectedToDate(selectedDate: DateModel) {
    this.selectedTaxDetail.toDate = selectedDate;
  }

}

