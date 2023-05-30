import { NgModule } from '@angular/core';
import { SearchFormComponent } from './search-form.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations: [SearchFormComponent],
    exports: [SearchFormComponent],
    imports: [MatDialogModule, MatButtonModule, CommonModule,FormsModule]
})
export class SearchFormModule { }