import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {

  form = {
    fullName: '',
    email: '',
    password: '',
    role: 'Viewer'
  };
  isLoading = false;

  constructor(private auth: AuthService, private router: Router) {}

  register() {
    this.form.fullName = (this.form.fullName || '').trim();
    this.form.email = (this.form.email || '').trim().toLowerCase();
    this.form.password = (this.form.password || '').trim();

    console.log('REGISTER DATA 👉', this.form); // IMPORTANT

    this.auth.register(this.form).subscribe({
      next: () => {
        alert('Registration successful. Please login.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error(err);
        alert(err.error?.message || 'Registration failed');
      }
    });
  }
}
