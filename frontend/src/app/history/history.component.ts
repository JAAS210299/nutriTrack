import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NutritionService } from '../services/nutrition.service';
import type { DailyLog } from '../services/nutrition.service';
import { NavbarComponent } from '../shared/navbar.component';
import { ProfileService } from '../services/profile.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <main class="page" role="main">
      <h1>Historial semanal</h1>
      <p class="subtitle">Últimos 7 días registrados</p>

      <div *ngIf="!logs.length" class="empty" aria-live="polite">No hay registros todavía.</div>

      <div class="history-list" role="list">
        <div *ngFor="let log of logs" class="history-card" role="listitem">
          <div class="card-date">
            <span class="day">{{ log.logDate | date:'EEEE':'':'es' }}</span>
            <span class="full-date">{{ log.logDate | date:'d MMM':'':'es' }}</span>
          </div>
          <div class="card-bar-wrap" aria-label="{{ log.totalCalories | number:'1.0-0' }} de {{ targetCalories | number:'1.0-0' }} kcal">
            <div class="card-bar">
              <div class="bar-fill" [style.width.%]="getPercent(log.totalCalories)" [class.over]="log.totalCalories > targetCalories"></div>
            </div>
            <span class="bar-label">{{ log.totalCalories | number:'1.0-0' }} / {{ targetCalories | number:'1.0-0' }} kcal</span>
          </div>
          <div class="card-macros">
            <span>P: {{ log.totalProteinG | number:'1.0-0' }}g</span>
            <span>C: {{ log.totalCarbsG | number:'1.0-0' }}g</span>
            <span>G: {{ log.totalFatG | number:'1.0-0' }}g</span>
          </div>
        </div>
      </div>
    </main>
  `,
  styles: [`
    .page { max-width:700px; margin:0 auto; padding:2rem 1rem; }
    h1 { font-size:1.75rem; font-weight:700; color:#0F2D5E; margin:0 0 4px; }
    .subtitle { color:#6B7280; margin:0 0 1.5rem; }
    .empty { text-align:center; padding:3rem; color:#9CA3AF; background:white; border-radius:12px; }
    .history-list { display:flex; flex-direction:column; gap:1rem; }
    .history-card { background:white; border-radius:12px; padding:1.25rem; box-shadow:0 1px 4px rgba(0,0,0,0.08); display:grid; grid-template-columns:100px 1fr auto; align-items:center; gap:1rem; }
    .day { display:block; font-weight:600; color:#1F2937; text-transform:capitalize; }
    .full-date { font-size:13px; color:#6B7280; }
    .card-bar-wrap { flex:1; }
    .card-bar { background:#E5E7EB; border-radius:6px; height:10px; margin-bottom:4px; overflow:hidden; }
    .bar-fill { height:100%; background:#1A56B0; border-radius:6px; transition:width 0.5s; }
    .bar-fill.over { background:#EF4444; }
    .bar-label { font-size:13px; color:#374151; font-weight:500; }
    .card-macros { display:flex; flex-direction:column; gap:2px; font-size:12px; color:#6B7280; text-align:right; }
    @media (max-width:640px) { .history-card { grid-template-columns:1fr; } .card-macros { flex-direction:row; gap:8px; } }
  `]
})
export class HistoryComponent implements OnInit {
  private nutritionService = inject(NutritionService);
  private profileService = inject(ProfileService);
  private cdr = inject(ChangeDetectorRef);

  logs: DailyLog[] = [];
  targetCalories = 2000;

  getPercent(calories: number): number {
    return Math.min(Math.round((calories / this.targetCalories) * 100), 100);
  }

  ngOnInit(): void {
    this.nutritionService.getHistory().subscribe({
      next: logs => { this.logs = logs; this.cdr.detectChanges(); },
      error: () => {}
    });
    this.profileService.getProfile().subscribe({
      next: p => { if (p.targetCalories) this.targetCalories = p.targetCalories; this.cdr.detectChanges(); },
      error: () => {}
    });
  }
}
