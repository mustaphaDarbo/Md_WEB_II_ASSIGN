import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {

  private API = `${API_BASE}/articles`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    console.log('getHeaders called - token:', token);
    
    if (!token) {
      console.error('No token found in localStorage');
      return new HttpHeaders();
    }
    
    // For FormData, let browser set Content-Type automatically
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getArticles(): Observable<any[]> {
    return this.http.get<any[]>(this.API, {
      headers: this.getHeaders()
    });
  }

  getArticleById(id: string): Observable<any> {
    return this.http.get<any>(`${this.API}/${id}`, {
      headers: this.getHeaders()
    });
  }

  createArticle(data: any, isFormData: boolean = false): Observable<any> {
    console.log('Creating article with data:', data);
    // When sending FormData, do not set content-type explicitly; Authorization header is fine
    return this.http.post(this.API, data, {
      headers: this.getHeaders()
    });
  }

  updateArticle(id: string, data: any, isFormData: boolean = false): Observable<any> {
    return this.http.put(`${this.API}/${id}`, data, {
      headers: this.getHeaders()
    });
  }

  deleteArticle(id: string): Observable<any> {
    return this.http.delete(`${this.API}/${id}`, {
      headers: this.getHeaders()
    });
  }

  publishArticle(id: string): Observable<any> {
    return this.http.put(`${this.API}/${id}/publish`, {}, {
      headers: this.getHeaders()
    });
  }

  unpublishArticle(id: string): Observable<any> {
    return this.http.put(`${this.API}/${id}/unpublish`, {}, {
      headers: this.getHeaders()
    });
  }
}
