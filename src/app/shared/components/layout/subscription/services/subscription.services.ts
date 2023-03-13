import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from "../../../../../../environments/environment"
@Injectable({
    providedIn: 'root',
  })
export class SubscriptionService {
  constructor(private _httpClient: HttpClient) { }

  getLastSubscription():Observable<any>{

    return this._httpClient.get<any>(environment.apiUrl + "/api/subscription/GetLastSubscription");
  }
}