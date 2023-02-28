import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DateModel } from './date-calc.service';

@Injectable({
  providedIn: 'root',
})
export class DateConverterService {
  constructor(private datePipe: DatePipe) {}
  getDateForCalender(date: any) {
    let dateString: string = this.datePipe.transform(date, 'dd/M/yyyy') ?? '';
    //alert(dateString);
    let dateParts: string[] = [];
    let selectedDate: { year: number; month: number; day: number } = {
      year: 0,
      month: 0,
      day: 0,
    };
    if (dateString != undefined && dateString != null) {
      dateParts = dateString.split('/');
      selectedDate = {
        year: parseInt(dateParts[2]),
        month: parseInt(dateParts[1]) - 1,
        day: parseInt(dateParts[0]),
      };
    }

    return selectedDate;
  }

  getDateTimeForCalender(date: any) {
    let dateString: string = this.datePipe.transform(date, 'dd/M/yyyy') ?? '';
    //alert(dateString);
    let dateParts: string[] = [];
    let selectedDate: {
      year: number;
      month: number;
      day: number;
      hour: number;
      min: number;
      sec: number;
    } = {
      year: 0,
      month: 0,
      day: 0,
      hour: 0,
      min: 0,
      sec: 0,
    };
    if (dateString != undefined && dateString != null) {
      dateParts = dateString.split('/');
      selectedDate = {
        year: parseInt(dateParts[2]),
        month: parseInt(dateParts[1]) - 1,
        day: parseInt(dateParts[0]),
        hour: 0,
        min: 0,
        sec: 0,
      };
    }

    return selectedDate;
  }

  //2019-01-06T17:16:40

  getDateForInsertISO_Format(e: { year: number; month: number; day: number }) {
    let d = new Date();
    let mMonth =
      (e.month + '').length == 1 ? '0' + (e.month + 1) : e.month + 1 + '';
    let mDay = (e.day + '').length == 1 ? '0' + e.day : e.day + '';
    let hour =
      (d.getHours() + '').length == 1 ? '0' + d.getHours() : d.getHours();
    let min =
      (d.getMinutes() + '').length == 1 ? '0' + d.getMinutes() : d.getMinutes();
    let sec =
      (d.getSeconds() + '').length == 1 ? '0' + d.getSeconds() : d.getSeconds();
    return (
      e.year + '-' + mMonth + '-' + mDay + 'T' + hour + ':' + min + ':' + sec
    );
  }

  getDateTimeWithReadableFormat(date: Date) {
    return (
      date.getFullYear() +
      '/' +
      (date.getMonth() + 1) +
      '/' +
      date.getDate() +
      ' ' +
      date.getHours() +
      ':' +
      date.getMinutes() +
      ':' +
      date.getSeconds()
    );
  }

  getDateForInsertISO_FormatForPostions(e: {
    year: number;
    month: number;
    day: number;
    hour: number;
    min: number;
    sec: number;
  }) {
    // let d = new Date();
    let mMonth =
      (e.month + '').length == 1 ? '0' + (e.month + 1) : e.month + 1 + '';
    let mDay = (e.day + '').length == 1 ? '0' + e.day : e.day + '';
    let hour = (e.hour + '').length == 1 ? '0' + e.hour : e.hour;
    let min = (e.min + '').length == 1 ? '0' + e.min : e.min;
    let sec = (e.sec + '').length == 1 ? '0' + e.sec : e.sec;
    return (
      e.year +
      '-' +
      mMonth +
      '-' +
      mDay +
      'T' +
      hour +
      ':' +
      min +
      ':' +
      sec +
      'Z'
    );
  }

  getDateTimeForInsertISO_Format(e: DateModel) {
    // let d = new Date();
    let mMonth =
      (e.month + '').length == 1 ? '0' + (e.month + 1) : e.month + 1 + '';
    let mDay = (e.day + '').length == 1 ? '0' + e.day : e.day + '';
    // let hour = (e.hour+"").length == 1 ? ("0"+e.hour):e.hour;
    // let min = (e.min+"").length == 1 ? ("0"+e.min):e.min;
    // let sec = (e.sec+"").length == 1 ? ("0"+e.sec):e.sec;
    return e.year + '-' + mMonth + '-' + mDay;
    //+"T"+hour+":"+min+":"+sec;
  }


  getCurrentDateTimeForInsertISO_Format() {
    let d = new Date();
    let mMonth =
      ((d.getMonth()+1) + '').length == 1 ? '0' + (d.getMonth()+1) : (d.getMonth()+1) + '';
    let mDay = (d.getDate() + '').length == 1 ? '0' + d.getDate() : d.getDate() + '';
    
    
    return d.getFullYear() + '-' + mMonth + '-' + mDay+"T00:00:000";
  }

  getDateForInsert(e: { year: number; month: number; day: number }) {
    let d = new Date();
    return (
      e.month +
      1 +
      '/' +
      e.day +
      '/' +
      e.year +
      ' ' +
      d.getHours() +
      ':' +
      d.getMinutes() +
      ':' +
      d.getSeconds()
    );
  }

  getDate(e: { year: number; month: number; day: number }) {
    let d = new Date();
    return e.month + 1 + '/' + e.day + '/' + e.year;
  }
  getWaslDateFormat(e: { year: number; month: number; day: number }) {
    if (e) {
      let monthStr: string = e.month + 1 + '';
      monthStr = monthStr.length == 1 ? '0' + monthStr : monthStr;
      let dayStr: string = e.day + '';
      dayStr = dayStr.length == 1 ? '0' + dayStr : dayStr;

      return e.year + '-' + monthStr + '-' + dayStr;
    }
    return null;
  }

  getDateFromWaslDate(waslDate: string) {
    let calenderDate: {
      year: number;
      month: number;
      day: number;
      hour: number;
      min: number;
      sec: number;
    } = {
      year: 0,
      month: 0,
      day: 0,
      hour: 0,
      min: 0,
      sec: 0,
    };
    if (waslDate) {
      let waslDateArrStr = waslDate.split('-');
      calenderDate.year = Number.parseInt(waslDateArrStr[0]);
      calenderDate.month = Number.parseInt(waslDateArrStr[1]) - 1;
      calenderDate.day = Number.parseInt(waslDateArrStr[2]);
    }
    return calenderDate;
  }

  getCurrentDate(): DateModel {
    let d = new Date();
    return {
      year: d.getFullYear(),
      month: d.getMonth(),
      day: d.getDate(),
      // , min:d.getMinutes(), sec:d.getSeconds(), hour:d.getHours()
    };
  }
  getCurrentDateTime(): {
    year: number;
    month: number;
    day: number;
    hour: number;
    min: number;
    sec: number;
  } {
    let d = new Date();
    return {
      year: d.getFullYear(),
      month: d.getMonth(),
      day: d.getDate(),
      hour: d.getHours(),
      min: d.getMinutes(),
      sec: d.getSeconds(),
    };
  }

  getDateTimeCalenderFormat(date: string) {
    let d: Date = new Date(date);
    return {
      year: d.getFullYear(),
      month: d.getMonth(),
      day: d.getDate(),
      hour: d.getHours(),
      min: d.getMinutes(),
      sec: d.getSeconds(),
    };
  }

  getDateTimeIsoFormat(date: string) {
    return new Date(date).toISOString();
  }

  getDateForView(e: { year: number; month: number; day: number }) {
    return e.year + '/' + (e.month + 1) + '/' + e.day;
  }

  getDateForView2(e: { year: number; month: number; day: number }) {
    return e.day + '/' + (e.month + 1) + '/' + e.year;
  }

  getDateForCalenderInputFormat(date: any, format: string) {
    let dateStr: string = date;

    if (dateStr.includes('T')) {
      let s: string[] = dateStr.split('T');
      dateStr = s[0];
      if (dateStr.includes('-')) {
        dateStr = dateStr.replace('-', '/');
        dateStr = dateStr.replace('-', '/');
      }
    } else if (dateStr.includes('-')) {
      dateStr = dateStr.replace('-', '/');
    }
    let dateString: string =
      this.datePipe.transform(dateStr, 'dd/MM/yyyy') ?? '';
    let dateParts: string[] = [];
    let selectedDate: { year: number; month: number; day: number } = {
      year: 0,
      month: 0,
      day: 0,
    };
    if (dateString != undefined && dateString != null) {
      dateParts = dateString.split('/');
      selectedDate = {
        year: parseInt(dateParts[2]),
        month: parseInt(dateParts[1]) - 1,
        day: parseInt(dateParts[0]),
      };
    }

    return selectedDate;
  }

  getDateForReport(e: { year: number; month: number; day: number }) {
    return e.year + '/' + (e.month + 1) + '/' + e.day;
  }

  calcDateDiff(date1: any, date2: any) {
    let dateDiffResult: {
      days: number;
      hours: number;
      minutes: number;
      seconds: number;
    } = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
    let dt1: any = new Date(date1);
    let dt2: any = new Date(date2);
    let dateDiff: number = Math.abs(dt1 - dt2);

    dateDiffResult.days = Math.floor(dateDiff / 1000 / 60 / 60 / 24);
    dateDiffResult.hours = Math.floor(
      dateDiff / 1000 / 60 / 60 - dateDiffResult.days * 24
    );
    dateDiffResult.minutes = Math.floor(
      dateDiff / 1000 / 60 -
        dateDiffResult.hours * 60 -
        dateDiffResult.days * 24 * 60
    );
    dateDiffResult.seconds = Math.floor(
      dateDiff / 1000 -
        dateDiffResult.minutes * 60 -
        dateDiffResult.hours * 60 * 60 -
        dateDiffResult.days * 60 * 60 * 24
    );

    return dateDiffResult;
  }

  compareStartDateIsGreater(startDate: DateModel, endDate: DateModel) {

    let startDateTemp = this.getDateTimeForInsertISO_Format(startDate);
    let endDateTemp = this.getDateTimeForInsertISO_Format(endDate);
    if (startDateTemp > endDateTemp) {
      return true;
    } else {
      return false;
    }
  }


  checkDocomentDateIsExpired(DocumentDate: DateModel) {

    let currentDate = this.getDateForInsertISO_Format(this.getCurrentDate());
    let DocumentDateTemp = this.getDateTimeForInsertISO_Format(DocumentDate);
    if (DocumentDateTemp < currentDate) {
      return true;
    } else {
      return false;
    }
  }
}
