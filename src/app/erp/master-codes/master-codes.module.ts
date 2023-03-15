import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MasterCodesRoutingModule } from './master-codes-routing.module';
import { CountriesComponent } from './countries/countries.component'
import { AddCountryComponent } from './countries/add-country/add-country.component'
import { SharedModule } from 'src/app/shared/shared.module';
import { CountryServiceProxy } from './services/country.servies';
import { NgxSpinnerModule } from 'ngx-spinner';
import { AddBusinessComponent } from './business/add-business/add-business.component';
import { BusinessComponent } from './business/business.component';
import { AddCurrencyComponent } from './currencies/add-currency/add-currency.component';
import { CurrenciesComponent } from './currencies/currencies/currencies.component';
import { AddEditCurrencyTransactionsComponent } from './currencies/add-edit-currency-transactions/add-edit-currency-transactions.component';
import { CompaniesComponent } from './companies/companies.component';
import { AddCompanyComponent } from './companies/add-company/add-company.component';
@NgModule({
  declarations: [ CountriesComponent, AddCountryComponent, AddBusinessComponent, BusinessComponent, AddCurrencyComponent, CurrenciesComponent, AddEditCurrencyTransactionsComponent, CompaniesComponent, AddCompanyComponent],
  imports: [
    CommonModule,
    MasterCodesRoutingModule, SharedModule, NgxSpinnerModule,
  ],
  providers: [CountryServiceProxy]
})
export class MasterCodesModule { }
