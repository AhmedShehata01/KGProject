export interface SidebarItemDTO {
  id: number;
  labelAr: string;
  labelEn: string;
  icon: string;
  route: string;
  parentId?: number;
  order: number;
  children: SidebarItemDTO[];
}

export interface CreateSidebarItemDTO {
  labelAr: string;
  labelEn: string;
  icon: string;
  route: string;
  parentId?: number;
  order?: number;
}

export interface UpdateSidebarItemDTO {
  id: number;
  labelAr: string;
  labelEn: string;
  icon: string;
  route: string;
  parentId?: number;
  order?: number;
}

export interface PaginationFilter {
  page: number;
  pageSize: number;
  searchText?: string;
  sortBy?: string;
  sortDirection?: string;
}

export interface PagedResult<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
