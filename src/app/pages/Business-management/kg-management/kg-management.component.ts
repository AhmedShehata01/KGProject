import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KGBranchService } from '../../../core/services/kg-branch.service';
import { KGBranchDTO } from '../../../core/interface/kg-branch.interfaces';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { BusinessManagementTranslator } from '../business-management-translator'; // ✅ import الترجمة
import { CustomDatePipe } from '../../../shared/pipes/custom-date.pipe';
import { ToastService } from 'src/app/shared/services/toast.service';


@Component({
  selector: 'app-kg-management',
  standalone: true,
  imports: [CommonModule, FormsModule , TranslateModule, CustomDatePipe],
  templateUrl: './kg-management.component.html',
  styleUrl: './kg-management.component.css'
})
export class KgManagementComponent implements OnInit {
  kgBranches: KGBranchDTO[] = [];
  loading = false;
  error: string | null = null;

  showCreateKgModal = false;
  showEditKgModal = false;
  showDetailsKgModal = false;
  showDeleteModal = false;
  showHistoryModal = false;

  createKgData = {
    kg: {
      nameAr: '',
      nameEn: '',
      address: ''
    },
    branches: [] as any[]
  };

  editKgData: any = null;
  editKgIndex: number | null = null;
  editUserComment: string = '';

  detailsKgData: any = null;

  deleteKgId: number | null = null;
  deleteUserComment: string = '';

  // Pagination and table state
  page = 1;
  pageSize = 10;
  pageSizes = [10, 50, 100];
  totalCount = 0;
  totalPages = 1;
  validationErrors: string[] = [];

  // Server-side search and sort
  searchText = '';
  searchInput = '';
  sortBy: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  historyLoading = false;
  kgHistory: any[] = [];
  historyMessage: string | null = null;

  constructor(private kgBranchService: KGBranchService,
    private kgTranslator : BusinessManagementTranslator, // ✅ Inject الترجمة
    private toast: ToastService // ✅ Inject ToastService
    ) {}

  async ngOnInit() {
    await this.kgTranslator.loadTranslations();
    this.fetchKgBranches();
  }

  fetchKgBranches() {
    this.loading = true;
    this.error = null;
    this.kgBranchService.getAllPaginated(
      this.page,
      this.pageSize,
      this.searchText,
      this.sortBy,
      this.sortDirection
    ).subscribe({
      next: (res) => {
        if (res && res.code === 200 && res.status === 'Success') {
          // Map KindergartenDTO[] to KGBranchDTO[]
          this.kgBranches = (res.result.data || []).map((k: any) => ({ kg: k, branches: k.branches || [] }));
          this.totalCount = res.result.totalCount;
          this.totalPages = res.result.totalPages;
        } else {
          this.toast.showError(typeof res.result === 'string' ? res.result : this.kgTranslator.instant('KG_MANAGEMENT.FAILED_LOAD'));
        }
        this.loading = false;
      },
      error: (err) => {
        this.toast.showError(err?.error?.result ? (Array.isArray(err.error.result) ? err.error.result.join(' ') : err.error.result) : (err?.error?.message || this.kgTranslator.instant('KG_MANAGEMENT.FAILED_LOAD')));
        this.loading = false;
      }
    });
  }

  openCreateKgModal() {
    this.showCreateKgModal = true;
  }

  closeCreateKgModal() {
    this.showCreateKgModal = false;
    // Reset the create model when closing the modal
    this.createKgData = {
      kg: {
        nameAr: '',
        nameEn: '',
        address: ''
      },
      branches: []
    };
  }

  addBranch() {
    this.createKgData.branches.push({
      nameAr: '',
      nameEn: '',
      address: '',
      phone: '',
      email: '',
      kindergartenId: null
    });
  }

  removeBranch(index: number) {
    this.createKgData.branches.splice(index, 1);
  }

  // Helper to check if all branch fields are valid according to the DTO validation
  allBranchesValid(): boolean {
    if (!this.createKgData.branches.length) return false;
    return this.createKgData.branches.every(branch =>
      branch.nameAr && branch.nameAr.length >= 3 && branch.nameAr.length <= 50 &&
      branch.nameEn && branch.nameEn.length >= 3 && branch.nameEn.length <= 50 &&
      branch.address && branch.address.length >= 10 && branch.address.length <= 100 &&
      branch.phone && branch.phone.length >= 1 &&
      branch.email && branch.email.length >= 1 && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(branch.email)
    );
  }

  // Placeholder for create action
  onCreateKg() {
    // Prepare DTO to match backend expectations (id: 0, branches at root)
    const kg = {
      id: 0,
      nameAr: this.createKgData.kg.nameAr,
      nameEn: this.createKgData.kg.nameEn,
      address: this.createKgData.kg.address,
      branches: this.createKgData.branches.map(b => ({
        id: 0,
        nameAr: b.nameAr,
        nameEn: b.nameEn,
        address: b.address,
        phone: b.phone,
        email: b.email,
        kindergartenId: 0
      }))
    };
    // console.log('Create KG DTO:', kg);
    this.kgBranchService.create(kg).subscribe({
      next: (res) => {
        if (res && (res.code === 200 || res.code === 201) && (res.status === 'Success' || res.status === 'Created')) {
          this.toast.showSuccess(this.kgTranslator.instant('KG_MANAGEMENT.CREATED_SUCCESS'));
          this.fetchKgBranches();
          this.closeCreateKgModal();
        } else {
          this.toast.showError(typeof res?.result === 'string' ? res.result : this.kgTranslator.instant('KG_MANAGEMENT.FAILED_CREATE'));
        }
      },
      error: (err) => {
        this.toast.showError(err?.error?.result || err?.error?.message || this.kgTranslator.instant('KG_MANAGEMENT.FAILED_CREATE'));
      }
    });
  }

  openEditKgModal(kgBranch: KGBranchDTO, index: number) {
    this.editKgData = {
      kg: { ...kgBranch.kg },
      branches: kgBranch.branches.map(b => ({ ...b }))
    };
    this.editKgIndex = index;
    this.editUserComment = '';
    this.showEditKgModal = true;
  }

  closeEditKgModal() {
    this.showEditKgModal = false;
    this.editKgData = null;
    this.editKgIndex = null;
    this.editUserComment = '';
  }

  allEditBranchesValid(): boolean {
    if (!this.editKgData?.branches?.length) return false;
    return (this.editKgData.branches as any[]).every((branch: any) =>
      branch.nameAr && branch.nameAr.length >= 3 && branch.nameAr.length <= 50 &&
      branch.nameEn && branch.nameEn.length >= 3 && branch.nameEn.length <= 50 &&
      branch.address && branch.address.length >= 10 && branch.address.length <= 100 &&
      branch.phone && branch.phone.length >= 1 &&
      branch.email && branch.email.length >= 1 && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(branch.email)
    );
  }

  addEditBranch() {
    this.editKgData.branches.push({
      nameAr: '',
      nameEn: '',
      address: '',
      phone: '',
      email: '',
      kindergartenId: this.editKgData.kg.id
    });
  }

  removeEditBranch(index: number) {
    if (this.editKgData.branches.length > 1) {
      this.editKgData.branches.splice(index, 1);
    }
  }

  onEditKg() {
    const kg = { ...this.editKgData.kg };
    kg.branches = (this.editKgData.branches as any[]).map((b: any) => ({
      ...b,
      kindergartenId: kg.id,
      id: b.id ?? 0 // 0 for new branches
    }));
    this.kgBranchService.update(kg, this.editUserComment).subscribe({
      next: (res) => {
        if (res && res.code === 200 && res.status === 'Success') {
          this.toast.showSuccess(this.kgTranslator.instant('KG_MANAGEMENT.UPDATED_SUCCESS'));
          this.fetchKgBranches();
          this.closeEditKgModal();
        } else {
          this.toast.showError(typeof res?.result === 'string' ? res.result : this.kgTranslator.instant('KG_MANAGEMENT.FAILED_UPDATE'));
        }
      },
      error: (err) => {
        this.toast.showError(err?.error?.result || err?.error?.message || this.kgTranslator.instant('KG_MANAGEMENT.FAILED_UPDATE'));
      }
    });
  }

  deleteKgBranch(kgId: number) {
    this.deleteKgId = kgId;
    this.deleteUserComment = '';
    this.showDeleteModal = true;
  }

  confirmDeleteKgBranch() {
    if (this.deleteKgId == null) return;
    this.kgBranchService.softDelete(this.deleteKgId, this.deleteUserComment).subscribe({
      next: (res) => {
        if (res && res.code === 200 && res.status === 'Success') {
          this.toast.showSuccess(this.kgTranslator.instant('KG_MANAGEMENT.DELETED_SUCCESS'));
          this.fetchKgBranches();
          this.cancelDeleteKgBranch();
        } else {
          this.toast.showError(typeof res?.result === 'string' ? res.result : this.kgTranslator.instant('KG_MANAGEMENT.FAILED_DELETE'));
        }
      },
      error: (err) => {
        this.toast.showError(err?.error?.result || err?.error?.message || this.kgTranslator.instant('KG_MANAGEMENT.FAILED_DELETE'));
      }
    });
  }

  cancelDeleteKgBranch() {
    this.showDeleteModal = false;
    this.deleteKgId = null;
    this.deleteUserComment = '';
  }

  openDetailsKgModal(kgBranch: KGBranchDTO) {
    this.detailsKgData = {
      kg: { ...kgBranch.kg },
      branches: kgBranch.branches.map(b => ({ ...b }))
    };
    this.showDetailsKgModal = true;
  }

  closeDetailsKgModal() {
    this.showDetailsKgModal = false;
    this.detailsKgData = null;
  }

  showKgHistory(kgId: number) {
    this.showHistoryModal = true;
    this.historyLoading = true;
    this.kgHistory = [];
    this.historyMessage = null;
    this.kgBranchService.getKgHistory(kgId).subscribe({
      next: (res) => {
        // Log the full response for debugging
        console.log('[KG History Response]', res);
        if (res && res.code === 200 && res.status === 'Success') {
          // Accept both array and object with data property
          if (Array.isArray(res.result)) {
            this.kgHistory = res.result;
          } else if (res.result && Array.isArray(res.result.data)) {
            this.kgHistory = res.result.data;
          } else {
            this.kgHistory = [];
          }
          if (!this.kgHistory.length) {
            this.historyMessage = this.kgTranslator.instant('KG_MANAGEMENT.NO_HISTORY');
          }
        } else {
          this.toast.showError(typeof res?.result === 'string' ? res.result : this.kgTranslator.instant('KG_MANAGEMENT.FAILED_HISTORY'));
        }
        this.historyLoading = false;
      },
      error: (err) => {
        this.toast.showError(err?.error?.result || err?.error?.message || this.kgTranslator.instant('KG_MANAGEMENT.FAILED_HISTORY'));
        this.historyLoading = false;
      }
    });
  }

  closeHistoryModal() {
    this.showHistoryModal = false;
    this.kgHistory = [];
    this.historyMessage = null;
  }

  // Pagination logic
  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.page = 1;
    this.fetchKgBranches();
  }

  onPageChange(page: number) {
    this.page = page;
    this.fetchKgBranches();
  }

  onSearchClick() {
    this.searchText = this.searchInput.trim();
    this.page = 1;
    this.fetchKgBranches();
  }

  onSortChange(column: string, direction: 'asc' | 'desc') {
    this.sortBy = column;
    this.sortDirection = direction;
    this.page = 1;
    this.fetchKgBranches();
  }

  onSortToggle(column: string) {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
    this.page = 1;
    this.fetchKgBranches();
  }

  getPageArray(): (number | string)[] {
    const total = this.totalPages;
    const current = this.page;
    const delta = 2; // how many pages to show around current
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

  // Placeholder for future CRUD methods (add, edit, delete, etc.)
  validateEmail(emailNgModel: any) {
    const value = emailNgModel.model;
    // Regex: must contain at least one character before and after @, and at least one dot after @
    const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (value && !emailPattern.test(value)) {
      emailNgModel.control.setErrors({ ...(emailNgModel.control.errors || {}), customEmail: true });
    } else {
      if (emailNgModel.control.errors) {
        const { customEmail, ...rest } = emailNgModel.control.errors;
        if (Object.keys(rest).length) {
          emailNgModel.control.setErrors(rest);
        } else {
          emailNgModel.control.setErrors(null);
        }
      }
    }
  }
}
