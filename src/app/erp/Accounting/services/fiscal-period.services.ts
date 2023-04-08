
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
import { FiscalPeriodDto, CreateFiscalPeriodCommand, DeleteListFiscalPeriodCommand, EditFiscalPeriodCommand } from "../models/fiscal-period";
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

@Injectable({
    providedIn: 'root'
})
export class FiscalPeriodServiceProxy {
    private http: HttpClient;
    private baseUrl: string;
    protected jsonParseReviver: ((key: string, value: any) => any) | undefined = undefined;

    constructor(@Inject(HttpClient) http: HttpClient, @Optional() @Inject(API_BASE_URL) baseUrl?: string) {
        this.http = http;
        this.baseUrl = environment.apiUrl;
    }

    createFiscalPeriod(fiscalPeriod: CreateFiscalPeriodCommand): Observable<FiscalPeriodDto> {

        return this.http.post<any>(environment.apiUrl + "/api/FiscalPeriod/add?", fiscalPeriod);
    }
    // ids: number[] | undefined;
    deleteListFiscalPeriod(fiscalPeriod: DeleteListFiscalPeriodCommand): Observable<number> {
        return this.http.post<any>(environment.apiUrl + "/api/FiscalPeriod/deleteList?", fiscalPeriod);
    }
    updateFiscalPeriod(fiscalPeriod: EditFiscalPeriodCommand): Observable<FiscalPeriodDto> {
        return this.http.post<any>(environment.apiUrl + "/api/FiscalPeriod/edit?", fiscalPeriod);
    }
    getDdl(): Observable<any> {
        return this.http.get<any>(this.baseUrl + "/api/FiscalPeriod/get-ddl?");
    }
   
    allFiscalPeriodes(pageIndex: number | undefined, pageSize: number | undefined, sortBy: string | undefined, sortOrder: string | undefined, filter: string | undefined): Observable<any> {
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

        return this.http.get<any>(this.baseUrl + "/api/FiscalPeriod/all?", { params: queryParams });

        // return this.http.get<any>(environment.apiUrl + "/api/FiscalPeriod/GetFiscalPeriods");
    }


    getFiscalPeriod(id: any): Observable<any> {
        let params = new HttpParams();
        params = params.append('id', id);
        return this.http.get<any>(this.baseUrl + "/api/FiscalPeriod/getById", { params: params });
    }
    getLastCode(): Observable<any> {
        return this.http.get<any>(this.baseUrl + "/api/FiscalPeriod/getLastCode?");
    }
    deleteFiscalPeriod(id: any): Observable<any> {
        let params = new HttpParams();
        params = params.append('id', id);
        return this.http.get<any>(environment.apiUrl + "/api/FiscalPeriod/delete", { params: params });
    }
  
}

