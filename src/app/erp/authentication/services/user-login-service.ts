import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import {environment} from '../../../../environments/environment'
@Injectable({
    providedIn: 'root',
  })
export class UserLoginService {
  constructor(private _httpClient: HttpClient) { }

  UserLoginLogin(AuthenticateRequest: any):Observable<any>{

    return this._httpClient.post<any>(environment.apiUrl + "/api/UserLogin/Login", AuthenticateRequest);
  }
  getDdl(): Observable<any> {
    return this._httpClient.get<any>(environment.apiUrl  + "/api/UserLogin/get-ddl?");
}
getDdlWithCompanies( ids: Array<number>|undefined): Observable<any> {
  let queryParams = new HttpParams();
  if (ids != undefined)
 // queryParams = queryParams.append("companies", ids.join(', '));
  queryParams = queryParams.appendAll({'companies': ids});

  return this._httpClient.get<any>(environment.apiUrl+ "/api/UserLogin/get-ddlWithCompanies?", { params: queryParams });
}
}
