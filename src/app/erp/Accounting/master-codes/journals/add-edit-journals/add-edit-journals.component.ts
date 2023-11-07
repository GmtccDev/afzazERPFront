import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SharedService } from '../../../../../shared/common-services/shared-service';
import { ToolbarPath } from '../../../../../shared/interfaces/toolbar-path';
import { JournalServiceProxy } from '../../../services/journal.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { JournalDto } from '../../../models/journal';
import { CODE_REQUIRED_VALIDATORS, NAME_REQUIRED_VALIDATORS } from '../../../../../shared/constants/input-validators';
import { Subscription } from 'rxjs';
import { ToolbarData } from '../../../../../shared/interfaces/toolbar-data';
import { ToolbarActions } from '../../../../../shared/enum/toolbar-actions';
import { navigateUrl } from '../../../../../shared/helper/helper-url';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbdModalContent } from 'src/app/shared/components/modal/modal-component';
@Component({
  selector: 'app-add-edit-journals',
  templateUrl: './add-edit-journals.component.html',
  styleUrls: ['./add-edit-journals.component.scss']
})
export class AddEditJournalsComponent implements OnInit {
  //#region Main Declarations
  userId: any = localStorage.getItem("userId");
	// = "2e992e3d-3bc9-41f5-9b6e-98fbc97d770a";
	orderBy: any;
	companyId: string = localStorage.getItem("companyId");
	lang = localStorage.getItem("language");
  journalForm!: FormGroup;
  sub: any;
  url: any;
  id: any = 0;
  currnetUrl;
  journal: JournalDto[] = [];
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
  response: any;
  errorMessage = '';
  errorClass = '';
  submited: boolean = false;
  constructor(
    private journalService: JournalServiceProxy,
    private router: Router,
    private sharedServices: SharedService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private modalService: NgbModal,
    private SharedServices: SharedService, private translate: TranslateService
  ) {
    this.defineJournalForm();
  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    this.spinner.show();

    this.getRouteData();
    this.currnetUrl = this.router.url;
    if (this.currnetUrl == this.addUrl) {
      this.getJournalCode();
    }
    this.changePath();
    this.listenToClickedButton();
    this.spinner.hide();



  }

  //#endregion
  getRouteData() {
    let sub = this.route.params.subscribe((params) => {
      if (params['id'] != null) {
        this.id = +params['id'];
        if (this.id > 0) {
          this.getJournalById(this.id).then(a => {
            this.spinner.hide();

          }).catch(err => {
            this.spinner.hide();

          });


        }
        else {
          this.sharedServices.changeButton({ action: 'New' } as ToolbarData);
          this.spinner.hide();
        }

      }
      else {
        this.spinner.hide();
        this.sharedServices.changeButton({ action: 'New' } as ToolbarData);
      }
    });
    this.subsList.push(sub);

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

  //#region Permissions

  //#endregion

  //#region  State Management
  //#endregion

  //#region Basic Data
  ///Geting form dropdown list data
  defineJournalForm() {
    this.journalForm = this.fb.group({
      id: 0,
      nameAr: NAME_REQUIRED_VALIDATORS,
      nameEn: NAME_REQUIRED_VALIDATORS,
      code: CODE_REQUIRED_VALIDATORS,
      isActive: true
    });
  }

  //#endregion

  //#region CRUD Operations
  getJournalById(id: any) {
    return new Promise<void>((resolve, reject) => {
      let sub = this.journalService.getJournal(id).subscribe({
        next: (res: any) => {
          resolve();
          this.journalForm.setValue({
            id: res.response?.id,
            nameAr: res.response?.nameAr,
            nameEn: res.response?.nameEn,
            code: res.response?.code,
            isActive: res.response?.isActive
          });

        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {
          //console.log('complete');
        },
      });
      this.subsList.push(sub);

    });
  }
  getJournalCode() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.journalService.getLastCode().subscribe({

        next: (res: any) => {
          this.toolbarPathData.componentList = this.translate.instant("component-names.journal");
          this.journalForm.patchValue({
            code: res.response
          });

        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {
          //console.log('complete');
        },
      });
      this.subsList.push(sub);

    });

  }
  //#endregion

  //#region Helper Functions

  get f(): { [key: string]: AbstractControl } {
    return this.journalForm.controls;
  }


  //#endregion
  //#region Tabulator
  subsList: Subscription[] = [];
  currentBtnResult;
  listenToClickedButton() {
    let sub = this.SharedServices.getClickedbutton().subscribe({
      next: (currentBtn: ToolbarData) => {
        currentBtn;
            
        if (currentBtn != null) {
          if (currentBtn.action == ToolbarActions.List) {
            this.SharedServices.changeToolbarPath({
              listPath: this.listUrl,
            } as ToolbarPath);
            this.router.navigate([this.listUrl]);
          } else if (currentBtn.action == ToolbarActions.Save) {
            this.onSave();
          } else if (currentBtn.action == ToolbarActions.New) {
            this.toolbarPathData.componentAdd = this.translate.instant("journal.add-journal");
            if (this.journalForm.value.code != null) {
              this.getJournalCode()
            }
            this.defineJournalForm();
            this.SharedServices.changeToolbarPath(this.toolbarPathData);
          }else if (currentBtn.action == ToolbarActions.Update) {
            this.onUpdate();
          }
          else if (currentBtn.action == ToolbarActions.Copy) {
           this.getJournalCode();
          }  else if (currentBtn.action == ToolbarActions.Print) {
            this.gotoViewer();
           }
        }
      },
    });
    this.subsList.push(sub);
  }
  changePath() {
    this.SharedServices.changeToolbarPath(this.toolbarPathData);
  }
  confirmSave() {
    return new Promise<void>((resolve, reject) => {

      let sub = this.journalService.createJournal(this.journalForm.value).subscribe({
        next: (result: any) => {
          this.spinner.show();
          this.response = { ...result.response };
          this.defineJournalForm();

          this.submited = false;
          this.spinner.hide();
          navigateUrl(this.listUrl, this.router);
        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {
          //console.log('complete');
        },
      });
      this.subsList.push(sub);

    });
  }
  onSave() {
    if (this.journalForm.valid) {
      this.spinner.show();
      this.confirmSave().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });

    } else {

      return this.journalForm.markAllAsTouched();
    }
  }
  confirmUpdate() {
    this.journalForm.value.id = this.id;
    return new Promise<void>((resolve, reject) => {
      let sub = this.journalService.updateJournal(this.journalForm.value).subscribe({
        next: (result: any) => {
          this.spinner.show();
          this.response = { ...result.response };
          this.defineJournalForm();
          this.submited = false;
          this.spinner.hide();
          navigateUrl(this.listUrl, this.router);
        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {
          //console.log('complete');
        },
      });
      this.subsList.push(sub);

    });
  }

  onUpdate() {

    if (this.journalForm.valid) {
      this.spinner.show();
      this.confirmUpdate().then(a => {
        this.spinner.hide();
      }).catch(e => {
        this.spinner.hide();
      });


    }

    else {

      return this.journalForm.markAllAsTouched();
    }
  }

  //#endregion

  // Print Page Report

reportTypeId=1000;
branchId
JournalId
selectedCurrencyName='';
selectedBranchName='';
gotoViewer() {
	


	if (this.branchId == null || this.branchId == undefined || this.branchId == "undefined"|| this.branchId == "") {
		this.branchId = 0;
	}
	
	let reportParams: string = "reportParameter=branchId!" + this.branchId
	+ "&reportParameter=companyId!" + this.companyId
	+"&reportParameter=selectedBranchName!" + this.selectedBranchName
	+"&reportParameter=selectedCurrencyName!" + this.selectedCurrencyName 
	+ "&reportParameter=JournalEntryId!" + this.id
	+ "&reportParameter=lang!" + this.lang
	+ "&reportParameter=userId!" + this.userId;

	const modalRef = this.modalService.open(NgbdModalContent);
	modalRef.componentInstance.reportParams = reportParams;
	modalRef.componentInstance.reportType = 1;
	modalRef.componentInstance.reportTypeID = this.reportTypeId;
}
}

