import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContentComponent } from "./shared/components/layout/content/content.component";
import { DashboardComponent } from "./shared/components/layout/dashboard/dashboard.component";
import { AuthenticationComponent } from './erp/authentication/authentication.component';
import { AuthenticationGuard } from './shared/gaurds/authentication.guard';
import { SubscriptionComponent } from './shared/components/layout/subscription/subscription.component';

const routes: Routes = [
	{
		path: '',
		component: AuthenticationComponent,
		children: [
			{ path: '', redirectTo: '/authentication/login', pathMatch: 'full' },
			{
				path: 'authentication',
				loadChildren: () => import('././erp/authentication/authentication-routing.module').then(m => m.AuthenticationRoutingModule)
			}
		]
	},
	{
		path: 'security',
		component: ContentComponent,

		children: [

			{
				path: '',
				loadChildren: () => import('./erp/security/security-routing.module').then(m => m.SecurityRoutingModule)
			}
		]
	}
	,
	{
		path: 'master-codes',
		component: ContentComponent,
		canActivate: [AuthenticationGuard],
		children: [

			{
				path: '',
				loadChildren: () => import('././erp/master-codes/master-codes.module').then(m => m.MasterCodesModule)
			}
		]

	},
	{
		//{ path: 'accounting-configurations', component: AccountingConfigurationsComponent },
		path: 'configurations',
		component: ContentComponent,
		canActivate: [AuthenticationGuard],
		children: [

			{
				path: '',
				loadChildren: () => import('././erp/Accounting/configurations/configurations.module').then(m => m.ConfigurationsModule)
			}
		]

	},{
		path: 'accounting-master-codes',
		component: ContentComponent,
		canActivate: [AuthenticationGuard],
		children: [

			{
				path: '',
				loadChildren: () => import('./erp/Accounting/master-codes/master-codes.module').then(m => m.MasterCodesModule)
			}
		]

	},
	//ConfigurationsModule
	{
		path: 'dashboard',
		component: DashboardComponent,
		//canActivate: [AdminGuard],
		children: [
			{
				path: '',
				loadChildren: () => import('./././erp/dashboard/dashboard.module').then(m => m.DashboardModule)
			}]
	},
	{
		path: 'Subscription',
		component: SubscriptionComponent,
		canActivate: [AuthenticationGuard],
		children: [
			{
				path: '',
				loadChildren: () => import('./././erp/dashboard/dashboard.module').then(m => m.DashboardModule)
			}]
	},
	{
		path: 'accounting-operations',
		component: ContentComponent,
		canActivate: [AuthenticationGuard],
		children: [
			{
				path: '',
				loadChildren: () => import('./erp/Accounting/operations/operations.module').then(m => m.OperationsModule)
			}]
	}
	,
	{
		path: 'accounting-reports',
		component: ContentComponent,
		canActivate: [AuthenticationGuard],
		children: [
			{
				path: '',
				loadChildren: () => import('./erp/Accounting/reports/reports.module').then(m => m.ReportsModule)
			}]
	}
	,

	{
		path: '**',
		redirectTo: ''
	}
];

@NgModule({
	imports: [[RouterModule.forRoot(routes, {
		anchorScrolling: 'enabled',
		scrollPositionRestoration: 'enabled',
		relativeLinkResolution: 'legacy'
	})],
	],
	exports: [RouterModule]
})
export class AppRoutingModule { }
