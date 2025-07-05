import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseService } from './base.service';

@Injectable({ providedIn: 'root' })
export class FileUploadService extends BaseService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) { super(); }

  uploadFile(file: File, folder: string): Observable<{ filePath: string }> {
    const formData = new FormData();
    formData.append('file', file);
    // Use correct API endpoint for file upload
    const url = `${this.apiUrl}/api/Files/upload?folder=${encodeURIComponent(folder)}`;
    console.log('Uploading to:', url, 'File:', file);
    return this.http.post<{ result: { filePath: string } }>(
      url,
      formData,
      this.getAuthHeaders()
    ).pipe(
      map(res => res.result)
    );
  }
}
