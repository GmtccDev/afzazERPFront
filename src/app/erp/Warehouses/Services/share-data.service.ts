// data.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataShareService {
  // Using BehaviorSubject to store and emit changes to the data
  private dataSubject = new BehaviorSubject<{ billDynamicDeterminants: any, quantity: any }>({ billDynamicDeterminants: null, quantity: null }); // You can replace 'string' with the type of data you want to share
  public data$ = this.dataSubject.asObservable();

  constructor() {}

  // Method to update the shared data
  updateData(billDynamicDeterminants: any, quantity: any) {
    // Update the shared data by creating a new object with the updated values
    this.dataSubject.next({ billDynamicDeterminants, quantity });
  }
}
