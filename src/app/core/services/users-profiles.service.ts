import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../interface/api-response.interfaces';
import { BaseService } from './base.service';

@Injectable({ providedIn: 'root' })
export class UsersProfilesService extends BaseService {
  private apiUrl = environment.apiBaseUrl + '/api/PersonalProfiles';

  constructor(private http: HttpClient) { super(); }

  /**
   * Complete a user's basic profile (self, Admin, or SuperAdmin)
   */
  completeBasicProfile(userId: string, dto: any): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/${userId}/complete-profile`, dto, this.getAuthHeaders());
  }

  /**
   * Get all user profiles (Admin, Super Admin only)
   */
  getAllUserProfiles(filter: any): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/profiles/pending`, { ...this.getAuthHeaders(), params: filter });
  }

  /**
   * Get a user's profile status (self, Admin, or SuperAdmin)
   */
  getUserRequestStatus(userId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${userId}/status`, this.getAuthHeaders());
  }

  /**
   * Admin reviews a user profile
   */
  profileReviewByAdmin(dto: any): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/ProfileReviewByAdmin`, dto, this.getAuthHeaders());
  }

  /**
   * Get a user's full profile by userId (self, Admin, or SuperAdmin)
   */
  getUserProfileByUserId(userId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/profiles/${userId}`, this.getAuthHeaders());
  }
}
