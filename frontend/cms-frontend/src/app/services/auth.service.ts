import { Injectable } from '@angular/core';
import { API_BASE } from '../config/api.config';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

 type PermissionMap = Record<string, boolean>;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private API = `${API_BASE}/auth`;
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const user = localStorage.getItem('user');
    if (user && user !== 'undefined') {
      try {
        this.currentUserSubject.next(JSON.parse(user));
      } catch (err) {
        console.error('Error parsing user from localStorage:', err);
        localStorage.removeItem('user');
      }
    }
  }

  login(data: any): Observable<any> {
    return this.http.post<any>(`${this.API}/login`, data).pipe(
      tap(response => {
        this.saveUser(response);
        this.currentUserSubject.next(response.user);
      })
    );
  }

  register(data: any): Observable<any> {
    return this.http.post<any>(`${this.API}/register`, data).pipe(
      tap(response => {
        // After successful registration, automatically login the user
        if (response.message === "User registered successfully") {
          // Login the user to get their permissions
          this.login({ email: data.email, password: data.password }).subscribe();
        }
      })
    );
  }

  refreshToken(refreshToken: string): Observable<any> {
    return this.http.post<any>(`${this.API}/refresh-token`, { refreshToken }).pipe(
      tap(response => {
        const nextAccessToken = response.accessToken ?? response.token;
        if (nextAccessToken) {
          localStorage.setItem('token', nextAccessToken);
        }
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }
      })
    );
  }

  logout(): Observable<any> {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.http.post<any>(`${this.API}/logout`, { refreshToken }).pipe(
      tap(() => {
        this.clearUser();
      })
    );
  }

  updateProfilePhoto(profilePhoto: string): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.post<any>(
      `${this.API}/profile-photo`,
      { profilePhoto },
      { headers: { Authorization: `Bearer ${token}` } }
    ).pipe(
      tap((res) => {
        const current = this.getCurrentUser() || {};
        const nextUser = { ...current, ...(res?.user || {}) };
        localStorage.setItem('user', JSON.stringify(nextUser));
        this.currentUserSubject.next(nextUser);
      })
    );
  }

  saveUser(data: any) {
    const accessToken = data.accessToken ?? data.token;
    if (accessToken) {
      localStorage.setItem('token', accessToken);
    }
    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
    }
    localStorage.setItem('user', JSON.stringify(data.user));
    this.currentUserSubject.next(data.user);
  }

  clearUser() {
    localStorage.clear();
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getCurrentUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    // First try to use permissions from backend
    if (user.permissions && user.permissions[permission] === true) {
      return true;
    }
    
    // Fallback to role-based permissions
    const rolePermissions = this.getUserPermissions(user.role);
    return rolePermissions[permission] || false;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role?.name === role;
  }

  private getUserPermissions(role?: string): PermissionMap {
    const permissions: Record<string, PermissionMap> = {
      SuperAdmin: { create: true, edit: true, delete: true, publish: true, view: true, manageUsers: true, manageRoles: true },
      Manager: { create: true, edit: true, delete: true, publish: true, view: true, manageUsers: false, manageRoles: false },
      Contributor: { create: true, edit: true, delete: false, publish: false, view: true, manageUsers: false, manageRoles: false },
      Viewer: { create: false, edit: false, delete: false, publish: false, view: true, manageUsers: false, manageRoles: false }
    };

    if (!role) return {};
    return permissions[role] ?? {};
  }
}
