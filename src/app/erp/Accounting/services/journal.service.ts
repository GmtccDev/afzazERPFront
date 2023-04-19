
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
import { JournalDto, CreateJournalCommand, DeleteListJournalCommand, EditJournalCommand } from "../models/journal";
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

@Injectable({
    providedIn: 'root'
})
export class JournalServiceProxy {
    private http: HttpClient;
    private baseUrl: string;
    protected jsonParseReviver: ((key: string, value: any) => any) | undefined = undefined;

    constructor(@Inject(HttpClient) http: HttpClient, @Optional() @Inject(API_BASE_URL) baseUrl?: string) {
        this.http = http;
        this.baseUrl = environment.apiUrl;
    }

    createJournal(branch: CreateJournalCommand): Observable<JournalDto> {

        return this.http.post<any>(environment.apiUrl + "/api/Journal/add?", branch);
    }
    // ids: number[] | undefined;
    deleteListJournal(branch: DeleteListJournalCommand): Observable<number> {
        return this.http.post<any>(environment.apiUrl + "/api/Journal/deleteList?", branch);
    }
    updateJournal(branch: EditJournalCommand): Observable<JournalDto> {
        return this.http.post<any>(environment.apiUrl + "/api/Journal/edit?", branch);
    }
    getDdl(): Observable<any> {
        return this.http.get<any>(this.baseUrl + "/api/Journal/get-ddl?");
    }
   
    allJournales(pageIndex: number | undefined, pageSize: number | undefined, sortBy: string | undefined, sortOrder: string | undefined, filter: string | undefined): Observable<any> {
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

        return this.http.get<any>(this.baseUrl + "/api/Journal/all?", { params: queryParams });

        // return this.http.get<any>(environment.apiUrl + "/api/Journal/GetJournals");
    }


    getJournal(id: any): Observable<any> {
        let params = new HttpParams();
        params = params.append('id', id);
        return this.http.get<any>(this.baseUrl + "/api/Journal/getById", { params: params });
    }
    getLastCode(): Observable<any> {
        return this.http.get<any>(this.baseUrl + "/api/Journal/getLastCode?");
    }
    deleteJournal(id: any): Observable<any> {
        let params = new HttpParams();
        params = params.append('id', id);
        return this.http.get<any>(environment.apiUrl + "/api/Journal/delete", { params: params });
    }
  
}
