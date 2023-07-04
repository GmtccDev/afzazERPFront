import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FiltersComponent } from './filters.component';
import { TranslateLoader, TranslateModule, TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';

import { NgxSpinnerModule } from 'ngx-spinner';
import { SharedService } from '../../common-services/shared-service';
import { Subscription } from 'rxjs';
import {stringIsNullOrEmpty} from  '../../helper/helper'
import {FullDateModule} from '../../date/full-date/full-date.module'
import { MultiSelectModule } from 'primeng/multiselect';



@NgModule({
    declarations: [FiltersComponent],
    exports: [FiltersComponent],
    imports: [FormsModule,
        // HijriDateModule,
        // GregorianDateModule,
       FullDateModule,
        NgxSpinnerModule,
        //NgSelectModule,
       // NgbNavModule,
        TranslateModule,
        MultiSelectModule,


        CommonModule, TranslateModule.forChild({
        loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
        }
    }),
    ],
    providers: [TranslatePipe]
})
export class FiltersModule {
    lang: string = '';
    constructor(
      private translateService: TranslateService,
      private sharedServices: SharedService,
     // private managerService:ManagerService
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
export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http);
}


