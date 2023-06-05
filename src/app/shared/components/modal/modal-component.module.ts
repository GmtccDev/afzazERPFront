import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { stringIsNullOrEmpty } from '../../helper/helper';
import { SharedService } from '../../common-services/shared-service';

import {  NgbdModalContent } from './modal-component';

@NgModule({
  imports: [BrowserModule, NgbModule,TranslateModule],
  declarations: [NgbdModalContent],
  exports: [],
  bootstrap: [],
  entryComponents: [NgbdModalContent],
  providers: [TranslatePipe ]
})
export class NgbdModalComponentModule {
  lang: string = '';
  constructor(
    private translateService: TranslateService,
    private sharedServices: SharedService,
    //private managerService:ManagerService
  ) {
    this.lang = localStorage.getItem('language')!;
    this.listenToLanguageChange();
    // managerService.load();
  }
  currentBtn!: string;
  subsList: Subscription[] = [];
  listenToLanguageChange() {
    let sub = this.sharedServices.getLanguage().subscribe({
      next: (currentLanguage: string) => {
        currentLanguage;
        if (!stringIsNullOrEmpty(currentLanguage)) {
          this.translateService.use(currentLanguage).subscribe({
            next: (result: any) => {
              //(('translateService', result);
            },
          });
        } else {
          this.translateService.use(this.lang).subscribe({
            next: (result: any) => {
              //(('translateService', result);
            },
          });
        }
      },
    });
    this.subsList.push(sub);
  }


}
