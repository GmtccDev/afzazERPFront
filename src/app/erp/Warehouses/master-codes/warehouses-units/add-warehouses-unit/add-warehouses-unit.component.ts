import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
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
import { WarehousesUnitDto } from '../../../models/warehouses-unit';
import { WarehousesUnitServiceProxy } from '../../../Services/warehousesunit.servies';
import { AddEditWarehousesUnitTransactionsComponent } from '../add-edit-warehouses-unit-transactions/add-edit-warehouses-unit-transactions.component';
import { MessageModalComponent } from '../../../../../shared/components/message-modal/message-modal.component';

@Component({
  selector: 'app-add-warehouses-unit',
  templateUrl: './add-warehouses-unit.component.html',
  styleUrls: ['./add-warehouses-unit.component.scss']
})
export class AddwarehousesUnitComponent implements OnInit {
  //#region Main Declarations
  warehousesUnitForm!: FormGroup;
  
  id: any = 0;
  currnetUrl;
  warehousesUnits: WarehousesUnitDto[] = [];
  addUrl: string = '/warehouses-master-codes/warehousesUnit/add-warehousesUnit';
  updateUrl: string = '/warehouses-master-codes/warehousesUnit/update-warehousesUnit/';
  listUrl: string = '/warehouses-master-codes/warehousesUnit';
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
    private warehousesUnitService:WarehousesUnitServiceProxy,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private sharedService: SharedService,
    private translate: TranslateService,
    private modelService: NgbModal
  ) {

    this.defineWarehousesUnitForm();
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
      this.getWarehousesUnitCode();
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
          this.getWarehousesUnitById(this.id).then(a => {

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
  defineWarehousesUnitForm() {
    this.warehousesUnitForm = this.fb.group({
      id: 0,
      nameAr: NAME_REQUIRED_VALIDATORS,
      nameEn: NAME_REQUIRED_VALIDATORS,
      code: CODE_REQUIRED_VALIDATORS,
      isActive: true,
      symbol: ''
    });
  }
 
  //#endregion

  //#region CRUD Operations
  getWarehousesUnitById(id: any) {
    return new Promise<void>((resolve, reject) => {
      let sub = this.warehousesUnitService.getWarehousesUnit(id).subscribe({
        next: (res: any) => {
          resolve();
          this.warehousesUnitForm.setValue({
            id: res.response.id,
            nameAr: res.response?.nameAr,
            nameEn: res.response?.nameEn,
            code: res.response?.code,
            isActive: res.response?.isActive,
            symbol: res.response?.symbol
          });
          this.warehousesUnitTransactionsDto = res.response?.warehousesUnitTransactionsDto;
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
  getWarehousesUnitCode() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.warehousesUnitService.getLastCode().subscribe({
        next: (res: any) => {

          this.toolbarPathData.componentList = this.translate.instant("component-names.units");
          this.warehousesUnitForm.patchValue({
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
    return this.warehousesUnitForm.controls;
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
            this.toolbarPathData.componentAdd = this.translate.instant("warehouses-unit.add-unit");
            this.defineWarehousesUnitForm();
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
  confirmSave() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.warehousesUnitService.createWarehousesUnit(this.warehousesUnitForm.value).subscribe({
        next: (result: any) => {
          this.response = { ...result.response };
          this.defineWarehousesUnitForm();
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
    if (this.warehousesUnitForm.valid) {
      this.spinner.show();
      this.confirmSave().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });

    } else {

      return this.warehousesUnitForm.markAllAsTouched();
    }
  }
  confirmUpdate() {
    
    this.warehousesUnitForm.value.id = this.id;
    return new Promise<void>((resolve, reject) => {
      let sub = this.warehousesUnitService.updateWarehousesUnit(this.warehousesUnitForm.value).subscribe({
        next: (result: any) => {
          
          this.response = { ...result.response };
          this.defineWarehousesUnitForm();
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
    if (this.warehousesUnitForm.valid) {
      this.spinner.show();
      this.confirmUpdate().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });
    }

    else {

      return this.warehousesUnitForm.markAllAsTouched();
    }
  }

  //#endregion
  disabledSave = false;
  disabledUpate = false;
  disabledNew = false;
  disabledDlete = false

  doUpdateEvent(id) {
    const modalRef = this.modelService.open(AddEditWarehousesUnitTransactionsComponent, { size: 'lg' });
    modalRef.componentInstance.name = this.translate.instant('warehouses-unit.add-edit');
    modalRef.componentInstance.warehousesUnitMasterId = this.id;
    modalRef.componentInstance.id = id;
    modalRef.result.then((result) => {
      if (result) {
        this.getWarehousesUnitById(result)
      }
    });
  }

  doNewEvent() {
    const modalRef = this.modelService.open(AddEditWarehousesUnitTransactionsComponent, { size: 'lg' });
    modalRef.componentInstance.name = this.translate.instant('warehouses-unit.add-edit');
    modalRef.componentInstance.warehousesUnitMasterId = this.id;
    modalRef.result.then((result) => {
      if (result) {
        this.getWarehousesUnitById(result)
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
        let sub = this.warehousesUnitService.deleteWarehousesUnitTransaction(id).subscribe(
          () => {
            //reloadPage()
            this.getWarehousesUnitById(this.id);

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
  warehousesUnitTransactionsDto: any = [];
  columnNames = [
    this.lang == 'ar'
      ? {
        title: ' الوحدة ', width: 300, field: 'warehousesUnitDetailNameAr'
      } : {
        title: ' Unit ', width: 300, field: 'warehousesUnitDetailNameEn'
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
      data: this.warehousesUnitTransactionsDto,
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

