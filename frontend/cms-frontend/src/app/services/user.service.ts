import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { API_BASE } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class UserService {
  private API = `${API_BASE}/users`;

  constructor(private http: HttpClient) {}

  private headers() {
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${localStorage.getItem('token')}`
      })
    };
  }

  createUser(userData: any): Observable<any> {
    console.log('Creating user:', userData);
    return this.http.post(this.API, userData, this.headers());
  }

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.API, this.headers());
  }

  getUserById(id: string) {
    return this.http.get(`${this.API}/${id}`, this.headers());
  }

  updateUser(id: string, data: any) {
    return this.http.put(`${this.API}/${id}`, data, this.headers());
  }

  deleteUser(id: string): Observable<any> {
    console.log('Deleting user:', id);
    return this.http.delete(`${this.API}/${id}`, this.headers());
  }
}
