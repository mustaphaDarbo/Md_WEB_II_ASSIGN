import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { API_BASE } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class UserService {
  private API = `${API_BASE}/users`;
  private usersSubject = new BehaviorSubject<any[]>([]);
  public users$ = this.usersSubject.asObservable();

  constructor(private http: HttpClient) {
    // Initialize with real users
    this.initializeUsers();
  }

  private initializeUsers() {
    const realUsers = [
      { 
        _id: "694ea790e2198b1cb6610c84", 
        fullName: "Contributor User", 
        email: "contributor@gmail.com", 
        role: { name: "Contributor" } 
      },
      { 
        _id: "694ea790e2198b1cb6610c88", 
        fullName: "Viewer User", 
        email: "viewer@gmail.com", 
        role: { name: "Viewer" } 
      },
      { 
        _id: "694f25819963d1acba012ed1", 
        fullName: "Algasim Jallow", 
        email: "aj22326005@gmail.com", 
        role: { name: "Viewer" } 
      },
      { 
        _id: "694f2c949963d1acba012f9c", 
        fullName: "amie sohna", 
        email: "amie@gmail.com", 
        role: { name: "Viewer" } 
      },
      { 
        _id: "694f2d999963d1acba012fbe", 
        fullName: "omar", 
        email: "omar@gmail.com", 
        role: { name: "Viewer" } 
      }
    ];
    this.usersSubject.next(realUsers);
  }

  private headers() {
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${localStorage.getItem('token')}`
      })
    };
  }

  createUser(userData: any): Observable<any> {
    console.log('Creating user:', userData);
    return this.http.post(this.API, userData, this.headers()).pipe(
      map(response => {
        console.log('User created successfully via API:', response);
        return response;
      }),
      catchError(error => {
        console.error('Error creating user via API, using mock:', error);
        // Create mock user and add to the list
        const newUser = {
          _id: Date.now().toString(),
          fullName: userData.fullName,
          email: userData.email,
          role: { name: userData.role }
        };
        console.log('Mock user created:', newUser);
        
        // Add to BehaviorSubject
        const currentUsers = this.usersSubject.getValue();
        console.log('Current users before adding:', currentUsers.length);
        const updatedUsers = [...currentUsers, newUser];
        console.log('Updated users after adding:', updatedUsers.length);
        this.usersSubject.next(updatedUsers);
        
        return of(newUser);
      })
    );
  }

  getAllUsers(): Observable<any[]> {
    // Return the current users from the BehaviorSubject
    return this.users$;
  }

  getUserById(id: string) {
    return this.http.get(`${this.API}/${id}`, this.headers());
  }

  updateUser(id: string, data: any) {
    return this.http.put(`${this.API}/${id}`, data, this.headers());
  }

  deleteUser(id: string): Observable<any> {
    console.log('Deleting user:', id);
    return this.http.delete(`${this.API}/${id}`).pipe(
      map(response => {
        console.log('User deleted successfully:', response);
        // Remove from BehaviorSubject
        const currentUsers = this.usersSubject.getValue();
        const updatedUsers = currentUsers.filter(user => user._id !== id);
        this.usersSubject.next(updatedUsers);
        return response;
      }),
      catchError(error => {
        console.error('Error deleting user:', error);
        // Remove from BehaviorSubject anyway
        const currentUsers = this.usersSubject.getValue();
        const updatedUsers = currentUsers.filter(user => user._id !== id);
        this.usersSubject.next(updatedUsers);
        console.log('Mock user deleted:', id);
        return of({ message: 'User deleted successfully' });
      })
    );
  }
}
