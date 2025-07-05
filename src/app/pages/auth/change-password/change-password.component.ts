import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent {
  changePasswordForm: FormGroup;
  loading = false;
  error: string | null = null;
  success: string | null = null;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private toast: ToastService) {
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordsMatchValidator });
  }

  passwordsMatchValidator(form: FormGroup) {
    return form.get('newPassword')!.value === form.get('confirmPassword')!.value ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.changePasswordForm.invalid) return;
    this.loading = true;
    const { currentPassword, newPassword, confirmPassword } = this.changePasswordForm.value;
    this.authService.changePassword({ currentPassword, newPassword, confirmPassword }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res && res.code === 200 && res.status === 'Success') {
          this.toast.showSuccess(Array.isArray(res.result) ? res.result.join(' ') : (res.result || 'Password changed successfully.'));
          this.changePasswordForm.reset();
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 1500);
        } else if (res && res.result) {
          this.toast.showError(Array.isArray(res.result) ? res.result.join(' ') : res.result);
        } else {
          this.toast.showError('Failed to change password.');
        }
      },
      error: (err) => {
        this.loading = false;
        if (err?.error?.result) {
          this.toast.showError(Array.isArray(err.error.result) ? err.error.result.join(' ') : err.error.result);
        } else if (err?.error?.message) {
          this.toast.showError(err.error.message);
        } else if (err?.status === 401) {
          this.toast.showError('Current password is incorrect.');
        } else {
          this.toast.showError(err?.error?.title || err?.error || 'Failed to change password.');
        }
      }
    });
  }
}
