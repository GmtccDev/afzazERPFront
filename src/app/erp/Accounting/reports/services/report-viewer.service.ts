import { Injectable } from '@angular/core';
import { ReportServiceProxy } from 'src/app/shared/common-services/report.service';
import { ReportFile } from 'src/app/shared/model/report-file';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportViewerService {

  constructor(private rptSrv: ReportServiceProxy) { }

  userId: any = localStorage.getItem("userId");
  private readonly apiurl = environment.apiUrl;
  // = "2e992e3d-3bc9-41f5-9b6e-98fbc97d770a";
  orderBy: any;
  companyId: string = localStorage.getItem("companyId");
  lang = localStorage.getItem("language");
  branchId
  reportParams = "";
  reportList: ReportFile[] = [];
  gotoViewer(reportType, reportTypeId, itemId) {
    ;
    this.rptSrv.setReportList(reportType, reportTypeId).then(a => {

      this.rptSrv.getReportList().subscribe(r => {
        this.reportList = r["response"]

        if (this.reportList.length > 0) {
          this.reportList.forEach(element => {

            this.viewRpt(element, reportType, reportTypeId, itemId);

          });
        }

      });

    });
  }
  // JournalEntryId = this.id;
   


  viewRpt(selectedRpt: ReportFile, reportType, reportTypeId, ItemId) {
    ;
     ;
    let lang = localStorage.getItem("language");
    if (this.branchId == null || this.branchId == undefined || this.branchId == "undefined" || this.branchId == "") {
      this.branchId = 0;
    }
    // JournalEntryId = this.id;

    let reportParams = "&reportParameter=companyId!" + this.companyId
      + "&reportParameter=lang!" + lang
      + "&reportParameter=userId!" + this.userId
      + "&reportParameter=id!" +   localStorage.getItem("itemId");

    var newUrl = this.apiurl?.replace('api', '') + "/Viewer/Reports?id=" + selectedRpt.id + "&reportParameter=reportType!" + reportType + "&reportParameter=reportTypeID!" + reportTypeId + "&" + reportParams;
    window.open(newUrl, "_blank");

    // this.close();


  }

}
