import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UsersProfilesService } from '../services/users-profiles.service';
import { jwtDecode } from 'jwt-decode';
import { Observable, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService,
    private usersProfilesService: UsersProfilesService // Use UsersProfilesService instead of UserService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> {
    const token = this.authService.getToken();
    if (token && !this.authService.isTokenExpired()) {
      const url = state.url;
      try {
        const decoded: any = jwtDecode(token);
        const userRoles = this.authService.getRoles();
        // Allow Super Admin to access everything directly
        if (userRoles && userRoles.includes('Super Admin')) {
          return true;
        }
        const isFirstLogin = decoded.IsFirstLogin === 'true';
        const isAgree = decoded.IsAgree === 'true';

        // 1. If IsFirstLogin is true, only allow /auth/change-password-first-time
        if (isFirstLogin) {
          if (url.startsWith('/auth/change-password-first-time')) {
            return true;
          } else {
            return this.router.createUrlTree(['/auth/change-password-first-time']);
          }
        }

        // 2. If IsFirstLogin is false and IsAgree is false, redirect to /complete-user-profile
        if (!isFirstLogin && !isAgree) {
          return this.router.createUrlTree(['/complete-user-profile']);
        }

        // 3. If IsFirstLogin is false and IsAgree is true, allow access (but check UserStatus for main layout)
        if (!url.startsWith('/auth') && !url.startsWith('/complete-user-profile')) {
          // Only allow access if UserStatus is 'approved' (2 or 'approved')
          const userId = decoded.UserId || decoded.sub || decoded.userId || decoded.id;
          if (userId) {
            return this.usersProfilesService.getUserRequestStatus(userId).pipe(
              map((resp: any) => {
                let status = resp?.result?.status ?? resp?.result;
                if (typeof status === 'string') status = status.toLowerCase();
                if (status === 'approved' || status === 2 || status === '2') {
                  return true;
                }
                // Not approved, redirect to complete-user-profile
                return this.router.createUrlTree(['/complete-user-profile']);
              }),
              catchError(() => of(this.router.createUrlTree(['/complete-user-profile'])))
            );
          }
        }
        
        // RBAC: Check for allowed roles if specified in route data
        const allowedRoles = route.data && route.data['roles'] as string[];
        if (allowedRoles && allowedRoles.length > 0) {
          const userRoles = this.authService.getRoles();
          const hasRole = userRoles.some(role => allowedRoles.includes(role));
          if (!hasRole) {
            // Redirect unauthorized users to /unauthorized
            return this.router.createUrlTree(['/unauthorized']);
          }
        }
        return true;
      } catch {
        this.authService.logout();
        return this.router.createUrlTree(['/auth/login']);
      }
    }
    this.authService.logout();
    return this.router.createUrlTree(['/auth/login']);
  }
}
