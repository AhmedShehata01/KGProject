import { Component, OnInit } from '@angular/core';
import { SidebarService } from '../../../core/services/sidebar.service';
import { SidebarItemDTO, CreateSidebarItemDTO, UpdateSidebarItemDTO, PaginationFilter } from '../../../core/interface/sidebar.interfaces';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SystemManagementTranslator } from '../system-management-translator';
import { TranslateModule } from '@ngx-translate/core';
import { ToastService } from 'src/app/shared/services/toast.service';


@Component({
  selector: 'app-sidebar-management',
  standalone: true,
  imports: [CommonModule, FormsModule , TranslateModule],
  templateUrl: './sidebar-management.component.html',
  styleUrl: './sidebar-management.component.css'
})
export class SidebarManagementComponent implements OnInit {
  sidebarItems: SidebarItemDTO[] = [];
  loading = false;
  error: string | null = null;
  currentLang: string = 'ar';

  showCreateSidebarModal = false;
  showEditSidebarModal = false;

  createSidebarData: CreateSidebarItemDTO = {
    labelAr: '',
    labelEn: '',
    icon: '',
    route: '',
    order: 1,
    parentId: undefined
  };
  createHasSubItem = false;
  createSubItems: CreateSidebarItemDTO[] = [];

  editSidebarData: UpdateSidebarItemDTO = {
    id: 0,
    labelAr: '',
    labelEn: '',
    icon: '',
    route: '',
    order: 1,
    parentId: undefined
  };
  editHasSubItem = false;
  editSubItems: UpdateSidebarItemDTO[] = [];
  editSidebarIndex: number | null = null;

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

  constructor(private sidebarService: SidebarService ,
              private systemManagementTranslator: SystemManagementTranslator,
              private toast: ToastService // ✅ Inject ToastService
  ) {
    // محاولة جلب اللغة الحالية من الترجمة
    if ((this.systemManagementTranslator as any).translate?.currentLang) {
      this.currentLang = (this.systemManagementTranslator as any).translate.currentLang;
    }
    // استمع لتغيير اللغة إذا كان متاحًا
    if ((this.systemManagementTranslator as any).translate?.onLangChange) {
      (this.systemManagementTranslator as any).translate.onLangChange.subscribe((event: any) => {
        this.currentLang = event.lang;
      });
    }
  }

  async ngOnInit() {
    this.systemManagementTranslator.loadTranslations();
    this.fetchSidebarItems();
  }

  fetchSidebarItems() {
    this.loading = true;
    this.error = null;
    const filter: PaginationFilter = {
      page: this.page,
      pageSize: this.pageSize,
      searchText: this.searchText,
      sortBy: this.sortBy,
      sortDirection: this.sortDirection
    };
    this.sidebarService.getAllPaginated(filter).subscribe({
      next: (res) => {
        if (res && res.code === 200 && res.status === 'Success') {
          this.sidebarItems = res.result.data;
          this.totalCount = res.result.totalCount;
          this.page = res.result.page;
          this.pageSize = res.result.pageSize;
          this.totalPages = res.result.totalPages;
        } else {
          this.sidebarItems = [];
          this.toast.showError(this.systemManagementTranslator.instant('SIDEBAR_MANAGEMENT.FAILED_LOAD'));
        }
        this.loading = false;
      },
      error: (err) => {
        this.toast.showError(err?.error?.result || err?.error?.message || this.systemManagementTranslator.instant('SIDEBAR_MANAGEMENT.FAILED_LOAD'));
        this.loading = false;
      }
    });
  }

  openCreateSidebarModal() {
    this.createSidebarData = { labelAr: '', labelEn: '', icon: '', route: '', order: 1, parentId: undefined };
    this.createHasSubItem = false;
    this.createSubItems = [];
    this.showCreateSidebarModal = true;
  }

  closeCreateSidebarModal() {
    this.showCreateSidebarModal = false;
  }

  addSubItem() {
    this.createSubItems.push({ labelAr: '', labelEn: '', icon: '', route: '', order: 1, parentId: undefined });
  }

  removeSubItem(index: number) {
    this.createSubItems.splice(index, 1);
  }

  onCreateSidebar() {
    if (!this.createHasSubItem) {
      this.sidebarService.create(this.createSidebarData).subscribe({
        next: () => {
          this.toast.showSuccess(this.systemManagementTranslator.instant('SIDEBAR_MANAGEMENT.CREATED_SUCCESS'));
          this.fetchSidebarItems();
          this.closeCreateSidebarModal();
        },
        error: (err) => {
          this.toast.showError(err?.error?.result || err?.error?.message || this.systemManagementTranslator.instant('SIDEBAR_MANAGEMENT.FAILED_CREATE'));
        }
      });
    } else {
      // Create parent first, then sub items
      this.sidebarService.create(this.createSidebarData).subscribe({
        next: (res) => {
          const parentId = res.result;
          const subCreates = this.createSubItems.map(sub => {
            return this.sidebarService.create({ ...sub, parentId });
          });
          if (subCreates.length) {
            Promise.all(subCreates.map(obs => obs.toPromise())).then(() => {
              this.toast.showSuccess(this.systemManagementTranslator.instant('SIDEBAR_MANAGEMENT.CREATED_SUCCESS'));
              this.fetchSidebarItems();
              this.closeCreateSidebarModal();
            });
          } else {
            this.toast.showSuccess(this.systemManagementTranslator.instant('SIDEBAR_MANAGEMENT.CREATED_SUCCESS'));
            this.fetchSidebarItems();
            this.closeCreateSidebarModal();
          }
        },
        error: (err) => {
          this.toast.showError(err?.error?.result || err?.error?.message || this.systemManagementTranslator.instant('SIDEBAR_MANAGEMENT.FAILED_CREATE'));
        }
      });
    }
  }

  openEditSidebarModal(item: SidebarItemDTO, index: number) {
    this.editSidebarData = {
      id: item.id,
      labelAr: item.labelAr,
      labelEn: item.labelEn,
      icon: item.icon,
      route: item.route,
      order: item.order,
      parentId: item.parentId
    };
    this.editSidebarIndex = index;
    // If item has children, load them for editing
    if (item.children && item.children.length > 0) {
      this.editHasSubItem = true;
      this.editSubItems = item.children.map(child => ({
        id: child.id,
        labelAr: child.labelAr,
        labelEn: child.labelEn,
        icon: child.icon,
        route: child.route,
        order: child.order,
        parentId: child.parentId
      }));
    } else {
      this.editHasSubItem = false;
      this.editSubItems = [];
    }
    this.showEditSidebarModal = true;
  }

  closeEditSidebarModal() {
    this.showEditSidebarModal = false;
    this.editSidebarData = { id: 0, labelAr: '', labelEn: '', icon: '', route: '', order: 1, parentId: undefined };
    this.editSidebarIndex = null;
  }

  addEditSubItem() {
    this.editSubItems.push({ id: 0, labelAr: '', labelEn: '', icon: '', route: '', order: 1, parentId: this.editSidebarData.id });
  }

  removeEditSubItem(index: number) {
    const sub = this.editSubItems[index];
    if (sub.id && sub.id !== 0) {
      if (!confirm(this.systemManagementTranslator.instant('SIDEBAR_MANAGEMENT.CONFIRM_DELETE_SUB'))) return;
      this.sidebarService.delete(sub.id).subscribe({
        next: () => {
          this.toast.showSuccess(this.systemManagementTranslator.instant('SIDEBAR_MANAGEMENT.DELETED_SUCCESS'));
          this.editSubItems.splice(index, 1);
        },
        error: (err) => {
          this.toast.showError(err?.error?.result || err?.error?.message || this.systemManagementTranslator.instant('SIDEBAR_MANAGEMENT.FAILED_DELETE_SUB'));
        }
      });
    } else {
      this.editSubItems.splice(index, 1);
    }
  }

  onEditSidebar() {
    // Update parent
    this.sidebarService.update(this.editSidebarData).subscribe({
      next: () => {
        if (this.editHasSubItem) {
          // Update or create sub items
          const subUpdates = this.editSubItems.map(sub => {
            if (sub.id && sub.id !== 0) {
              return this.sidebarService.update(sub);
            } else {
              return this.sidebarService.create({
                labelAr: sub.labelAr,
                labelEn: sub.labelEn,
                icon: sub.icon,
                route: sub.route,
                order: sub.order,
                parentId: this.editSidebarData.id
              });
            }
          });
          if (subUpdates.length) {
            Promise.all(subUpdates.map(obs => obs.toPromise())).then(() => {
              this.toast.showSuccess(this.systemManagementTranslator.instant('SIDEBAR_MANAGEMENT.UPDATED_SUCCESS'));
              this.fetchSidebarItems();
              this.closeEditSidebarModal();
            });
          } else {
            this.toast.showSuccess(this.systemManagementTranslator.instant('SIDEBAR_MANAGEMENT.UPDATED_SUCCESS'));
            this.fetchSidebarItems();
            this.closeEditSidebarModal();
          }
        } else {
          this.toast.showSuccess(this.systemManagementTranslator.instant('SIDEBAR_MANAGEMENT.UPDATED_SUCCESS'));
          this.fetchSidebarItems();
          this.closeEditSidebarModal();
        }
      },
      error: (err) => {
        this.toast.showError(err?.error?.result || err?.error?.message || this.systemManagementTranslator.instant('SIDEBAR_MANAGEMENT.FAILED_UPDATE'));
      }
    });
  }

  deleteSidebarItem(id: number) {
    if (!confirm(this.systemManagementTranslator.instant('SIDEBAR_MANAGEMENT.CONFIRM_DELETE'))) return;
    this.sidebarService.delete(id).subscribe({
      next: () => {
        this.toast.showSuccess(this.systemManagementTranslator.instant('SIDEBAR_MANAGEMENT.DELETED_SUCCESS'));
        this.fetchSidebarItems();
      },
      error: (err) => {
        this.toast.showError(err?.error?.result || err?.error?.message || this.systemManagementTranslator.instant('SIDEBAR_MANAGEMENT.FAILED_DELETE'));
      }
    });
  }

  onSearchClick() {
    this.searchText = this.searchInput.trim();
    this.page = 1;
    this.fetchSidebarItems();
  }

  // Pagination logic
  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.page = 1;
    this.fetchSidebarItems();
  }

  onPageChange(page: number) {
    this.page = page;
    this.fetchSidebarItems();
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

  onSortToggle(column: string) {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
    this.page = 1;
    this.fetchSidebarItems();
  }
}
