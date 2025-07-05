import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FileUploadService } from '../../../core/services/file-upload.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router'; // <-- Add this import
import { jwtDecode } from 'jwt-decode';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service'; // <-- Import AuthService
import { UsersProfilesService } from '../../../core/services/users-profiles.service';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-complete-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule], // Added RouterModule for routerLink
  templateUrl: './complete-user-profile.component.html',
  styleUrl: './complete-user-profile.component.css'
})
export class CompleteUserProfileComponent implements OnInit {
  profileForm: FormGroup;
  loading = false;
  submitted = false;
  errorMsg = '';
  successMsg = '';
  personalPhotoFile: File | null = null;
  nationalIdFrontFile: File | null = null;
  nationalIdBackFile: File | null = null;
  profileStatus: string | null = null;
  statusLoading = true;
  userId: string | null = null;
  rejectionReason: string = ''; // Add property to class

  constructor(
    private fb: FormBuilder,
    private usersProfilesService: UsersProfilesService,
    private fileUploadService: FileUploadService,
    public router: Router,
    private http: HttpClient,
    private authService: AuthService,
    private toast: ToastService // Inject ToastService
  ) {
    this.profileForm = this.fb.group({
      fullName: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50)
      ]],
      primaryPhone: ['', [
        Validators.required
      ]],
      secondaryPhone1: [''],
      secondaryPhone2: [''],
      birthDate: ['', [
        Validators.required
      ]],
      graduationYear: ['', [
        Validators.required
      ]],
      address: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(100)
      ]],
      personalPhotoPath: ['', [
        Validators.required
      ]],
      nationalIdFrontPath: ['', [
        Validators.required
      ]],
      nationalIdBackPath: ['', [
        Validators.required
      ]],
      agreementAccepted: [false, [Validators.requiredTrue]]
    });
  }

  async ngOnInit() {
    // Get userId from JWT token
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      this.toast.showError('Authentication token not found. Please log in again.');
      this.statusLoading = false;
      return;
    }
    let userId: string | undefined;
    try {
      const decoded: any = jwtDecode(token);
      userId = decoded.nameid || decoded.sub || decoded.userId || decoded.id;
    } catch (e) {
      this.toast.showError('Invalid authentication token. Please log in again.');
      this.statusLoading = false;
      return;
    }
    if (!userId) {
      this.toast.showError('User ID not found in token. Please log in again.');
      this.statusLoading = false;
      return;
    }
    this.userId = userId;
    // Check profile status
    this.usersProfilesService.getUserRequestStatus(userId).subscribe({
      next: (res: any) => {
        this.profileStatus = res?.result?.status || 'Draft';
        console.log('Profile status:', this.profileStatus); // Debug log
        if (this.profileStatus && (this.profileStatus.toLowerCase() === 'rejected')) {
          // Fetch and patch form with previous data
          this.usersProfilesService.getUserProfileByUserId(userId!).subscribe({
            next: (profileRes: any) => {
              console.log('getUserProfileByUserId result:', profileRes);
              const data = profileRes?.result;
              if (data) {
                // Patch all fields, but do NOT set file fields (let user re-upload)
                this.profileForm.patchValue({
                  fullName: data.fullName || '',
                  primaryPhone: data.primaryPhone || '',
                  secondaryPhone1: data.secondaryPhone1 || '',
                  secondaryPhone2: data.secondaryPhone2 || '',
                  birthDate: data.birthDate ? data.birthDate.substring(0, 10) : '',
                  graduationYear: data.graduationYear ? String(data.graduationYear) : '',
                  address: data.address || '',
                  agreementAccepted: !!data.agreementAccepted
                });
                // Clear file fields so browser shows 'No file chosen'
                this.profileForm.patchValue({
                  personalPhotoPath: '',
                  nationalIdFrontPath: '',
                  nationalIdBackPath: ''
                });
                this.personalPhotoFile = null;
                this.nationalIdFrontFile = null;
                this.nationalIdBackFile = null;
                // Set rejection reason from profile API (not status API)
                console.log('API rejectionReason:', data.rejectionReason);
                this.rejectionReason = (data.rejectionReason && data.rejectionReason.trim()) ? data.rejectionReason : '';
              }
              this.statusLoading = false;
            },
            error: () => {
              this.statusLoading = false;
            }
          });
        } else {
          this.statusLoading = false;
        }
      },
      error: (err: any) => {
        this.toast.showError('Failed to get profile status.');
        this.statusLoading = false;
      }
    });
  }

  extractFileName(path: string): string {
    if (!path) return '';
    return path.split('\\').pop()?.split('/').pop() || path;
  }

  onFileChange(event: any, field: string) {
    const file = event.target.files && event.target.files.length ? event.target.files[0] : null;
    if (file) {
      this.profileForm.patchValue({ [field]: file.name }); // Only file name for now
      if (field === 'personalPhotoPath') this.personalPhotoFile = file;
      if (field === 'nationalIdFrontPath') this.nationalIdFrontFile = file;
      if (field === 'nationalIdBackPath') this.nationalIdBackFile = file;
    }
  }

  async getPublicIp(): Promise<string> {
    try {
      const res: any = await this.http.get('https://api.ipify.org?format=json').toPromise();
      return res.ip || '';
    } catch {
      return '';
    }
  }

  async submit() {
    this.submitted = true;
    if (this.profileForm.invalid) return;
    this.loading = true;
    // Get userId from JWT token
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      this.toast.showError('Authentication token not found. Please log in again.');
      this.loading = false;
      return;
    }
    let userId: string | undefined;
    try {
      const decoded: any = jwtDecode(token);
      userId = decoded.nameid || decoded.sub || decoded.userId || decoded.id;
    } catch (e) {
      this.toast.showError('Invalid authentication token. Please log in again.');
      this.loading = false;
      return;
    }
    if (!userId) {
      this.toast.showError('User ID not found in token. Please log in again.');
      this.loading = false;
      return;
    }
    try {
      // Get public IP
      const submitterIp = await this.getPublicIp();
      // Upload files and get their paths
      const [personalPhoto, nationalIdFront, nationalIdBack] = await Promise.all([
        this.personalPhotoFile ? this.fileUploadService.uploadFile(this.personalPhotoFile, 'profile').toPromise() : { filePath: '' },
        this.nationalIdFrontFile ? this.fileUploadService.uploadFile(this.nationalIdFrontFile, 'nationalid').toPromise() : { filePath: '' },
        this.nationalIdBackFile ? this.fileUploadService.uploadFile(this.nationalIdBackFile, 'nationalid').toPromise() : { filePath: '' }
      ]);
      const dto = {
        FullName: this.profileForm.value.fullName,
        PrimaryPhone: this.profileForm.value.primaryPhone,
        SecondaryPhone1: this.profileForm.value.secondaryPhone1,
        SecondaryPhone2: this.profileForm.value.secondaryPhone2,
        BirthDate: this.profileForm.value.birthDate,
        GraduationYear: this.profileForm.value.graduationYear,
        Address: this.profileForm.value.address,
        PersonalPhotoPath: personalPhoto?.filePath || '',
        NationalIdFrontPath: nationalIdFront?.filePath || '',
        NationalIdBackPath: nationalIdBack?.filePath || '',
        AgreementAccepted: this.profileForm.value.agreementAccepted,
        SubmitterIp: submitterIp
      };
      this.usersProfilesService.completeBasicProfile(userId, dto).subscribe({
        next: () => {
          this.toast.showSuccess('Profile submitted successfully!');
          this.loading = false;
          // Instead of navigating, refresh the profile status to update the UI
          this.statusLoading = true;
          this.usersProfilesService.getUserRequestStatus(userId!).subscribe({
            next: (res: any) => {
              this.profileStatus = res?.result?.status || 'Draft';
              this.statusLoading = false;
            },
            error: (err: any) => {
              this.toast.showError('Failed to get profile status.');
              this.statusLoading = false;
            }
          });
        },
        error: (err: any) => {
          this.toast.showError(err?.error?.result || 'Submission failed.');
          this.loading = false;
        }
      });
    } catch (err) {
      this.toast.showError('File upload failed.');
      this.loading = false;
    }
  }

  goToLogin() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  get f() { return this.profileForm.controls; }
}
