import { Component, OnInit, Output, EventEmitter, Renderer2, ViewChild, ElementRef, Input, OnChanges } from '@angular/core';
import {
  NgbCalendar, NgbCalendarIslamicUmalqura,
  NgbDatepickerI18n,
  NgbDateAdapter, NgbDateParserFormatter, NgbInputDatepicker
} from '@ng-bootstrap/ng-bootstrap';

import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { CustomDateParserFormatter } from '../../services/date-services/custom-date-formatter.service';
import { IslamicI18n } from '../../services/date-services/hijriservice';
import { DateModel } from '../../model/date-model';


@Component({
  selector: 'app-hijri-date',
  templateUrl: './hijri-date.component.html',
  styleUrls: ['./hijri-date.component.css'],
  providers: [
    { provide: NgbCalendar, useClass: NgbCalendarIslamicUmalqura },
    { provide: NgbDatepickerI18n, useClass: IslamicI18n },
    // {provide: NgbDateAdapter, useClass: DateCustomAdapter},
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter }

  ]
})
export class HijriDateComponent implements OnInit, OnChanges {

  @ViewChild('inputHDate') elementRef?: ElementRef;

  isAvailable: boolean = false;
  allowedKeyCode: number[] = [
    96, 97, 98, 99, 100, 101, 102, 103, 104, 105,
    8, 37, 39, 16, 35, 36, 46, 111
  ];

  allowedFunctionKey: number[] = [8, 37, 39, 16, 35, 36, 46, 111];



  @Output() onSelect = new EventEmitter<DateModel>();
  @Output() onChangeType = new EventEmitter<number>();

  @Input() selectedDate?: DateModel
  @Input() lableName: string = "";

  model: string | null = "";
  constructor(private dateAdapter: NgbDateAdapter<string>,
    private ngbCalendar: NgbCalendarIslamicUmalqura, private renderer: Renderer2) { }

  ngOnInit(): void {

    ////((this.today);
    this.model = this.today;

  }

  selectDate(ev: any) {
    // //((ev);
    // //((this.model)

  }

  get today(): any {
    let d = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate(),
      0, 0, 0, 0);



    let todayHijri = this.ngbCalendar.fromGregorian(d);


    return this.dateAdapter.toModel({ year: todayHijri.year, month: todayHijri.month, day: todayHijri.day });
  }

  onDateSelect(ev: any) {

    let georginDate = this.ngbCalendar.toGregorian(new NgbDate(ev.year, ev.month, ev.day));
    this.onSelect.emit({
      year: georginDate.getFullYear(),
      month: georginDate.getMonth(),
      day: georginDate.getDate(),
      hour: 0,
      min: 0,
      sec: 0
    });

  }

  dateChange(dateModel: any, d: NgbInputDatepicker) {

    let year: number;
    let month: number;
    let day: number;

    let txt: string = this.elementRef?.nativeElement.value;
    if (txt.length != 10) {

      this.setToday();
      year = this.today.year;
      month = this.today.month;
      day = this.today.day;

    }
    else {
      ////((txt);

      if (txt.indexOf('/') == -1) {
        this.setToday();
        year = this.today.year;
        month = this.today.month;
        day = this.today.day;
      }
      else {
        let dateParts: string[] = txt.split('/');
        //====================Check Year==========================================================

        if (Number.parseInt(dateParts[2]) > 1600) {
          year = this.today.year;
          // //((dateModel.model.year);
          // let year: string = JSON.stringify(this.today.year);
          // txt = this.replcaeAt(6, txt, year);
          // this.renderer.setProperty(this.elementRef.nativeElement, 'value', txt);
          // dateModel.model.year = Number.parseInt(year);
          // //Set Date On Calender
          // this.model = this.dateAdapter.toModel({ year: dateModel.model.year, month: dateModel.model.month, day: dateModel.model.day });
        }
        else {
          year = parseInt(dateParts[2]);
          ////((year);
        }
        //==========================Check Month=======================================================
        if (Number.parseInt(dateParts[1]) == 0 || Number.parseInt(dateParts[1]) > 12) {
          month = 12;
          // txt= this.replcaeAt(3, txt, "12");
          // this.model = this.dateAdapter.toModel({year:parseInt(dateParts[2]), month:12, day:parseInt(dateParts[0])});
          // this.renderer.setProperty(this.elementRef.nativeElement, 'value', txt);

        }
        else {
          month = parseInt(dateParts[1]);

        }

        if (Number.parseInt(dateParts[0]) > 29) {
          day = this.ngbCalendar.getDaysPerMonth(month, year);


        }
        else if (Number.parseInt(dateParts[0]) == 0) {
          day = 1;
        }
        else {
          day = parseInt(dateParts[0]);
        }

        let dayStr: string = day < 10 ? ("0" + day.toString()) : ("" + day.toString());
        let monthStr: string = month < 10 ? ("0" + month.toString()) : ("" + month.toString());
        let yearStr: string = year.toString();
        txt = dayStr +
          "/" + monthStr +
          "/" + yearStr;
        this.model = this.dateAdapter.toModel({ year: year, month: month, day: day });
        this.renderer.setProperty(this.elementRef?.nativeElement, 'value', txt);

        ////((this.ngbCalendar.toGregorian(new NgbDate(year, month, day)));



      }
    }

    let georginDate = this.ngbCalendar.toGregorian(new NgbDate(year, month, day));
    this.onSelect.emit({
      year: georginDate.getFullYear(),
      month: georginDate.getMonth(),
      day: georginDate.getDate(),

      hour: 0,
      min: 0,
      sec: 0
    });
  }



  onKeyDown(ev: any) {
    let txt: string = this.elementRef?.nativeElement.value;

    this.isAvailable = this.allowedKeyCode.find(x => {
      return x.toString() == ev.keyCode;
    }) != undefined;
    ////((this.isAvailable);

    if (this.isAvailable == false) {
      ev.preventDefault();
    }
    else {
      if ((txt.length != 2 && txt.length != 5) && ev.keyCode == 111) {
        ev.preventDefault();
      }
    }
    if (txt.length == 10 && (this.allowedFunctionKey.find(x => {
      return x.toString() == ev.keyCode;
    }) == undefined)) {

      ev.preventDefault();
    }
  }

  setToday() {
    ////(("Set Today")
    this.model = this.today;
    let dateVal: string = (Number.parseInt(this.today.day) < 10 ? ("0" + this.today.day) : ("" + this.today.day)) +
      "/" + (Number.parseInt(this.today.month) < 10 ? ("0" + this.today.month) : ("" + this.today.month)) +
      "/" + this.today.year

    this.renderer.setProperty(this.elementRef?.nativeElement, 'value', dateVal);
  }

  replcaeAt(index: number, value: string, newVal: string): string {
    return value.substr(0, index) + newVal + value.substr(index + newVal.length, value.length);
  }

  insertAt(index: number, value: string, insertedVal: string) {
    return value.substr(0, index) + insertedVal + value.substr(index, value.length);
  }

  ngOnChanges() {
    if (this.selectedDate) {
      if (this.elementRef) {
        let d = new Date(this.selectedDate.year, this.selectedDate.month, this.selectedDate.day);
        let hijriDate = this.ngbCalendar.fromGregorian(d);
        this.model = this.dateAdapter.toModel(hijriDate);
        let dateVal: string = (hijriDate.day < 10 ? "0" + hijriDate.day : "" + hijriDate.day) +
          "/" + (hijriDate.month < 10 ? "0" + hijriDate.month : "" + hijriDate.month) +
          "/" + hijriDate.year;
        this.renderer.setProperty(this.elementRef.nativeElement, 'value', dateVal);
      }


    }


  }

  ChangeType() {
    this.onChangeType.emit(1);
  }
}
