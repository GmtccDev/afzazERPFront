import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { IAppConfig } from "../interfaces/api-config";
@Injectable(
    {providedIn:"root"}
)


export class AppConfigService{
    static appCongif :IAppConfig
    constructor(private http:HttpClient)
    {
      
    }
    loadConfig()
    {
        debugger
        return  new Promise<void>((resolve, reject) => {
            this.http.get<IAppConfig>("assets/config/api-config.json").toPromise().then(appConfig=>{
                AppConfigService.appCongif  ={...appConfig};
                resolve();

            }).catch(err=>{
                reject();
            })
        })


    }
}
