import { Injectable } from '@angular/core';
import { NgbCalendarIslamicUmalqura } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class DateCalculation {
  // startDate:{year:number, month:number, day:number};
  // endDate:{year:number, month:number, day:number};
  constructor(private ngbCalendar: NgbCalendarIslamicUmalqura, private datePipe: DatePipe) {

  }

  calculateEndDateForHijri(period: number, rentMethodType: number,
     startDate: { year: number, month: number, day: number },
      daysBefore: number): { year: number, month: number, day: number } {
    let endDate: { year: number, month: number, day: number } = { year: 0, month: 0, day: 0 };
    let addedYears;
    let addedMonth;
    let workDate = {
      day: startDate.day,
      month: startDate.month,
      year: startDate.year
    };

    let d = new Date(workDate.year, workDate.month, workDate.day);

    let hijriStartDate = this.ngbCalendar.fromGregorian(d)
    //console.log(hijriStartDate);
    if (rentMethodType == 1) {
      //Month      
      addedYears = Math.floor(period / 12);
      addedMonth = period % 12;
      hijriStartDate.year = hijriStartDate.year + addedYears;
      //console.log("1", hijriStartDate);

      if (addedMonth + hijriStartDate.month > 12) {
        hijriStartDate.month = hijriStartDate.month + addedMonth - 12;
        hijriStartDate.year = hijriStartDate.year + 1;
        //console.log("2", hijriStartDate);
      }
      else {
        hijriStartDate.month = hijriStartDate.month + addedMonth;
        //console.log("3", hijriStartDate);
      }
    }
    else {
      //Year
      hijriStartDate.year = hijriStartDate.year + period;
    }

    //console.log("final Hijridate", hijriStartDate);
    if (hijriStartDate.day - daysBefore == 0) {
      hijriStartDate.day = 30;
      if (hijriStartDate.month - 1 == 0) {
        hijriStartDate.month = 12;
        hijriStartDate.year = hijriStartDate.year - 1;
      }
      else {
        hijriStartDate.month = hijriStartDate.month - 1
      }

      //console.log("Hijridate after Minus Day and month");
    }
    else {
      // console.log("Hijri Day Before Minus 1 ", hijriStartDate.day)
      hijriStartDate.day = hijriStartDate.day - daysBefore;
    }

    if (hijriStartDate.day > 29) {
      // hijriStartDate.day = this.ngbCalendar.getDaysInIslamicMonth(hijriStartDate.month, hijriStartDate.year);
      hijriStartDate.day = this.ngbCalendar.getDaysPerMonth(hijriStartDate.month, hijriStartDate.year);
    }

    // console.log("Before Convert to Hijri ##################################33 ", hijriStartDate);
    d = this.ngbCalendar.toGregorian(hijriStartDate);
    
    endDate = {
      year: d.getFullYear(),
      month: d.getMonth(),
      day: d.getDate()
    };

    return endDate;

  }

  calculateEndDateForGregrion(period: number, rentMethodType: number, startDate: DateModel, daysBefore: number): DateModel {
    let endDate: { year: number, month: number, day: number } = {
      day: 0,
      month: 0,
      year: 0
    };

    let addedYears;
    let addedMonth;
    let workDate: { year: number, month: number, day: number };


    //عقد ميلادي
    workDate = {
      day: startDate.day,
      month: startDate.month,
      year: startDate.year
    };
    workDate.month = workDate.month + 1;
    //عقد ميلادي



    if (rentMethodType == 1) {
      //Month
      addedYears = Math.floor(period / 12);
      addedMonth = period % 12;
      //console.log("Period Division", Math.floor(period / 12), period % 12)

      endDate.year = workDate.year + addedYears;
      if (addedMonth + workDate.month > 12) {
        endDate.month = workDate.month + addedMonth - 12;
        endDate.year = endDate.year + 1;
      }
      else {
        endDate.month = workDate.month + addedMonth;
      }

      endDate.month = endDate.month;

      endDate.day = workDate.day;

    }
    else if (rentMethodType == 2) {
      //Year
      //periodPerMonth = period * 12;

      endDate = {
        year: workDate.year + period,
        month: workDate.month,
        day: workDate.day
      };
    }
    let mDay: number = endDate.day;
    let mMonth: number = endDate.month;
    if (endDate.year % 4 != 0 && endDate.month == 2 && endDate.day == 29) {
      mDay = 28;
    }
    if (mDay - daysBefore == 0) {
      if (mMonth - 1 == 0) {
        mMonth = 12;
        mDay = 31;
        endDate.year = endDate.year - 1;
      }
      else {
        mMonth = mMonth - 1;

        if ([1, 3, 5, 7, 10, 12].filter(x => x == mMonth).length == 1) {
          mDay = 31;
        }
        else if ([4, 6, 9, 11].filter(x => x == mMonth).length == 1) {
          mDay = 30;
        }
        else {
          if (endDate.year % 4 == 0) {
            //شهر فبراير سنة كبيسة
            mDay = 29;
          } else {
            mDay = 28;
          }
        }
      }
    }
    else {
      mDay = mDay - daysBefore;
    }
    endDate.month = mMonth - 1;
    endDate.day = mDay;
    //console.log("End Date: ", endDate);
    return endDate;
  }

//+ " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds()
  getDateForInsert(selectedDate: { year: number, month: number, day: number }) {
    let d = new Date();
    return (selectedDate.month + 1) + "/" + selectedDate.day + "/" + selectedDate.year ;
  }
  getDateForInsertS(selectedDate: { year: number, month: number, day: number }) {
    let d = new Date();
    return (selectedDate.month) + "/" + selectedDate.day + "/" + selectedDate.year ;
  }
  getDateForInsert2(e:{ year: number, month: number, day: number })
  {
    let d = new Date();
      return (e.month+1)+"/"+e.day+"/"+e.year+" "+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();
  }
  getCurrentDate():{ year: number, month: number, day: number }
  {
      let d = new Date();
      return {year:d.getFullYear(), month:d.getMonth(), day:d.getDate()}
  }

  getDateForCalender(date: any) {
    let dateString: string|null = this.datePipe.transform(date, "dd/M/yyyy");
    let dateParts: string[] = [];
    let selectedDate: { year: number, month: number, day: number } = {
      year: 0,
      month: 0,
      day: 0

    };
    if (dateString != undefined && dateString != null) {
      dateParts = dateString.split("/");
      selectedDate =
      {
        year: parseInt(dateParts[2]),
        month: parseInt(dateParts[1]) - 1,
        day: parseInt(dateParts[0])
      }

    }

    return selectedDate;
  }



  AddDaysToGregorian(periodPerDay: number, startDate: { year: number, month: number, day: number }): { year: number, month: number, day: number } {
   
    let endDate: { year: number, month: number, day: number } = {
      day: 0,
      month: 0,
      year: 0
    };

    
    let workDate: { year: number, month: number, day: number };
   
    workDate = {
      day: startDate.day,
      month: startDate.month,
      year: startDate.year
    };

    workDate.month = workDate.month + 1;
   



      endDate = {
        year: workDate.year ,
        month: workDate.month,
        day: workDate.day+periodPerDay
      };

    
    let mDay: number = endDate.day;
    let mMonth: number = endDate.month;
    let mYear:number = endDate.year;
    if (endDate.year % 4 != 0 && endDate.month == 2 && endDate.day > 28) {
      mDay = mDay-28;
      mMonth = mMonth+1;
      if(mMonth > 12)
      {
        mMonth = 1;
        mYear = mYear + 1;
        
      }
    }
    else if(endDate.year % 4 == 0 && endDate.month == 2 && endDate.day > 29)
    {

      mDay = mDay-29;
      mMonth = mMonth+1;
      if(mMonth > 12)
      {
        mMonth = 1;
        mYear = mYear + 1;
        
      }
    }
    else if ([1, 3, 5, 7, 10, 12].filter(x => x == mMonth).length == 1 && mDay > 31) {
      mDay = mDay-31;
      mMonth = mMonth+1;
      if(mMonth > 12)
      {
        mMonth = 1;
        mYear = mYear + 1;
        
      }

    }
    else if ([4, 6, 9, 11].filter(x => x == mMonth).length == 1 && mDay > 30) {
      mDay = mDay - 30;
      mMonth = mMonth+1;
      if(mMonth > 12)
      {
        mMonth = 1;
        mYear = mYear + 1;
        
      }
    }
    
    
    endDate.month = mMonth - 1;
    endDate.day = mDay;
    endDate.year = mYear;
    //console.log("new Date: ", endDate);
    return endDate;
  }





}
export interface DateModel{
  year:number;
  month:number;
  day:number;
 hour?:number;
 min?:number;
 sec?:number;
}
