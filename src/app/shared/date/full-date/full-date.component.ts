import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DateModel } from '../../model/date-model';
@Component({
  selector: 'app-full-date',
  templateUrl: './full-date.component.html',
  styleUrls: ['./full-date.component.scss']
})
export class FullDateComponent implements OnInit {

  @Input() dateType:number = 1;
  @Input() selectedDate?:DateModel;


  @Output() OnDateSelect:EventEmitter<DateModel> = new EventEmitter();

  @Output() OnDateTypeChange:EventEmitter<number> = new EventEmitter();
  constructor() { }
//,hour:number, min:number, sec:number
  getSelectedDate(e:DateModel)
  {

    this.selectedDate = e;
    let d = new Date();
    this.OnDateSelect.emit({
      day:e.day,
      month:e.month,
      year:e.year,
     hour:d.getHours(),
     min:d.getMinutes(),
     sec:d.getSeconds()
    });
  }



  ngOnInit(): void {

    let d = new Date();
    //, hour:d.getHours(), min:d.getMinutes(), sec:d.getSeconds()

       this.selectedDate = {year:d.getFullYear(), month:d.getMonth(), day:d.getDate(), hour:d.getHours(), min:d.getMinutes(), sec:d.getSeconds()}



  }

  changeDateType(type:number) {

    this.dateType = type;
    this.OnDateTypeChange.emit(this.dateType);
  }

}
