import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environment';

@Injectable({
    providedIn: 'root',
  })
export class TechnicalSupportService {
  constructor(private _httpClient: HttpClient) { }

  TechnicalSupportLogin(AuthenticateRequest: any):Observable<any>{

    return this._httpClient.post<any>(environment.apiIdentity + "/api/TechnicalSupport/Login", AuthenticateRequest);
  }

}
