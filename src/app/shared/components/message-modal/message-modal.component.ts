import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'message-modal-content',
    templateUrl: './message-modal.component.html'
})
export class MessageModalComponent implements OnInit, OnDestroy {
    //@Input() name;
    @Input() message;
    @Input() isYesNo;
    @Input() functionName;
    @Input() title;
    @Input() btnConfirmTxt: string = this.translate.instant('buttons.delete');
    @Input() btnClass: string = "";




    constructor(public activeModal: NgbActiveModal, private translate: TranslateService) { }
    ngOnInit() {

        // this.message = this.translate.instant('messages.confirm-delete');
        // this.title = this.translate.instant('messageTitle.delete');
        // this.btnConfirmTxt = this.translate.instant('messageTitle.delete');
        // this.isYesNo = true;
    }

    ngOnDestroy() { }


    close() {
        this.activeModal.close('Close click');
    }
    confirm() {

        this.activeModal.close("Confirm")
    }
}



