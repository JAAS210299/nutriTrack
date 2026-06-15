import { environment } from '../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LogEntry {
  id: number;
  food: { id: number; name: string; caloriesPer100g: number; proteinG: number; carbsG: number; fatG: number };
  mealType: string;
  quantityG: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface DailyLog {
  id: number;
  logDate: string;
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  entries: LogEntry[];
}

@Injectable({ providedIn: 'root' })
export class NutritionService {
  private http = inject(HttpClient);
  private api = environment.apiUrl + '/nutrition';

  getToday(): Observable<DailyLog> {
    return this.http.get<DailyLog>(`${this.api}/today`);
  }

  getByDate(date: string): Observable<DailyLog> {
    return this.http.get<DailyLog>(`${this.api}/date/${date}`);
  }

  addEntry(foodId: number, mealType: string, quantityG: number): Observable<DailyLog> {
    return this.http.post<DailyLog>(`${this.api}/entries`, { foodId, mealType, quantityG });
  }

  removeEntry(entryId: number): Observable<DailyLog> {
    return this.http.delete<DailyLog>(`${this.api}/entries/${entryId}`);
  }

  getHistory(): Observable<DailyLog[]> {
    return this.http.get<DailyLog[]>(`${this.api}/history`);
  }
}
