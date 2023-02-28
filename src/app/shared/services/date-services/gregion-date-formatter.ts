import{Injectable} from '@angular/core';
import {NgbDateStruct,NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';

@Injectable({
  providedIn: 'root'
})
export class GregionDateParserFormatter extends NgbDateParserFormatter {

  readonly DELIMITER = '/';

  parse(value: string): NgbDateStruct | null {
    if (value) {
      let date = value.split(this.DELIMITER);
      return {
        day :  parseInt(date[0], 10),
        month : parseInt(date[1], 10),
        year : parseInt(date[2], 10)
      };
    }
    return null;
  }

  format(date: NgbDateStruct | null): string {
    return date ?  (date.day.toString().length == 1? "0"+date.day.toString():date.day.toString()) + this.DELIMITER + (date.month.toString().length == 1? "0"+date.month.toString():date.month.toString()) + this.DELIMITER + date.year : '';
  }
}