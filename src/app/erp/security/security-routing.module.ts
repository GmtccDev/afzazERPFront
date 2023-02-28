import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RolesComponent } from './roles/roles.component';
import { AddEditRoleComponent } from './roles/add-edit-role/add-edit-role.component';
import { UsersListComponent } from './users/users-list/users-list.component';
import { AddEditUserComponent } from './users/add-edit-user/add-edit-user.component';
const routes: Routes = [
	{
		path: '',
		children: [
		
			{ path: 'role', component: RolesComponent },
			{ path: 'role/add-role', component: AddEditRoleComponent },
			{ path: 'role/update-role/:id', component: AddEditRoleComponent },
			{ path: 'user', component:UsersListComponent },
			{ path: 'user/add-user', component: AddEditUserComponent },
			{ path: 'user/update-user/:id', component: AddEditUserComponent }
		]

	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class SecurityRoutingModule { }
