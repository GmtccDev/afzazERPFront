import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  
  public today: number = Date.now();
  lang = localStorage.getItem('language');
  companyNameAr =localStorage.getItem('companyNameAr');
  companyNameEn= localStorage.getItem('companyNameEn');
  branchNameAr =localStorage.getItem('branchNameAr');
  branchNameEn= localStorage.getItem('branchNameEn');

  constructor() { }

  ngOnInit(): void {
  }
  

}
