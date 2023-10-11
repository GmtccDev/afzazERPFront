import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from '../../../shared/common-services/base.service';
import { AppConfigService } from '../../../shared/common-services/app-config.service';
import {Bill} from '../models/bill'


@Injectable({
    providedIn: 'root'
})
export class BillService  extends BaseService<Bill> {

  private readonly baseUrl = AppConfigService.appCongif.url;
  constructor(http: HttpClient) {
    super(http);
    this.path="Bill";
  

  }
  
  
}
