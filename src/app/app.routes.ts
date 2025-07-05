// src/app/app.routes.ts
import { Routes, CanActivate } from '@angular/router';
import { authRoutes } from './pages/auth/auth-routing';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { userManagementRoutes } from './pages/user-management/user-management-routing';
import { AuthGuard } from './core/guards/auth.guard';
import { UnauthorizedComponent } from './pages/unauthorized/unauthorized.component';
import { CompleteUserProfileComponent } from './pages/auth/complete-user-profile/complete-user-profile.component';
import { roleManagementRoutes } from './pages/role-management/role-management-routing';
import { SecuredRouteGuard } from './core/guards/secured-route.guard';
import { systemManagementRoutes } from './pages/system-management/system-management-routings';
import { businessManagementRoutes } from './pages/Business-management/business-management-routes';
import { dashboardRoutes } from './pages/dashboard/dashboard-routes';

export const routes: Routes = [
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: authRoutes,
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        children: dashboardRoutes,
        canActivate: [AuthGuard], // Remove SecuredRouteGuard so dashboard is public for any authenticated user
      },
      {
        path: 'users',
        children: userManagementRoutes.map((r) => ({
          ...r,
          canActivate: [AuthGuard, SecuredRouteGuard],
        })),
        canActivate: [AuthGuard],
      },
      {
        path: 'business-management',
        children: businessManagementRoutes.map((r) => ({
          ...r,
          canActivate: [AuthGuard, SecuredRouteGuard],
        })),
        canActivate: [AuthGuard],
      },
      {
        path: 'system-management',
        children: systemManagementRoutes.map((r) => ({
          ...r,
          canActivate: [AuthGuard, SecuredRouteGuard],
        })),
        canActivate: [AuthGuard],
      },
      {
        path: 'roles',
        children: roleManagementRoutes.map((r) => ({
          ...r,
          canActivate: [AuthGuard, SecuredRouteGuard],
        })),
        canActivate: [AuthGuard],
      },
    ],
  },
  {
    path: 'unauthorized',
    component: UnauthorizedComponent,
  },
  {
    path: 'complete-user-profile',
    component: CompleteUserProfileComponent,
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  { path: '**', redirectTo: 'dashboard' },
];
