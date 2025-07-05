// src/app/pages/user-management/user-management-routing.ts
import { Routes } from '@angular/router';
import { UsersListComponent } from './users-list/users-list.component';
import { ReviewProfilesComponent } from './review-profiles/review-profiles.component';

export const userManagementRoutes: Routes = [
  { path: '', component: UsersListComponent },
  { path: 'review-profiles', component: ReviewProfilesComponent}
];

