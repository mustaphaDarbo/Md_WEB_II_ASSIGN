import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { RoleService } from '../services/role.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css']
})
export class RolesComponent implements OnInit {

  roles: any[] = [];
  filteredRoles: any[] = [];
  searchTerm = '';
  user: any = null;
  userInitials = '';
  
  newRole = {
    name: '',
    permissions: {
      create: false,
      edit: false,
      delete: false,
      publish: false,
      view: false,
      manageUsers: false,
      manageRoles: false
    }
  };
  editingRoleId: string | null = null;

  constructor(
    private roleService: RoleService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadRoles();
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      this.userInitials = this.getInitials(user?.fullName);
    });
  }

  loadRoles() {
    this.roleService.getRoles().subscribe(res => {
      this.roles = res;
      this.filteredRoles = res;
    });
  }

  searchRoles() {
    if (!this.searchTerm) {
      this.filteredRoles = this.roles;
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredRoles = this.roles.filter(role =>
        role.name.toLowerCase().includes(term)
      );
    }
  }

  createRole() {
    if (!this.newRole.name.trim()) {
      alert('Please enter a role name');
      return;
    }

    const payload = { name: this.newRole.name, permissions: this.newRole.permissions };
    if (this.editingRoleId) {
      this.roleService.updateRole(this.editingRoleId, payload).subscribe({
        next: () => {
          alert('Role updated successfully!');
          this.resetForm();
          this.loadRoles();
          this.editingRoleId = null;
        },
        error: (err) => {
          console.error('Error updating role:', err);
          alert('Failed to update role. Please try again.');
        }
      });
    } else {
      this.roleService.createRole(payload).subscribe({
        next: () => {
          alert('Role created successfully!');
          this.resetForm();
          this.loadRoles();
        },
        error: (err) => {
          console.error('Error creating role:', err);
          alert('Failed to create role. Please try again.');
        }
      });
    }
  }

  editRole(role: any) {
    this.editingRoleId = role._id || null;
    this.newRole = {
      name: role.name,
      permissions: { ...role.permissions }
    };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  resetForm() {
    this.newRole = {
      name: '',
      permissions: {
        create: false,
        edit: false,
        delete: false,
        publish: false,
        view: false,
        manageUsers: false,
        manageRoles: false
      }
    };
  }

  getInitials(fullName?: string): string {
    if (!fullName) return 'U';
    return fullName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  hasPermission(permission: string): boolean {
    return this.user?.permissions?.[permission] === true;
  }

  deleteRole(roleId: string) {
    if (confirm('Are you sure you want to delete this role?')) {
      this.roleService.deleteRole(roleId).subscribe({
        next: () => {
          alert('Role deleted successfully');
          this.loadRoles();
        },
        error: (err) => {
          console.error('Error deleting role:', err);
          alert('Failed to delete role');
        }
      });
    }
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        window.location.href = '/login';
      },
      error: (err) => {
        console.error('Logout failed:', err);
        window.location.href = '/login';
      }
    });
  }
}
