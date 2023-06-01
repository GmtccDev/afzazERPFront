import { NgModule} from '@angular/core';
import { GregorianDateComponent } from './gregorian-date.component';
import {NgbCalendarIslamicUmalqura, NgbDatepickerModule} from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

@NgModule({
    imports:[
        
        TranslateModule.forChild({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
        FormsModule,
        ReactiveFormsModule,
        
        CommonModule, NgbDatepickerModule,
    ],
    declarations:[GregorianDateComponent],
    entryComponents:[GregorianDateComponent],
    providers:[NgbCalendarIslamicUmalqura],
    exports:[GregorianDateComponent]
})

export class GregorianDateModule
{}

export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http);
}