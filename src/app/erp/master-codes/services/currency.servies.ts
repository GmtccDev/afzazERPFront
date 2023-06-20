
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
import { CurrencyDto, CreateCurrencyCommand, DeleteListCurrencyCommand, EditCurrencyCommand } from '../models/currency'
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

@Injectable({
    providedIn: 'root'
})
export class CurrencyServiceProxy {
    private http: HttpClient;
    private baseUrl: string;
    protected jsonParseReviver: ((key: string, value: any) => any) | undefined = undefined;

    constructor(@Inject(HttpClient) http: HttpClient, @Optional() @Inject(API_BASE_URL) baseUrl?: string) {
        this.http = http;
        this.baseUrl = environment.apiUrl;
    }

    createCurrency(currency: CreateCurrencyCommand): Observable<CurrencyDto> {

        return this.http.post<any>(environment.apiUrl + "/api/Currency/add?", currency);
    }
    // ids: number[] | undefined;
    deleteListCurrency(currency: DeleteListCurrencyCommand): Observable<number> {
        return this.http.post<any>(environment.apiUrl + "/api/Currency/deleteList?", currency);
    }
    updateCurrency(currency: EditCurrencyCommand): Observable<CurrencyDto> {
        return this.http.post<any>(environment.apiUrl + "/api/Currency/edit?", currency);
    }
    getDdl(): Observable<any> {
        return this.http.get<any>(this.baseUrl + "/api/Currency/get-ddl?");
    }
    all(pageIndex: number | undefined, pageSize: number | undefined, sortBy: string | undefined, sortOrder: string | undefined, filter: string | undefined): Observable<any> {
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

        return this.http.get<any>(this.baseUrl + "/api/Currency/all?", { params: queryParams });

        // return this.http.get<any>(environment.apiUrl + "/api/Currency/GetCurrencys");
    }


    getCurrency(id: any): Observable<any> {
        let params = new HttpParams();
        params = params.append('id', id);
        return this.http.get<any>(this.baseUrl + "/api/Currency/getById", { params: params });
    }
    getLastCode(): Observable<any> {
        return this.http.get<any>(this.baseUrl + "/api/Currency/getLastCode?");
    }
    deleteCurrency(id: any): Observable<any> {
        let params = new HttpParams();
        params = params.append('id', id);
        return this.http.get<any>(environment.apiUrl + "/api/Currency/delete-currency", { params: params });
    }

    deleteListCurrencyTransaction(customer: any): Observable<any> {
        return this.http.post<any>(environment.apiUrl + "/api/Currency/deleteListTransaction?",customer);
    }
    updateCurrencyTransaction(customer: any): Observable<any> {
        return this.http.post<any>(environment.apiUrl + "/api/Currency/editTransaction?",customer);
    }
    deleteCurrencyTransaction(id: any): Observable<any> {
        let params = new HttpParams();
        params = params.append('id', id);
        return this.http.get<any>(environment.apiUrl + "/api/Currency/deleteTransaction", { params: params });
    }
    getCurrencyTransaction(id: any): Observable<any> {
        let params = new HttpParams();
        params = params.append('id', id);
        return this.http.get<any>(this.baseUrl + "/api/Currency/getByIdTransaction", { params: params });
    }
    createCurrencyTransaction(customer: any): Observable<any> {

        return this.http.post<any>(environment.apiUrl + "/api/Currency/addTransaction?",customer);
    }


    getCurrenciesTransactions(): Observable<any> {
        return this.http.get<any>(this.baseUrl + "/api/Currency/get-ddl-currencies-transactions?");
    }



}

