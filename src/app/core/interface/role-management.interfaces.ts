export interface ApplicationRoleDTO {
  id: string;
  name: string;
  isActive: boolean;
  isExternal: boolean;
  createdOn: string;
}

export interface CreateRoleDTO {
  name: string;
}

export interface UpdateRoleDTO {
  id: string;
  name: string;
  isActive: boolean;
}

export interface ToggleRoleStatusDTO {
  roleId: string;
  isActive: boolean;
}

export interface RoleWithRoutesDTO {
  roleId: string;
  roleName: string;
  allowedRoutes: string[];
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
  totalPages?: number;
}

export interface DropdownRoleDTO {
  id: string;
  name: string;
}

export interface RemoveUserRoleDTO {
  userId: string;
  roleId: string;
}
