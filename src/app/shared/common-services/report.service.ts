
import { environment } from "../../../environments/environment"
/* tslint:disable */
/* eslint-disable */
//----------------------
// <auto-generated>
//     Generated using the NSwag toolchain v13.1.5.0 (NJsonSchema v10.0.27.0 (Newtonsoft.Json v11.0.0.0)) (http://NSwag.org)
// </auto-generated>
//----------------------
// ReSharper disable InconsistentNaming

import { mergeMap as _observableMergeMap, catchError as _observableCatch } from 'rxjs/operators';
import { Observable, throwError as _observableThrow, of as _observableOf, BehaviorSubject } from 'rxjs';
import { Injectable, Inject, Optional, InjectionToken } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse, HttpResponseBase } from '@angular/common/http';
import { ReportFile } from "../model/report-file";
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

@Injectable({
    providedIn: 'root'
})
export class ReportServiceProxy {
    private http: HttpClient;
    private baseUrl: string;
    protected jsonParseReviver: ((key: string, value: any) => any) | undefined = undefined;
    private reportListObs: BehaviorSubject<Array<ReportFile>> = new BehaviorSubject<ReportFile[]>([]);



  reportList: ReportFile[] = [];

    constructor(@Inject(HttpClient) http: HttpClient, @Optional() @Inject(API_BASE_URL) baseUrl?: string) {
        this.http = http;
        this.baseUrl = environment.apiUrl;
    }

    getReport(params: any): Observable<any> {

        return this.http.post<any>(environment.apiUrl + "/api/Report/getReport?", params);
    }
    getReportForDesigner(params: any): Observable<any> {

        return this.http.post<any>(environment.apiUrl + "/api/Report/getReportForDesigner?", params);
    }
   
    savefile(params: any): Observable<any> {

        return this.http.post<any>(environment.apiUrl + "/api/Report/savefile?", params);
    }
   
    getReportListFromApi(reportType, reportTypeID): Observable<ReportFile[]> {

        let params = {
          reportType: reportType,
          reportTypeID: reportTypeID
        }
        return this.http.get<ReportFile[]>(this.baseUrl + '/api/Report/getReportList', { params: params } );
    }
    setReportList(reportType, reportTypeID): Promise<boolean> {
        return new Promise((acc, rej) => {
          this.getReportListFromApi(reportType, reportTypeID).subscribe(rpt => {
            this.reportList = rpt;
    
          }, err => {
            acc(false);
          }, () => {
            this.reportListObs.next(this.reportList);
            acc(true);
          });
    
        });
      }
      getReportList(): Observable<ReportFile[]> {
        return this.reportListObs.asObservable();
      }
      getReportGeneric(reportParameters): Observable<string> {

    
        return this.http.get<string>(this.baseUrl + '/api/Report/getReportGeneric?' + reportParameters );
      }
    
      setDefaultReport(reportID, reportType, reportTypeID): Observable<boolean> {
        return this.http.get<boolean>(this.baseUrl + "/api/Report/setDefaultReport?reportId="+reportID+
        "&reportType="+reportType+"&reportTypeId="+reportTypeID );
      }
    
      cancelDefaultReport(reportType, reportTypeId): Observable<string> {
        debugger
        return this.http.get<string>(this.baseUrl + "/api/Report/cancelDefaultReport?reportType="+reportType+
          "&reportTypeId="+reportTypeId );
      }
    
      deleteReport(reportID):Observable<boolean>
      {
        return this.http.get<boolean>(this.baseUrl + "/api/Report/reportDelete?reportID="+reportID );
      }
    
    
}
