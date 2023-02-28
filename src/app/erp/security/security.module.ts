import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from "../../shared/shared.module";
import { SecurityRoutingModule } from './security-routing.module';
import { RolesComponent } from './roles/roles.component';
import { AddEditRoleComponent } from './roles/add-edit-role/add-edit-role.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { RoleServiceProxy } from './services/role.servies';
import { UsersListComponent } from './users/users-list/users-list.component';
import { AddEditUserComponent } from './users/add-edit-user/add-edit-user.component';
import { UserServiceProxy } from './services/user-service';
import { CustomerServiceProxy } from './services/customer-service';
import { PermissionListComponent } from './permission-list/permission-list.component';
import { PermissionServiceProxy } from './services/permission.servies';
import { DateConverterService } from 'src/app/shared/services/date-services/date-converter.service';


@NgModule({
	declarations: [ RolesComponent, AddEditRoleComponent, UsersListComponent, AddEditUserComponent, PermissionListComponent],
	imports: [
		CommonModule,
		NgxSpinnerModule,
		SharedModule,
		SecurityRoutingModule
	],
	providers:[RoleServiceProxy,UserServiceProxy,CustomerServiceProxy,PermissionServiceProxy,DatePipe,DateConverterService]
})
export class SecurityModule { }
