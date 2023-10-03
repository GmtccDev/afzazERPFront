import { Component, PLATFORM_ID, Inject, HostListener } from '@angular/core';
// import { isPlatformBrowser } from '@angular/common';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { map, delay, withLatestFrom } from 'rxjs/operators';
// import { TranslateService } from '@ngx-translate/core';
import {IdleService} from './shared/common-services/idle.service'
import { UserService } from './shared/common-services/user.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  
  // For Progressbar
  loaders = this.loader.progress$.pipe(
    delay(1000),
    withLatestFrom(this.loader.progress$),
    map(v => v[1]),
  );
  
  constructor(@Inject(PLATFORM_ID) private platformId: Object,public router: Router,
    private loader: LoadingBarService,private idleService: IdleService, private userService: UserService) {
      
    // if (isPlatformBrowser(this.platformId)) {
    //   translate.setDefaultLang('en');
    //   translate.addLangs(['en', 'de', 'es', 'fr', 'pt', 'cn', 'ae']);
    // }
  }
  ngOnInit(): void {
    this.idleService.isIdle$.subscribe((isIdle) => {
      if (isIdle) {
        this.router.navigate(['/authentication/login'])
      }
    });
  }

  @HostListener('window:mousemove', ['$event'])
  @HostListener('window:click', ['$event'])
  @HostListener('window:keypress', ['$event'])
  onActivity(event: MouseEvent | KeyboardEvent): void {
    this.idleService.onActivity();
  }

  private logout(): void {
    // Perform logout action here, such as clearing session data and redirecting to the login page
  }
}
