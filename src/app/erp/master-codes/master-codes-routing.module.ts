import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CountriesComponent } from './countries/countries.component';
import { BusinessComponent } from './business/business.component'
import { AddCountryComponent } from './countries/add-country/add-country.component';
import { AddBusinessComponent } from './business/add-business/add-business.component'
import { AddCurrencyComponent } from './currencies/add-currency/add-currency.component';
import { CurrenciesComponent } from './currencies/currencies/currencies.component';
const routes: Routes = [
	{
		path: '',
		children: [
			{ path: 'countries', component: CountriesComponent },
			{ path: 'countries/add-country', component: AddCountryComponent },
			{ path: 'countries/update-country/:id', component: AddCountryComponent },
			{ path: 'business', component: BusinessComponent },
			{ path: 'business/add-business', component: AddBusinessComponent },
			{ path: 'business/update-business/:id', component: AddBusinessComponent },
			{ path: 'currencies/add-currency', component: AddCurrencyComponent },
			{ path: 'currencies/update-currency/:id', component: AddCurrencyComponent },
			{ path: 'currencies', component: CurrenciesComponent },


		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class MasterCodesRoutingModule { }
