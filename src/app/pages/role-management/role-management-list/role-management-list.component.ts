import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoleManagementService } from '../../../core/services/role-management.service';
import { ApplicationRoleDTO, PagedResult } from '../../../core/interface/role-management.interfaces';
import { ApplicationUserDTO } from '../../../core/interface/user-management.interfaces';
import { TranslateModule } from '@ngx-translate/core';
import { RoleManagementTranslator } from '../role-management-translator';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-role-management-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './role-management-list.component.html',
  styleUrl: './role-management-list.component.css'
})
export class RoleManagementListComponent implements OnInit {
  roles: ApplicationRoleDTO[] = [];
  loading = false;
  error: string | null = null;

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

  // Modal states
  showCreateRoleModal = false;
  showEditRoleModal = false;
  showDetailsRoleModal = false;
  showRelatedUsersModal = false;
  selectedRole: ApplicationRoleDTO | null = null;
  editRoleIndex: number | null = null;
  relatedUsers: ApplicationUserDTO[] = [];
  relatedUsersLoading = false;
  relatedUsersError: string | null = null;
  selectedRoleForUsers: ApplicationRoleDTO | null = null;

  // Create role state
  createRoleData = { name: '' };
  createRoleError: string | null = null;
  creatingRole = false;

  // Edit role state
  editRoleError: string | null = null;
  editingRole = false;

  constructor(
    private roleService: RoleManagementService,
    private roleTranslator: RoleManagementTranslator,
    private toast: ToastService
  ) {}

  async ngOnInit() {
    await this.roleTranslator.loadTranslations();
    this.fetchRoles();
  }

  fetchRoles() {
    this.loading = true;
    this.error = null;
    this.roleService.getAllRolesPaginated(
      this.page,
      this.pageSize,
      this.searchText,
      this.sortBy,
      this.sortDirection
    ).subscribe({
      next: (res) => {
        // Updated: match new backend response structure
        if (res && res.result) {
          const paged = res.result;
          this.roles = paged.data || [];
          this.totalCount = paged.totalCount || 0;
          this.totalPages = paged.totalPages || 1;
        } else {
          this.roles = [];
          this.totalCount = 0;
          this.totalPages = 1;
        }
        this.loading = false;
      },
      error: (err) => {
        this.toast.showError(err?.error?.result ? (Array.isArray(err.error.result) ? err.error.result.join(' ') : err.error.result) : (err?.error?.message || this.roleTranslator.instant('ROLE_MANAGEMENT.FAILED_LOAD')));
        this.error = null;
        this.loading = false;
      }
    });
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.page = 1;
    this.fetchRoles();
  }

  onPageChange(page: number) {
    this.page = page;
    this.fetchRoles();
  }

  onSearchClick() {
    this.searchText = this.searchInput.trim();
    this.page = 1;
    this.fetchRoles();
  }

  onSortToggle(column: string) {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
    this.page = 1;
    this.fetchRoles();
  }

  openCreateRoleModal() {
    this.showCreateRoleModal = true;
  }
  closeCreateRoleModal() {
    this.showCreateRoleModal = false;
    this.createRoleError = null;
    this.createRoleData = { name: '' };
  }

  openEditRoleModal(role: ApplicationRoleDTO, index: number) {
    this.selectedRole = { ...role };
    this.editRoleIndex = index;
    this.showEditRoleModal = true;
  }
  closeEditRoleModal() {
    this.showEditRoleModal = false;
    this.editRoleError = null;
    this.selectedRole = null;
    this.editRoleIndex = null;
  }

  openDetailsRoleModal(role: ApplicationRoleDTO) {
    this.selectedRole = { ...role };
    this.showDetailsRoleModal = true;
  }
  closeDetailsRoleModal() {
    this.showDetailsRoleModal = false;
    this.selectedRole = null;
  }

  openRelatedUsersModal(role: ApplicationRoleDTO) {
    this.selectedRoleForUsers = { ...role };
    this.showRelatedUsersModal = true;
    this.relatedUsers = [];
    this.relatedUsersLoading = true;
    this.relatedUsersError = null;
    this.roleService.getUsersByRole(role.id).subscribe({
      next: (res) => {
        this.relatedUsers = res?.result || [];
        this.relatedUsersLoading = false;
      },
      error: (err) => {
        this.toast.showError(err?.error?.result || err?.error?.message || this.roleTranslator.instant('ROLE_MANAGEMENT.FAILED_LOAD_USERS'));
        this.relatedUsersError = null;
        this.relatedUsersLoading = false;
      }
    });
  }
  closeRelatedUsersModal() {
    this.showRelatedUsersModal = false;
    this.selectedRoleForUsers = null;
    this.relatedUsers = [];
    this.relatedUsersError = null;
  }
  removeUserFromRole(user: ApplicationUserDTO) {
    if (!this.selectedRoleForUsers) return;
    if (!confirm(this.roleTranslator.instant('ROLE_MANAGEMENT.CONFIRM_REMOVE_USER_FROM_ROLE', { user: user.userName || user.email || user.id }))) return;
    this.relatedUsersLoading = true;
    this.roleService.removeUserFromRole(this.selectedRoleForUsers.id, user.id).subscribe({
      next: () => {
        this.toast.showSuccess(this.roleTranslator.instant('ROLE_MANAGEMENT.REMOVED_USER_SUCCESS'));
        this.openRelatedUsersModal(this.selectedRoleForUsers!); // reload users
      },
      error: (err) => {
        this.toast.showError(err?.error?.result || err?.error?.message || this.roleTranslator.instant('ROLE_MANAGEMENT.FAILED_REMOVE_USER'));
        this.relatedUsersError = null;
        this.relatedUsersLoading = false;
      }
    });
  }

  onCreateRole() {
    if (!this.createRoleData.name || this.createRoleData.name.length < 3) {
      this.createRoleError = this.roleTranslator.instant('ROLE_MANAGEMENT.ROLE_NAME_REQUIRED');
      return;
    }
    this.creatingRole = true;
    this.createRoleError = null;
    this.roleService.createRole({
      name: this.createRoleData.name
    }).subscribe({
      next: (res) => {
        this.toast.showSuccess(this.roleTranslator.instant('ROLE_MANAGEMENT.CREATED_SUCCESS'));
        this.closeCreateRoleModal();
        this.createRoleData = { name: '' };
        this.fetchRoles();
        this.creatingRole = false;
      },
      error: (err) => {
        this.toast.showError(err?.error?.result || err?.error?.message || this.roleTranslator.instant('ROLE_MANAGEMENT.FAILED_CREATE'));
        this.createRoleError = null;
        this.creatingRole = false;
      }
    });
  }

  onEditRole() {
    if (!this.selectedRole || !this.selectedRole.name || this.selectedRole.name.length < 3) {
      this.editRoleError = this.roleTranslator.instant('ROLE_MANAGEMENT.ROLE_NAME_REQUIRED');
      return;
    }
    this.editingRole = true;
    this.editRoleError = null;
    this.roleService.updateRole({
      id: this.selectedRole.id,
      name: this.selectedRole.name,
      isActive: this.selectedRole.isActive
    }).subscribe({
      next: (res) => {
        this.toast.showSuccess(this.roleTranslator.instant('ROLE_MANAGEMENT.UPDATED_SUCCESS'));
        this.closeEditRoleModal();
        this.fetchRoles();
        this.editingRole = false;
      },
      error: (err) => {
        this.toast.showError(err?.error?.result || err?.error?.message || this.roleTranslator.instant('ROLE_MANAGEMENT.FAILED_UPDATE'));
        this.editRoleError = null;
        this.editingRole = false;
      }
    });
  }

  deleteRole(role: ApplicationRoleDTO, index: number) {
    if (confirm(this.roleTranslator.instant('ROLE_MANAGEMENT.CONFIRM_DELETE'))) {
      this.loading = true;
      this.roleService.deleteRole(role.id).subscribe({
        next: () => {
          this.toast.showSuccess(this.roleTranslator.instant('ROLE_MANAGEMENT.DELETED_SUCCESS'));
          this.fetchRoles();
        },
        error: (err) => {
          this.toast.showError(err?.error?.result || err?.error?.message || this.roleTranslator.instant('ROLE_MANAGEMENT.FAILED_DELETE'));
          this.loading = false;
        }
      });
    }
  }

  getPageArray(): (number | string)[] {
    const total = this.totalPages;
    const current = this.page;
    const delta = 2;
    const pages: (number | string)[] = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
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
}
