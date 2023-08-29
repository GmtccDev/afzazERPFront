import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { SharedService } from '../../../../shared/common-services/shared-service';
import { MessageModalComponent } from '../../../../shared/components/message-modal/message-modal.component';
import { SettingMenuShowOptions } from '../../../../shared/components/models/setting-menu-show-options';
import { ToolbarData } from '../../../../shared/interfaces/toolbar-data';
import { ToolbarPath } from '../../../../shared/interfaces/toolbar-path';
import { DeleteListJournalCommand, JournalDto } from '../../models/journal';
import { JournalServiceProxy } from '../../services/journal.service';
import { ITabulatorActionsSelected } from '../../../../shared/interfaces/ITabulator-action-selected';

import { ToolbarActions } from '../../../../shared/enum/toolbar-actions'
import { NgxSpinnerService } from 'ngx-spinner';
@Component({
  selector: 'app-journals',
  templateUrl: './journals.component.html',
  styleUrls: ['./journals.component.scss']
})
export class JournalsComponent implements OnInit, OnDestroy, AfterViewInit {

  //#region Main Declarations
  journal: JournalDto[] = [];
  currnetUrl: any;
  addUrl: string = '/accounting-master-codes/journal/add-journal';
  updateUrl: string = '/accounting-master-codes/journal/update-journal/';
  listUrl: string = '/accounting-master-codes/journal';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.journal"),
    componentAdd: '',

  };
  //#endregion

  //#region Constructor
  constructor(
    private journalService: JournalServiceProxy,
    private router: Router,
    private sharedServices: SharedService, private translate: TranslateService,
    private modalService: NgbModal,private spinner: NgxSpinnerService,
    ) {

  }


  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    //this.defineGridColumn();
    this.spinner.show();
    Promise.all([ this.getJournals()])
    .then(a=>{
      this.spinner.hide();
      this.sharedServices.changeButton({ action: 'List' } as ToolbarData);
      this.sharedServices.changeToolbarPath(this.toolbarPathData);
      this.listenToClickedButton();
    }).catch(err=>{
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
  getJournals() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.journalService.allJournales(undefined,undefined,undefined,undefined,undefined).subscribe({
        next: (res) => {
        
          this.toolbarPathData.componentList = this.translate.instant("component-names.journal");
          if (res.success) {
            this.journal = res.response.items;
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
    
    this.journalService.deleteJournal(id).subscribe((resonse) => {
      console.log('delet response', resonse);
      this.getJournals();
    });
  }
  edit(id: string) {
    this.router.navigate([
      '/accounting-master-codes/journal/update-journal',
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
        this.spinner.show();

        let sub = this.journalService.deleteJournal(id).subscribe(
          () => {
            //reloadPage()
            this.getJournals();

          });
        this.subsList.push(sub);
        this.spinner.hide();

      }
    });
  }
  //#endregion
  //#region Tabulator

  panelId: number = 1;
  sortByCols: any[] = [];
  searchFilters: any;
  groupByCols: string[] = [];
  lang = localStorage.getItem("language");
  columnNames = [
    this.lang == 'ar'
      ? { title: ' الاسم', field: 'nameAr' } : { title: ' Name  ', field: 'nameEn' },

    {
      title: this.lang == 'ar' ? ' الكود' : 'code ',
      field: 'code',
    },
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

  openJournals() { }
  onEdit(id) {

    if (id != undefined) {
      this.edit(id);
      this.sharedServices.changeButton({
        action: 'Update',
        componentName: 'List',
        submitMode: false
      } as ToolbarData);

      this.sharedServices.changeToolbarPath(this.toolbarPathData);
      this.router.navigate(['accounting-master-codes/journal/update-journal/' + id]
      )
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
        this.router.navigate(['accounting-master-codes/journal/update-journal/' + event.item.id]
        )

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
  onCheck(id) {
    
 
    this.listIds.push(id);
    this.sharedServices.changeButton({
      action: 'Delete',
      componentName: 'List',
      submitMode: false
    } as ToolbarData);
  }
  listIds: any[] = [];
  onDelete() {

    let item = new DeleteListJournalCommand();
    item.ids = this.listIds;
    let sub = this.journalService.deleteListJournal( item).subscribe(
      (resonse) => {

        //reloadPage()
        this.getJournals();
        this.listIds = [];
      });
    this.subsList.push(sub);
  }
  //#endregion
}

