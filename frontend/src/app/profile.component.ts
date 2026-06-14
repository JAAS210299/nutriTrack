import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfileService } from './services/profile.service';
import type { UserProfile } from './services/profile.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="profile-container">
      <div class="profile-card">
        <h2>Mi Perfil</h2>
        <form [formGroup]="profileForm" (ngSubmit)="saveProfile()">
          <div class="form-row">
            <div class="form-group">
              <label for="age">Edad</label>
              <input id="age" type="number" formControlName="age" min="10" max="120" />
            </div>
            <div class="form-group">
              <label for="sex">Sexo</label>
              <select id="sex" formControlName="sex">
                <option value="">-- Selecciona --</option>
                <option value="male">Masculino</option>
                <option value="female">Femenino</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="height">Altura (cm)</label>
              <input id="height" type="number" formControlName="heightCm" min="100" max="250" step="0.1" />
            </div>
            <div class="form-group">
              <label for="weight">Peso (kg)</label>
              <input id="weight" type="number" formControlName="weightKg" min="20" max="300" step="0.1" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="activity">Nivel de Actividad</label>
              <select id="activity" formControlName="activityLevel">
                <option value="sedentary">Sedentario</option>
                <option value="light">Ligero</option>
                <option value="moderate">Moderado</option>
                <option value="active">Activo</option>
                <option value="very_active">Muy Activo</option>
              </select>
            </div>
            <div class="form-group">
              <label for="objective">Objetivo</label>
              <select id="objective" formControlName="objective">
                <option value="deficit">Pérdida de peso</option>
                <option value="maintenance">Mantenimiento</option>
                <option value="surplus">Ganancia de peso</option>
              </select>
            </div>
          </div>
          <div class="stats-container" *ngIf="stats">
            <div class="stat">
              <span class="stat-label">BMR:</span>
              <span class="stat-value">{{ stats.bmr | number:'1.0-0' }} kcal/día</span>
            </div>
            <div class="stat">
              <span class="stat-label">TDEE:</span>
              <span class="stat-value">{{ stats.tdee | number:'1.0-0' }} kcal/día</span>
            </div>
            <div class="stat highlight">
              <span class="stat-label">Objetivo de Calorías:</span>
              <span class="stat-value">{{ stats.targetCalories | number:'1.0-0' }} kcal/día</span>
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" [disabled]="saving || !profileForm.valid">
              {{ saving ? 'Guardando...' : 'Guardar Perfil' }}
            </button>
          </div>
          <div *ngIf="successMessage" class="success-message">{{ successMessage }}</div>
          <div *ngIf="errorMessage" class="error-message">{{ errorMessage }}</div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .profile-container { display:flex; justify-content:center; align-items:center; min-height:100vh; background:linear-gradient(135deg,#667eea 0%,#764ba2 100%); padding:20px; }
    .profile-card { background:white; border-radius:12px; padding:40px; box-shadow:0 10px 40px rgba(0,0,0,0.1); max-width:600px; width:100%; }
    h2 { margin-bottom:30px; color:#333; text-align:center; }
    .form-row { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px; }
    .form-group { display:flex; flex-direction:column; }
    label { font-weight:600; margin-bottom:8px; color:#555; font-size:14px; }
    input, select { padding:12px; border:1px solid #ddd; border-radius:6px; font-size:14px; font-family:inherit; }
    input:focus, select:focus { outline:none; border-color:#667eea; box-shadow:0 0 0 3px rgba(102,126,234,0.1); }
    .stats-container { background:#f8f9fa; border-radius:8px; padding:20px; margin:25px 0; border-left:4px solid #667eea; }
    .stat { display:flex; justify-content:space-between; padding:10px 0; color:#666; }
    .stat.highlight { background:#fff; padding:12px; border-radius:6px; font-weight:600; color:#667eea; margin-top:10px; }
    .form-actions { display:flex; gap:10px; margin-top:30px; }
    button { flex:1; padding:12px; border:none; border-radius:6px; font-size:16px; font-weight:600; cursor:pointer; background:linear-gradient(135deg,#667eea 0%,#764ba2 100%); color:white; transition:all 0.3s; }
    button:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 5px 20px rgba(102,126,234,0.4); }
    button:disabled { opacity:0.6; cursor:not-allowed; }
    .success-message { margin-top:15px; padding:12px; background:#d4edda; color:#155724; border-radius:6px; text-align:center; }
    .error-message { margin-top:15px; padding:12px; background:#f8d7da; color:#721c24; border-radius:6px; text-align:center; }
    @media (max-width:600px) { .profile-card { padding:20px; } .form-row { grid-template-columns:1fr; } }
  `]
})
export class ProfileComponent implements OnInit {
  private profileService: ProfileService = inject(ProfileService);
  private fb: FormBuilder = inject(FormBuilder);
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  profileForm: FormGroup;
  saving = false;
  successMessage = '';
  errorMessage = '';
  stats: { bmr: number; tdee: number; targetCalories: number } | null = null;

  constructor() {
    this.profileForm = this.fb.group({
      age: ['', [Validators.required, Validators.min(10), Validators.max(120)]],
      sex: ['', Validators.required],
      heightCm: ['', [Validators.required, Validators.min(100), Validators.max(250)]],
      weightKg: ['', [Validators.required, Validators.min(20), Validators.max(300)]],
      activityLevel: ['sedentary', Validators.required],
      objective: ['maintenance', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadProfile();
    this.profileForm.valueChanges.subscribe(() => this.calculateStats());
  }

  loadProfile(): void {
    this.profileService.getProfile().subscribe({
      next: (profile: UserProfile) => {
        this.profileForm.patchValue(profile);
        this.calculateStats();
      },
      error: () => console.log('No profile yet')
    });
  }

  calculateStats(): void {
    const v = this.profileForm.value;
    if (v.age && v.sex && v.heightCm && v.weightKg) {
      const bmr = this.profileService.calculateBMR(v.weightKg, v.heightCm, v.age, v.sex);
      const tdee = this.profileService.calculateTDEE(bmr, v.activityLevel ?? 'sedentary');
      const targetCalories = this.profileService.calculateTargetCalories(tdee, v.objective ?? 'maintenance');
      this.stats = { bmr, tdee, targetCalories };
    }
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;
    this.saving = true;
    this.successMessage = '';
    this.errorMessage = '';

    const v = this.profileForm.value;
    const bmr = this.profileService.calculateBMR(v.weightKg, v.heightCm, v.age, v.sex);
    const tdee = this.profileService.calculateTDEE(bmr, v.activityLevel ?? 'sedentary');
    const targetCalories = this.profileService.calculateTargetCalories(tdee, v.objective ?? 'maintenance');

    const profileData: UserProfile = { ...v, bmr, tdee, targetCalories };

    this.profileService.updateProfile(profileData).subscribe({
      next: () => {
        this.saving = false;
        this.successMessage = '✓ Perfil guardado correctamente';
        this.cdr.detectChanges();
        setTimeout(() => { this.successMessage = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: () => {
        this.saving = false;
        this.errorMessage = '✗ Error al guardar el perfil';
        this.cdr.detectChanges();
      }
    });
  }
}
