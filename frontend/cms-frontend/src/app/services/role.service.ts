import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API_BASE } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class RoleService {

  private API = `${API_BASE}/roles`;

  constructor(private http: HttpClient) {}

  private headers() {
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${localStorage.getItem('token')}`
      })
    };
  }

  getRoles() {
    return this.http.get<any[]>(this.API, this.headers());
  }

  createRole(data: any) {
    return this.http.post(this.API, data, this.headers());
  }
  
  updateRole(id: string, data: any) {
    return this.http.put(`${this.API}/${id}`, data, this.headers());
  }

  deleteRole(id: string) {
    return this.http.delete(`${this.API}/${id}`, this.headers());
  }
}
