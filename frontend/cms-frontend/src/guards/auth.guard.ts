import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../app/services/auth.service';

 type PermissionMap = Record<string, boolean>;

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const auth = inject<AuthService>(AuthService);

  if (!auth.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};

export const permissionGuard = (permission: string): CanActivateFn => {
  return () => {
    const router = inject(Router);
    const auth = inject<AuthService>(AuthService);

    if (!auth.isLoggedIn()) {
      router.navigate(['/login']);
      return false;
    }

    const user = auth.getCurrentUser();
    const userPermissions = getUserPermissions(user?.role);

    if (!userPermissions[permission]) {
      router.navigate(['/unauthorized']);
      return false;
    }

    return true;
  };
};

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const router = inject(Router);
    const auth = inject<AuthService>(AuthService);

    if (!auth.isLoggedIn()) {
      router.navigate(['/login']);
      return false;
    }

    const user = auth.getCurrentUser();
    
    if (!allowedRoles.includes(user?.role)) {
      router.navigate(['/unauthorized']);
      return false;
    }

    return true;
  };
};

function getUserPermissions(role?: string): PermissionMap {
  const permissions: Record<string, PermissionMap> = {
    SuperAdmin: { create: true, edit: true, delete: true, publish: true, view: true, manageRoles: true },
    Manager: { create: true, edit: true, delete: false, publish: true, view: true },
    Contributor: { create: true, edit: true, delete: false, publish: false, view: true },
    Viewer: { create: false, edit: false, delete: false, publish: false, view: true }
  };

  if (!role) return {};
  return permissions[role] ?? {};
}
