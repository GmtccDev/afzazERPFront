import { BehaviorSubject, Observable } from "rxjs";
import {ToolbarData} from '../interfaces/toolbar-data';
import {ToolbarButtonsAppearance} from '../interfaces/toolbar-buttons-appearance';
import {ToolbarPath} from '../interfaces/toolbar-path'
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root',
  })
  export class SharedService {
    private buttonSource: BehaviorSubject<ToolbarData> =new BehaviorSubject<ToolbarData>({} as ToolbarData);
    private buttonAppearanceSource: BehaviorSubject<ToolbarButtonsAppearance> =new BehaviorSubject<ToolbarButtonsAppearance>({} as ToolbarButtonsAppearance);
    private pathSource: BehaviorSubject<ToolbarPath> =new BehaviorSubject<ToolbarPath>({} as ToolbarPath);
    private lageuageSource: BehaviorSubject<string> =new BehaviorSubject<string>("");
    private updateBtnSource: BehaviorSubject<string> =new BehaviorSubject<string>("");
  
  
  
    //currentButton = this.buttonSource.asObservable();
  
    constructor() {}
    public changeButton(toolbarData: ToolbarData) {
      
      
      this.buttonSource.next(toolbarData);
    }
    public getClickedbutton(): Observable<ToolbarData> {
   
      return this.buttonSource.asObservable();
    }
    public changeButtonApperance(toolbarButtons: ToolbarButtonsAppearance) {
      this.buttonAppearanceSource.next(toolbarButtons);
    }
  
    public getAppearanceButtons(): Observable<ToolbarButtonsAppearance> {
      return this.buttonAppearanceSource.asObservable();
    }
  
    public changeToolbarPath(toolbarPath: ToolbarPath) {
  
      this.pathSource.next(toolbarPath);
    }
  
    public getToolbarPath(): Observable<ToolbarPath> {
      return this.pathSource.asObservable();
    }
  
  
    public setLanguage(lang: string) {
  
      this.lageuageSource.next(lang);
    }
  
    public getLanguage(): Observable<string> {
      return this.lageuageSource.asObservable();
    }
  
    public setUpdateBtn(lang: string) {
  
      this.updateBtnSource.next(lang);
    }
  
    public getUpdateBtn(): Observable<string> {
      return this.updateBtnSource.asObservable();
    }
  
  }
  