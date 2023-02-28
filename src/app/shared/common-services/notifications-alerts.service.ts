import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
@Injectable({
  providedIn: 'root',
})
export class NotificationsAlertsService {
  constructor(private toastrService: ToastrService) {
    this.toastrService.toastrConfig.positionClass = 'toast-top-center';
  }
  showSuccess(message, title) {
    this.toastrService.success(message, title);
  }

  showError(message, title) {
    this.toastrService.error(message, title);
  }

  showInfo(message, title) {
    this.toastrService.info(message, title);
  }

  showWarning(message, title) {
    this.toastrService.warning(message, title);
  }
}
