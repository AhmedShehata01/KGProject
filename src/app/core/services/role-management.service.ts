import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ApplicationRoleDTO,
  CreateRoleDTO,
  UpdateRoleDTO,
  ToggleRoleStatusDTO,
  RoleWithRoutesDTO,
  ApiResponse,
  PagedResult,
  DropdownRoleDTO
} from '../interface/role-management.interfaces';
import { ApplicationUserDTO } from '../interface/user-management.interfaces';
import { environment } from '../../../environments/environment';
import { BaseService } from './base.service';

@Injectable({ providedIn: 'root' })
export class RoleManagementService extends BaseService {
  private baseUrl = environment.apiBaseUrl + '/api/RoleManagement';

  constructor(private http: HttpClient) { super(); }

  getRoleById(id: string): Observable<ApiResponse<ApplicationRoleDTO>> {
    return this.http.get<ApiResponse<ApplicationRoleDTO>>(`${this.baseUrl}/getById/${id}`, this.getAuthHeaders());
  }

  createRole(dto: CreateRoleDTO): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.baseUrl}/create`, dto, this.getAuthHeaders());
  }

  updateRole(dto: UpdateRoleDTO): Observable<ApiResponse<boolean>> {
    // Backend expects: PUT /update/{id} with dto in body
    return this.http.put<ApiResponse<boolean>>(`${this.baseUrl}/update/${dto.id}`, dto, this.getAuthHeaders());
  }

  toggleRoleStatus(roleId: string): Observable<ApiResponse<boolean>> {
    // Backend expects: PUT /toggle-status/{id}
    return this.http.put<ApiResponse<boolean>>(`${this.baseUrl}/toggle-status/${roleId}`, null, this.getAuthHeaders());
  }

  getRolesWithRoutes(): Observable<ApiResponse<RoleWithRoutesDTO[]>> {
    return this.http.get<ApiResponse<RoleWithRoutesDTO[]>>(`${this.baseUrl}/roles-with-routes`, this.getAuthHeaders());
  }

  deleteRole(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.baseUrl}/delete/${id}`, this.getAuthHeaders());
  }

  getAllRolesPaginated(page: number, pageSize: number, searchText?: string, sortBy?: string, sortDirection: 'asc' | 'desc' = 'asc'): Observable<ApiResponse<PagedResult<ApplicationRoleDTO>>> {
    const params: any = {
      Page: page,
      PageSize: pageSize,
      SearchText: searchText || '',
      SortBy: sortBy || '',
      SortDirection: sortDirection || 'asc'
    };
    return this.http.get<ApiResponse<PagedResult<ApplicationRoleDTO>>>(`${this.baseUrl}/getAllPaginated`, { ...this.getAuthHeaders(), params });
  }

  getDropdownRoles(): Observable<ApiResponse<DropdownRoleDTO[]>> {
    return this.http.get<ApiResponse<DropdownRoleDTO[]>>(`${this.baseUrl}/roles-dropdown`, this.getAuthHeaders());
  }

  /**
   * Get all users assigned to a specific role
   * Backend: GET /api/RoleManagement/{roleId}/users
   */
  getUsersByRole(roleId: string): Observable<ApiResponse<ApplicationUserDTO[]>> {
    return this.http.get<ApiResponse<ApplicationUserDTO[]>>(
      `${this.baseUrl}/${roleId}/users`,
      this.getAuthHeaders()
    );
  }

  /**
   * Remove a user from a specific role
   * Backend: DELETE /api/RoleManagement/{roleId}/users/{userId}
   */
  removeUserFromRole(roleId: string, userId: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(
      `${this.baseUrl}/${roleId}/users/${userId}`,
      this.getAuthHeaders()
    );
  }
}
