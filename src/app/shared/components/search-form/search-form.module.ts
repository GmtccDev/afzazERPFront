import { NgModule } from '@angular/core';
import { SearchFormComponent } from './search-form.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    declarations: [SearchFormComponent],
    exports: [SearchFormComponent],
    imports: [MatDialogModule, MatButtonModule, CommonModule,FormsModule,TranslateModule ]
})
export class SearchFormModule { }