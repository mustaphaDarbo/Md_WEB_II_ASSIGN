import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      this.router.navigate(['/login']);
      return false;
    }

    // For mock tokens, just check if token exists and starts with "mock"
    if (token.startsWith('mock-access-token')) {
      return true;
    }

    // For real JWT tokens, check expiration
    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      if (tokenPayload.exp * 1000 < Date.now()) {
        // Token expired
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.router.navigate(['/login']);
        return false;
      }
      return true;
    } catch (err) {
      // Invalid token - but if it's our mock token, allow it
      if (token.startsWith('mock-access-token')) {
        return true;
      }
      // Invalid real token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.router.navigate(['/login']);
      return false;
    }
  }
}
