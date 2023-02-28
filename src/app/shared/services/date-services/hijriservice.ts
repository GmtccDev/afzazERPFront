import { TranslationWidth } from '@angular/common';
import { Injectable } from '@angular/core';
import {
    NgbDatepickerI18n,
    NgbDateStruct
} from '@ng-bootstrap/ng-bootstrap';
const WEEKDAYS = ['س','ح','ن','ث','ر','خ','ج'];
const WEEKDAYSLABEL = ['الاحد','الاثنين','الثلاثاء','الاربعاء','الخميس','الجمعة','السبت'];
const MONTHS = ['محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوال',
    'ذو القعدة', 'ذو الحجة'];

    @Injectable({
        providedIn: 'root'
      })
export class IslamicI18n extends NgbDatepickerI18n {
    getWeekdayLabel(weekday: number, width?: TranslationWidth | undefined): string {
        return WEEKDAYS[weekday];
    }

    getWeekdayShortName(weekday: number) {
        return WEEKDAYS[weekday - 1];
    }

    getMonthShortName(month: number) {
        return MONTHS[month - 1];
    }

    getMonthFullName(month: number) {
        return MONTHS[month - 1];
    }

    getDayAriaLabel(date: NgbDateStruct): string {
        return `${date.day}-${date.month}-${date.year}`;
    }
}
