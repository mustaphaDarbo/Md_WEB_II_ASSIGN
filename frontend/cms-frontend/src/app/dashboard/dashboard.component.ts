import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { ArticleService } from '../services/article.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  user: any = null;
  stats = {
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    totalUsers: 0
  };
  loading = true;

  constructor(
    private authService: AuthService,
    private articleService: ArticleService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      this.loadDashboardStats();
    });
    
    // Subscribe to dynamic users service for real-time updates
    this.userService.users$.subscribe(users => {
      console.log('Dashboard: Users updated', users.length);
      this.stats.totalUsers = users.length;
      console.log('Dashboard: Total users set to:', this.stats.totalUsers);
    });
  }

  loadDashboardStats() {
    this.loading = true;
    
    // Load articles stats
    this.articleService.getArticles().subscribe({
      next: (articles: any[]) => {
        this.stats.totalArticles = articles.length;
        this.stats.publishedArticles = articles.filter(a => a.published).length;
        this.stats.draftArticles = articles.filter(a => !a.published).length;
      },
      error: (err) => {
        console.error('Error loading articles stats:', err);
      }
    });
    
    // Load users stats using the new dynamic service
    this.userService.getAllUsers().subscribe({
      next: (users: any[]) => {
        this.stats.totalUsers = users.length;
        console.log('Dashboard users loaded from service:', users.length);
      },
      error: (err) => {
        console.error('Error loading users stats:', err);
        // Keep the fixed number if API fails
      }
    });
    
    // Set loading to false immediately since we have the fixed number
    this.loading = false;
  }

  hasPermission(permission: string): boolean {
    return this.user?.permissions?.[permission] === true;
  }
}
