import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UsersProfilesService } from '../../core/services/users-profiles.service';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './unauthorized.component.html',
  styleUrl: './unauthorized.component.css'
})
export class UnauthorizedComponent {
  constructor(
    private router: Router,
    private authService: AuthService,
    private usersProfilesService: UsersProfilesService
  ) {}

  async goToDashboard() {
    const token = this.authService.getToken();
    if (!token || this.authService.isTokenExpired()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    try {
      const decoded: any = jwtDecode(token);
      if (!decoded.IsAgree) {
        this.router.navigate(['/unauthorized']);
        return;
      }
      const userId = decoded.UserId || decoded.sub || decoded.userId || decoded.id;
      if (userId) {
        this.usersProfilesService.getUserRequestStatus(userId).subscribe((resp: any) => {
          let status = resp?.result?.status ?? resp?.result;
          if (typeof status === 'string') status = status.toLowerCase();
          if (status === 'approved' || status === 2 || status === '2') {
            this.router.navigate(['/dashboard']);
          } else {
            this.router.navigate(['/complete-user-profile']);
          }
        }, () => {
          this.router.navigate(['/complete-user-profile']);
        });
      } else {
        this.router.navigate(['/auth/login']);
      }
    } catch {
      this.router.navigate(['/auth/login']);
    }
  }
}
