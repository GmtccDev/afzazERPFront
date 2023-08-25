import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { SharedService } from 'src/app/shared/common-services/shared-service';
import { ToolbarPath } from 'src/app/shared/interfaces/toolbar-path';
import { NotificationsAlertsService } from '../../../shared/common-services/notifications-alerts.service';
import { CompanyServiceProxy } from '../services/company.service';
import { CompanyDto, DeleteListCompanyCommand } from '../models/company';
import { ToolbarData } from 'src/app/shared/interfaces/toolbar-data';
import { Subscription } from 'rxjs';
import { ITabulatorActionsSelected } from '../../../shared/interfaces/ITabulator-action-selected';
import { MessageModalComponent } from '../../../shared/components/message-modal/message-modal.component'
import { SettingMenuShowOptions } from 'src/app/shared/components/models/setting-menu-show-options';
import { ToolbarActions } from '../../../shared/enum/toolbar-actions'
@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.scss']
})
export class CompaniesComponent implements OnInit, OnDestroy, AfterViewInit {

  //#region Main Declarations
  companies: CompanyDto[] = [];
  currnetUrl: any;
  addUrl: string = '/master-codes/companies/add-company';
  updateUrl: string = '/master-codes/companies/update-company/';
  listUrl: string = '/master-codes/companies';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.companies"),
    componentAdd: '',

  };
  listIds: any[] = [];
  symbolList: { descriptionAr: string; descriptionEn: string; value: string; }[];
  //#endregion

  //#region Constructor
  constructor(
    private companyService: CompanyServiceProxy,
    private router: Router,
    private sharedServices: SharedService,
    private alertsService: NotificationsAlertsService,
    private modalService: NgbModal,
    private translate: TranslateService
  ) {

  }


  //#endregion

  //#region ngOnInit
  ngOnInit(): void {

  }

  ngAfterViewInit(): void {

    this.listenToClickedButton();

    this.getCompanies();
    setTimeout(() => {

      this.sharedServices.changeButton({ action: 'List' } as ToolbarData);
      this.sharedServices.changeToolbarPath(this.toolbarPathData);
    }, 300);


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

  //#region Permissions

  //#endregion

  //#region  State Management
  //#endregion

  //#region Basic Data
  ///Geting form dropdown list data
  getCompanies() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.companyService.allCompanies(undefined, undefined, undefined, undefined, undefined).subscribe({
        next: (res) => {

          console.log(res);
          //let data =
          //   res.data.map((res: PeopleOfBenefitsVM[]) => {
          //   return res;
          // });
          this.toolbarPathData.componentList = this.translate.instant("component-names.companies");
          if (res.success) {
            this.companies = res.response.items
              ;

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
  delete(id: any) {
    this.companyService.deleteCompany(id).subscribe((resonse) => {
      console.log('delet response', resonse);
      this.getCompanies();
    });
  }
  edit(id: string) {
    this.router.navigate([
      '/master-codes/companies/update-company',
      id,
    ]);
  }

  //#endregion



  showConfirmDeleteMessage(id) {
    const modalRef = this.modalService.open(MessageModalComponent);
    modalRef.componentInstance.message = this.translate.instant('messages.confirm-delete');
    modalRef.componentInstance.title = this.translate.instant('messageTitle.delete');
    modalRef.componentInstance.btnConfirmTxt = this.translate.instant('messageTitle.delete');
    modalRef.componentInstance.isYesNo = true;
    modalRef.result.then((rs) => {
      console.log(rs);
      if (rs == 'Confirm') {
        let sub = this.companyService.deleteCompany(id).subscribe(
          (resonse) => {

            //reloadPage()
            this.getCompanies();

          });
        this.subsList.push(sub);
      }
    });
  }
  //#endregion
  //#region Tabulator

  panelId: number = 1;
  sortByCols: any[] = [];
  searchFilters: any;
  groupByCols: string[] = [];
  lang: string = localStorage.getItem("language");
  getSymbol() {

    this.symbolList = [
      { descriptionAr: 'دولار - $', descriptionEn: 'Dollar - $', value: '1' },
      { descriptionAr: 'يورو - €', descriptionEn: 'Euro - €', value: '2' },
      { descriptionAr: 'ريال – ﷼', descriptionEn: 'Riyal – ﷼', value: '3' },
      { descriptionAr: 'دينار – د.ك', descriptionEn: 'Dinar – د.ك', value: '4' }
    ];
  }
  columnNames = [
    this.lang == 'ar'
      ? { title: ' الاسم', field: 'nameAr' } :
      { title: ' Name  ', field: 'nameEn' },

    {
      title: this.lang == 'ar' ? ' الكود' : 'code ',
      field: 'code',
    },
    this.lang == 'ar'
      ? { title: ' العنوان', field: 'address' } :
      { title: ' Address  ', field: 'address' },

    this.lang == 'ar'
      ? { title: ' الدولة', field: 'countryNameAr' } :
      { title: ' Country  ', field: 'countryNameEn' },

    this.lang == 'ar'
      ? { title: ' العملة', field: 'symbol' } :
      { title: ' Currency  ', field: 'symbol' },
  ];

  menuOptions: SettingMenuShowOptions = {
    showDelete: true,
    showEdit: true,
  };

  direction: string = 'ltr';

  onSearchTextChange(searchTxt: string) {
    this.searchFilters = [
      [
        { field: 'nameEn', type: 'like', value: searchTxt },
        { field: 'nameAr', type: 'like', value: searchTxt },
        { field: 'code', type: 'like', value: searchTxt },
        ,
      ],
    ];
  }

  openCompanies() { }
  onCheck(id) {

    this.listIds.push(id);
    this.sharedServices.changeButton({
      action: 'Delete',
      componentName: 'List',
      submitMode: false
    } as ToolbarData);
  }
  onEdit(id) {

    if (id != undefined) {
      this.edit(id);
      this.sharedServices.changeButton({
        action: 'Update',
        componentName: 'List',
        submitMode: false
      } as ToolbarData);

      // this.toolbarPathData.updatePath = "/control-panel/definitions/update-benefit-person/"
      this.sharedServices.changeToolbarPath(this.toolbarPathData);
      this.router.navigate(['master-codes/companies/update-company/' + id])
    }

  }
  onMenuActionSelected(event: ITabulatorActionsSelected) {

    if (event != null) {
      if (event.actionName == 'Edit') {
        this.edit(event.item.id);
        this.sharedServices.changeButton({
          action: 'Update',
          componentName: 'List',
          submitMode: false
        } as ToolbarData);

        // this.toolbarPathData.updatePath = "/control-panel/definitions/update-benefit-person/"
        this.sharedServices.changeToolbarPath(this.toolbarPathData);
        this.router.navigate(['master-codes/companies/update-company/' + event.item.id])

      } else if (event.actionName == 'Delete') {
        this.showConfirmDeleteMessage(event.item.id);
      }
    }
  }

  //#endregion



  //#region Toolbar Service
  currentBtn!: string;
  subsList: Subscription[] = [];
  listenToClickedButton() {

    let sub = this.sharedServices.getClickedbutton().subscribe({
      next: (currentBtn: ToolbarData) => {

        //currentBtn;
        if (currentBtn != null) {
          if (currentBtn.action == ToolbarActions.List) {

          } else if (currentBtn.action == ToolbarActions.New) {
            this.router.navigate([this.addUrl]);
          }
          else if (currentBtn.action == ToolbarActions.DeleteCheckList) {
            this.onDelete();
          }
        }
      },
    });
    this.subsList.push(sub);
  }
  onDelete() {

    let item = new DeleteListCompanyCommand();
    item.ids = this.listIds;
    let sub = this.companyService.deleteListCompany(item).subscribe(
      (resonse) => {

        //reloadPage()
        this.getCompanies();
        this.listIds = [];
      });
    this.subsList.push(sub);
  }
  //#endregion
}
