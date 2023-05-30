import { SearchFormComponent } from 'src/app/shared/components/search-form/search-form.component';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';


@Injectable()
export class SearchDialogService {
    selectedItem: any;
    constructor(private dialog: MatDialog) {

    }

    showDialog(columsLable: string[], columsName: string[], list: any[], title: string, searchText: string): Observable<any> {
        const dialogRef = this.dialog.open<SearchFormComponent>(SearchFormComponent, {
            disableClose: true,
            data: this.selectedItem
        });
        dialogRef.componentInstance.title = title;
        dialogRef.componentInstance.colomnLables = columsLable
        dialogRef.componentInstance.colomnNames = columsName
        dialogRef.componentInstance.searchDataList = list;
        dialogRef.componentInstance.dataList = list;
        dialogRef.componentInstance.searchText = searchText;
        return dialogRef.componentInstance.OnSelect;

    }


}
