import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BillDynamicDeterminantComponent } from '../bill-dynamic-determinant/bill-dynamic-determinant.component';

@Component({
  selector: 'app-right-click-modal',
  templateUrl: './right-click-modal.component.html',
  styleUrls: ['./right-click-modal.component.scss']
})
export class RightClickModalComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<RightClickModalComponent>, @Inject(MAT_DIALOG_DATA) public data: any, public dialog: MatDialog,) { }

  ngOnInit(): void {

  }
  handleButtonClick() {
    this.dialog.open(BillDynamicDeterminantComponent,
      {
        width: '1000px',
        data: this.data,
        disableClose: true
      })
      .afterClosed().subscribe(result => {
        if (result && result != null && result.length > 0) {
debugger
          this.dialogRef.close(result);
         
        }
      });

  }
}
