import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SharedService } from '../../../../../shared/common-services/shared-service';
import { ToolbarPath } from '../../../../../shared/interfaces/toolbar-path';
import { NgxSpinnerService } from 'ngx-spinner';
import { CODE_REQUIRED_VALIDATORS, NAME_REQUIRED_VALIDATORS } from '../../../../../shared/constants/input-validators';
import { Subscription } from 'rxjs';
import { ToolbarData } from '../../../../../shared/interfaces/toolbar-data';
import { ToolbarActions } from '../../../../../shared/enum/toolbar-actions';
import { navigateUrl } from '../../../../../shared/helper/helper-url';
import * as Tabulator from 'tabulator-tables/dist/js/tabulator';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UnitDto } from '../../../models/unit';
import { UnitServiceProxy } from '../../../Services/unit.servies';
import { AddEditUnitTransactionComponent } from '../add-edit-unit-transaction/add-edit-unit-transaction.component';
import { MessageModalComponent } from '../../../../../shared/components/message-modal/message-modal.component';

@Component({
  selector: 'app-add-edit-unit',
  templateUrl: './add-edit-unit.component.html',
  styleUrls: ['./add-edit-unit.component.scss']
})
export class AddEditUnitComponent implements OnInit {
  //#region Main Declarations
  unitForm!: FormGroup;
  companyId: any = localStorage.getItem("companyId");
  branchId: any = localStorage.getItem("branchId");
  id: any = 0;
  currnetUrl;
  units: UnitDto[] = [];
  addUrl: string = '/warehouses-master-codes/unit/add-unit';
  updateUrl: string = '/warehouses-master-codes/unit/update-unit/';
  listUrl: string = '/warehouses-master-codes/unit';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.units"),
    componentAdd: '',

  };
  response: any;
  errorMessage = '';
  errorClass = '';
  submited: boolean = false;
  lang = localStorage.getItem("language")
  symbolList: { descriptionAr: string; descriptionEn: string; value: string; }[];
  constructor(
    private unitService: UnitServiceProxy,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private sharedService: SharedService,
    private translate: TranslateService,
    private modelService: NgbModal
  ) {

    this.defineUnitForm();
  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    this.spinner.show();
    this.getRouteData();
    this.changePath();
    this.listenToClickedButton();
    this.currnetUrl = this.router.url;
    if (this.currnetUrl == this.addUrl) {
      this.getUnitCode();
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
          this.getUnitById(this.id).then(a => {

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
        this.sharedService.changeButton({ action: 'New' } as ToolbarData);
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
  defineUnitForm() {
    this.unitForm = this.fb.group({
      id: 0,
      companyId: this.companyId,
      branchId: this.branchId,
      nameAr: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50)])],
      nameEn: '',
      code: CODE_REQUIRED_VALIDATORS,
      isActive: true,
      symbol: ''
    });
  }

  //#endregion

  //#region CRUD Operations
  getUnitById(id: any) {
    return new Promise<void>((resolve, reject) => {
      let sub = this.unitService.getUnit(id).subscribe({
        next: (res: any) => {
          resolve();
          this.unitForm.setValue({
            id: res.response.id,
            companyId: res.response?.companyId,
            branchId: res.response?.branchId,
            nameAr: res.response?.nameAr,
            nameEn: res.response?.nameEn,
            code: res.response?.code,
            isActive: res.response?.isActive,
            symbol: res.response?.symbol
          });
          this.unitTransactionsDto = res.response?.unitTransactionsDto;
          this.drawTable();

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
  getUnitCode() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.unitService.getLastCode().subscribe({
        next: (res: any) => {

          this.toolbarPathData.componentList = this.translate.instant("component-names.units");
          this.unitForm.patchValue({
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
    return this.unitForm.controls;
  }


  //#endregion
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
            this.toolbarPathData.componentAdd = this.translate.instant("unit.add-unit");
            this.defineUnitForm();
            this.sharedService.changeToolbarPath(this.toolbarPathData);
          }else if (currentBtn.action == ToolbarActions.Update) {
            this.onUpdate();
          }
          else if (currentBtn.action == ToolbarActions.Copy) {
           this.getUnitCode();
          }
        }
      },
    });
    this.subsList.push(sub);
  }
  changePath() {
    this.sharedService.changeToolbarPath(this.toolbarPathData);
  }
  confirmSave() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.unitService.createUnit(this.unitForm.value).subscribe({
        next: (result: any) => {
          this.response = { ...result.response };
          this.defineUnitForm();
          this.submited = false;
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
    if (this.unitForm.valid) {
      this.spinner.show();
      this.confirmSave().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });

    } else {

      return this.unitForm.markAllAsTouched();
    }
  }
  confirmUpdate() {
    this.unitForm.value.id = this.id;
    return new Promise<void>((resolve, reject) => {
      let sub = this.unitService.updateUnit(this.unitForm.value).subscribe({
        next: (result: any) => {
          this.response = { ...result.response };
          this.defineUnitForm();
          this.submited = false;
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
    if (this.unitForm.valid) {
      this.spinner.show();
      this.confirmUpdate().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });
    }

    else {

      return this.unitForm.markAllAsTouched();
    }
  }

  //#endregion
  disabledSave = false;
  disabledUpate = false;
  disabledNew = false;
  disabledDlete = false

  doUpdateEvent(id) {
    const modalRef = this.modelService.open(AddEditUnitTransactionComponent, { size: 'lg' });
    modalRef.componentInstance.name = this.translate.instant('unit.add-edit');
    modalRef.componentInstance.unitMasterId = this.id;
    modalRef.componentInstance.id = id;
    modalRef.result.then((result) => {
      if (result) {
        this.getUnitById(result)
      }
    });
  }

  doNewEvent() {
    const modalRef = this.modelService.open(AddEditUnitTransactionComponent, { size: 'lg' });
    modalRef.componentInstance.name = this.translate.instant('unit.add-edit');
    modalRef.componentInstance.unitMasterId = this.id;
    modalRef.result.then((result) => {
      if (result) {
        this.getUnitById(result)
      }
    });
  }


  showConfirmDeleteMessage(id) {
    const modalRef = this.modelService.open(MessageModalComponent);
    modalRef.componentInstance.message = this.translate.instant('messages.confirm-delete');
    modalRef.componentInstance.title = this.translate.instant('messageTitle.delete');
    modalRef.componentInstance.btnConfirmTxt = this.translate.instant('messageTitle.delete');
    modalRef.componentInstance.isYesNo = true;
    modalRef.result.then((rs) => {
      console.log(rs);
      if (rs == 'Confirm') {
        this.spinner.show();
        let sub = this.unitService.deleteUnitTransaction(id).subscribe(
          () => {
            //reloadPage()
            this.getUnitById(this.id);

          });
        this.subsList.push(sub);
        this.spinner.hide();

      }
    });
  }
  editFormatIcon() { //plain text value

    return "<i class='fa fa-edit'></i>";
  };
  deleteFormatIcon() { //plain text value

    return "<i class='fa fa-trash'></i>";
  };
  CheckBoxFormatIcon() { //plain text value

    return "<input id='yourID' type='checkbox' />";
  };
  unitTransactionsDto: any = [];
  columnNames = [
    this.lang == 'ar'
      ? {
        title: ' الوحدة ', width: 300, field: 'unitDetailNameAr'
      } : {
        title: ' Unit ', width: 300, field: 'unitDetailNameEn'
      },

    this.lang == 'ar'
      ? {
        title: ' معامل التحويل  ', width: 300, field: 'transactionFactor'
      } : {
        title: 'Transaction Factor ', width: 300, field: 'transactionFactor'
      },
    this.lang == "ar" ? {
      title: "حذف",

      field: "id", formatter: this.deleteFormatIcon, cellClick: (e, cell) => {

        this.showConfirmDeleteMessage(cell.getRow().getData().id);
      },
      //  visible: false,
    } :
      {
        title: "Delete",
        field: "id", formatter: this.deleteFormatIcon, cellClick: (e, cell) => {

          this.showConfirmDeleteMessage(cell.getRow().getData().id);
        },
        //   visible: false,
      }

    ,

    this.lang == "ar" ? {
      title: "تعديل",
      field: "id", formatter: this.editFormatIcon, cellClick: (e, cell) => {

        this.doUpdateEvent(cell.getRow().getData().id);
      }
    }
      :

      {
        title: "Edit",
        field: "id", formatter: this.editFormatIcon, cellClick: (e, cell) => {

          this.doUpdateEvent(cell.getRow().getData().id);
        }
      },



  ];
  exTable: any;
  filterParam: string = '';
  // subscriptionsData=[]
  tab = document.createElement('div');
  drawTable() {
    this.exTable = new Tabulator(this.tab, {
      height: 130,
      layout: 'fitColumns',
      columns: this.columnNames,
      movableColumns: true,
      data: this.unitTransactionsDto,
      //Local Pagination
      pagination: "local",
      paginationSize: 50,
      paginationSizeSelector: [5, 10, 20, 50, 100, 1000, 10000, 100000],

      paginationCounter: "rows",
    });
    //    this.exTable.setData(persons);
    document.getElementById('ex-table-div').appendChild(this.tab);
  }

}

