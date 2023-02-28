import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SharedService } from 'src/app/shared/common-services/shared-service';
import { ToolbarPath } from 'src/app/shared/interfaces/toolbar-path';
import {CountryServiceProxy } from '../../services/country.servies';
import { CountryDto } from '../../models/country';
import { NgxSpinnerService } from 'ngx-spinner';
import { CODE_REQUIRED_VALIDATORS, NAME_REQUIRED_VALIDATORS } from 'src/app/shared/constants/input-validators';
import { Subscription } from 'rxjs';
import { ToolbarData } from 'src/app/shared/interfaces/toolbar-data';
import { ToolbarActions } from 'src/app/shared/enum/toolbar-actions';
import { navigateUrl } from 'src/app/shared/helper/helper-url';
@Component({
  selector: 'app-add-country',
  templateUrl: './add-country.component.html',
  styleUrls: ['./add-country.component.css']
})
export class AddCountryComponent implements OnInit {
  //#region Main Declarations
  countriesForm!: FormGroup;
  sub: any;
  url: any;
  id: any = 0;
  currnetUrl;
  countries: CountryDto[] = [];
  addUrl: string = '/master-codes/countries/add-country';
  updateUrl: string = '/master-codes/countries/update-country/';
  listUrl: string = '/master-codes/countries';
  toolbarPathData: ToolbarPath = {
    listPath: '',
    updatePath: this.updateUrl,
    addPath: this.addUrl,
    componentList:this.translate.instant("countries") ,
    componentAdd: '',

  };
  Response: any;
  errorMessage = '';
  errorClass = '';
  submited: boolean = false;
  constructor(
    private countryService: CountryServiceProxy,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private SharedServices: SharedService,
    private translate:TranslateService
  ) {

    this.defineCountryForm();

  }
  //#endregion

  //#region ngOnInit
  ngOnInit(): void {

    this.currnetUrl = this.router.url;
    this.listenToClickedButton();
    this.changePath();
    if (this.currnetUrl == this.addUrl) {
      this.getCountryCode();
    }
    this.sub = this.route.params.subscribe((params) => {
      if (params['id'] != null) {
        this.id = +params['id'];
        if (this.id > 0) {
          this.getCountryById(this.id);
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
  defineCountryForm() {
    this.countriesForm = this.fb.group({
      id: 0,
      nameAr: NAME_REQUIRED_VALIDATORS,
      nameEn: NAME_REQUIRED_VALIDATORS,
      code:  CODE_REQUIRED_VALIDATORS,
      isActive:true
    });
  }

  //#endregion

  //#region CRUD Operations
  getCountryById(id: any) {
    const promise = new Promise<void>((resolve, reject) => {
      this.countryService.getCountry(id).subscribe({
        next: (res: any) => {
          
          console.log('result data getbyid', res);
          this.countriesForm.setValue({
            id: res.response.id,
            nameAr: res.response?.nameAr,
            nameEn: res.response?.nameEn,
            code: res.response?.code,
           isActive:res.response?.isActive
          });
          console.log(
            'this.countriesForm.value set value',
            this.countriesForm.value
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
  getCountryCode() {
    const promise = new Promise<void>((resolve, reject) => {
      this.countryService.getLastCode().subscribe({
        next: (res: any) => {

          this.toolbarPathData.componentList=this.translate.instant("component-names.countries");
          this.countriesForm.patchValue({
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
    return this.countriesForm.controls;
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
            this.toolbarPathData.componentAdd = 'Add Country';
            this.defineCountryForm();
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
    if (this.countriesForm.valid) {
         ;
      const promise = new Promise<void>((resolve, reject) => {

        this.countryService.createCountry(this.countriesForm.value).subscribe({
          next: (result: any) => {
            this.spinner.show();
            console.log('result dataaddData ', result);
            this.Response = { ...result.response };
            this.defineCountryForm();

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

    //  return this.countriesForm.markAllAsTouched();
    }
  }


  onUpdate() {

    if (this.countriesForm.valid) {
      this.countriesForm.value.id = this.id;
      console.log("this.VendorCommissionsForm.value", this.countriesForm.value)
      const promise = new Promise<void>((resolve, reject) => {
        this.countryService.updateCountry(this.countriesForm.value).subscribe({
          next: (result: any) => {
            this.spinner.show();
            console.log('result update ', result);
            this.Response = { ...result.response };
            this.defineCountryForm();
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

     // return this.countriesForm.markAllAsTouched();
    }
  }

  //#endregion


}

