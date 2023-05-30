import { Component, ViewEncapsulation, HostListener } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Menu, NavService } from '../../services/nav.service';
import { LayoutService } from '../../services/layout.service';
import { VoucherTypeServiceProxy } from 'src/app/erp/Accounting/services/voucher-type.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SidebarComponent {

  public iconSidebar;
  public menuItems: Menu[];
  public url: any;
  public fileurl: any;

  // For Horizontal Menu
  public margin: any = 0;
  public width: any = window.innerWidth;
  public leftArrowNone: boolean = true;
  public rightArrowNone: boolean = false;

  constructor(private router: Router, public navServices: NavService,
    private voucherTypeService: VoucherTypeServiceProxy,
    public layout: LayoutService) {
    
    let menu = localStorage.getItem("Menu");
    if (menu == '0') {
      this.navServices.itemsSettings.subscribe(menuItems => {
        this.menuItems = menuItems;
        console.log("----menuItems----", menuItems);
        this.router.events.subscribe((event) => {
          if (event instanceof NavigationEnd) {
            ;
            menuItems.filter(items => {
              if (items.path === event.url) {
                this.setNavActive(items);
              }
              if (!items.children) { return false; }
              items.children.filter(subItems => {
                if (subItems.path === event.url) {
                  this.setNavActive(subItems);
                }
                if (!subItems.children) { return false; }
                subItems.children.filter(subSubItems => {
                  if (subSubItems.path === event.url) {
                    this.setNavActive(subSubItems);
                  }
                });
              });
            });
          }
        });
      });
    }
    else if (menu == '5') {
      this.navServices.itemsAccount.subscribe(menuItems => {
        
        this.menuItems = menuItems;
        console.log("----menuItems----", menuItems);
        this.router.events.subscribe((event) => {
          if (event instanceof NavigationEnd) {
            ;
            menuItems.filter(items => {
              if (items.path === event.url) {
                this.setNavActive(items);
              }
              if (!items.children) { return false; }
              items.children.filter(subItems => {
                if (subItems.path === event.url) {
                  this.setNavActive(subItems);
                }
                if (!subItems.children) { return false; }
                subItems.children.filter(subSubItems => {
                  if (subSubItems.path === event.url) {
                    this.setNavActive(subSubItems);
                  }
                });
              });
            });
          }
        });
      });
    }


  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.width = event.target.innerWidth - 500;
  }

  sidebarToggle() {
    this.navServices.collapseSidebar = !this.navServices.collapseSidebar;
  }

  // Active Nave state
  setNavActive(item) {
   debugger
   this.getVoucherTypes();
    this.menuItems.filter(menuItem => {
      if (menuItem !== item) {
        menuItem.active = false;
      }
      if (menuItem.children && menuItem.children.includes(item)) {
        menuItem.active = true;
      }
      if (menuItem.children) {
        menuItem.children.filter(submenuItems => {
          if (submenuItems.children && submenuItems.children.includes(item)) {
            menuItem.active = true;
            submenuItems.active = true;
          }
        });
      }
    });
  }

  // Click Toggle menu
  toggletNavActive(item) {
    debugger
   this.getVoucherTypes();
    if (!item.active) {
      this.menuItems.forEach(a => {
        if (this.menuItems.includes(item)) {
          a.active = false;
        }
        if (!a.children) { return false; }
        a.children.forEach(b => {
          if (a.children.includes(item)) {
            b.active = false;
          }
        });
      });
    }
    item.active = !item.active;
  }


  // For Horizontal Menu
  scrollToLeft() {
    if (this.margin >= -this.width) {
      this.margin = 0;
      this.leftArrowNone = true;
      this.rightArrowNone = false;
    } else {
      this.margin += this.width;
      this.rightArrowNone = false;
    }
  }

  scrollToRight() {
    if (this.margin <= -3051) {
      this.margin = -3464;
      this.leftArrowNone = false;
      this.rightArrowNone = true;
    } else {
      this.margin += -this.width;
      this.leftArrowNone = false;
    }
  }

  getVoucherTypes() {
    return new Promise<void>((resolve, reject) => {
      let sub = this.voucherTypeService.allVoucherTypees(undefined, undefined, undefined, undefined, undefined).subscribe({
        next: (res) => {
          console.log(res);
          if (res.success) {
            
            const voucherTypes = res.response.items.map(element => ({
              path: '/accounting-operations/vouchers',
              title: element.voucherNameAr,
              type: 'link',
              active: true
            }));
            this.navServices.voucherTypes=voucherTypes ;


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
}
