import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-vouchers',
  templateUrl: './vouchers.component.html',
  styleUrls: ['./vouchers.component.scss']
})
export class VouchersComponent implements OnInit, OnDestroy, AfterViewInit {

  //#region Main Declarations
  accountClassification: any[] = [];
  currnetUrl: any;
  addUrl: string = '/accounting-opertaions/vouchers/add-voucher';
  updateUrl: string = '/accounting-opertaions/vouchers/update-voucher/';
  listUrl: string = '/accounting-opertaions/vouchers';
  // toolbarPathData: ToolbarPath = {
  //   listPath: '',
  //   updatePath: this.updateUrl,
  //   addPath: this.addUrl,
  //   componentList: this.translate.instant("component-names.accountClassification"),
  //   componentAdd: '',

  // };
  listIds: any[] = [];
  //#endregion

  //#region Constructor
  constructor(
    private router: Router,
    //private sharedServices: SharedService,
    private modalService: NgbModal,
    private translate: TranslateService
  ) {

  }


  //#endregion

  //#region ngOnInit
  ngOnInit(): void {

  }

  ngAfterViewInit(): void {

  //  this.listenToClickedButton();

    setTimeout(() => {

    //  this.sharedServices.changeButton({ action: 'List' } as ToolbarData);
    //  this.sharedServices.changeToolbarPath(this.toolbarPathData);
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


  currentBtn!: string;
  subsList: Subscription[] = [];
  // listenToClickedButton() {

  //   let sub = this.sharedServices.getClickedbutton().subscribe({
  //     next: (currentBtn: ToolbarData) => {

  //       //currentBtn;
  //       if (currentBtn != null) {
  //         if (currentBtn.action == ToolbarActions.List) {

  //         } else if (currentBtn.action == ToolbarActions.New) {
  //           this.router.navigate([this.addUrl]);
  //         }
  //         else if (currentBtn.action == ToolbarActions.DeleteCheckList) {
  //           this.onDelete();
  //         }
  //       }
  //     },
  //   });
  //   this.subsList.push(sub);
  // }

  //#endregion
}
