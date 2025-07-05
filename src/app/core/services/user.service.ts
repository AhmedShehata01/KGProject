import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';
import { ApiResponse, PagedResult } from '../interface/api-response.interfaces';
import { BaseService } from './base.service';
import {
  ApplicationUserDTO,
  CreateApplicationUserDTO,
  UpdateApplicationUserDTO,
  CreateUserByAdminDTO,
  ClaimDTO
} from '../interface/user-management.interfaces';

@Injectable({ providedIn: 'root' })
export class UserService extends BaseService {
  private apiUrl = environment.apiBaseUrl + '/api/User';

  constructor(private http: HttpClient) { super(); }

  getUserById(id: string): Observable<ApplicationUserDTO> {
    return this.http.get<ApiResponse<ApplicationUserDTO>>(`${this.apiUrl}/${id}`, this.getAuthHeaders())
      .pipe(map(res => res.result));
  }

  updateUser(id: string, user: UpdateApplicationUserDTO): Observable<ApplicationUserDTO> {
    return this.http.put<ApiResponse<ApplicationUserDTO>>(`${this.apiUrl}/${id}`, user, this.getAuthHeaders())
      .pipe(map(res => res.result));
  }

  deleteUser(id: string): Observable<string> {
    return this.http.delete<ApiResponse<string>>(`${this.apiUrl}/${id}`, this.getAuthHeaders())
      .pipe(map(res => res.result));
  }

  // Get all roles in the system
  getAllRoles(): Observable<string[]> {
    return this.http.get<ApiResponse<string[]>>(`${this.apiUrl}/allroles`, this.getAuthHeaders())
      .pipe(map(res => res.result));
  }

  // Get all claims in the system (returns array of {type, value})
  getAllClaims(): Observable<ClaimDTO[]> {
    return this.http.get<ApiResponse<ClaimDTO[]>>(`${this.apiUrl}/allclaims`, this.getAuthHeaders())
      .pipe(map(res => res.result));
  }

  // Get user roles by user id
  getUserRoles(id: string): Observable<string[]> {
    return this.http.get<ApiResponse<string[]>>(`${this.apiUrl}/roles/${id}`, this.getAuthHeaders())
      .pipe(map(res => res.result));
  }

  // Update user roles by user id
  updateUserRoles(id: string, roles: string[]): Observable<string[]> {
    return this.http.post<ApiResponse<string[]>>(`${this.apiUrl}/roles/${id}`, roles, this.getAuthHeaders())
      .pipe(map(res => res.result));
  }

  // Get user claims by user id (returns array of claim types)
  getUserClaims(id: string): Observable<ClaimDTO[]> {
    return this.http.get<ApiResponse<ClaimDTO[]>>(`${this.apiUrl}/claims/${id}`, this.getAuthHeaders())
      .pipe(map(res => res.result));
  }

  // Update user claims by user id (send array of claim types)
  updateUserClaims(id: string, claims: string[]): Observable<ClaimDTO[]> {
    return this.http.post<ApiResponse<ClaimDTO[]>>(`${this.apiUrl}/claims/${id}`, claims, this.getAuthHeaders())
      .pipe(map(res => res.result));
  }

  /**
   * Create a new user by admin (calls /create-by-admin endpoint)
   * @param userData CreateUserByAdminDTO
   * @returns Observable<ApiResponse<any>>
   *   - Success: { code, status, result: { Message, UserId, EmailSent } }
   *   - Validation Error: { code, status, result: string[] }
   *   - Error: { code, status, result: { Message, Details } }
   */
  createUserByAdmin(userData: CreateUserByAdminDTO): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/create-by-admin`, userData, this.getAuthHeaders())
      .pipe(map(res => res.result));
  }

  /**
   * Get all users (paginated, filtered, sorted)
   * Calls /api/User/GetAllPaginated
   * @param filter { page, pageSize, searchText?, sortBy?, sortDirection? }
   * @returns Observable<{ data, totalCount, page, pageSize }>
   */
  getAllUsersPaginated(filter: {
    page: number;
    pageSize: number;
    searchText?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  }): Observable<PagedResult<ApplicationUserDTO>> {
    return this.http.get<ApiResponse<PagedResult<ApplicationUserDTO>>>(`${this.apiUrl}/GetAllPaginated`, { params: filter as any, ...this.getAuthHeaders() })
      .pipe(map(res => res.result));
  }
}
