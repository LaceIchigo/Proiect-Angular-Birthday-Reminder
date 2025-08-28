import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { Router } from '@angular/router';

interface User {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient, private router: Router) {
    this.checkAuthStatus();
  }

  private checkAuthStatus(): void {
    const token = localStorage.getItem('authToken');
    this.isAuthenticatedSubject.next(!!token);
  }

  login(email: string, password: string, rememberMe: boolean): Observable<any> {
    return this.http.get<User[]>(`${this.apiUrl}/users?email=${email}&password=${password}`).pipe(
      map(users => {
        if (users.length > 0) {
          return users[0];
        } else {
          throw new Error('Invalid credentials');
        }
      }),
      tap(user => {
        if (rememberMe) {
          localStorage.setItem('authToken', user.token);
          localStorage.setItem('userData', JSON.stringify(user));
        } else {
          sessionStorage.setItem('authToken', user.token);
          sessionStorage.setItem('userData', JSON.stringify(user));
        }
        this.isAuthenticatedSubject.next(true);
        this.router.navigate(['/birthdays']);
      })
    );
  }
  register(userData: any): Observable<any> {
    // Pregătim datele pentru JsonServer
    const registrationData = {
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      token: 'token-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
    };

    return this.http.post(`${this.apiUrl}/users`, registrationData).pipe(
      tap({
        next: (response: any) => {
          console.log('Registration successful:', response);
          this.router.navigate(['/login'], {
            queryParams: { registered: true }
          });
        },
        error: (error) => {
          console.error('Registration error:', error);
          throw new Error('Registration failed: ' + (error.error?.message || error.message));
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userData');
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  getToken(): string | null {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  }

  getUserData(): any {
    const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }
}