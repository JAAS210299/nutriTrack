import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserProfile {
  id?: number;
  weightKg?: number;
  heightCm?: number;
  age?: number;
  sex?: 'male' | 'female';
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  objective?: 'deficit' | 'maintenance' | 'surplus';
  bmr?: number;
  tdee?: number;
  targetCalories?: number;
  targetProteinG?: number;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = 'http://localhost:3000/api/users/profile';

  constructor(private http: HttpClient) {}

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(this.apiUrl);
  }

  updateProfile(profile: UserProfile): Observable<UserProfile> {
    return this.http.put<UserProfile>(this.apiUrl, profile);
  }

  calculateBMR(weightKg: number, heightCm: number, age: number, sex: string): number {
    if (sex === 'male') {
      return 88.362 + (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * age);
    } else {
      return 447.593 + (9.247 * weightKg) + (3.098 * heightCm) - (4.330 * age);
    }
  }

  calculateTDEE(bmr: number, activityLevel: string): number {
    const multipliers: { [key: string]: number } = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };
    return bmr * (multipliers[activityLevel] || 1.2);
  }

  calculateTargetCalories(tdee: number, objective: string): number {
    const adjustments: { [key: string]: number } = {
      deficit: -500,
      maintenance: 0,
      surplus: 500
    };
    return tdee + (adjustments[objective] || 0);
  }
}
