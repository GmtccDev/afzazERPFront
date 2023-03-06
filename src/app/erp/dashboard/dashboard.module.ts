import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { CountToModule } from 'angular-count-to';
import { ChartistModule } from 'ng-chartist';
import { NgChartsModule } from 'ng2-charts';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
// import { AgmCoreModule } from '@agm/core';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { GoogleMapsModule } from "@angular/google-maps";
import { DefaultDashboardComponent } from './default-dashboard/default-dashboard.component';
import { TranslateService } from '@ngx-translate/core';
import { LayoutService } from '../../shared/services/layout.service';



@NgModule({
  declarations: [ DefaultDashboardComponent ],
  imports: [
    CommonModule,
    ChartistModule,
    CarouselModule,
    NgChartsModule,
    NgApexchartsModule,
    SharedModule,
    GoogleMapsModule,
    CKEditorModule,
    CountToModule,
    NgbModule,
    FormsModule,
    DashboardRoutingModule
  ]
})
export class DashboardModule {
  constructor(public layout: LayoutService, private translate:TranslateService){
    this.customizeLayoutType();
  }
  customizeLayoutType() {
    if (localStorage.getItem("language") == "ar") {
      this.layout.config.settings.layout_type = "rtl";
      document.getElementsByTagName('html')[0].setAttribute('dir', 'rtl');
    } else {
      this.translate.setDefaultLang("en");
      this.layout.config.settings.layout_type = "ltr";
      document.getElementsByTagName('html')[0].setAttribute('dir', 'ltr');
    }
  }
 }