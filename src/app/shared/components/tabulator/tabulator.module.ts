import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DraggableMenuItemsComponent } from './draggable-menu-items/draggable-menu-items.component';
import { TabulatorSettingComponent } from './tabulator-setting/tabulator-setting.component';
import { TabulatorComponent } from './tabulator/tabulator.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgxSpinnerModule } from 'ngx-spinner';
@NgModule({
    declarations: [TabulatorComponent, TabulatorSettingComponent, DraggableMenuItemsComponent],
    imports: [FormsModule, CommonModule,TranslateModule,NgxSpinnerModule
    ],
    exports: [TabulatorComponent]
})
export class TabulatorModule {

}