import {
    Component, Output, EventEmitter, Input,
    ViewChild, ElementRef, Renderer2, OnChanges, OnInit
} from '@angular/core';
import {
    NgbDateAdapter, NgbDateParserFormatter, NgbCalendar
} from '@ng-bootstrap/ng-bootstrap';
import { DateCustomAdapter } from '../../services/date-services/date-adapter.service';
import {GregionDateParserFormatter} from '../../services/date-services/gregion-date-formatter';
import { DateModel } from '../../model/date-model';


@Component({
    selector: 'app-gregorian-date',
    templateUrl: './gregorian-date.component.html',
    styleUrls: ['./gregorian-date.component.css'],
    providers: [
        { provide: NgbDateAdapter, useClass: DateCustomAdapter },
        { provide: NgbDateParserFormatter, useClass: GregionDateParserFormatter }
    ]

})

export class GregorianDateComponent implements OnInit, OnChanges {
    @ViewChild('inputGDate') elementRef?: ElementRef;


    isAvailable: boolean = false;
    allowedKeyCode: number[] = [
        96, 97, 98, 99, 100, 101, 102, 103, 104, 105,
        8, 37, 39, 16, 35, 36, 46, 111
    ];

    allowedFunctionKey: number[] = [8, 37, 39, 16, 35, 36, 46, 111];



    @Output() onSelect = new EventEmitter<DateModel>();
    @Input() lableName: string = "";
    @Output() onChangeType = new EventEmitter<number>();

    @Input() selectedDate?: DateModel;
    model: string|null="";
    constructor(private dateAdapter: NgbDateAdapter<string>,
        private ngbCalendar: NgbCalendar, private renderer: Renderer2) { }

    ngOnInit(): void {
        this.model = this.today;
    }
    get today(): any {
        let d = new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            new Date().getDate(),
            0, 0, 0, 0
        );
        return this.dateAdapter.toModel({ year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() });
    }

    onDateSelect(ev:any) {
        ////(("Select Date");

        //((ev);
        //,min:0, hour:0, sec:0
        this.onSelect.emit({ year: ev.year, month: ev.month - 1, day: ev.day, hour:0, min:0, sec:0 });

    }

    dateChange(dateModel:any, d: any) {
        let year: number;
        let month: number;
        let day: number;
        let txt: string = this.elementRef?.nativeElement.value;
        if (txt.length != 10) {
            year = parseInt(this.today.year);
            month = parseInt(this.today.month);
            day = parseInt(this.today.day);
            this.setToday();
        }
        else {
            if (txt.indexOf('/') == -1) {
                this.setToday();
                year = parseInt(this.today.year);
                month = parseInt(this.today.month);
                day = parseInt(this.today.day);
            }
            else {
                let dateParts: string[] = txt.split('/');

                if (Number.parseInt(dateParts[2]) < 1899 || Number.parseInt(dateParts[2]) > 2300) {
                    year = parseInt(JSON.stringify(this.today).split("-")[2]);
                }
                else {
                    year = parseInt(dateParts[2]);

                }
                if (Number.parseInt(dateParts[1]) == 0 || Number.parseInt(dateParts[1]) > 12) {
                    month = 12;
                }
                else {
                    month = parseInt(dateParts[1]);
                }
                //==========================Check Day=======================================================

                if (Number.parseInt(dateParts[0]) >= 31) {
                    if ([1, 3, 5, 7, 8, 10, 12].filter(x => x == month).length > 0) {
                        day = 31;
                    }
                    else if ([4, 6, 9, 11].filter(x => x == month).length > 0) {
                        day = 30;
                    }
                    else {
                        //Feb
                        if (year % 4 == 0) {
                            day = 29;
                        }
                        else {
                            day = 28;
                        }
                    }
                }
                else if (month == 2) {
                    if (Number.parseInt(dateParts[0]) > 28) {
                        if (year % 4 == 0) {
                            day = 29;
                        }
                        else {
                            day = 28;
                        }
                    }
                    else
                    {
                        day = Number.parseInt(dateParts[0])
                    }
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
            }
        }
        //, hour:0, min:0,sec:0
        this.onSelect.emit({ year: year, month: month - 1, day: day,hour:0, min:0, sec:0 });

    }



    onKeyDown(ev:any) {
        let txt: string = this.elementRef?.nativeElement.value;

        this.isAvailable = this.allowedKeyCode.find(x => {
            return x.toString() == ev.keyCode;
        }) != undefined;
        //((this.isAvailable);

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

        if (this.elementRef) {
            if (this.selectedDate) {
                let m = this.selectedDate.month + 1;
                this.model = this.dateAdapter.toModel({ year: this.selectedDate.year, month: m, day: this.selectedDate.day });
                let dateVal: string = (this.selectedDate.day < 10 ? "0" + this.selectedDate.day : "" + this.selectedDate.day) +
                    "/" + (m < 10 ? "0" + m : "" + m) +
                    "/" + this.selectedDate.year;
                this.renderer.setProperty(this.elementRef.nativeElement, 'value', dateVal);

            }
        }

    }

    ChangeType() {
        this.onChangeType.emit(2);
    }
}
