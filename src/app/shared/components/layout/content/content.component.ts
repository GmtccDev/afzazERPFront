import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'
import * as feather from 'feather-icons';
import { LayoutService } from '../../../services/layout.service';
import { NavService } from '../../../services/nav.service';
import { fadeInAnimation } from '../../../data/router-animation/router-animation';
import { UserService } from 'src/app/shared/common-services/user.service';
import { TranslateService } from '@ngx-translate/core';
import { VoucherTypeServiceProxy } from 'src/app/erp/Accounting/services/voucher-type';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss'],
  animations: [fadeInAnimation]
})
export class ContentComponent implements OnInit, AfterViewInit {

  constructor(private route: ActivatedRoute, private userService: UserService, private translate: TranslateService,
    public navServices: NavService, private router: Router,
    private voucherTypeService: VoucherTypeServiceProxy,
    public layout: LayoutService) {
    this.customizeLayoutType()
    // this.route.queryParams.subscribe((params) => {
    //   
    //   this.layout.config.settings.layout = params.layout ? params.layout : this.layout.config.settings.layout
    // })
  }
  getVoucherTypes() {

    return new Promise<void>((resolve, reject) => {


      let sub = this.voucherTypeService.allVoucherTypees(undefined, undefined, undefined, undefined, undefined).subscribe({
        next: (res) => {


          console.log(res);
          if (res.success) {
            debugger

            res.response.items.forEach(element => {

              this.navServices.voucherTypes.push({ path: '/accounting-master-codes/journal', title: this.translate.instant("component-names.journal"), type: 'link', active: true },)

            });


          }
          resolve();
        },
        error: (err: any) => {
          reject(err);
        },
        complete: () => {
          console.log('complete');
        },
      });

      //	this.subsList.push(sub);

    });

  }
  customizeLayoutType() {

    debugger
    this.getVoucherTypes()
    // this.layout.config.settings.layout_type = "rtl";
    if (localStorage.getItem("language") == "ar") {
      // this.translate.setDefaultLang(localStorage.getItem("language"));
      this.layout.config.settings.layout_type = "rtl";
      document.getElementsByTagName('html')[0].setAttribute('dir', "rtl");
    } else {
      this.translate.setDefaultLang("en");
      this.layout.config.settings.layout_type = "ltr";
      document.getElementsByTagName('html')[0].removeAttribute('dir');
    }
    //     const currentRoute = this.router.url;

    // this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
    // 	this.router.navigate([currentRoute]); // navigate to same route
    // }); 
  }

  ngAfterViewInit() {
    setTimeout(() => {
      // feather.replace();
    });
  }

  public getRouterOutletState(outlet) {
    return outlet.isActivated ? outlet.activatedRoute : '';
  }

  get layoutClass() {
    switch (this.layout.config.settings.layout) {
      case "Dubai":
        return "compact-wrapper"
      case "London":
        return "only-body"
      case "Seoul":
        return "compact-wrapper modern-type"
      case "LosAngeles":
        return this.navServices.horizontal ? "horizontal-wrapper material-type" : "compact-wrapper material-type"
      case "Paris":
        return "compact-wrapper dark-sidebar"
      case "Tokyo":
        return "compact-sidebar"
      case "Madrid":
        return "compact-wrapper color-sidebar"
      case "Moscow":
        return "compact-sidebar compact-small"
      case "NewYork":
        return "compact-wrapper box-layout"
      case "Singapore":
        return this.navServices.horizontal ? "horizontal-wrapper enterprice-type" : "compact-wrapper enterprice-type"
      case "Rome":
        return "compact-sidebar compact-small material-icon"
      case "Barcelona":
        return this.navServices.horizontal ? "horizontal-wrapper enterprice-type advance-layout" : "compact-wrapper enterprice-type advance-layout"
    }
  }

  ngOnInit() {

  }

}
