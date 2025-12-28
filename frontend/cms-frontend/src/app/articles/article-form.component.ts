import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ArticleService } from '../services/article.service';

@Component({
  selector: 'app-article-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './article-form.component.html',
  styleUrls: ['./article-form.component.css']
})
export class ArticleFormComponent implements OnInit {
  article = {
    title: '',
    body: '',
    published: false
  };
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  isEdit = false;
  articleId: string | null = null;
  loading = false;
  user: any = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private articleService: ArticleService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });

    // Check if we're editing an article
    this.articleId = this.route.snapshot.paramMap.get('id');
    if (this.articleId) {
      this.isEdit = true;
      this.loadArticle();
    }
  }

  loadArticle() {
    if (!this.articleId) return;
    
    this.loading = true;
    this.articleService.getArticleById(this.articleId).subscribe({
      next: (article: any) => {
        this.article = {
          title: article.title,
          body: article.body,
          published: article.published
        };
        // existing image URL if provided by backend (backend uses `image`)
        if (article.image) {
          this.imagePreview = article.image;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading article:', err);
        this.loading = false;
        alert('Failed to load article');
        this.router.navigate(['/articles']);
      }
    });
  }

  hasPermission(permission: string): boolean {
    return this.user?.permissions?.[permission] === true;
  }

  saveArticle() {
    if (!this.article.title.trim() || !this.article.body.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    this.loading = true;

    // Always use FormData when image is selected or when editing with existing image
    let payload: any;
    let useFormData = false;

    if (this.selectedImage || (this.isEdit && this.article.image)) {
      useFormData = true;
      const fd = new FormData();
      fd.append('title', this.article.title);
      fd.append('body', this.article.body);
      fd.append('published', String(this.article.published));
      
      if (this.selectedImage) {
        fd.append('image', this.selectedImage, this.selectedImage.name);
        console.log('Adding image to FormData:', this.selectedImage.name);
      }
      
      payload = fd;
      console.log('Using FormData for article creation');
    } else {
      // Use JSON for articles without images
      payload = this.article;
      console.log('Using JSON for article creation');
    }

    console.log('Sending article payload:', payload);

    if (this.isEdit && this.articleId) {
      // Update existing article
      this.articleService.updateArticle(this.articleId, payload, useFormData).subscribe({
        next: () => {
          this.router.navigate(['/articles']);
        },
        error: (err) => {
          console.error('Error updating article:', err);
          this.loading = false;
          alert('Failed to update article: ' + (err.error?.message || err.message));
        }
      });
    } else {
      // Create new article
      this.articleService.createArticle(payload, useFormData).subscribe({
        next: (response) => {
          console.log('Article created successfully:', response);
          this.router.navigate(['/articles']);
        },
        error: (err) => {
          console.error('Error creating article:', err);
          this.loading = false;
          alert('Failed to create article: ' + (err.error?.message || err.message));
        }
      });
    }
  }

  saveAsDraft() {
    this.article.published = false;
    this.saveArticle();
  }

  publish() {
    if (!this.hasPermission('publish')) {
      alert('You do not have permission to publish articles');
      return;
    }
    this.article.published = true;
    this.saveArticle();
  }

  cancel() {
    this.router.navigate(['/articles']);
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.selectedImage = null;
      this.imagePreview = null;
      return;
    }
    const file = input.files[0];
    this.selectedImage = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
}
