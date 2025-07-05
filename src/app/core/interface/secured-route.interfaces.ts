export interface SecuredRouteDTO {
  id: number;
  basePath: string;
  description?: string;
  createdOn: string;
  createdById: string;
  createdByName?: string;
  assignedRoles: string[];
}

export interface CreateSecuredRouteDTO {
  basePath: string;
  description?: string;
  // createdById is set by backend, not required here
  roleIds: string[]; // ✅ لدعم إرسال الأدوار مع الإنشاء
}

export interface UpdateSecuredRouteDTO {
  id: number;
  basePath: string;
  description?: string;
  roleIds: string[]; // ✅ لدعم إرسال الأدوار مع التعديل
}

export interface AssignRolesToRouteDTO {
  securedRouteId: number;
  roleIds: string[];
}

export interface UnassignRoleFromRouteDTO {
  securedRouteId: number;
  roleId: string;
}

export interface RouteWithRolesDTO {
  routeId: number;
  basePath: string;
  roles: string[];
}

export interface ApiResponse<T> {
  code: number;
  status: string;
  result: T;
}

export interface PagedResult<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
