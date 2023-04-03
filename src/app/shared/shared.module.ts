import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DragulaModule } from 'ng2-dragula';
import { TranslateModule } from '@ngx-translate/core';
// Components
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { CustomizerComponent } from './components/customizer/customizer.component';
import { FeatherIconsComponent } from './components/feather-icons/feather-icons.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { ContentComponent } from './components/layout/content/content.component';
import { DashboardComponent } from './components/layout/dashboard/dashboard.component';
import { FullComponent } from './components/layout/full/full.component';
import { LoaderComponent } from './components/loader/loader.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TapToTopComponent } from './components/tap-to-top/tap-to-top.component';
import { ToolbarComponent } from '../shared/components/toolbar/toolbar.component'
// Header Elements Components
import { SearchComponent } from './components/header/elements/search/search.component';
import { MegaMenuComponent } from './components/header/elements/mega-menu/mega-menu.component';
import { LanguagesComponent } from './components/header/elements/languages/languages.component';
import { NotificationComponent } from './components/header/elements/notification/notification.component';
import { BookmarkComponent } from './components/header/elements/bookmark/bookmark.component';
import { CartComponent } from './components/header/elements/cart/cart.component';
import { MessageBoxComponent } from './components/header/elements/message-box/message-box.component';
import { MyAccountComponent } from './components/header/elements/my-account/my-account.component';

import { DisableKeyPressDirective } from './directives/disable-key-press.directive';
import { OnlyAlphabetsDirective } from './directives/only-alphabets.directive';
import { OnlyNumbersDirective } from './directives/only-numbers.directive';
import { ShowOptionsDirective } from './directives/show-options.directive';
// Services
import { ChatService } from './services/chat.service';
import { LayoutService } from './services/layout.service';
import { NavService } from './services/nav.service';
import { TableService } from './services/table.service';
import { NgbdSortableHeader } from './directives/NgbdSortableHeader';
import { DecimalPipe } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ResortHttpInterceptor } from './interceptors/http.interceptor';
import { throwIfAlreadyLoaded } from '../shared/gaurds/module-import'
import { ModalComponent } from './modal/modal.component';
import { TabulatorModule } from '../shared/components/tabulator/tabulator.module'
import { MessageModalComponent } from './components/message-modal/message-modal.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgSelectModule } from '@ng-select/ng-select';
import { InputComponent } from './components/froms/input/input.component';
import { SwitchButtonComponent } from './components/froms/switch-button/switch-button.component';
import { ChangePasswordComponent } from '../erp/authentication/change-password/change-password.component';
import { SubscriptionComponent } from './components/layout/subscription/subscription.component';
import { FilterPipe } from "../shared/pipes/filter-pipe";
import { PublicSearchModalComponent } from './components/public-search-modal/public-search-modal.component';
import { PublicService } from './services/public.service';
@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    ContentComponent,
    DashboardComponent,
    SubscriptionComponent,
    BreadcrumbComponent,
    CustomizerComponent,
    FeatherIconsComponent,
    FullComponent,
    ShowOptionsDirective,
    DisableKeyPressDirective,
    OnlyAlphabetsDirective,
    OnlyNumbersDirective,
    LoaderComponent,
    TapToTopComponent,
    SearchComponent,
    MegaMenuComponent,
    LanguagesComponent,
    NotificationComponent,
    BookmarkComponent,
    CartComponent,
    MessageBoxComponent,
    MyAccountComponent,
    NgbdSortableHeader,
    ToolbarComponent,
    ModalComponent,
    MessageModalComponent,
    InputComponent,
    SwitchButtonComponent,
    ChangePasswordComponent,
    FilterPipe,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    TabulatorModule,
    DragulaModule.forRoot(),
    TranslateModule,
    NgxSpinnerModule,
  ],
  providers: [
    NavService,
    ChatService,
    LayoutService,
    TableService,
    DecimalPipe, {
      provide: HTTP_INTERCEPTORS,
      useClass: ResortHttpInterceptor,
      multi: true
    },
    PublicService 
  ],
  exports: [
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    LoaderComponent,
    BreadcrumbComponent,
    FooterComponent,
    FeatherIconsComponent,
    ModalComponent,
    ChangePasswordComponent,
    TapToTopComponent,
    DisableKeyPressDirective,
    OnlyAlphabetsDirective,
    OnlyNumbersDirective,
    NgbdSortableHeader, TabulatorModule, NgSelectModule,
    InputComponent,
    SwitchButtonComponent,
    FilterPipe,
    
  ],
})
export class SharedModule {
  // constructor(@Optional() @SkipSelf() parentModule: SharedModule) {
  //   throwIfAlreadyLoaded(parentModule, 'SharedModule')
  // }
}
