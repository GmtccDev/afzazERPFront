import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subject, Subscription, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GeneralConfigurationServiceProxy } from 'src/app/erp/Accounting/services/general-configurations.services';
import { environment } from 'src/environments/environment';
import { UserService } from './user.service';
import { ModuleType } from 'src/app/erp/Accounting/models/general-configurations';

@Injectable({
  providedIn: 'root'
})
export class IdleService implements OnDestroy, OnInit {
  private timeoutInMinutes = environment.timeoutInMinutes; // Idle timeout duration in minutes
  private lastActivityTimestamp: number;
  private timerInterval = 1000;  // Check idleness every second
  private destroy$: Subject<void> = new Subject<void>();

  public isIdle$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  subsList: Subscription[] = [];
  name: string;
  constructor(private generalConfigurationService: GeneralConfigurationServiceProxy, public userService: UserService) {
    if (this.userService.isLoggedIn()) {
      this.name = userService.getUserName();
      this.getGeneralConfiguration()
    }

  }
  ngOnInit(): void {




  }
  getGeneralConfiguration() {
    return new Promise<void>((resolve, reject) => {
      if (this.name != "") {

        let sub = this.generalConfigurationService.allGeneralConfiguration(ModuleType.Settings, 1, 1000, undefined, undefined, undefined).subscribe({
          next: (res) => {

            resolve();

            if (res.success) {

              this.timeoutInMinutes = Number(res.response.result.items.find(c => c.id == 10001).value);
              this.startTimer();

            }

          },
          error: (err: any) => {
            reject(err);
          },
          complete: () => {
            console.log('complete');
          },
        });

        this.subsList.push(sub);
      }

    });

  }

  private startTimer(): void {
    this.lastActivityTimestamp = Date.now();

    timer(0, this.timerInterval)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {

        const idleMilliseconds = Date.now() - this.lastActivityTimestamp;
        const idleMinutes = Math.floor(idleMilliseconds / 60000);

        if (idleMinutes >= this.timeoutInMinutes) {
          this.isIdle$.next(true);
        } else {
          this.isIdle$.next(false);
        }
      });
  }

  public onActivity(): void {
    this.lastActivityTimestamp = Date.now();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subsList.forEach((s) => {
      if (s) {
        s.unsubscribe();
      }
    });
  }
}
