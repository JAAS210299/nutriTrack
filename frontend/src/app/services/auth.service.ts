import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.checkToken();
  }

  register(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { email, password });
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<{ accessToken: string }>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => {
          if (response.accessToken) {
            this.saveToken(response.accessToken);
            this.isAuthenticatedSubject.next(true);
            this.getMe().subscribe(user => {
              this.currentUserSubject.next(user);
            });
          }
        })
      );
  }

  verifyEmail(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/verify?token=${token}`);
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  getMe(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`);
  }

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private checkToken(): void {
    if (this.isAuthenticated()) {
      this.isAuthenticatedSubject.next(true);
      this.getMe().subscribe(
        user => this.currentUserSubject.next(user),
        () => this.logout()
      );
    }
  }
}
