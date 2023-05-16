import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-edit-voucher',
  templateUrl: './add-edit-voucher.component.html',
  styleUrls: ['./add-edit-voucher.component.scss']
})
export class AddEditVoucherComponent implements OnInit {
  //#region Main Declarations
  sub: any;
  url: any;
  id: any = 0;
  currnetUrl;
  public show: boolean = false;
  lang = localStorage.getItem("language")
  accountClassification: [] = [];
  addUrl: string = '/accounting-operations/vouchers/add-voucher';
  updateUrl: string = '/accounting-operations/vouchers/update-voucher/';
  listUrl: string = '/accounting-operations/vouchers';
  // toolbarPathData: ToolbarPath = {
  //   listPath: '',
  //   updatePath: this.updateUrl,
  //   addPath: this.addUrl,
  //   componentList: this.translate.instant("component-names.vouchers"),
  //   componentAdd: '',

  // };
 
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
     private translate: TranslateService,
    private cd: ChangeDetectorRef

  ) {
    //this.defineaccountClassificationForm();
  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    this.currnetUrl = this.router.url;
    //this.listenToClickedButton();
    //this.changePath();
    if (this.currnetUrl == this.addUrl) {
     // this.getaccountClassificationCode();
    }
    this.sub = this.route.params.subscribe((params) => {
      if (params['id'] != null) {
        this.id = params['id'];

        if (this.id) {
        //  this.getaccountClassificationById(this.id);
        }
      }
    });
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


  

  //#region Helper Functions




  //#endregion
  //#region Tabulator
  subsList: Subscription[] = [];
  currentBtnResult;
  // listenToClickedButton() {
  //   let sub = this.sharedServices.getClickedbutton().subscribe({
  //     next: (currentBtn: ToolbarData) => {
  //       currentBtn;

  //       if (currentBtn != null) {
  //         if (currentBtn.action == ToolbarActions.List) {
  //           this.sharedServices.changeToolbarPath({
  //             listPath: this.listUrl,
  //           } as ToolbarPath);
  //           this.router.navigate([this.listUrl]);
  //         } else if (currentBtn.action == ToolbarActions.Save) {
  //          // this.onSave();
  //         } else if (currentBtn.action == ToolbarActions.New) {
  //           this.toolbarPathData.componentAdd = 'Add accountClassification';
  //          // this.defineaccountClassificationForm();
  //           this.sharedServices.changeToolbarPath(this.toolbarPathData);
  //         } else if (currentBtn.action == ToolbarActions.Update) {
  //          // this.onUpdate();
  //         }
  //       }
  //     },
  //   });
  //   this.subsList.push(sub);
  // }
  // changePath() {
  //   this.sharedServices.changeToolbarPath(this.toolbarPathData);
  // }


}

