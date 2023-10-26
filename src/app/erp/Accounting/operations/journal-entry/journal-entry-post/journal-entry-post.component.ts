import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { SharedService } from 'src/app/shared/common-services/shared-service';
import { ToolbarPath } from 'src/app/shared/interfaces/toolbar-path';
import { NotificationsAlertsService } from '../../../../../shared/common-services/notifications-alerts.service';
import { ToolbarData } from 'src/app/shared/interfaces/toolbar-data';
import { Subscription } from 'rxjs';
import { ITabulatorActionsSelected } from '../../../../../shared/interfaces/ITabulator-action-selected';
import { SettingMenuShowOptions } from 'src/app/shared/components/models/setting-menu-show-options';
import { ToolbarActions } from '../../../../../shared/enum/toolbar-actions';
import { JournalEntryServiceProxy } from '../../../services/journal-entry'
import format from 'date-fns/format';
import { NgxSpinnerService } from 'ngx-spinner';
@Component({
  selector: 'app-journal-entry-post',
  templateUrl: './journal-entry-post.component.html',
  styleUrls: ['./journal-entry-post.component.scss']
})
export class JournalEntryPostComponent implements OnInit, OnDestroy, AfterViewInit {

  //#region Main Declarations
  journalEntry: any[] = [];
  currnetUrl: any;
  addUrl: string = '/accounting-operations/journalEntryPost/add-journalEntryPost';
  updateUrl: string = '/accounting-operations/journalEntryPost/update-journalEntryPost/';
  listUrl: string = '/accounting-operations/journalEntryPost';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: '',
    componentList: this.translate.instant("component-names.journalEntryPost"),
    componentAdd: '',

  };
  listIds: any[] = [];
  //#endregion

  //#region Constructor
  constructor(
    private journalEntryService: JournalEntryServiceProxy,
    private router: Router,
    private sharedServices: SharedService,
    private alertsService: NotificationsAlertsService,
    private modalService: NgbModal,
    private translate: TranslateService,
    private spinner: NgxSpinnerService,

  ) {

  }


  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    //  this.defineGridColumn();
    this.spinner.show();
    Promise.all([this.getJournalEntryes()])
      .then(a => {
        this.spinner.hide();
        this.sharedServices.changeButton({ action: 'Post' } as ToolbarData);
        this.sharedServices.changeToolbarPath(this.toolbarPathData);
        this.listenToClickedButton();
      }).catch(err => {
        this.spinner.hide();
      })
  }

  ngAfterViewInit(): void {




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
  getJournalEntryes() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.journalEntryService.allJournalEntryes(undefined, undefined, undefined, undefined, undefined).subscribe({
        next: (res) => {
          this.toolbarPathData.componentList = this.translate.instant("component-names.journalEntryPost");
          if (res.success) {
            this.journalEntry = res.response.items.filter(x => x.isCloseFiscalPeriod != true);


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

  //#endregion

  //#region CRUD operations
  delete(id: any) {
    this.journalEntryService.deleteJournalEntry(id).subscribe((resonse) => {
      this.getJournalEntryes();
    });
  }
  edit(id: string) {
    this.router.navigate([
      '/accounting-operations/journalEntryPost/update-journalEntryPost',
      id,
    ]);
  }

  //#endregion



  showConfirmDeleteMessage(id) {

  }
  //#endregion
  //#region Tabulator

  panelId: number = 1;
  sortByCols: any[] = [];
  searchFilters: any;
  groupByCols: string[] = [];
  lang: string = localStorage.getItem("language");
  columnNames = [

    {
      title: this.lang == 'ar' ? ' الكود' : 'code ',
      field: 'code',
    },
    this.lang == 'ar'
      ? {
        title: '  تاريخ  ', width: 300, field: 'date', formatter: function (cell, formatterParams, onRendered) {
          var value = cell.getValue();
          value = format(new Date(value), 'dd-MM-yyyy');;
          return value;
        }
      } : {
        title: 'Date', width: 300, field: 'date', formatter: function (cell, formatterParams, onRendered) {
          var value = cell.getValue();
          value = format(new Date(value), 'dd-MM-yyyy');;
          return value;
        }
      },
    this.lang == 'ar'
      ? {
        title: '  الحالة  ', width: 300, field: 'postType', formatter: this.translateArEnum
      } : {
        title: '   Status', width: 300, field: 'postType', formatter: this.translateEnEnum
      },
  ];

  menuOptions: SettingMenuShowOptions = {
    showDelete: false,
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

  openJournalEntryes() { }
  onCheck(id) {
;
    const index = this.listIds.findIndex(item => item.id === id && item.isChecked === true);
  if (index !== -1) {
    this.listIds.splice(index, 1);
  } else {
    const newItem = { id, isChecked: true };
    this.listIds.push(newItem);
  }

}
  onEdit(id) {

    if (id != undefined) {
      this.edit(id);
      this.sharedServices.changeButton({
        action: 'Update',
        componentName: 'List',
        submitMode: false
      } as ToolbarData);

      this.sharedServices.changeToolbarPath(this.toolbarPathData);
      this.router.navigate(['accounting-operations/journalEntryPost/update-journalEntryPost/' + id])
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

        this.sharedServices.changeToolbarPath(this.toolbarPathData);
        this.router.navigate(['accounting-operations/journalEntryPost/update-journalEntryPost/' + event.item.id])

      } else if (event.actionName == 'Delete') {
        // this.showConfirmDeleteMessage(event.item.id);
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
            //  this.router.navigate([this.addUrl]);
          }
          else if (currentBtn.action == ToolbarActions.DeleteCheckList) {
            // this.onDelete();
          }
          else if (currentBtn.action == ToolbarActions.Post) {
            this.onCheckUpdate();
          }
        }
      },
    });
    this.subsList.push(sub);
  }
  onDelete() {


    var ids = this.listIds.map(item => item.id);
    let sub = this.journalEntryService.deleteListJournalEntry(ids).subscribe(
      (resonse) => {

        //reloadPage()
        this.getJournalEntryes();
        this.listIds = [];
      });
    this.subsList.push(sub);
  }
  listUpdateIds: any[] = [];
  onCheckUpdate() {

;
    var ids = this.listIds.map(item => item.id);
    if(ids.length>0){
      let sub = this.journalEntryService.updateList(ids).subscribe(
        (resonse) => {
    
          //reloadPage()
          this.getJournalEntryes();
          this.listUpdateIds = [];
        });
      this.subsList.push(sub);
    }
  
  }
  translateArEnum(cell, formatterParams, onRendered) {

    const status = cell.getValue();
    let text;
    switch (status) {
      case 1:
        text = 'مرحل';
        break;
      case 2:
        text = 'غير مرحل';
        break;

      default:
        text = status;
        break;
    }
    return text;

  }
  translateEnEnum(cell, formatterParams, onRendered) {

    const status = cell.getValue();
    let text;
    switch (status) {
      case 1:
        text = 'Post';
        break;
      case 2:
        text = 'Not Post';
        break;

      default:
        text = status;
        break;
    }
    return text;

  }
  //#endregion
}
