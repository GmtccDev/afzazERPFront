import {
  Component,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { SharedService } from '../../common-services/shared-service';
import { Subscription } from 'rxjs';
import { ObjectIsNotNullOrEmpty } from '../../helper/helper';
import { ToolbarData } from '../../interfaces/toolbar-data';
import { ToolbarButtonsAppearance } from '../../interfaces/toolbar-buttons-appearance';
import { ToolbarPath } from '../../interfaces/toolbar-path'

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent implements OnInit, OnDestroy {
  tabular: any;
  componentName: any;

  constructor(
    private router: Router,
    private SharedService: SharedService,
    private route: ActivatedRoute,
  ) {
    this.showToolbarButtonsObj = {} as ToolbarButtonsAppearance;

  }
  showButtons!: ToolbarButtonsAppearance;

  disabledList = false;
  disabledSave = false;
  disabledUpdate = false;
  disabledNew = false;
  disabledCopy = false;
  disabledDelete = false
  disabledCancel = false;
  disabledExport = false;
  disabledPrint = false;
  disabledView = false;
  disabledPost = true;
  disableCancelDefaultReport = false;
  disabledGenerateEntry = true;
  toolbarPathData!: ToolbarPath;
  toolbarData: ToolbarData = {} as ToolbarData;
  toolbarCompnentData: ToolbarData = {} as ToolbarData;
  substringUrl;
  showToolbarButtonsObj!: ToolbarButtonsAppearance;
  currentUrl;

  updateUrl;
  ngOnInit(): void {
    
    this.tabular = this.SharedService.getTabulator();
    this.tabular = this.tabular.source._value;
    this.componentName = this.SharedService.getComponentName();
    this.componentName = this.componentName.source._value;
    this.currentUrl = '';
    this.currentUrl = this.router.url;
    this.toolbarData.componentName = this.currentUrl;
    this.SharedService.changeButton(this.toolbarData);
    this.substringUrl = this.currentUrl
      .substring(this.currentUrl.lastIndexOf('/') + 1)
      .trim();
    this.updateUrl = this.currentUrl.replace(this.substringUrl, '');
    this.listenToShowButton();
    this.listenToPathChange();
    this.listenClickedButton();
  }

  //#region ngOnDestroy
  ngOnDestroy() {
    this.subsList.forEach((s) => {
      if (s) {
        s.unsubscribe();
      }
    });
  }
  //#endregion

  //#region Authentications
  //
  //
  //#endregion

  //#region Toolbar Service
  subsList: Subscription[] = [];
  currentBtn!: string;

  listenToShowButton() {
    let sub = this.SharedService.getAppearanceButtons().subscribe({
      next: (showCurrentBtn: ToolbarButtonsAppearance) => {
        showCurrentBtn;

        if (ObjectIsNotNullOrEmpty(showCurrentBtn)) {
          this.showButtons = showCurrentBtn;
          this.resetCLickedButtons();

        } else {
          this.resetShowButtons();
        }
      },
    });
    this.subsList.push(sub);
  }

  listenClickedButton() {

    let sub = this.SharedService.getClickedbutton().subscribe({
      next: (toolbarCompnentData: ToolbarData) => {
        toolbarCompnentData;
        if (ObjectIsNotNullOrEmpty(toolbarCompnentData)) {
          this.toolbarCompnentData = toolbarCompnentData;
          if (this.toolbarCompnentData.action == 'New') {
            this.checkButtonClicked('New');
          }
          if (this.toolbarCompnentData.action == 'List') {
            this.checkButtonClicked('List');
          }
          if (this.toolbarCompnentData.action == 'Update') {
            this.checkButtonClicked('Update');
          }
          if (this.toolbarCompnentData.action == 'Delete') {
            this.checkButtonClicked('Delete');
          }
          if (this.toolbarCompnentData.action == 'Report') {
            this.checkButtonClicked('Report');
          }
          if (this.toolbarCompnentData.action == 'Print') {
            this.checkButtonClicked('Print');
          } if (this.toolbarCompnentData.action == 'Post') {
            this.checkButtonClicked('Post');
          }
          if (this.toolbarCompnentData.action == 'CancelDefaultReport') {
            this.checkButtonClicked('CancelDefaultReport');
          }
          if (this.toolbarCompnentData.action == 'View') {
            this.checkButtonClicked('View');
          } if (this.toolbarCompnentData.action == 'ConfigMode') {
            this.checkButtonClicked('ConfigMode');
          }
          if (this.toolbarCompnentData.action == 'GenerateEntry') {
            this.checkButtonClicked('GenerateEntry');
          }


        }
      },
    });
    this.subsList.push(sub);
  }
  listenToPathChange() {

    let sub = this.SharedService.getToolbarPath().subscribe({
      next: (toolbarPathData: ToolbarPath) => {
        toolbarPathData;

        this.toolbarPathData = toolbarPathData;
        if (ObjectIsNotNullOrEmpty(toolbarPathData)) {
          if (
            this.toolbarPathData.listPath == this.currentUrl &&
            this.toolbarCompnentData.action == 'List'
          ) {
            this.checkButtonClicked('List');
          } else if (
            this.toolbarPathData.addPath == this.currentUrl &&
            this.toolbarCompnentData.action == 'New'
          ) {
            this.checkButtonClicked('New');
          } else if (
            this.toolbarPathData.updatePath == this.updateUrl &&
            this.toolbarCompnentData.action == 'Update'
          ) {
            this.checkButtonClicked('Update');
          }

        }
      },
    });
    this.subsList.push(sub);
  }

  doSaveEvent() {

    this.checkButtonClicked('Save');

    this.toolbarData.submitMode=true;
    this.SharedService.changeButton({ action: 'Save' } as ToolbarData);
  }
  doUpdateEvent() {
    this.checkButtonClicked('Update');
     this.toolbarData.submitMode=true;
    (this.toolbarData.action = 'Update'),
      this.SharedService.changeButton(this.toolbarData);
  }
  doCopyEvent() {

    this.checkButtonClicked('Copy');
    (this.toolbarData.action = 'Copy'),
      this.SharedService.changeButton(this.toolbarData);
  }
  doPostEvent() {

    this.checkButtonClicked('Post');
    (this.toolbarData.action = 'Post'),
      this.SharedService.changeButton(this.toolbarData);
  }
  doGenerateEntryEvent() {

    this.checkButtonClicked('GenerateEntry');
    (this.toolbarData.action = 'GenerateEntry'),
      this.SharedService.changeButton(this.toolbarData);
  }
  doNewEvent() {
    this.checkButtonClicked('New');
    (this.toolbarData.action = 'New'),
      this.SharedService.changeButton(this.toolbarData);
  }
  doCancelEvent() {
    this.checkButtonClicked('Cancel');
    (this.toolbarData.action = 'Cancel'),
      this.SharedService.changeButton(this.toolbarData);
  }
  doExportEvent() {
    this.checkButtonClicked('Export');
    (this.toolbarData.action = 'Export'),
      this.SharedService.changeButton(this.toolbarData);
  }
  doPrintEvent() {

    this.checkButtonClicked('Print');
    (this.toolbarData.action = 'Print'),
      this.SharedService.changeButton(this.toolbarData);
  }
  doDeleteEvent() {

    this.checkButtonClicked('Delete');
    (this.toolbarData.action = 'DeleteCheckList'),
      this.SharedService.changeButton(this.toolbarData);
    this.disabledDelete = true;
  }
  doViewEvent() {
    this.checkButtonClicked('View');
    (this.toolbarData.action = 'View'),
      this.SharedService.changeButton(this.toolbarData);
  }
  doCancelDefaultReportEvent() {
    this.checkButtonClicked('CancelDefaultReport');
    (this.toolbarData.action = 'CancelDefaultReport'),
      this.SharedService.changeButton(this.toolbarData);
  }
  public goToList() {
    this.checkButtonClicked('List');
    (this.toolbarData.action = 'List'),
      this.SharedService.changeButton(this.toolbarData);
  }

  checkButtonClicked(button: string) {

    this.resetCLickedButtons();
    if (button == 'List') {
      this.disabledSave = true;
      this.disabledNew = false;
      this.disabledCopy = true;
      this.disabledList = true;
      this.disabledExport = false;
      this.disabledPrint = true;
      this.disabledUpdate = true;
      this.disabledCancel = true;
      this.disabledDelete = true;
      this.disabledView = true;
      this.disabledPost = true;
      this.disabledGenerateEntry = true;

      this.disableCancelDefaultReport = true;

    } else if (button == 'Save') {
      this.disabledUpdate = true;
      this.disabledCopy = true;
      this.disabledNew = true;
      this.disabledExport = true;
      this.disabledPrint = true;
      this.disabledDelete = true;
      this.disabledView = true;
      this.disableCancelDefaultReport = true;
      this.disabledGenerateEntry = true;
      this.disabledPost = true;

    } else if (button == 'New') {
      this.disabledUpdate = true;
      this.disabledCopy = true;
      this.disabledExport = true;
      this.disabledPrint = true;
      this.disabledDelete = true;
      this.disabledView = true;
      this.disableCancelDefaultReport = true;
      this.disabledGenerateEntry = true;
      this.disabledPost = true;


    }
    else if (button == 'Print') {
      this.disabledSave = true;
      this.disabledView=true;
      this.disabledPrint = true;
      this.disabledView = true;
      this.disabledPrint = false;
      this.disableCancelDefaultReport = true;
      this.disabledExport = true;
      this.disabledGenerateEntry = true;
      this.disabledPost = true;


    } else if (button == 'Copy') {
    } else if (button == 'Update') {
      debugger;
      this.disabledSave = true;
      this.disabledView=true;
      this.disabledPrint = false;
      this.disabledCancel=true;
      this.disabledDelete=true;
      this.disabledView = true;
      this.disabledPrint = this.toolbarCompnentData.disabledPrint==false?false:true;
      this.disabledCancel = true;
      this.disableCancelDefaultReport = true;
      this.disabledExport = true;
      this.disabledGenerateEntry = true;
      this.disabledPost = true;

    } else if (button == 'Cancel') {
    }
    else if (button == 'Post') {
      this.disabledSave = true;
      this.disabledPost = false;
      this.disabledUpdate = true;
      this.disabledCopy = true;
      this.disabledExport = true;
      this.disabledPrint = true;
      this.disabledDelete = true;
      this.disabledView = true;
      this.disabledCancel = true;
      this.disabledNew = true;
      this.disableCancelDefaultReport = true;
      this.disabledGenerateEntry = true;

    }
    // else if (button == 'Print') {
    // }
    else if (button == 'Delete') {
      this.disabledUpdate = true;
      this.disabledCopy = true;
      this.disabledExport = true;
      this.disabledPrint = true;
      this.disabledSave = true;
      this.disabledDelete = false;
    }
    else if (button == 'Report') {

      this.disabledList = true;
      this.disabledSave = true;
      this.disabledNew = true;
      this.disabledCopy = true;
      this.disabledList = true;
      this.disabledExport = true;
      this.disabledUpdate = true;
      this.disabledCancel = true;
      this.disabledDelete = true;
      this.disabledPrint = false;
      this.disabledView = false;
      this.disableCancelDefaultReport = false;
      this.disabledGenerateEntry = true;
      this.disabledPost = true;

    }
    else if (button == 'ConfigMode') {

      this.disabledList = true;
      this.disabledSave = true;
      this.disabledNew = true;
      this.disabledCopy = true;
      this.disabledList = true;
      this.disabledExport = true;
      this.disabledUpdate = false;
      this.disabledCancel = true;
      this.disabledDelete = true;
      this.disabledPrint = true;
      this.disabledView = true;
      this.disableCancelDefaultReport = true;
      this.disabledGenerateEntry = true;
      this.disabledPost = true;


    }
    else if (button == 'GenerateEntry') {
      this.disabledGenerateEntry = false;
      this.disabledSave = true;
      this.disabledPost = true;
      this.disabledUpdate = true;
      this.disabledCopy = true;
      this.disabledExport = true;
      this.disabledPrint = true;
      this.disabledDelete = true;
      this.disabledView = true;
      this.disabledCancel = true;
      this.disabledNew = true;
      this.disableCancelDefaultReport = true;
    }

  }

  resetCLickedButtons() {
    this.disabledSave = false;
    this.disabledNew = false;
    this.disabledCopy = false;
    this.disabledList = false;
    this.disabledExport = false;
    this.disabledPrint = false;
    this.disabledUpdate = false;
    this.disableCancelDefaultReport = false;
    this.disabledView = false;
    this.disabledPost = false;
    this.disabledGenerateEntry = false;


  }
  resetShowButtons() {
    this.showToolbarButtonsObj.showSave = true;
    this.showToolbarButtonsObj.showCancel = true;
    this.showToolbarButtonsObj.showDelete = true;
    this.showToolbarButtonsObj.showExport = true;
    this.showToolbarButtonsObj.showCopy = true;
    this.showToolbarButtonsObj.showList = true;
    this.showToolbarButtonsObj.showNew = true;
    this.showToolbarButtonsObj.showPrint = true;
    this.showToolbarButtonsObj.showReset = true;
    this.showToolbarButtonsObj.showUpdate = true;
    this.showToolbarButtonsObj.showView = true;
    this.showToolbarButtonsObj.showCancelDefaultReport = true;
    this.showToolbarButtonsObj.showPost = true;
    this.showToolbarButtonsObj.showGenerateEntry = true;

    this.SharedService.changeButtonApperance(this.showToolbarButtonsObj);
  }
  exportPdf() {
    this.tabular.download("pdf", this.componentName + ".pdf", {
      orientation: "portrait", //set page orientation to portrait
      title: this.componentName + " " + "Report", //add title to report
      lang: 'ar',
      unicode: true,


    });
  }
  exportJson() {
    this.tabular.download("json", this.componentName + ".json");
  }

  exportHtml() {
    this.tabular.download("html", this.componentName + ".html", { style: true });
  }

  exportCsv() {
    this.tabular.download("csv", this.componentName + ".csv");
  }

  exportExcel() {
    this.tabular.download("xlsx", this.componentName + ".xlsx", { sheetName: this.componentName });
  }


}
