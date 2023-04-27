
import { environment } from "../../../../environments/environment"
/* tslint:disable */
/* eslint-disable */
//----------------------
// <auto-generated>
//     Generated using the NSwag toolchain v13.1.5.0 (NJsonSchema v10.0.27.0 (Newtonsoft.Json v11.0.0.0)) (http://NSwag.org)
// </auto-generated>
//----------------------
// ReSharper disable InconsistentNaming

import { mergeMap as _observableMergeMap, catchError as _observableCatch } from 'rxjs/operators';
import { Observable, throwError as _observableThrow, of as _observableOf } from 'rxjs';
import { Injectable, Inject, Optional, InjectionToken } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse, HttpResponseBase } from '@angular/common/http';
import { AccountDto, CreateAccountCommand, DeleteListAccountCommand, EditAccountCommand, TreeDto } from "../models/account";
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

@Injectable({
    providedIn: 'root'
})
export class AccountServiceProxy {
    private http: HttpClient;
    private baseUrl: string;
    protected jsonParseReviver: ((key: string, value: any) => any) | undefined = undefined;

    constructor(@Inject(HttpClient) http: HttpClient, @Optional() @Inject(API_BASE_URL) baseUrl?: string) {
        this.http = http;
        this.baseUrl = environment.apiUrl;
    }

    createAccount(accountGroup: CreateAccountCommand): Observable<AccountDto> {

        return this.http.post<any>(environment.apiUrl + "/api/Account/add?", accountGroup);
    }
    // ids: number[] | undefined;
    deleteListAccount(accountGroup: DeleteListAccountCommand): Observable<number> {
        return this.http.post<any>(environment.apiUrl + "/api/Account/deleteList?", accountGroup);
    }
    updateAccount(accountGroup: EditAccountCommand): Observable<AccountDto> {
        return this.http.post<any>(environment.apiUrl + "/api/Account/edit?", accountGroup);
    }
    getDdl(): Observable<any> {
        return this.http.get<any>(this.baseUrl + "/api/Account/get-ddl?");
    }

    allAccountes(pageIndex: number | undefined, pageSize: number | undefined, sortBy: string | undefined, sortOrder: string | undefined, filter: string | undefined): Observable<any> {
        let queryParams = new HttpParams();
        if (pageIndex != undefined)
            queryParams = queryParams.append("pageIndex", pageIndex);
        if (pageSize != undefined)
            queryParams = queryParams.append("pageSize", pageSize);
        if (sortBy != undefined)
            queryParams = queryParams.append("sortBy", sortBy);
        if (sortOrder != undefined)
            queryParams = queryParams.append("sortOrder", sortOrder);
        if (filter != undefined)
            queryParams = queryParams.append("filter", filter);

        return this.http.get<any>(this.baseUrl + "/api/Account/all?", { params: queryParams });

        // return this.http.get<any>(environment.apiUrl + "/api/Account/GetAccounts");
    }
    getAllTree(filter): Observable<any> {
        // filter: any = {id:null, name: null,selectedId:null };
        let queryParams = new HttpParams();
        if (filter.id != undefined)
            queryParams = queryParams.append("id", filter.id);
        if (filter.name != undefined)
            queryParams = queryParams.append("name", filter.name);
        if (filter.selectedId != undefined)
            queryParams = queryParams.append("selectedId", filter.selectedId);
      //  return this.http.post<any>(this.baseUrl + "/api/Account/all-tree", filter);
        return this.http.get<any>(this.baseUrl + "/api/Account/all-tree?", { params: queryParams });
    }

    getAccount(id: any): Observable<any> {
        let params = new HttpParams();
        params = params.append('id', id);
        return this.http.get<any>(this.baseUrl + "/api/Account/getById", { params: params });
    }
    getLastCode(id): Observable<any> {
        let params = new HttpParams();
        if (id != undefined){
            params = params.append('parentId', id);
        }
    
        return this.http.get<any>(this.baseUrl + "/api/Account/getLastCode", { params: params });
       // return this.http.get<any>(this.baseUrl + "/api/Account/getLastCode?");
    }
    deleteAccount(id: any): Observable<any> {
        let params = new HttpParams();
        params = params.append('id', id);
        return this.http.get<any>(environment.apiUrl + "/api/Account/delete", { params: params });
    }

}
