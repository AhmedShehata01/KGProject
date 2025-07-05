import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class SecuredRouteGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const path = state.url.split('?')[0];
    const userRoles = this.auth.getRoles();
    if (userRoles.includes('Super Admin')) {
      return true;
    }
    // Allow if any securedRoute is a prefix of the current path
    const allowed = this.auth.getSecuredRoutes().some(allowedPath =>
      path === allowedPath || path.startsWith(allowedPath + '/') || allowedPath === '/' || path === allowedPath + '/'
    );
    if (allowed) {
      return true;
    }
    this.router.navigate(['/unauthorized']);
    return false;
  }
}
