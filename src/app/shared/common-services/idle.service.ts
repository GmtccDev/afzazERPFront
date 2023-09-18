import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class IdleService implements OnDestroy {
  private timeoutInMinutes = environment.timeoutInMinutes; // Idle timeout duration in minutes
  private lastActivityTimestamp: number;
  private timerInterval = 1000;  // Check idleness every second
  private destroy$: Subject<void> = new Subject<void>();

  public isIdle$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor() {
    this.startTimer();
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
  }
}
