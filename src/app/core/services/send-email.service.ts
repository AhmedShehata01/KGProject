import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { EmailDto } from '../interface/email.interfaces';
import { ApiResponse } from '../interface/api-response.interfaces';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class SendEmailService extends BaseService {
  private apiUrl = environment.apiBaseUrl + '/email';

  constructor(private http: HttpClient) { super(); }

  sendEmail(email: EmailDto): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/send`, email, this.getAuthHeaders());
  }
}
