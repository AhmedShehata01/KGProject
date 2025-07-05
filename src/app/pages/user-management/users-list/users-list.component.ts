import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { RoleManagementService } from '../../../core/services/role-management.service';
import { UserManagementTranslator } from '../user-management-translator';
import { LanguageService } from '../../../shared/services/language.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ClaimDTO } from '../../../core/interface/user-management.interfaces';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css']
})
export class UsersListComponent implements OnInit {
  users: any[] = [];
  pagedUsers: any[] = [];
  loading = false;
  error = '';
  selectedUser: any = {};
  pageSize = 10;
  currentPage = 1;
  totalPages = 1;
  totalCount = 0;
  editUserRoles: string[] = [];
  editUserClaims: string[] = [];
  editUserRolesLoading = false;
  editUserClaimsLoading = false;
  allRoles: string[] = [];
  allClaims: ClaimDTO[] = [];
  selectedUserRoles: string[] = [];
  selectedUserClaims: ClaimDTO[] = [];
  @ViewChild('editUserModal') editUserModal!: ElementRef;
  @ViewChild('createUserNgForm') createUserNgForm!: NgForm;
  createUserForm: any = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    roles: [],
    redirectUrlAfterResetPassword: ''
  };
  createUserLoading = false;
  createUserError: string | string[] = '';
  createUserSuccess = '';
  createUserAllRoles: string[] = [];
  createUserFormTouched = false;
  searchInput: string = '';
  pageSizes = [10, 50, 100];
  sortBy: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    public userService: UserService,
    private roleService: RoleManagementService,
    private userManagementTranslator: UserManagementTranslator,
    private languageService: LanguageService,
    private translate: TranslateService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.userManagementTranslator.loadTranslations();
    this.languageService.translate.onLangChange.subscribe(() => {
      this.userManagementTranslator.loadTranslations();
    });
    this.fetchUsers();
    // Fetch all roles for create/edit user modals from UserService
    this.userService.getAllRoles().subscribe({
      next: (roles) => {
        this.createUserAllRoles = roles || [];
        this.allRoles = this.createUserAllRoles;
      },
      error: () => {
        this.createUserAllRoles = [];
        this.allRoles = [];
      }
    });
  }

  fetchUsers() {
    this.loading = true;
    this.userService.getAllUsersPaginated({
      page: this.currentPage,
      pageSize: this.pageSize,
      searchText: this.searchInput?.trim() || '',
      sortBy: this.sortBy,
      sortDirection: this.sortDirection
    }).subscribe({
      next: (result) => {
        this.users = result.data || [];
        this.totalCount = result.totalCount || 0;
        this.totalPages = result.totalPages || 1;
        this.currentPage = result.page || 1;
        this.pagedUsers = this.users;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load users:', err);
        this.toast.showError(this.userManagementTranslator.instant('USER_LIST.FAILED_LOAD'));
        this.error = '';
        this.loading = false;
      }
    });
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.fetchUsers();
  }

  // Update page size
  onPageSizeChange(size?: number) {
    this.pageSize = size || this.pageSize;
    this.currentPage = 1;
    this.fetchUsers();
  }

  // Generate page array for pagination (with ellipsis if needed)
  getPageArray(): (number | string)[] {
    const total = this.totalPages;
    const current = this.currentPage;
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

  openEditUser(user: any) {
    this.selectedUser = { ...user };
    this.editUserRolesLoading = true;
    this.editUserClaimsLoading = true;
    this.selectedUserRoles = [];
    this.selectedUserClaims = [];
    // Use allRoles already fetched from RoleManagementService
    // Fetch user's roles after allRoles loaded
    this.userService.getUserRoles(user.id).subscribe({
      next: (userRoles) => {
        this.selectedUserRoles = userRoles || [];
        this.editUserRolesLoading = false;
      },
      error: () => {
        this.selectedUserRoles = [];
        this.editUserRolesLoading = false;
      }
    });
    // Fetch all claims from backend
    this.userService.getAllClaims().subscribe({
      next: (claims) => {
        this.allClaims = claims || [];
        // Fetch user's claims after allClaims loaded
        this.userService.getUserClaims(user.id).subscribe({
          next: (userClaims) => {
            this.selectedUserClaims = userClaims || [];
            this.editUserClaimsLoading = false;
          },
          error: () => {
            this.selectedUserClaims = [];
            this.editUserClaimsLoading = false;
          }
        });
      },
      error: () => {
        this.allClaims = [];
        this.editUserClaimsLoading = false;
      }
    });
    // Show Bootstrap modal
    const modal = new (window as any).bootstrap.Modal(this.editUserModal.nativeElement);
    modal.show();
  }

  onRoleCheckboxChange(role: string, event: any) {
    if (event.target.checked) {
      if (!this.selectedUserRoles.includes(role)) {
        this.selectedUserRoles.push(role);
      }
    } else {
      this.selectedUserRoles = this.selectedUserRoles.filter(r => r !== role);
    }
  }

  onClaimCheckboxChange(claim: ClaimDTO, event: any) {
    if (event.target.checked) {
      if (!this.selectedUserClaims.some(c => c.type === claim.type)) {
        this.selectedUserClaims.push(claim);
      }
    } else {
      this.selectedUserClaims = this.selectedUserClaims.filter(c => c.type !== claim.type);
    }
  }

  isClaimSelected(claim: ClaimDTO): boolean {
    return this.selectedUserClaims.some(c => c.type === claim.type);
  }

  saveUser() {
    // Save user name, email, phoneNumber, isAgree (all required by UpdateApplicationUserDTO)
    const payload = {
      id: this.selectedUser.id,
      userName: this.selectedUser.userName,
      phoneNumber: this.selectedUser.phoneNumber || '',
      isAgree: this.selectedUser.isAgree ?? false
    };
    this.userService.updateUser(this.selectedUser.id, payload).subscribe({
      next: () => {
        // Save roles
        this.userService.updateUserRoles(this.selectedUser.id, this.selectedUserRoles).subscribe({
          next: () => {
            // Save claims (send array of claim types)
            const claimTypes = this.selectedUserClaims.map(c => c.type);
            this.userService.updateUserClaims(this.selectedUser.id, claimTypes).subscribe({
              next: () => {
                (window as any).bootstrap.Modal.getOrCreateInstance(this.editUserModal.nativeElement).hide();
                this.toast.showSuccess(this.userManagementTranslator.instant('USER_LIST.UPDATED_SUCCESS'));
                this.fetchUsers();
              },
              error: () => {
                this.toast.showError(this.userManagementTranslator.instant('USER_LIST.FAILED_UPDATE_CLAIMS'));
                this.fetchUsers();
              }
            });
          },
          error: () => {
            this.toast.showError(this.userManagementTranslator.instant('USER_LIST.FAILED_UPDATE_ROLES'));
            this.fetchUsers();
          }
        });
      },
      error: () => {
        this.toast.showError(this.userManagementTranslator.instant('USER_LIST.FAILED_UPDATE'));
        this.fetchUsers();
      }
    });
  }

  deleteUser(user: any) {
    if (confirm(this.userManagementTranslator.instant('USER_LIST.CONFIRM_DELETE'))) {
      this.loading = true;
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.toast.showSuccess(this.userManagementTranslator.instant('USER_LIST.DELETED_SUCCESS'));
          this.fetchUsers();
          this.loading = false;
        },
        error: (err) => {
          this.toast.showError(this.userManagementTranslator.instant('USER_LIST.FAILED_DELETE'));
          this.loading = false;
        }
      });
    }
  }

  openCreateUserModal() {
    this.createUserForm = {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      roles: [],
      redirectUrlAfterResetPassword: window.location.origin + '/reset-temporary-password'
    };
    this.createUserError = '';
    this.createUserSuccess = '';
    this.createUserLoading = false;
  }

  onCreateUserRoleChange(role: string, event: any) {
    if (event.target.checked) {
      if (!this.createUserForm.roles.includes(role)) {
        this.createUserForm.roles.push(role);
      }
    } else {
      this.createUserForm.roles = this.createUserForm.roles.filter((r: string) => r !== role);
    }
  }

  submitCreateUser() {
    this.createUserFormTouched = true;
    if (!this.createUserForm.firstName || this.createUserForm.firstName.length < 2 || this.createUserForm.firstName.length > 50 ||
        !this.createUserForm.lastName || this.createUserForm.lastName.length < 2 || this.createUserForm.lastName.length > 50 ||
        !this.createUserForm.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(this.createUserForm.email) ||
        (this.createUserForm.phoneNumber && !/^\+?[0-9]{7,15}$/.test(this.createUserForm.phoneNumber)) ||
        !this.createUserForm.roles || !this.createUserForm.roles.length ||
        !this.createUserForm.redirectUrlAfterResetPassword) {
      this.toast.showError(this.userManagementTranslator.instant('USER_LIST.CREATE_USER_VALIDATION'));
      this.createUserLoading = false;
      return;
    }
    this.createUserLoading = true;
    this.createUserError = '';
    this.createUserSuccess = '';
    this.userService.createUserByAdmin(this.createUserForm).subscribe({
      next: (res) => {
        const message = res?.Message || res?.message || (typeof res === 'string' ? res : null);
        if (message) {
          this.toast.showSuccess(message);
        } else {
          this.toast.showSuccess(this.userManagementTranslator.instant('USER_LIST.CREATED_SUCCESS'));
        }
        this.createUserForm = {
          firstName: '',
          lastName: '',
          email: '',
          phoneNumber: '',
          roles: [],
          redirectUrlAfterResetPassword: window.location.origin + '/reset-temporary-password'
        };
        this.createUserFormTouched = false;
        setTimeout(() => {
          if (this.createUserNgForm) {
            this.createUserNgForm.resetForm({
              firstName: '',
              lastName: '',
              email: '',
              phoneNumber: '',
              roles: [],
              redirectUrlAfterResetPassword: window.location.origin + '/reset-temporary-password'
            });
          }
        });
        this.createUserLoading = false;
        setTimeout(() => {
          (window as any).bootstrap.Modal.getOrCreateInstance(document.getElementById('createUserModal')).hide();
          this.fetchUsers();
        }, 1200);
      },
      error: (err) => {
        let errorMsg = '';
        if (err?.error?.result) {
          if (Array.isArray(err.error.result)) {
            errorMsg = err.error.result.join(', ');
          } else if (typeof err.error.result === 'string') {
            errorMsg = err.error.result;
          } else if (err.error.result.Message || err.error.result.message) {
            errorMsg = err.error.result.Message || err.error.result.message;
          } else {
            errorMsg = this.userManagementTranslator.instant('USER_LIST.FAILED_CREATE');
          }
        } else if (err?.error?.Message || err?.error?.message) {
          errorMsg = err.error.Message || err.error.message;
        } else {
          errorMsg = this.userManagementTranslator.instant('USER_LIST.FAILED_CREATE');
        }
        if (!errorMsg || !errorMsg.trim()) {
          errorMsg = this.userManagementTranslator.instant('USER_LIST.FAILED_CREATE');
        }
        this.toast.showError(errorMsg);
        this.createUserLoading = false;
      }
    });
  }

  onSearchClick() {
    this.currentPage = 1;
    this.fetchUsers();
  }

  onSortToggle(column: string) {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
    this.currentPage = 1;
    this.fetchUsers();
  }

  get createUserErrorList(): string[] {
    if (Array.isArray(this.createUserError)) return this.createUserError;
    if (typeof this.createUserError === 'string' && this.createUserError) return [this.createUserError];
    return [];
  }
}
