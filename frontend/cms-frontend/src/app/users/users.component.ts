import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  users: any[] = [];
  filteredUsers: any[] = [];
  searchTerm = '';
  user: any = null;
  loading = true;
  isSuperAdmin: boolean = false;

  newUser = {
    fullName: '',
    email: '',
    password: '',
    role: ''
  };
  editingUserId: string | null = null;

  roles = ['SuperAdmin', 'Manager', 'Contributor', 'Viewer'];

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Subscribe to dynamic users service
    this.userService.users$.subscribe(users => {
      console.log('UsersComponent: Users updated:', users.length);
      this.users = users;
      this.filteredUsers = users;
      this.loading = false;
    });
    
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      this.isSuperAdmin = user?.role?.name === 'SuperAdmin';
    });
  }

  get currentUser() {
    return this.user;
  }

  searchUsers() {
    if (!this.searchTerm) {
      this.filteredUsers = this.users;
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredUsers = this.users.filter(user =>
        user.fullName.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      );
    }
  }

  editUser(user: any) {
    this.editingUserId = user._id;
    this.newUser = {
      fullName: user.fullName || '',
      email: user.email || '',
      password: '',
      role: user.role?.name || user.role || ''
    };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  createUser() {
    if (!this.newUser.fullName.trim() || !this.newUser.email.trim() || !this.newUser.password.trim() || !this.newUser.role) {
      alert('Please fill all fields');
      return;
    }

    // If editing, update user; otherwise create
    if (this.editingUserId) {
      const payload: any = { fullName: this.newUser.fullName, email: this.newUser.email, role: this.newUser.role };
      if (this.newUser.password) payload.password = this.newUser.password;
      this.userService.updateUser(this.editingUserId, payload).subscribe({
        next: () => {
          alert('User updated successfully!');
          this.resetUserForm();
          this.editingUserId = null;
        },
        error: (err) => {
          console.error('Error updating user:', err);
          alert(err.error?.message || 'Failed to update user');
        }
      });
    } else {
      this.userService.createUser(this.newUser).subscribe({
        next: (res) => {
          alert('User created successfully!');
          this.resetUserForm();
        },
        error: (err) => {
          console.error('Error creating user:', err);
          alert(err.error?.message || 'Failed to create user');
        }
      });
    }
  }

  resetUserForm() {
    this.newUser = {
      fullName: '',
      email: '',
      password: '',
      role: ''
    };
  }

  deleteUser(userId: string) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(userId).subscribe({
        next: () => {
          alert('User deleted successfully');
        },
        error: (err) => {
          console.error('Error deleting user:', err);
          alert('Failed to delete user');
        }
      });
    }
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

  get userInitials(): string {
    return this.getInitials(this.user?.fullName);
  }

  hasPermission(permission: string): boolean {
    return this.user?.permissions?.[permission] === true;
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
