import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  api = 'https://md-web-ii-assign.onrender.com/api/auth';

  constructor(private http: HttpClient) {}

  register(data: any) {
    return this.http.post(`${this.api}/register`, data);
  }

  login(data: any) {
    return this.http.post(`${this.api}/login`, data);
  }

  saveUser(data: any) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }

  getUser() {
    return JSON.parse(localStorage.getItem('user')!);
  }

  logout() {
    localStorage.clear();
  }
}
