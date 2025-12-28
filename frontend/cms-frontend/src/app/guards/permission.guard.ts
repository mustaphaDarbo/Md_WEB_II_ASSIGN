import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {
  constructor(
    private router: Router,
    private auth: AuthService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const requiredPermission = route.data?.['permission'] as string | undefined;
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      this.router.navigate(['/login']);
      return false;
    }

    // For mock tokens, skip JWT parsing and check permissions directly
    if (token.startsWith('mock-access-token')) {
      // Check permissions using AuthService
      if (requiredPermission && !this.auth.hasPermission(requiredPermission)) {
        this.router.navigate(['/unauthorized']);
        return false;
      }
      return true;
    }

    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      
      // Check if token is expired
      if (tokenPayload.exp * 1000 < Date.now()) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.router.navigate(['/login']);
        return false;
      }

      // Prefer AuthService permissions check (supports role fallback)
      if (requiredPermission && !this.auth.hasPermission(requiredPermission)) {
        this.router.navigate(['/unauthorized']);
        return false;
      }

      return true;
    } catch (err) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.router.navigate(['/login']);
      return false;
    }
  }
}
