import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { SharedService } from '../../../../shared/common-services/shared-service';
import { ToolbarPath } from '../../../../shared/interfaces/toolbar-path';
import { UserServiceProxy } from '../../services/user-service'
import { ToolbarData } from '../../../../shared/interfaces/toolbar-data';
import { Subscription } from 'rxjs';
import { ITabulatorActionsSelected } from '../../../../shared/interfaces/ITabulator-action-selected';
import { MessageModalComponent } from '../../../../shared/components/message-modal/message-modal.component'
import { SettingMenuShowOptions } from '../../../../shared/components/models/setting-menu-show-options';
import { ToolbarActions } from '../../../../shared/enum/toolbar-actions'
import { DeleteListUserCommand, UserDto } from '../../models/User';
@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss']
})
export class UsersListComponent implements OnInit, OnDestroy, AfterViewInit {

  //#region Main Declarations
  user: UserDto[] = [];
  currnetUrl: any;
  addUrl: string = '/security/user/add-user';
  updateUrl: string = '/security/user/update-user/';
  listUrl: string = '/security/user';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList: this.translate.instant("component-names.user"),
    componentAdd: '',

  };
  //#endregion

  //#region Constructor
  constructor(
    private userService: UserServiceProxy,
    private router: Router,
    private sharedServices: SharedService, private translate: TranslateService,
    private modalService: NgbModal) {

  }


  //#endregion

  //#region ngOnInit
  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    this.listenToClickedButton();

    this.getUserss();
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
  getUserss() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.userService.allUsers(undefined, undefined, undefined, undefined, undefined).subscribe({
        next: (res) => {
          console.log(res);
          //let data =
          //   res.data.map((res: PeopleOfBenefitsVM[]) => {
          //   return res;
          // });
          this.toolbarPathData.componentList = this.translate.instant("component-names.user");
          if (res.success) {
            this.user = res.response?.items;
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
    this.userService.deleteUser(id).subscribe((resonse) => {
      console.log('delet response', resonse);
      this.getUserss();
    });
  }
  edit(id: string) {
    this.router.navigate([
      '/security/user/update-user',
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
        let sub = this.userService.deleteUser(id).subscribe(
          () => {
            //reloadPage()
            this.getUserss();

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
  lang = localStorage.getItem("language");
  columnNames = [
	  {
		  title: this.lang == 'ar' ? ' الكود' : 'code ',
		  field: 'code',
	  },
    this.lang == 'ar'
		  ?

		  { title: ' الاسم', field: 'nameAr' } : { title: ' Name  ', field: 'nameEn' },


	  {
		  title: this.lang == 'ar' ? ' اسم المستخدم ' : 'User Name ',
		  field: 'fullName',
	  },
	  {
		  title: this.lang == 'ar' ? ' البريد الالكتروني' : 'Email ',
		  field: 'email',
	  },

    {
      title: this.lang == 'ar' ? ' رقم الجوال  ' : 'Phone Number ',
      field: 'phoneNumber',
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
        { field: 'phoneNumber', type: 'like', value: searchTxt },
        { field: 'email', type: 'like', value: searchTxt },
        { field: 'fullName', type: 'like', value: searchTxt },
        ,
      ],
    ];
  }

  openUserss() { }
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
      this.router.navigate(['security/user/update-user/' + id]
      )
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

    let item = new DeleteListUserCommand();
    item.ids = this.listIds;
    let sub = this.userService.deleteListUser(item).subscribe(
      (resonse) => {

        //reloadPage()
        this.getUserss();
        this.listIds = [];
      });
    this.subsList.push(sub);
  }
  //#endregion
}

