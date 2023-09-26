
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
import { HttpClient, HttpParams } from '@angular/common/http';
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

@Injectable({
    providedIn: 'root'
})
export class WarehousesCustomerServiceProxy {
    private http: HttpClient;
    private baseUrl: string;
    protected jsonParseReviver: ((key: string, value: any) => any) | undefined = undefined;

    constructor(@Inject(HttpClient) http: HttpClient, @Optional() @Inject(API_BASE_URL) baseUrl?: string) {
        this.http = http;
        this.baseUrl = environment.apiUrl;
    }

    createWarehousesCustomer(warehousesCustomer: any): Observable<any> {

        return this.http.post<any>(environment.apiUrl + "/api/WarehousesCustomer/add?", warehousesCustomer);
    }
    
   
    deleteListWarehousesCustomer(warehousesCustomer: any): Observable<number> {
        return this.http.post<any>(environment.apiUrl + "/api/WarehousesCustomer/deleteList?", warehousesCustomer);
    }
    updateWarehousesCustomer(warehousesCustomer: any): Observable<any> {
        return this.http.post<any>(environment.apiUrl + "/api/WarehousesCustomer/edit?", warehousesCustomer);
    }
    getDdl(): Observable<any> {
        return this.http.get<any>(environment.apiUrl + "/api/WarehousesCustomer/get-ddl?");
    }
  
    allWarehousesCustomers(pageIndex: number | undefined, pageSize: number | undefined, sortBy: string | undefined, sortOrder: string | undefined, filter: string | undefined): Observable<any> {
     
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

        return this.http.get<any>(this.baseUrl + "/api/WarehousesCustomer/all?", { params: queryParams });

    }


    getWarehousesCustomer(id: any): Observable<any> {
        
        let params = new HttpParams();
        params = params.append('id', id);
        return this.http.get<any>(this.baseUrl + "/api/WarehousesCustomer/getById", { params: params });
    }
    getLastCode(): Observable<any> {
        return this.http.get<any>(this.baseUrl + "/api/WarehousesCustomer/getLastCode?");
    }
    deleteWarehousesCustomer(id: any): Observable<any> {
        let params = new HttpParams();
        params = params.append('id', id);
        return this.http.get<any>(environment.apiUrl + "/api/WarehousesCustomer/delete", { params: params });
    }
    
    deleteEntity(entity: any): Observable<any> {

        return this.http.post<any>(environment.apiUrl + "/api/WarehousesCustomer/deleteEntity?", entity);
    }
    deleteListEntity(entity: any): Observable<any> {

        return this.http.post<any>(environment.apiUrl + "/api/WarehousesCustomer/deleteListEntity?", entity);
    }
}
