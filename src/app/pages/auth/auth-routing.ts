// src/app/pages/auth/auth-routing.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ChangePasswordFirstTimeComponent } from './change-password-first-time/change-password-first-time.component';
import { CompleteUserProfileComponent } from './complete-user-profile/complete-user-profile.component';
import { LoginOtpComponent } from './login-otp/login-otp.component';


export const authRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'login-otp', component: LoginOtpComponent },
  // { path: 'register', component: RegisterComponent },
  { path: 'forget-password', component: ForgetPasswordComponent },
  { path: 'change-password', component: ChangePasswordComponent },
  { path: 'change-password-first-time', component: ChangePasswordFirstTimeComponent },
  { path: 'complete-user-profile', component: CompleteUserProfileComponent }
];
