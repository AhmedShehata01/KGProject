import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  SecuredRouteDTO,
  CreateSecuredRouteDTO,
  UpdateSecuredRouteDTO,
  AssignRolesToRouteDTO,
  UnassignRoleFromRouteDTO,
  RouteWithRolesDTO,
  ApiResponse,
  PagedResult
} from '../interface/secured-route.interfaces';
import { environment } from '../../../environments/environment';
import { BaseService } from './base.service';

@Injectable({ providedIn: 'root' })
export class SecuredRouteService extends BaseService {
  private baseUrl = environment.apiBaseUrl + '/api/SecuredRoute'; // عدل المسار حسب إعداداتك

  constructor(private http: HttpClient) { super(); }

  getRouteById(id: number): Observable<ApiResponse<SecuredRouteDTO>> {
    return this.http.get<ApiResponse<SecuredRouteDTO>>(`${this.baseUrl}/getById/${id}`, this.getAuthHeaders());
  }

  createRoute(dto: CreateSecuredRouteDTO): Observable<ApiResponse<number>> {
    // Remove createdById if present (backend will set it from token)
    const { basePath, description, roleIds } = dto;
    return this.http.post<ApiResponse<number>>(
      `${this.baseUrl}/create`,
      { basePath, description, roleIds },
      this.getAuthHeaders()
    );
  }

  updateRoute(dto: UpdateSecuredRouteDTO): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.baseUrl}/update`, dto, this.getAuthHeaders());
  }

  deleteRoute(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.baseUrl}/delete/${id}`, this.getAuthHeaders());
  }

  assignRoles(dto: AssignRolesToRouteDTO): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.baseUrl}/assign-roles`, dto, this.getAuthHeaders());
  }

  unassignRole(dto: UnassignRoleFromRouteDTO): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.baseUrl}/unassign-role`, dto, this.getAuthHeaders());
  }

  getRoutesWithRoles(): Observable<ApiResponse<RouteWithRolesDTO[]>> {
    return this.http.get<ApiResponse<RouteWithRolesDTO[]>>(`${this.baseUrl}/routes-with-roles`, this.getAuthHeaders());
  }

  getAllRoutesPaginated(page: number, pageSize: number, searchText?: string, sortBy?: string, sortDirection: 'asc' | 'desc' = 'asc'): Observable<ApiResponse<PagedResult<SecuredRouteDTO>>> {
    const params: any = {
      page: page,
      pageSize: pageSize,
      searchText: searchText || '',
      sortBy: sortBy || '',
      sortDirection: sortDirection || 'asc'
    };
    return this.http.get<ApiResponse<PagedResult<SecuredRouteDTO>>>(`${this.baseUrl}/GetAllPaginated`, { ...this.getAuthHeaders(), params });
  }
}
