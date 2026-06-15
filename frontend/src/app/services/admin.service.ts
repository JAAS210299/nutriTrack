import { environment } from '../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/users/admin/all`);
  }

  updateUserRole(id: number, role: string): Observable<any> {
    return this.http.put(`${this.api}/users/admin/${id}/role`, { role });
  }

  getStats(): Observable<any> {
    return this.http.get(`${this.api}/users/admin/stats`);
  }

  getFoods(query = '', page = 1): Observable<any> {
    return this.http.get(`${this.api}/foods?query=${query}&page=${page}&limit=20`);
  }

  createFood(food: any): Observable<any> {
    return this.http.post(`${this.api}/foods`, food);
  }

  updateFood(id: number, food: any): Observable<any> {
    return this.http.put(`${this.api}/foods/${id}`, food);
  }

  deleteFood(id: number): Observable<any> {
    return this.http.delete(`${this.api}/foods/${id}`);
  }
}
