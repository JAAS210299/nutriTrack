import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Food {
  id: number;
  name: string;
  caloriesPer100g: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  isCustom: boolean;
}

export interface FoodsResponse {
  items: Food[];
  total: number;
  page: number;
  pages: number;
}

@Injectable({ providedIn: 'root' })
export class FoodsService {
  private http = inject(HttpClient);
  private api = 'http://localhost:3000/api/foods';

  search(query: string = '', page: number = 1): Observable<FoodsResponse> {
    return this.http.get<FoodsResponse>(`${this.api}?query=${query}&page=${page}&limit=20`);
  }

  create(food: Partial<Food>): Observable<Food> {
    return this.http.post<Food>(this.api, food);
  }

  update(id: number, food: Partial<Food>): Observable<Food> {
    return this.http.put<Food>(`${this.api}/${id}`, food);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
