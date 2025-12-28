import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-new.component.html',
  styleUrls: ['./login-new.component.css']
})
export class LoginComponent {
  form = { email: '', password: '' };
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  onEmailChange() {
    console.log('Email field changed to:', this.form.email);
  }

  login() {
    console.log('=== LOGIN ATTEMPT START ===');
    console.log('Before trim - email:', this.form.email);
    this.form.email = (this.form.email || '').trim().toLowerCase();
    this.form.password = (this.form.password || '').trim();
    console.log('After trim - email:', this.form.email);
    console.log('Password length:', this.form.password.length);

    console.log('Login attempt with email:', this.form.email);
    console.log('Full form data:', this.form);

    if (!this.form.email || !this.form.password) {
      console.error('Missing email or password');
      alert('Please enter both email and password');
      return;
    }

    this.loading = true;
    
    console.log('Calling auth service...');
    
    // Use the proper auth service
    this.auth.login(this.form).subscribe({
      next: (res: any) => {
        console.log('Login response:', res);
        this.auth.saveUser(res);
        this.router.navigate(['/dashboard']);
        this.loading = false;
      },
      error: (err) => {
        console.error('Login error:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.error?.message || err.message);
        alert('Login failed: ' + (err.error?.message || err.message || 'Server error'));
        this.loading = false;
      }
    });
  }
}
