// src/app/pages/user-management/user-management-routing.ts
import { Routes } from '@angular/router';
import { RoleManagementListComponent } from './role-management-list/role-management-list.component';
import { SecuredRouteListComponent } from './secured-route-list/secured-route-list.component';

export const roleManagementRoutes: Routes = [
  { path: '', component: RoleManagementListComponent },
  { path: 'secured-routes', component: SecuredRouteListComponent }
];

