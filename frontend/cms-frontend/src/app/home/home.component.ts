import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ArticleService } from '../services/article.service';
import { API_BASE } from '../config/api.config';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  articles: any[] = [];
  loading = true;

  constructor(
    private router: Router,
    private articleService: ArticleService
  ) {}

  ngOnInit() {
    this.loadPublishedArticles();
  }

  loadPublishedArticles() {
    this.loading = true;
    this.articleService.getArticles().subscribe({
      next: (articles: any[]) => {
        // Show only published articles for public view
        this.articles = articles.filter(article => article.published);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading articles:', err);
        // Fallback to mock data
        this.articles = [
          {
            _id: '1',
            title: 'Welcome to Our CMS',
            body: 'This is a sample article showcasing our content management system. You can create, edit, and manage articles with role-based permissions.',
            author: { fullName: 'Admin User' },
            createdAt: new Date('2025-01-01'),
            published: true
          },
          {
            _id: '2',
            title: 'Getting Started with Role-Based Access',
            body: 'Learn how our role-based access control system works to secure your content and manage user permissions effectively.',
            author: { fullName: 'Manager User' },
            createdAt: new Date('2025-01-02'),
            published: true
          }
        ];
        this.loading = false;
      }
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getExcerpt(content: string, maxLength: number = 150): string {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
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
    event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgZmlsbD0iI2Y0ZjRmNCIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K';
  }
}
