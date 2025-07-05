import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersProfilesService } from '../../../core/services/users-profiles.service';
import { environment } from '../../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { UserManagementTranslator } from '../user-management-translator';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-review-profiles',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './review-profiles.component.html',
  styleUrls: ['./review-profiles.component.css'],
})
export class ReviewProfilesComponent implements OnInit {
  profiles: any[] = [];
  loading = true;
  error: string = '';
  selectedProfile: any = null; // For modal view
  environment = environment;
  showRejectionModal = false;
  rejectionReasonInput = '';
  actionLoading = false;
  actionError = '';
  showProfileModal = false;

  // Pagination and table state
  page = 1;
  pageSize = 10;
  pageSizes = [10, 50, 100];
  totalCount = 0;
  totalPages = 1;
  // Server-side search and sort
  searchText = '';
  searchInput = '';
  sortBy: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private usersProfilesService: UsersProfilesService,
    private roleTranslator: UserManagementTranslator,
    private toast: ToastService
  ) {}

  async ngOnInit() {
    await this.roleTranslator.loadTranslations();
    this.fetchProfiles();
  }

  fetchProfiles() {
    this.loading = true;
    this.usersProfilesService
      .getAllUserProfiles({
        page: this.page,
        pageSize: this.pageSize,
        searchText: this.searchText,
        sortBy: this.sortBy,
        sortDirection: this.sortDirection,
      })
      .subscribe({
        next: (res) => {
          this.profiles = res?.result?.data || [];
          this.totalCount = res?.result?.totalCount || 0;
          this.totalPages = res?.result?.totalPages || 1;
          this.loading = false;
          // Show success toast if needed (optional)
        },
        error: (err: any) => {
          this.toast.showError(this.roleTranslator.instant('REVIEW_PROFILES.FAILED_LOAD'));
          this.error = '';
          this.loading = false;
        },
      });
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.page = 1;
    this.fetchProfiles();
  }

  onPageChange(page: number) {
    this.page = page;
    this.fetchProfiles();
  }

  onSearchClick() {
    this.searchText = this.searchInput.trim();
    this.page = 1;
    this.fetchProfiles();
  }

  onSortToggle(column: string) {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
    this.page = 1;
    this.fetchProfiles();
  }

  getPageArray(): (number | string)[] {
    const total = this.totalPages;
    const current = this.page;
    const delta = 2;
    const pages: (number | string)[] = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      if (current <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(total);
      } else if (current >= total - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = total - 4; i <= total; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = current - 1; i <= current + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(total);
      }
    }
    return pages;
  }

  openViewModal(profile: any) {
    this.selectedProfile = profile;
    this.showProfileModal = true;
  }

  closeProfileModal() {
    this.showProfileModal = false;
  }

  acceptProfile(profile: any) {
    this.actionLoading = true;
    this.actionError = '';
    this.usersProfilesService
      .profileReviewByAdmin({
        UserId: profile.userId || profile.UserId || profile.id || profile.Id,
        IsApproved: true,
        RejectionReason: null,
      })
      .subscribe({
        next: (res) => {
          this.actionLoading = false;
          const idx = this.profiles.findIndex(
            (p) =>
              (p.userId || p.UserId || p.id || p.Id) ===
              (profile.userId || profile.UserId || profile.id || profile.Id)
          );
          if (idx > -1) {
            this.profiles.splice(idx, 1);
          }
          this.showProfileModal = false;
          this.actionError = '';
          this.toast.showSuccess(this.roleTranslator.instant('REVIEW_PROFILES.APPROVED_SUCCESS'));
        },
        error: (err: any) => {
          this.actionLoading = false;
          this.toast.showError(err?.error?.result || this.roleTranslator.instant('REVIEW_PROFILES.FAILED_APPROVE'));
        },
      });
  }

  openRejectModal() {
    this.rejectionReasonInput = '';
    this.showRejectionModal = true;
    this.actionError = '';
  }

  confirmRejectProfile() {
    if (!this.rejectionReasonInput.trim()) {
      this.actionError = this.roleTranslator.instant('REVIEW_PROFILES.REJECTION_REASON_REQUIRED');
      return;
    }
    this.actionLoading = true;
    this.actionError = '';
    this.usersProfilesService
      .profileReviewByAdmin({
        UserId:
          this.selectedProfile.userId ||
          this.selectedProfile.UserId ||
          this.selectedProfile.id ||
          this.selectedProfile.Id,
        IsApproved: false,
        RejectionReason: this.rejectionReasonInput,
      })
      .subscribe({
        next: (res) => {
          this.actionLoading = false;
          const idx = this.profiles.findIndex(
            (p) =>
              (p.userId || p.UserId || p.id || p.Id) ===
              (this.selectedProfile.userId ||
                this.selectedProfile.UserId ||
                this.selectedProfile.id ||
                this.selectedProfile.Id)
          );
          if (idx > -1) {
            this.profiles.splice(idx, 1);
          }
          this.showRejectionModal = false;
          this.actionError = '';
          this.toast.showSuccess(this.roleTranslator.instant('REVIEW_PROFILES.REJECTED_SUCCESS'));
        },
        error: (err: any) => {
          this.actionLoading = false;
          this.toast.showError(err?.error?.result || this.roleTranslator.instant('REVIEW_PROFILES.FAILED_REJECT'));
        },
      });
  }

  rejectProfile(profile: any) {
    this.showProfileModal = false;
    setTimeout(() => {
      this.openRejectModal();
    }, 300);
  }

  closeRejectionModal() {
    this.showRejectionModal = false;
    this.actionError = '';
  }
}
