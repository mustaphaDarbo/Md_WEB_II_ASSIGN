import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RoleService } from '../services/role.service';

@Component({
  selector: 'app-access-matrix',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './access-matrix.component.html',
  styleUrls: ['./access-matrix.component.css']
})
export class AccessMatrixComponent implements OnInit {
  user: any = null;
  
  // Access matrix will be loaded from backend roles
  accessMatrix: any[] = [];

  permissionColumns = ['create', 'edit', 'delete', 'publish', 'view'];
  permissionLabels: { [key: string]: string } = {
    create: 'Create',
    edit: 'Edit', 
    delete: 'Delete',
    publish: 'Publish',
    view: 'View'
  };

  // Helper method to safely access permissions
  hasPermission(roleRow: any, permission: string): boolean {
    return roleRow.permissions[permission] || false;
  }

  // Helper method to check current user permissions
  hasUserPermission(permission: string): boolean {
    return this.user?.permissions?.[permission] === true;
  }

  constructor(
    private router: Router,
    private auth: AuthService
    , private roleService: RoleService
  ) {}

  ngOnInit() {
    this.auth.currentUser$.subscribe(user => {
      this.user = user;
    });

    // Load roles and their permissions from backend
    this.roleService.getRoles().subscribe({
      next: (roles) => {
        // Normalize roles into accessMatrix format
        this.accessMatrix = roles.map((r: any) => ({ role: r.name, permissions: r.permissions || {} }));
      },
      error: (err) => {
        console.error('Failed to load roles for access matrix:', err);
      }
    });
  }

  logout() {
    this.auth.logout().subscribe({
      next: () => {
        window.location.href = '/login';
      },
      error: (err) => {
        console.error('Logout failed:', err);
        window.location.href = '/login';
      }
    });
  }

  get userInitials(): string {
    const name = (this.user?.fullName || '').trim();
    if (!name) return 'U';
    const parts = name.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] || 'U';
    const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] || '') : '';
    return (first + last).toUpperCase();
  }
}
