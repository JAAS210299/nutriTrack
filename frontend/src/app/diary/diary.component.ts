import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NutritionService } from '../services/nutrition.service';
import { FoodsService } from '../services/foods.service';
import { HttpClient } from '@angular/common/http';
import type { DailyLog } from '../services/nutrition.service';
import type { Food } from '../services/foods.service';
import { NavbarComponent } from '../shared/navbar.component';
import { SpinnerComponent } from '../shared/spinner.component';
import { environment } from '../../environments/environment';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface SearchResult {
  id?: number;
  name: string;
  caloriesPer100g: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  source?: string;
}

@Component({
  selector: 'app-diary',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, SpinnerComponent],
  template: `
    <app-navbar></app-navbar>
    <main class="page" role="main">
      <h1>Diario de comidas</h1>
      <p class="date">{{ today | date:'EEEE, d MMMM' }}</p>

      <section class="add-section" aria-label="Añadir alimento">
        <div class="section-tabs">
          <button [class.active]="addMode === 'search'" (click)="addMode='search'">🔍 Buscar alimento</button>
          <button [class.active]="addMode === 'manual'" (click)="addMode='manual'">✏️ Añadir manual</button>
        </div>

        <!-- BÚSQUEDA -->
        <div *ngIf="addMode === 'search'">
          <div class="search-wrap">
            <input
              type="search"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearch($event)"
              placeholder="Buscar alimento (local o internet)..."
              class="search-input"
              aria-label="Buscar alimento"
              autocomplete="off"
            />
            <div class="search-status" *ngIf="searching" aria-live="polite">
              <span class="mini-spinner"></span> Buscando...
            </div>
            <div class="search-results" *ngIf="searchResults.length && showResults" role="listbox">
              <div
                *ngFor="let food of searchResults"
                class="result-item"
                (click)="selectFood(food)"
                role="option"
                tabindex="0"
                (keydown.enter)="selectFood(food)"
              >
                <div class="result-main">
                  <span class="result-name">{{ food.name }}</span>
                  <span class="result-source" *ngIf="food.source === 'openfoodfacts'">🌐 Open Food Facts</span>
                  <span class="result-source local" *ngIf="!food.source">📦 Local</span>
                </div>
                <span class="result-macros">{{ food.caloriesPer100g }} kcal · P{{ food.proteinG }}g · C{{ food.carbsG }}g · G{{ food.fatG }}g</span>
              </div>
              <div *ngIf="searchResults.length === 0 && !searching" class="no-results">
                No se encontraron resultados
              </div>
            </div>
          </div>
        </div>

        <!-- MANUAL -->
        <div *ngIf="addMode === 'manual'" class="manual-form">
          <div class="form-grid">
            <div class="form-group full">
              <label for="mname">Nombre del alimento</label>
              <input id="mname" type="text" [(ngModel)]="manualFood.name" placeholder="Ej: Tortilla española" class="form-input" />
            </div>
            <div class="form-group">
              <label for="mcal">Calorías / 100g</label>
              <input id="mcal" type="number" [(ngModel)]="manualFood.caloriesPer100g" min="0" class="form-input" />
            </div>
            <div class="form-group">
              <label for="mpro">Proteína (g)</label>
              <input id="mpro" type="number" [(ngModel)]="manualFood.proteinG" min="0" class="form-input" />
            </div>
            <div class="form-group">
              <label for="mcar">Carbohidratos (g)</label>
              <input id="mcar" type="number" [(ngModel)]="manualFood.carbsG" min="0" class="form-input" />
            </div>
            <div class="form-group">
              <label for="mfat">Grasas (g)</label>
              <input id="mfat" type="number" [(ngModel)]="manualFood.fatG" min="0" class="form-input" />
            </div>
          </div>
          <button class="btn-secondary" (click)="selectManualFood()" [disabled]="!manualFood.name">
            Usar este alimento →
          </button>
        </div>

        <!-- FORMULARIO CANTIDAD -->
        <div class="add-form" *ngIf="selectedFood" aria-label="Formulario para añadir alimento">
          <div class="selected-food">
            <strong>{{ selectedFood.name }}</strong>
            <span class="badge">{{ selectedFood.caloriesPer100g }} kcal/100g</span>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="quantity">Cantidad (g)</label>
              <input id="quantity" type="number" [(ngModel)]="quantity" min="1" max="2000" class="form-input" />
            </div>
            <div class="form-group">
              <label for="mealType">Momento del día</label>
              <select id="mealType" [(ngModel)]="mealType" class="form-input">
                <option value="breakfast">Desayuno</option>
                <option value="lunch">Comida</option>
                <option value="dinner">Cena</option>
                <option value="snack">Snack</option>
              </select>
            </div>
          </div>
          <div class="preview" *ngIf="quantity > 0" aria-live="polite">
            <span><strong>{{ (selectedFood.caloriesPer100g * quantity / 100) | number:'1.0-0' }} kcal</strong></span>
            <span>P: {{ (selectedFood.proteinG * quantity / 100) | number:'1.1-1' }}g</span>
            <span>C: {{ (selectedFood.carbsG * quantity / 100) | number:'1.1-1' }}g</span>
            <span>G: {{ (selectedFood.fatG * quantity / 100) | number:'1.1-1' }}g</span>
          </div>
          <div class="form-actions">
            <button class="btn-primary" (click)="addEntry()" [disabled]="adding">
              {{ adding ? 'Añadiendo...' : '+ Añadir al diario' }}
            </button>
            <button class="btn-secondary" (click)="clearSelection()">Cancelar</button>
          </div>
        </div>
      </section>

      <section class="log-section" aria-label="Registro del día">
        <div class="totals">
          <div class="total-item">
            <span class="total-label">Total calorías</span>
            <span class="total-value calories">{{ log?.totalCalories || 0 | number:'1.0-0' }} kcal</span>
          </div>
          <div class="total-item">
            <span class="total-label">Proteína</span>
            <span class="total-value">{{ log?.totalProteinG || 0 | number:'1.0-0' }}g</span>
          </div>
          <div class="total-item">
            <span class="total-label">Carbohidratos</span>
            <span class="total-value">{{ log?.totalCarbsG || 0 | number:'1.0-0' }}g</span>
          </div>
          <div class="total-item">
            <span class="total-label">Grasas</span>
            <span class="total-value">{{ log?.totalFatG || 0 | number:'1.0-0' }}g</span>
          </div>
        </div>

        <app-spinner [show]="loadingLog" message="Cargando tu diario..."></app-spinner>

        <div *ngIf="!loadingLog && !log?.entries?.length" class="empty">No hay entradas para hoy.</div>

        <div *ngFor="let meal of meals" class="meal-group" role="article">
          <h3 class="meal-title">{{ mealLabels[meal.type] }}</h3>
          <div *ngFor="let entry of meal.entries" class="entry">
            <div class="entry-info">
              <span class="entry-name">{{ entry.food.name }}</span>
              <span class="entry-detail">{{ entry.quantityG }}g · {{ entry.calories | number:'1.0-0' }} kcal</span>
            </div>
            <div class="entry-macros">
              <span>P{{ entry.proteinG | number:'1.0-0' }}g</span>
              <span>C{{ entry.carbsG | number:'1.0-0' }}g</span>
              <span>G{{ entry.fatG | number:'1.0-0' }}g</span>
            </div>
            <button class="btn-remove" (click)="removeEntry(entry.id)" aria-label="Eliminar {{ entry.food.name }}">✕</button>
          </div>
        </div>
      </section>
    </main>
  `,
  styles: [`
    .page { max-width:800px; margin:0 auto; padding:2rem 1rem; }
    h1 { font-size:1.75rem; font-weight:700; color:#0F2D5E; margin:0 0 4px; }
    .date { color:#6B7280; margin:0 0 1.5rem; }
    .add-section, .log-section { background:white; border-radius:12px; padding:1.5rem; margin-bottom:1.5rem; box-shadow:0 1px 4px rgba(0,0,0,0.08); }
    .section-tabs { display:flex; gap:4px; margin-bottom:1.25rem; background:#F3F4F6; padding:4px; border-radius:10px; width:fit-content; }
    .section-tabs button { padding:7px 16px; border:none; border-radius:7px; cursor:pointer; font-size:13px; font-weight:500; background:none; color:#6B7280; transition:all 0.2s; }
    .section-tabs button.active { background:white; color:#0F2D5E; box-shadow:0 1px 4px rgba(0,0,0,0.1); }
    .search-wrap { position:relative; }
    .search-input { width:100%; padding:10px 14px; border:1.5px solid #E5E7EB; border-radius:8px; font-size:15px; outline:none; box-sizing:border-box; }
    .search-input:focus { border-color:#1A56B0; box-shadow:0 0 0 3px rgba(26,86,176,0.1); }
    .search-status { display:flex; align-items:center; gap:8px; font-size:13px; color:#6B7280; padding:8px 0; }
    .mini-spinner { width:14px; height:14px; border:2px solid #E5E7EB; border-top-color:#1A56B0; border-radius:50%; animation:spin 0.7s linear infinite; display:inline-block; }
    @keyframes spin { to { transform:rotate(360deg); } }
    .search-results { position:absolute; top:100%; left:0; right:0; background:white; border:1px solid #E5E7EB; border-radius:8px; box-shadow:0 4px 16px rgba(0,0,0,0.1); z-index:50; max-height:300px; overflow-y:auto; }
    .result-item { padding:10px 14px; cursor:pointer; transition:background 0.15s; border-bottom:1px solid #F9FAFB; }
    .result-item:hover { background:#F0F4FF; }
    .result-main { display:flex; align-items:center; gap:8px; margin-bottom:2px; }
    .result-name { font-weight:500; color:#1F2937; font-size:14px; flex:1; }
    .result-source { font-size:11px; padding:2px 6px; border-radius:8px; background:#EFF6FF; color:#1A56B0; white-space:nowrap; }
    .result-source.local { background:#F0FDF4; color:#166534; }
    .result-macros { font-size:12px; color:#9CA3AF; }
    .no-results { padding:12px 14px; color:#9CA3AF; font-size:13px; text-align:center; }
    .manual-form { display:flex; flex-direction:column; gap:1rem; }
    .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
    .form-group { display:flex; flex-direction:column; gap:4px; }
    .form-group.full { grid-column:1/-1; }
    .form-group label { font-size:13px; font-weight:500; color:#374151; }
    .form-input { padding:10px; border:1.5px solid #E5E7EB; border-radius:8px; font-size:14px; font-family:inherit; }
    .form-input:focus { outline:none; border-color:#1A56B0; }
    .selected-food { display:flex; align-items:center; gap:10px; padding:10px 14px; background:#EFF6FF; border-radius:8px; margin:1rem 0; }
    .badge { background:#1A56B0; color:white; padding:2px 8px; border-radius:10px; font-size:12px; }
    .form-row { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
    .preview { display:flex; gap:1rem; padding:10px 14px; background:#F9FAFB; border-radius:8px; margin-top:0.75rem; font-size:13px; color:#374151; flex-wrap:wrap; }
    .form-actions { display:flex; gap:10px; margin-top:1rem; }
    .btn-primary { background:#1A56B0; color:white; border:none; padding:10px 20px; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; }
    .btn-primary:hover:not(:disabled) { background:#0F2D5E; }
    .btn-primary:disabled { opacity:0.6; cursor:not-allowed; }
    .btn-secondary { background:#F3F4F6; color:#374151; border:none; padding:10px 20px; border-radius:8px; font-size:14px; font-weight:500; cursor:pointer; }
    .btn-secondary:hover:not(:disabled) { background:#E5E7EB; }
    .btn-secondary:disabled { opacity:0.5; cursor:not-allowed; }
    .totals { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; margin-bottom:1.5rem; padding-bottom:1.5rem; border-bottom:1px solid #E5E7EB; }
    .total-label { font-size:12px; color:#6B7280; display:block; }
    .total-value { font-size:1.25rem; font-weight:700; color:#1F2937; }
    .total-value.calories { color:#1A56B0; }
    .empty { text-align:center; padding:2rem; color:#9CA3AF; }
    .meal-group { margin-bottom:1.25rem; }
    .meal-title { font-size:13px; font-weight:600; color:#1A56B0; text-transform:uppercase; letter-spacing:.05em; margin:0 0 8px; }
    .entry { display:flex; align-items:center; gap:1rem; padding:10px 0; border-bottom:1px solid #F3F4F6; }
    .entry-info { flex:1; }
    .entry-name { display:block; font-weight:500; color:#1F2937; font-size:14px; }
    .entry-detail { font-size:12px; color:#9CA3AF; }
    .entry-macros { display:flex; gap:8px; font-size:12px; color:#6B7280; }
    .btn-remove { background:none; border:none; color:#EF4444; cursor:pointer; font-size:16px; padding:4px 8px; border-radius:4px; }
    .btn-remove:hover { background:#FEE2E2; }
    @media (max-width:640px) { .form-row,.form-grid { grid-template-columns:1fr; } .totals { grid-template-columns:1fr 1fr; } }
  `]
})
export class DiaryComponent implements OnInit {
  private nutritionService = inject(NutritionService);
  private foodsService = inject(FoodsService);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  log: DailyLog | null = null;
  today = new Date();
  searchQuery = '';
  searchResults: SearchResult[] = [];
  showResults = false;
  selectedFood: SearchResult | null = null;
  quantity = 100;
  mealType = 'breakfast';
  adding = false;
  loadingLog = true;
  searching = false;
  addMode: 'search' | 'manual' = 'search';

  manualFood = { name: '', caloriesPer100g: 0, proteinG: 0, carbsG: 0, fatG: 0 };

  private searchSubject = new Subject<string>();

  mealLabels: Record<string, string> = {
    breakfast: '🌅 Desayuno', lunch: '☀️ Comida', dinner: '🌙 Cena', snack: '🍎 Snack',
  };

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
    this.loadToday();
    this.searchSubject.pipe(debounceTime(400), distinctUntilChanged()).subscribe(q => {
      if (q.length < 2) { this.searchResults = []; this.showResults = false; return; }
      this.performSearch(q);
    });
  }

  loadToday(): void {
    this.nutritionService.getToday().subscribe({
      next: log => { this.log = log; this.loadingLog = false; this.cdr.detectChanges(); },
      error: () => { this.loadingLog = false; }
    });
  }

  onSearch(query: string): void {
    this.searchSubject.next(query);
  }

  performSearch(query: string): void {
    this.searching = true;
    this.cdr.detectChanges();

    // Buscar en local primero
    this.foodsService.search(query).subscribe({
      next: res => {
        const localResults: SearchResult[] = res.items.map((f: Food) => ({ ...f, source: undefined }));

        if (localResults.length >= 5) {
          this.searchResults = localResults;
          this.showResults = true;
          this.searching = false;
          this.cdr.detectChanges();
        } else {
          // Si hay pocos resultados locales, buscar en Open Food Facts
          this.http.get<SearchResult[]>(`${environment.apiUrl}/foods/search-external?query=${encodeURIComponent(query)}`).subscribe({
            next: external => {
              const combined = [...localResults, ...external].slice(0, 12);
              this.searchResults = combined;
              this.showResults = true;
              this.searching = false;
              this.cdr.detectChanges();
            },
            error: () => {
              this.searchResults = localResults;
              this.showResults = true;
              this.searching = false;
              this.cdr.detectChanges();
            }
          });
        }
      },
      error: () => { this.searching = false; }
    });
  }

  selectFood(food: SearchResult): void {
    this.selectedFood = food;
    this.showResults = false;
    this.searchQuery = food.name;
  }

  selectManualFood(): void {
    if (!this.manualFood.name) return;
    this.selectedFood = { ...this.manualFood };
  }

  clearSelection(): void {
    this.selectedFood = null;
    this.searchQuery = '';
    this.quantity = 100;
    this.manualFood = { name: '', caloriesPer100g: 0, proteinG: 0, carbsG: 0, fatG: 0 };
  }

  addEntry(): void {
    if (!this.selectedFood || this.quantity < 1) return;
    this.adding = true;

    const addWithFoodId = (foodId: number) => {
      this.nutritionService.addEntry(foodId, this.mealType, this.quantity).subscribe({
        next: log => {
          this.log = log;
          this.clearSelection();
          this.adding = false;
          this.cdr.detectChanges();
        },
        error: () => { this.adding = false; }
      });
    };

    if (this.selectedFood.id) {
      addWithFoodId(this.selectedFood.id);
    } else {
      // Importar desde Open Food Facts o crear manual
      this.http.post<Food>(`${environment.apiUrl}/foods/import-external`, this.selectedFood).subscribe({
        next: food => addWithFoodId(food.id),
        error: () => { this.adding = false; }
      });
    }
  }

  removeEntry(entryId: number): void {
    this.nutritionService.removeEntry(entryId).subscribe({
      next: log => { this.log = log; this.cdr.detectChanges(); },
      error: () => {}
    });
  }
}
