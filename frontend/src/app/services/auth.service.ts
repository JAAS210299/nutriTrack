import { environment } from '../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private apiUrl = environment.apiUrl + '/auth';
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() { this.checkToken(); }

  getCurrentUser() { return this.currentUserSubject.value; }

  register(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { email, password });
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<{ accessToken: string; user: any }>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => {
        if (response.accessToken) {
          this.saveToken(response.accessToken);
          this.currentUserSubject.next(response.user);
          this.isAuthenticatedSubject.next(true);
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

  saveToken(token: string): void { localStorage.setItem('token', token); }
  getToken(): string | null { return localStorage.getItem('token'); }
  isAuthenticated(): boolean { return !!this.getToken(); }

  private checkToken(): void {
    if (this.isAuthenticated()) {
      this.isAuthenticatedSubject.next(true);
      this.getMe().subscribe({
        next: user => { this.currentUserSubject.next(user); },
        error: () => this.logout()
      });
    }
  }
}
