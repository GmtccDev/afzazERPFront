import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subscription, BehaviorSubject, Observable } from 'rxjs';
import { AppConfigService } from './app-config.service';
import { ResponseResult, ResponseData } from '../model/ResponseResult';
import { stringIsNullOrEmpty } from '../../shared/helper/helper';




@Injectable({
    providedIn: 'root'
})
export class BaseService<T>
{
    domainName?: string = AppConfigService.appCongif.url;
    public path: string = "";
    subscription: Subscription = new Subscription;

    dataList: T[] = [];
    private dataObservable: BehaviorSubject<T[]> = new BehaviorSubject<T[]>([]);
    apiHeaders: HttpHeaders = new HttpHeaders();
    constructor(protected http: HttpClient) {
        this.apiHeaders = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Access-Control-Allow-Origin', '*')

    }
    getAll(url?: string);
    getAll<A>(url: string);
    getAll<A = {}>(url: string) {
        this.apiHeaders = this.apiHeaders.set('Authorization', 'Bearer ' + localStorage.getItem('token'));
        if ((url + "").length == 0) {
            //((this.getFullURL(''));
            return this.http.get<A[]>(this.getFullURL(''), { headers: this.apiHeaders });
        }
        return this.http.get<T[]>(this.getFullURL(url), { headers: this.apiHeaders });
    }

    getById(id: any) {
        this.apiHeaders = this.apiHeaders.set('Authorization', 'Bearer ' + localStorage.getItem('token'));
        return this.http.get<T>(this.getFullURL('') + "/" + `${id}`, { headers: this.apiHeaders });
    }

    getByIdWithUrl(url: string) {
        this.apiHeaders = this.apiHeaders.set('Authorization', 'Bearer ' + localStorage.getItem('token'));
        return this.http.get<T>(this.getFullURL(url), { headers: this.apiHeaders });
    }
    getSingleObject(url?: string);
    getSingleObject<A>(url: string);
    getSingleObject<A = {}>(url: string) {
        //this.apiHeaders = this.apiHeaders.set('Authorization', 'Basic ' + btoa(email + ':' + password))
        if ((url + "").length == 0) {
            this.apiHeaders = this.apiHeaders.set('Authorization', 'Bearer ' + localStorage.getItem('token'));
            return this.http.get<A>(this.getFullURL(''), { headers: this.apiHeaders });
        }
        return this.http.get<T>(this.getFullURL(url), { headers: this.apiHeaders });
    }
    add(model: T) {
        this.apiHeaders = this.apiHeaders.set('Authorization', 'Bearer ' + localStorage.getItem('token'));
        return this.http.post<T>(this.getFullURL(''), model, { headers: this.apiHeaders });
    }

    // addWithResponse(url:string , model: T) {
    //     this.apiHeaders = this.apiHeaders.set('Authorization', 'Bearer ' + localStorage.getItem('token'));
    //     return this.http.post<ResponseResult<T>>(this.getFullURL(url), model, { headers: this.apiHeaders });
    // }

    addWithResponse<G>(url: string, model: G) {
        this.apiHeaders = this.apiHeaders.set('Authorization', 'Bearer ' + localStorage.getItem('token'));
        let apiUrl = this.getFullURL(url);

        let attachmentIds = localStorage.getItem("attachments");

        if (url.includes("?")) {
            apiUrl += "&" + attachmentIds ?? 0;
        }
        else {

            apiUrl += "?" + attachmentIds ?? 0;
        }

        console.log("---------------------------------------------------------------");
        console.log(apiUrl);
        console.log("---------------------------------------------------------------");
        return this.http.post<ResponseResult<G>>(apiUrl, model, { headers: this.apiHeaders });
    }

    getWithResponse<M>(url: string) {
        
        this.apiHeaders = this.apiHeaders.set('Authorization', 'Bearer ' + localStorage.getItem('token'));
        return this.http.get<ResponseResult<M>>(this.getFullURL(url), { headers: this.apiHeaders });
    }

    updateWithResponse<G>(url: string, model: G) {
        this.apiHeaders = this.apiHeaders.set('Authorization', 'Bearer ' + localStorage.getItem('token'));
        return this.http.put<ResponseResult<G>>(this.getFullURL(url), model, { headers: this.apiHeaders });
    }


    addWithUrl(url: string, model: any) {
        this.apiHeaders = this.apiHeaders.set('Authorization', 'Bearer ' + localStorage.getItem('token'));
        let apiUrl = this.getFullURL(url);
        let attachmentIds = localStorage.getItem("attachments");
        // apiUrl += attachmentIds;

        if (url.includes("?")) {
            apiUrl += "&" + attachmentIds ?? 0;
        }
        else {

            apiUrl += "?" + attachmentIds ?? 0;
        }
        return this.http.post<any>(apiUrl, model, { headers: this.apiHeaders });
    }

    uploadWithUrl(url: string, model: any) {
        ;
        this.apiHeaders = this.apiHeaders.set('Authorization', 'Bearer ' + localStorage.getItem('token'));
        return this.http.post<any>(this.getFullURL(url), model, {
            headers: this.apiHeaders, reportProgress: true,
            responseType: 'json',
        });
    }
    addData(url: string, model: any) {
        this.apiHeaders = this.apiHeaders.set('Authorization', 'Bearer ' + localStorage.getItem('token'));
        let apiUrl = this.getFullURL(url);
        let attachmentIds = localStorage.getItem("attachments");
        // apiUrl += attachmentIds;

        if (url.includes("?")) {
            apiUrl += "&" + attachmentIds ?? 0;
        }
        else {

            apiUrl += "?" + attachmentIds ?? 0;
        }
        return this.http.post<any>(apiUrl, model, { headers: this.apiHeaders });
    }
    updateData(url: string, model: T) {
        this.apiHeaders = this.apiHeaders.set('Authorization', 'Bearer ' + localStorage.getItem('token'));

        return this.http.put<any>(this.getFullURL(url), model, { headers: this.apiHeaders });
    }
    addAllWithUrl(url: string, model: T[]) {
        this.apiHeaders = this.apiHeaders.set('Authorization', 'Bearer ' + localStorage.getItem('token'));
        return this.http.post<T>(this.getFullURL(url), model, { headers: this.apiHeaders });
    }
    updateAllWithUrl(url: string, model: T[]) {
        this.apiHeaders = this.apiHeaders.set('Authorization', 'Bearer ' + localStorage.getItem('token'));

        return this.http.put<any>(this.getFullURL(url), model, { headers: this.apiHeaders });
    }
    addAllData(url: string, model: T[]) {
        this.apiHeaders = this.apiHeaders.set('Authorization', 'Bearer ' + localStorage.getItem('token'));

        return this.http.post<any[]>(this.getFullURL(url), model, { headers: this.apiHeaders });
    }
    delete(id) {
        this.apiHeaders = this.apiHeaders.set('Authorization', 'Bearer ' + localStorage.getItem('token'));
        return this.http.delete<any>(this.getFullURL('') + "/" + `${id}`, { headers: this.apiHeaders });
    }

    deleteWithResponse(url: string) {
        this.apiHeaders = this.apiHeaders.set('Authorization', 'Bearer ' + localStorage.getItem('token'));
        return this.http.delete<ResponseData>(this.getFullURL(url), { headers: this.apiHeaders });
    }
    getFullURL(parameter: string): string {
        const defaultURL = `${this.domainName}/${this.path}`;
        if (parameter) {
            if (parameter.startsWith('?')) {
                return stringIsNullOrEmpty(parameter) ? defaultURL : (defaultURL + parameter);
            }
        }
        return stringIsNullOrEmpty(parameter) ? defaultURL : (defaultURL + "/" + parameter);
    }
    loadData(url: string = '') {
        return new Promise<boolean>((acc, rej) => {
            let sub: Subscription = this.getAll(url).subscribe(data => {
                this.dataList = [];
                this.dataList = (data as any[]);
                this.dataObservable.next(this.dataList.filter(a => true));
            }, err => {
                if (sub) {
                    sub.unsubscribe();
                }
                acc(false);
            }, () => {
                ////(("Last Server Data is ", this.dataList);
                if (sub) {
                    sub.unsubscribe();
                }
                acc(true);
            });
        })
    }
    releaseList() {
        this.dataObservable.next([]);
    }
    getData() {
        return this.dataObservable.asObservable();
    }
    checkExist(fieldName, fieldValue) {
        return this.dataList.filter(x => {
            return x[fieldName] == fieldValue;
        }).length > 0 ? true : false;
    }
    updateModel(id, model: T) {
        this.apiHeaders = this.apiHeaders.set('Authorization', 'Bearer ' + localStorage.getItem('token'));
        return this.http.put<T>(this.getFullURL('') + "/" + id, model, { headers: this.apiHeaders });
    }
    get(url: string) {
        this.apiHeaders = this.apiHeaders.set('Authorization', 'Bearer ' + localStorage.getItem('token'));
        return this.http.get<T>(this.getFullURL(url), { headers: this.apiHeaders });
    }
    updateWithUrl(url: string, model: any) {

        this.apiHeaders = this.apiHeaders.set('Authorization', 'Bearer ' + localStorage.getItem('token'));
        let apiUrl = this.getFullURL(url);
        let attachmentIds = localStorage.getItem("attachments");
        // apiUrl += attachmentIds;

        if (url.includes("?")) {
            apiUrl += "&" + attachmentIds ?? 0;
        }
        else {

            apiUrl += "?" + attachmentIds ?? 0;
        }
        return this.http.put<ResponseResult<any>>(apiUrl, model, { headers: this.apiHeaders });
    }
    patchWithUrl(url: string, model: any) {
        this.apiHeaders = this.apiHeaders.set('Authorization', 'Bearer ' + localStorage.getItem('token'));

        return this.http.patch<ResponseResult<any>>(this.getFullURL(url), model, { headers: this.apiHeaders });
    }
    update(model: T) {

        this.apiHeaders = this.apiHeaders.set('Authorization', 'Bearer ' + localStorage.getItem('token'));

        return this.http.put<any>(this.getFullURL(''), model, { headers: this.apiHeaders });
    }


    deleteWithUrl(url: string) {
        this.apiHeaders = this.apiHeaders.set('Authorization', 'Bearer ' + localStorage.getItem('token'));

        return this.http.delete<any>(this.getFullURL(url), { headers: this.apiHeaders });
    }
    getAllVM<V>(url: string = '') {
        // this.apiHeaders = this.apiHeaders.set('Authorization', 'Basic ' + btoa(email + ':' + password))
        if ((url + "").length == 0) {
            //((this.getFullURL(''));
            return this.http.get<V[]>(this.getFullURL(''), { headers: this.apiHeaders });
        }
        return this.http.get<V[]>(this.getFullURL(url), { headers: this.apiHeaders });
    }
}
