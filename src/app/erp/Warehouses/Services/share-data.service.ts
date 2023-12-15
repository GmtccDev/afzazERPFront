// data.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataShareService {
  // Using BehaviorSubject to store and emit changes to the data
  private dataSubject = new BehaviorSubject<any>(null); // You can replace 'string' with the type of data you want to share
  public data$ = this.dataSubject.asObservable();

  constructor() {}

  // Method to update the shared data
  updateData(data: any) {
    this.dataSubject.next(data);
  }
}
