import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import {environment} from '../../../../environments/environment'
@Injectable({
    providedIn: 'root',
  })
export class TechnicalSupportService {
  constructor(private _httpClient: HttpClient) { }

  TechnicalSupportLogin(AuthenticateRequest: any):Observable<any>{

    return this._httpClient.post<any>(environment.apiUrl + "/api/TechnicalSupport/Login", AuthenticateRequest);
  }

}
