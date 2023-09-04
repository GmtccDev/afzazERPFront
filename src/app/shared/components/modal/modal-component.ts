import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { ReportFile } from '../../model/report-file';
import { ReportServiceProxy } from '../../common-services/report.service'
import { environment } from '../../../../environments/environment';
import { ToolbarData } from '../../interfaces/toolbar-data';
import { SharedService } from '../../common-services/shared-service';


@Component({
    selector: 'ngbd-modal-content',
    templateUrl: './modal-content.html'
})
export class NgbdModalContent implements OnInit, OnDestroy {
    @Input() reportParams;
    @Input() reportType;
    @Input() reportTypeID;

    reportList: ReportFile[] = [];
    private readonly apiurl = environment.apiUrl;

    constructor(public activeModal: NgbActiveModal,
        private rptSrv: ReportServiceProxy,
        private sharedService: SharedService,

        private router: Router) { }
    ngOnInit() {

        this.rptSrv.setReportList(this.reportType, this.reportTypeID).then(a => {

            this.rptSrv.getReportList().subscribe(r => {


                this.reportList = r["response"]

                if (this.reportList.length > 0) {
                    this.reportList.forEach(element => {
                        if (element.isDefault == true) {
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
        this.sharedService.changeButton({ action: 'Report' } as ToolbarData);

    }

    viewRpt(selectedRpt: ReportFile) {

        let reportData = {
            reportName: selectedRpt.fileName,
            reportParams: this.reportParams
        };
        let params: string = "";

        var newUrl = this.apiurl?.replace('api', '') + "/Viewer/Reports?id=" + selectedRpt.id + "&reportParameter=reportType!" + this.reportType + "&reportParameter=reportTypeID!" + this.reportTypeID + "&" + this.reportParams;

        window.open(newUrl, "_blank");
        this.close();


    }
    designRpt(selectedRpt: ReportFile) {

        let reportData = {
            reportName: selectedRpt.fileName,
            reportParams: this.reportParams
        };
        var newUrl = this.apiurl?.replace('api', '') + "/Designer/Reports?id=" + selectedRpt.id + "&" + this.reportParams;
        window.open(newUrl, "_blank");
        this.close();

    }
    setAsDefaultRpt(selectedRpt: ReportFile) {

        this.rptSrv.setDefaultReport(selectedRpt.id, this.reportType, this.reportTypeID).subscribe(d => {

            if (d) {

                this.viewRpt(selectedRpt);
                this.close();
            }
            else {
            }
        });
    }

    deleteRpt(selectedRpt: ReportFile) {
        this.rptSrv.deleteReport(selectedRpt.id).subscribe(d => {
            if (d == true) {
                this.close();
            }
            else {
            }
        });
    }
}



