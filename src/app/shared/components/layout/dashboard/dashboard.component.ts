import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router'
import * as feather from 'feather-icons';
import { LayoutService } from '../../../services/layout.service';
import { NavService } from '../../../services/nav.service';
import { fadeInAnimation } from '../../../data/router-animation/router-animation';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: [fadeInAnimation]
})
export class DashboardComponent implements OnInit, AfterViewInit {
  public elem: any;
  public dark: boolean = this.layout.config.settings.layout_version == 'dark-only' ? true : false;
  constructor(private route: ActivatedRoute, public navServices: NavService, 
    @Inject(DOCUMENT) private document: any,
    public layout: LayoutService) {
      this.elem = document.documentElement;
      this.route.queryParams.subscribe((params) => {
        this.layout.config.settings.layout = params.layout ? params.layout : this.layout.config.settings.layout
      })
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
    switch(this.layout.config.settings.layout){
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


  sidebarToggle() {
    this.navServices.collapseSidebar = !this.navServices.collapseSidebar;
    this.navServices.megaMenu  = false;
    this.navServices.levelMenu = false;
  }

  layoutToggle() {
    this.dark = !this.dark;
    this.layout.config.settings.layout_version = this.dark ? 'dark-only' : 'light';
  }

  searchToggle() {
    this.navServices.search = true;
  }

  languageToggle() {
    this.navServices.language = !this.navServices.language;
  }

  toggleFullScreen() {
    this.navServices.fullScreen = !this.navServices.fullScreen;
    if (this.navServices.fullScreen) {
      if (this.elem.requestFullscreen) {
        this.elem.requestFullscreen();
      } else if (this.elem.mozRequestFullScreen) {
        /* Firefox */
        this.elem.mozRequestFullScreen();
      } else if (this.elem.webkitRequestFullscreen) {
        /* Chrome, Safari and Opera */
        this.elem.webkitRequestFullscreen();
      } else if (this.elem.msRequestFullscreen) {
        /* IE/Edge */
        this.elem.msRequestFullscreen();
      }
    } else {
      if (!this.document.exitFullscreen) {
        this.document.exitFullscreen();
      } else if (this.document.mozCancelFullScreen) {
        /* Firefox */
        this.document.mozCancelFullScreen();
      } else if (this.document.webkitExitFullscreen) {
        /* Chrome, Safari and Opera */
        this.document.webkitExitFullscreen();
      } else if (this.document.msExitFullscreen) {
        /* IE/Edge */
        this.document.msExitFullscreen();
      }
    }
  }

}
