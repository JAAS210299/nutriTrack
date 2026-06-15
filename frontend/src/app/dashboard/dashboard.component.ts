import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NutritionService } from '../services/nutrition.service';
import type { DailyLog } from '../services/nutrition.service';
import { NavbarComponent } from '../shared/navbar.component';
import { ProfileService } from '../services/profile.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <main class="page" role="main">
      <div class="header">
        <h1>Dashboard</h1>
        <p class="date" aria-live="polite">{{ today | date:'EEEE, d MMMM':'':'es' }}</p>
      </div>

      <section class="cards" aria-label="Resumen calórico del día">
        <div class="card calories" role="article">
          <div class="card-label">Calorías consumidas</div>
          <div class="card-value" aria-label="{{ log?.totalCalories || 0 }} kilocalorías">
            {{ log?.totalCalories || 0 | number:'1.0-0' }}
          </div>
          <div class="card-sub">de {{ targetCalories | number:'1.0-0' }} kcal objetivo</div>
        </div>
        <div class="card protein" role="article">
          <div class="card-label">Proteína</div>
          <div class="card-value">{{ log?.totalProteinG || 0 | number:'1.0-0' }}g</div>
          <div class="card-sub">de {{ targetProtein | number:'1.0-0' }}g mínimo</div>
        </div>
        <div class="card carbs" role="article">
          <div class="card-label">Carbohidratos</div>
          <div class="card-value">{{ log?.totalCarbsG || 0 | number:'1.0-0' }}g</div>
        </div>
        <div class="card fat" role="article">
          <div class="card-label">Grasas</div>
          <div class="card-value">{{ log?.totalFatG || 0 | number:'1.0-0' }}g</div>
        </div>
      </section>

      <section class="progress-section" aria-label="Progreso calórico">
        <div class="progress-label">
          <span>Progreso calórico</span>
          <span>{{ caloriePercent }}%</span>
        </div>
        <div class="progress-bar" role="progressbar" [attr.aria-valuenow]="caloriePercent" aria-valuemin="0" aria-valuemax="100">
          <div class="progress-fill" [style.width.%]="caloriePercent" [class.over]="caloriePercent > 100"></div>
        </div>
      </section>

      <section class="meals-section" aria-label="Comidas del día">
        <div class="section-header">
          <h2>Comidas de hoy</h2>
          <a routerLink="/diary" class="btn-primary" aria-label="Ir al diario de comidas">+ Añadir comida</a>
        </div>
        <div *ngIf="!log?.entries?.length" class="empty" aria-live="polite">
          No has registrado comidas hoy. <a routerLink="/diary">¡Empieza ahora!</a>
        </div>
        <div *ngFor="let meal of meals" class="meal-group" role="article">
          <h3 class="meal-title">{{ mealLabels[meal.type] }}</h3>
          <div class="meal-entries">
            <div *ngFor="let entry of meal.entries" class="entry">
              <span class="entry-name">{{ entry.food.name }}</span>
              <span class="entry-qty">{{ entry.quantityG }}g</span>
              <span class="entry-kcal">{{ entry.calories | number:'1.0-0' }} kcal</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  `,
  styles: [`
    .page { max-width:900px; margin:0 auto; padding:2rem 1rem; }
    .header { margin-bottom:1.5rem; }
    h1 { font-size:1.75rem; font-weight:700; color:#0F2D5E; margin:0; }
    .date { color:#6B7280; margin:4px 0 0; }
    .cards { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:1rem; margin-bottom:1.5rem; }
    .card { background:white; border-radius:12px; padding:1.25rem; box-shadow:0 1px 4px rgba(0,0,0,0.08); border-top:4px solid #ddd; }
    .calories { border-color:#1A56B0; }
    .protein { border-color:#059669; }
    .carbs { border-color:#7C3AED; }
    .fat { border-color:#D97706; }
    .card-label { font-size:12px; color:#6B7280; font-weight:500; text-transform:uppercase; letter-spacing:.05em; }
    .card-value { font-size:2rem; font-weight:700; color:#1F2937; margin:4px 0; }
    .card-sub { font-size:12px; color:#9CA3AF; }
    .progress-section { background:white; border-radius:12px; padding:1.25rem; margin-bottom:1.5rem; box-shadow:0 1px 4px rgba(0,0,0,0.08); }
    .progress-label { display:flex; justify-content:space-between; font-size:14px; font-weight:500; color:#374151; margin-bottom:8px; }
    .progress-bar { background:#E5E7EB; border-radius:8px; height:12px; overflow:hidden; }
    .progress-fill { height:100%; background:#1A56B0; border-radius:8px; transition:width 0.5s ease; }
    .progress-fill.over { background:#EF4444; }
    .meals-section { background:white; border-radius:12px; padding:1.25rem; box-shadow:0 1px 4px rgba(0,0,0,0.08); }
    .section-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; }
    h2 { font-size:1.1rem; font-weight:600; color:#1F2937; margin:0; }
    .btn-primary { background:#1A56B0; color:white; padding:8px 16px; border-radius:8px; text-decoration:none; font-size:14px; font-weight:500; }
    .btn-primary:hover { background:#0F2D5E; }
    .empty { text-align:center; padding:2rem; color:#9CA3AF; }
    .empty a { color:#1A56B0; }
    .meal-group { margin-bottom:1rem; }
    .meal-title { font-size:14px; font-weight:600; color:#1A56B0; margin:0 0 8px; text-transform:uppercase; letter-spacing:.05em; }
    .entry { display:flex; gap:1rem; padding:8px 0; border-bottom:1px solid #F3F4F6; align-items:center; }
    .entry-name { flex:1; font-size:14px; color:#374151; }
    .entry-qty { font-size:13px; color:#9CA3AF; }
    .entry-kcal { font-size:14px; font-weight:600; color:#1F2937; }
    @media (max-width:640px) { .cards { grid-template-columns:1fr 1fr; } }
  `]
})
export class DashboardComponent implements OnInit {
  private nutritionService = inject(NutritionService);
  private profileService = inject(ProfileService);
  private cdr = inject(ChangeDetectorRef);

  log: DailyLog | null = null;
  today = new Date();
  targetCalories = 2000;
  targetProtein = 150;

  mealLabels: Record<string, string> = {
    breakfast: '🌅 Desayuno',
    lunch: '☀️ Comida',
    dinner: '🌙 Cena',
    snack: '🍎 Snack',
  };

  get caloriePercent(): number {
    if (!this.targetCalories) return 0;
    return Math.min(Math.round(((this.log?.totalCalories || 0) / this.targetCalories) * 100), 110);
  }

  get meals() {
    if (!this.log?.entries) return [];
    const order = ['breakfast', 'lunch', 'dinner', 'snack'];
    const grouped: Record<string, typeof this.log.entries> = {};
    for (const e of this.log.entries) {
      if (!grouped[e.mealType]) grouped[e.mealType] = [];
      grouped[e.mealType].push(e);
    }
    return order.filter(t => grouped[t]?.length).map(t => ({ type: t, entries: grouped[t] }));
  }

  ngOnInit(): void {
    this.nutritionService.getToday().subscribe({
      next: log => { this.log = log; this.cdr.detectChanges(); },
      error: () => {}
    });
    this.profileService.getProfile().subscribe({
      next: p => {
        if (p.targetCalories) this.targetCalories = p.targetCalories;
        if (p.targetProteinG) this.targetProtein = p.targetProteinG;
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }
}
