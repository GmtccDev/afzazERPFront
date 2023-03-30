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
@Component({
  selector: 'app-add-edit-journals',
  templateUrl: './add-edit-journals.component.html',
  styleUrls: ['./add-edit-journals.component.scss']
})
export class AddEditJournalsComponent implements OnInit {
  //#region Main Declarations
  journalForm!: FormGroup;
  sub: any;
  url: any;
  id: any = 0;
  currnetUrl;
  journal:JournalDto[] = [];
  addUrl: string = '/accounting-master-codes/journal/add-journal';
  updateUrl: string = '/accounting-master-codes/journal/update-journal/';
  listUrl: string = '/accounting-master-codes/journal';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList:this.translate.instant("component-names.journal"),
    componentAdd: '',

  };
  Response: any;
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
    private SharedServices: SharedService,private translate:TranslateService
  ) {
    this.defineJournalForm();
  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {
    
    this.currnetUrl = this.router.url;
    this.listenToClickedButton();
    this.changePath();
    if (this.currnetUrl == this.addUrl) {
      this.getJournalCode();
    }
    this.sub = this.route.params.subscribe((params) => {
      if (params['id'] != null) {
        this.id = +params['id'];
        if (this.id > 0) {
          this.getJournalById(this.id);
        }
        this.url = this.router.url.split('/')[2];
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
      isActive:true
    });
  }

  //#endregion

  //#region CRUD Operations
  getJournalById(id: any) {
    const promise = new Promise<void>((resolve, reject) => {
      this.journalService.getJournal(id).subscribe({
        next: (res: any) => {
          console.log('result data getbyid', res);
          this.journalForm.setValue({
            id: res.response?.id,
            nameAr: res.response?.nameAr,
            nameEn: res.response?.nameEn,
            code: res.response?.code,
            isActive:res.response?.isActive
          });
          console.log(
            'this.journalForm.value set value',
            this.journalForm.value
          );
        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {
          console.log('complete');
        },
      });
    });
    return promise;
  }
  getJournalCode() {
    const promise = new Promise<void>((resolve, reject) => {
      this.journalService.getLastCode().subscribe({
       
        next: (res: any) => {
          this.toolbarPathData.componentList=this.translate.instant("component-names.journal");
          this.journalForm.patchValue({
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
            this.toolbarPathData.componentAdd = 'Add Journal';
            this.defineJournalForm();
            this.SharedServices.changeToolbarPath(this.toolbarPathData);
          } else if (currentBtn.action == ToolbarActions.Update) {
            this.onUpdate();
          }
        }
      },
    });
    this.subsList.push(sub);
  }
  changePath() {
    this.SharedServices.changeToolbarPath(this.toolbarPathData);
  }
  onSave() {
    if (this.journalForm.valid) {
      const promise = new Promise<void>((resolve, reject) => {

        this.journalService.createJournal(this.journalForm.value).subscribe({
          next: (result: any) => {
            this.spinner.show();
            console.log('result dataaddData ', result);
            this.Response = { ...result.response };
            this.defineJournalForm();

            this.submited = false;
            setTimeout(() => {
              this.spinner.hide();
             
              navigateUrl(this.listUrl, this.router);
            }, 1000);
          },
          error: (err: any) => {
            reject(err);
          },
          complete: () => {
            console.log('complete');
          },
        });
      });
      return promise;

    } else {
     
    //  return this.journalForm.markAllAsTouched();
    }
  }


  onUpdate() {
    
    if (this.journalForm.valid) {

      this.journalForm.value.id = this.id;
      console.log("this.VendorCommissionsForm.value", this.journalForm.value)
      const promise = new Promise<void>((resolve, reject) => {
        this.journalService.updateJournal( this.journalForm.value).subscribe({
          next: (result: any) => {
            this.spinner.show();
            console.log('result update ', result);
            this.Response = { ...result.response };
            this.defineJournalForm();
            this.submited = false;
            setTimeout(() => {
              this.spinner.hide();
             
              navigateUrl(this.listUrl, this.router);
            }, 1000);
          },
          error: (err: any) => {
            reject(err);
          },
          complete: () => {
            console.log('complete');
          },
        });
      });
      return promise;
    }

    else {
   
     // return this.journalForm.markAllAsTouched();
    }
  }

  //#endregion
}

