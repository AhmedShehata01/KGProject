import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, CommonModule , ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error: string | null = null;
  showOtp = false;
  otpUserId: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [Validators.required, Validators.minLength(6), Validators.maxLength(50)],
      ],
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      this.authService.login(this.loginForm.value).subscribe({
        next: (res: any) => {
          this.loading = false;
          // Handle all ApiResponse cases
          let backendMsg = undefined;
          if (res && res.result) {
            if (typeof res.result === 'string') {
              backendMsg = res.result;
            } else if (typeof res.result === 'object' && res.result.message) {
              backendMsg = res.result.message;
            } else if (Array.isArray(res.result)) {
              backendMsg = res.result.join(', ');
            }
          }
          if (res && res.status === 'OtpRequired') {
            this.toast.showInfo(backendMsg || 'Please enter the OTP sent to your registered contact.');
            this.showOtp = true;
            this.otpUserId = this.loginForm.value.email;
            this.router.navigate(['/auth/login-otp'], { queryParams: { userId: this.otpUserId } });
          } else if (res && res.status === 'Success') {
            this.toast.showSuccess(backendMsg || 'Login successful!');
            // Navigation handled by AuthService for IsFirstLogin
          } else {
            this.toast.showError(backendMsg || 'Login failed');
          }
        },
        error: (err: any) => {
          this.loading = false;
          let backendMsg = err?.error?.result || err?.error?.message || err?.message;
          if (Array.isArray(backendMsg)) backendMsg = backendMsg.join(', ');
          this.toast.showError(backendMsg || 'Login failed');
        }
      });
    }
  }
}
