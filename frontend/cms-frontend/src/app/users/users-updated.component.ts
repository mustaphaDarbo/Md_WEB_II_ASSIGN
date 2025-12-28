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

  newUser = {
    fullName: '',
    email: '',
    password: '',
    role: ''
  };

  roles = ['SuperAdmin', 'Manager', 'Contributor', 'Viewer'];

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadUsers();
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });
  }

  get currentUser() {
    return this.user;
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe({
      next: (res) => {
        this.users = res;
        this.filteredUsers = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.loading = false;
      }
    });
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
    // TODO: Implement edit user functionality
    alert(`Edit user: ${user.fullName}`);
  }

  createUser() {
    if (!this.newUser.fullName.trim() || !this.newUser.email.trim() || !this.newUser.password.trim() || !this.newUser.role) {
      alert('Please fill all fields');
      return;
    }

    // Use the user service to create a new user (SuperAdmin only)
    this.userService.createUser(this.newUser).subscribe({
      next: (res) => {
        alert('User created successfully!');
        this.resetUserForm();
        this.loadUsers();
      },
      error: (err) => {
        console.error('Error creating user:', err);
        alert(err.error?.message || 'Failed to create user');
      }
    });
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
          this.loadUsers();
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
