import { FullDateComponent } from './full-date.component';
import { NgModule } from '@angular/core';
import { HijriDateModule } from '../hijri-date/hijri-date.module';
import { GregorianDateModule } from '../gregorian-date/gregorian-date.module';
import { CommonModule } from '@angular/common';

@NgModule({
    imports: [HijriDateModule, GregorianDateModule,CommonModule],
    exports: [FullDateComponent],
    declarations: [FullDateComponent]
})
export class FullDateModule { }