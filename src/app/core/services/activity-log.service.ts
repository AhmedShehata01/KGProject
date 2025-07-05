import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ActivityLogDTO, ActivityLogViewDTO, ActivityLogCreateDTO } from '../interface/activity-log.interfaces';
import { ApiResponse } from '../interface/api-response.interfaces';

@Injectable({ providedIn: 'root' })
export class ActivityLogService {
  private apiUrl = environment.apiBaseUrl + '/api/activity-log';

  constructor(private http: HttpClient) {}

  getEntityHistory(entityName: string, entityId: string): Observable<ApiResponse<ActivityLogViewDTO[] | string>> {
    const params = new HttpParams()
      .set('entityName', entityName)
      .set('entityId', entityId);
    return this.http.get<ApiResponse<ActivityLogViewDTO[] | string>>(`${this.apiUrl}/entity-history`, { params });
  }

  getUserActions(userId: string, fromDate?: Date, toDate?: Date): Observable<ApiResponse<ActivityLogDTO[] | string>> {
    let params = new HttpParams().set('userId', userId);
    if (fromDate) params = params.set('fromDate', fromDate.toISOString());
    if (toDate) params = params.set('toDate', toDate.toISOString());
    return this.http.get<ApiResponse<ActivityLogDTO[] | string>>(`${this.apiUrl}/user-actions`, { params });
  }

  create(dto: ActivityLogCreateDTO): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}`, dto);
  }
}
