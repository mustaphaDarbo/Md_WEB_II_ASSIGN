import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ArticleService } from '../services/article.service';
import { API_BASE } from '../config/api.config';

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './articles-list.component.html',
  styleUrls: ['./articles-list.component.css']
})
export class ArticlesComponent implements OnInit {
  articles: any[] = [];
  loading = true;
  user: any = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private articleService: ArticleService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });

    this.loadArticles();
  }

  loadArticles() {
    this.loading = true;
    this.articleService.getArticles().subscribe({
      next: (articles: any[]) => {
        // Filter articles based on user role
        const roleName = this.user?.role?.name || this.user?.role;
        if (roleName === 'Viewer') {
          this.articles = articles.filter(article => article.published);
        } else {
          this.articles = articles;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading articles:', err);
        this.loading = false;
      }
    });
  }

  hasPermission(permission: string): boolean {
    return this.authService.hasPermission(permission);
  }

  editArticle(id: string) {
    this.router.navigate([`/articles/edit/${id}`]);
  }

  deleteArticle(id: string) {
    if (confirm('Are you sure you want to delete this article?')) {
      this.articleService.deleteArticle(id).subscribe({
        next: () => {
          this.loadArticles();
        },
        error: (err) => {
          console.error('Error deleting article:', err);
          alert('Failed to delete article');
        }
      });
    }
  }

  publishArticle(id: string) {
    this.articleService.publishArticle(id).subscribe({
      next: () => {
        this.loadArticles();
      },
      error: (err) => {
        console.error('Error publishing article:', err);
        alert('Failed to publish article');
      }
    });
  }

  unpublishArticle(id: string) {
    this.articleService.unpublishArticle(id).subscribe({
      next: () => {
        this.loadArticles();
      },
      error: (err) => {
        console.error('Error unpublishing article:', err);
        alert('Failed to unpublish article');
      }
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  getArticleImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    // If the image path already starts with http, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    // If it's a relative path starting with /uploads, construct full URL
    if (imagePath.startsWith('/uploads')) {
      return `${API_BASE.replace('/api', '')}${imagePath}`;
    }
    // Otherwise, assume it's a relative path and construct full URL
    return `${API_BASE.replace('/api', '')}/uploads/${imagePath}`;
  }

  onImageError(event: any) {
    // Set a placeholder image if the article image fails to load
    event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y0ZjRmNCIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K';
  }
}
