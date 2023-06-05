import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {Router} from '@angular/router';
import { ReportFile } from '../../model/report-file';
import {ReportServiceProxy} from '../../common-services/report.service'
import { environment } from '../../../../environments/environment';


@Component({
    selector: 'ngbd-modal-content',
    templateUrl: './modal-content.html'
})
export class NgbdModalContent implements OnInit, OnDestroy {
    //@Input() name;
    @Input() reportParams;
    @Input() reportType;
    @Input() reportTypeID;
    @Input() oldUrl;

    reportList: ReportFile[] = [];
    private readonly apiurl = environment.apiUrl;
    //AppConfigService.appCongif.url;

    constructor(public activeModal: NgbActiveModal,
    private rptSrv: ReportServiceProxy,
    private router:Router) { }
    ngOnInit() {
        this.rptSrv.setReportList(this.reportType, this.reportTypeID).then(a=>{
             this.rptSrv.getReportList().subscribe(r=>{
                 this.reportList = r;
                 if(this.reportList.length>0)
                 {
                    this.reportList.forEach(element => {
                    if(element.isDefault==true)
                    {
                        this.viewRpt(element);
                    }

                });
               }

             });

        });

    }

    ngOnDestroy() { }

    close() {
        this.activeModal.close('Close click');
    }

    viewRpt(selectedRpt:ReportFile)
    {
        debugger
        let reportData = {
            reportName:selectedRpt.fileName,
            reportParams:this.reportParams
        };
        //((reportData);
        //var newUrl= window.location.href.replace(this.oldUrl, "ReportViewer")+"?reportType="+this.reportType+"--reportTypeID="+this.reportTypeID+"--id="+selectedRpt.reportNameAr+"&"+this.reportParams;
        let params:string= "";

        var newUrl = this.apiurl?.replace('api','')+"Viewer/Reports?id=" + selectedRpt.id + "&reportParameter=reportType!" + this.reportType + "&reportParameter=reportTypeID!" +this.reportTypeID + "&"+this.reportParams;
        //this.router.navigate(['ReportViewer', {params:reportData}]);
        //window.location.href = newUrl;
        window.open(newUrl, "_blank");
        this.close();

        // this.rptSrv.setReportData(reportData).then(d=>{

        // });

        //this.router.navigate(['ReportViewer']);


    }
    designRpt(selectedRpt:ReportFile)
    {

        let reportData = {
            reportName:selectedRpt.fileName,
            reportParams:this.reportParams
        };
        //((reportData);
        //var newUrl= window.location.href.replace(this.oldUrl, "ReportDesigner")+"?reportType="+this.reportType+"--reportTypeID="+this.reportTypeID+"--id="+selectedRpt.reportNameAr+"&"+this.reportParams;
        var newUrl = this.apiurl?.replace('api','')+"Designer/Reports?id=" + selectedRpt.id+ "&"+this.reportParams;
        //this.router.navigate(['ReportViewer', {params:reportData}]);
        //window.location.href = newUrl;
        window.open(newUrl, "_blank");
        this.close();

    }
    setAsDefaultRpt(selectedRpt:ReportFile)
    {

        this.rptSrv.setDefaultReport(selectedRpt.id, this.reportType, this.reportTypeID).subscribe(d=>{

            if(d)

            {

                this.viewRpt(selectedRpt);
                this.close();
            }
            else{
            }
        });
    }

    deleteRpt(selectedRpt:ReportFile)
    {

        this.rptSrv.deleteReport(selectedRpt.id).subscribe(d=>{
            if(d==true)
            {
                this.close();
            }
            else{
            }
        });
    }
}



