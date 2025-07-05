import { HttpHeaders } from '@angular/common/http';

export abstract class BaseService {
  protected getToken(): string | null {
    return (typeof window !== 'undefined' && window.localStorage)
      ? localStorage.getItem('jwt_token')
      : null;
  }

  protected getAuthHeaders(): { headers?: HttpHeaders } {
    const token = this.getToken();
    return token ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) } : {};
  }
}
