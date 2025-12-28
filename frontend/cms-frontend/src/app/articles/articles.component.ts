import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ArticleService } from '../services/article.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.css']
})
export class ArticlesComponent implements OnInit {

  articles: any[] = [];
  filteredArticles: any[] = [];
  searchTerm: string = '';
  user: any = null;
  viewMode: 'create' | 'library' = 'create';
  isSuperAdmin: boolean = false;
  private API = 'http://localhost:5000/api/articles';

  newArticle = {
    title: '',
    body: '',
    published: false
  };

  editingArticleId: string | null = null;
  
  articleImageUrl: string | null = null;
  articleImageFile: File | null = null;

  @ViewChild('profileFileInput') profileFileInput?: ElementRef<HTMLInputElement>;

  get profilePhotoUrl(): string | null {
    const raw = this.user?.profilePhoto;
    if (!raw) return null;

    if (typeof raw !== 'string') return null;
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
    if (raw.startsWith('data:image/')) return raw;
    return null;
  }

  get userInitials(): string {
    const name = (this.user?.fullName || '').trim();
    if (!name) return 'U';
    const parts = name.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] || 'U';
    const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] || '') : '';
    return (first + last).toUpperCase();
  }

  hasPermission(permission: string): boolean {
    return this.user?.permissions?.[permission] === true;
  }

  constructor(
    private articleService: ArticleService,
    private router: Router,
    private route: ActivatedRoute,
    public auth: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    console.log('Articles component initialized');
    
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    console.log('Token exists:', !!token);
    console.log('User string:', userStr);
    
    if (userStr) {
      this.user = JSON.parse(userStr);
      console.log('Parsed user:', this.user);
      console.log('User role:', this.user?.role);
      console.log('User role name:', this.user?.role?.name);
      this.isSuperAdmin = this.user?.role?.name === 'SuperAdmin';
      console.log('Is SuperAdmin:', this.isSuperAdmin);
    }
    
    if (!token) {
      console.error('No token found - user not logged in');
      alert('Please login to create articles');
      this.router.navigate(['/login']);
      return;
    }
    
    // Check if token is expired
    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      console.log('Decoded token payload:', tokenPayload);
      console.log('Token permissions:', tokenPayload.permissions);
      console.log('Has create permission:', tokenPayload.permissions?.create);
      console.log('User role from token:', tokenPayload.role);
      console.log('All permissions object:', JSON.stringify(tokenPayload.permissions, null, 2));
      console.log('Token expires at:', new Date(tokenPayload.exp * 1000));
      console.log('Current time:', new Date());
      console.log('Token expired:', tokenPayload.exp * 1000 < Date.now());
      
      if (tokenPayload.exp * 1000 < Date.now()) {
        console.error('Token has expired');
        alert('Your session has expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.router.navigate(['/login']);
        return;
      }
      
      // Check specific permissions
      if (!tokenPayload.permissions?.create) {
        console.error('User does not have create permission');
        console.error('Available permissions:', Object.keys(tokenPayload.permissions || {}));
        alert(`Your role (${tokenPayload.role}) does not have permission to create articles.\n\nCurrent role: ${tokenPayload.role}\nAvailable permissions: ${Object.keys(tokenPayload.permissions || {}).join(', ')}\n\nTo create articles, login as:\n• SuperAdmin (admin@cms.com / admin123)\n• Manager \n• Contributor\n\nPlease logout and login with a higher privilege account.`);
        return;
      }
      
    } catch (err) {
      console.error('Error decoding token:', err);
      alert('Invalid token. Please login again.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.router.navigate(['/login']);
      return;
    }
    
    this.loadArticles();
    this.auth.currentUser$.subscribe(user => {
      this.user = user;
      this.isSuperAdmin = user?.role?.name === 'SuperAdmin';
      console.log('Current user:', user);
      console.log('User permissions:', user?.permissions);
      console.log('User role:', user?.role);
      console.log('Updated isSuperAdmin:', this.isSuperAdmin);
    });
  }

  loadArticles() {
    this.articleService.getArticles().subscribe({
      next: (res) => {
        this.articles = res;
        this.filteredArticles = res;
      },
      error: (err) => {
        console.error('Error loading articles:', err);
      }
    });
  }

  searchArticles() {
    if (!this.searchTerm) {
      this.filteredArticles = this.articles;
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredArticles = this.articles.filter(article =>
        article.title.toLowerCase().includes(term) ||
        article.body.toLowerCase().includes(term)
      );
    }
  }

  createArticle() {
    console.log('createArticle called');
    console.log('newArticle:', this.newArticle);
    console.log('editingArticleId:', this.editingArticleId);
    
    if (!this.newArticle.title.trim() || !this.newArticle.body.trim()) {
      alert('Please enter both title and content');
      return;
    }

    console.log('Sending article data:', this.newArticle);
    console.log('Has image:', !!this.articleImageUrl);
    
    if (this.editingArticleId) {
      // Update existing article
      const articleData = {
        ...this.newArticle,
        image: this.articleImageUrl || null
      };
      console.log('Updating article with data:', articleData);
      this.articleService.updateArticle(this.editingArticleId, articleData).subscribe({
        next: (response) => {
          console.log('Article updated successfully:', response);
          alert('Article updated successfully!');
          this.resetForm();
          this.loadArticles();
          this.setViewMode('library');
        },
        error: (err) => {
          console.error('Error updating article:', err);
          alert('Failed to update article. Please try again.');
        }
      });
    } else {
      // Create new article
      const articleData = {
        ...this.newArticle,
        image: this.articleImageUrl || null
      };
      console.log('Creating article with data:', articleData);
      console.log('Has image:', !!articleData.image);
      console.log('Image length:', articleData.image?.length || 0);
      this.articleService.createArticle(articleData).subscribe({
        next: (response) => {
          console.log('Article created successfully:', response);
          alert('Article created successfully!');
          this.resetForm();
          this.loadArticles();
          this.setViewMode('library');
        },
        error: (err) => {
          console.error('Error creating article:', err);
          alert('Failed to create article. Please try again.');
        }
      });
    }
  }

  resetForm() {
    this.newArticle = {
      title: '',
      body: '',
      published: false
    };
    this.editingArticleId = null;
    this.articleImageUrl = null;
    this.articleImageFile = null;
  }

  onArticleImageSelected(event: any) {
    console.log('onArticleImageSelected called');
    const file = event.target.files[0];
    console.log('Selected file:', file);
    if (file) {
      this.articleImageFile = file;
      console.log('File size:', file.size, 'Type:', file.type);
      const reader = new FileReader();
      reader.onload = (e) => {
        this.articleImageUrl = e.target?.result as string;
        console.log('Image converted to base64, length:', this.articleImageUrl?.length);
      };
      reader.readAsDataURL(file);
    } else {
      console.log('No file selected');
    }
  }

  removeArticleImage() {
    this.articleImageUrl = null;
    this.articleImageFile = null;
  }

  publishArticle(id: string) {
    this.articleService.publishArticle(id).subscribe({
      next: () => {
        alert('Article published successfully!');
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
        alert('Article unpublished successfully!');
        this.loadArticles();
      },
      error: (err) => {
        console.error('Error unpublishing article:', err);
        alert('Failed to unpublish article');
      }
    });
  }

  editArticle(article: any) {
    // Switch to create mode and populate form with article data
    this.viewMode = 'create';
    this.newArticle = {
      title: article.title,
      body: article.body,
      published: article.published
    };
    this.editingArticleId = article._id;
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteArticle(id: string) {
    console.log('deleteArticle called with id:', id);
    if (confirm('Are you sure you want to delete this article?')) {
      console.log('Sending delete request for article:', id);
      this.articleService.deleteArticle(id).subscribe({
        next: (response) => {
          console.log('Delete response:', response);
          alert('Article deleted successfully!');
          this.loadArticles();
        },
        error: (err) => {
          console.error('Error deleting article:', err);
          console.error('Error details:', err.error);
          alert('Failed to delete article: ' + (err.error?.message || err.message));
        }
      });
    }
  }

  triggerProfilePicker() {
    const input = this.profileFileInput?.nativeElement;
    if (input) input.click();
  }

  onProfileFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      this.auth.updateProfilePhoto(dataUrl).subscribe({
        next: () => {
          this.user = this.auth.getCurrentUser();
          input.value = '';
        },
        error: (err) => {
          console.error(err);
          alert(err.error?.message || 'Failed to upload photo');
          input.value = '';
        }
      });
    };
    reader.readAsDataURL(file);
  }

  setViewMode(mode: 'create' | 'library') {
    this.viewMode = mode;
  }

  logout() {
    this.auth.logout().subscribe({
      next: () => {
        window.location.href = '/login';
      },
      error: (err) => {
        console.error('Logout failed:', err);
        window.location.href = '/login';
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
}
