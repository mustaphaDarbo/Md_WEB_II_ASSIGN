import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ArticleService } from '../services/article.service';

@Component({
  selector: 'app-article-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './article-view.component.html',
  styleUrls: ['./article-view.component.css']
})
export class ArticleViewComponent implements OnInit {
  article: any = null;
  loading = true;
  relatedArticles: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private articleService: ArticleService
  ) {}

  ngOnInit() {
    const articleId = this.route.snapshot.paramMap.get('id');
    if (articleId) {
      this.loadArticle(articleId);
    }
  }

  loadArticle(id: string) {
    this.loading = true;
    this.articleService.getArticleById(id).subscribe({
      next: (article: any) => {
        this.article = article;
        this.loadRelatedArticles();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading article:', err);
        // Fallback to mock data
        this.article = {
          _id: id,
          title: 'Sample Article',
          body: 'This is a sample article content. In a real application, this would contain the full article text with proper formatting, images, and rich content.',
          author: { fullName: 'Admin User' },
          createdAt: new Date('2025-01-01'),
          published: true
        };
        this.loading = false;
      }
    });
  }

  loadRelatedArticles() {
    this.articleService.getArticles().subscribe({
      next: (articles: any[]) => {
        // Get other published articles, excluding current one
        this.relatedArticles = articles
          .filter(a => a.published && a._id !== this.article._id)
          .slice(0, 3);
      },
      error: (err) => {
        console.error('Error loading related articles:', err);
        this.relatedArticles = [];
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

  goBack() {
    this.router.navigate(['/']);
  }
}
