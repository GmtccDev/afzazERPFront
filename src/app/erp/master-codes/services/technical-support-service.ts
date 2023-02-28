import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environment';

@Injectable({
    providedIn: 'root',
  })
export class UserLoginService {
  constructor(private _httpClient: HttpClient) { }

  UserLoginLogin(AuthenticateRequest: any):Observable<any>{

    return this._httpClient.post<any>(environment.apiIdentity + "/api/UserLogin/Login", AuthenticateRequest);
  }

}
