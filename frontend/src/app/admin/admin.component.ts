import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../shared/navbar.component';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <main class="page" role="main">
      <h1>Panel de Administración</h1>

      <!-- Stats -->
      <section class="stats" aria-label="Estadísticas generales">
        <div class="stat-card" role="article">
          <div class="stat-value">{{ stats?.totalUsers || 0 }}</div>
          <div class="stat-label">Usuarios totales</div>
        </div>
        <div class="stat-card" role="article">
          <div class="stat-value">{{ stats?.verifiedUsers || 0 }}</div>
          <div class="stat-label">Usuarios verificados</div>
        </div>
        <div class="stat-card" role="article">
          <div class="stat-value">{{ stats?.adminUsers || 0 }}</div>
          <div class="stat-label">Administradores</div>
        </div>
        <div class="stat-card" role="article">
          <div class="stat-value">{{ totalFoods }}</div>
          <div class="stat-label">Alimentos en BD</div>
        </div>
      </section>

      <!-- Tabs -->
      <div class="tabs" role="tablist">
        <button role="tab" [class.active]="tab === 'foods'" (click)="tab='foods'" [attr.aria-selected]="tab==='foods'">🥗 Alimentos</button>
        <button role="tab" [class.active]="tab === 'users'" (click)="tab='users'" [attr.aria-selected]="tab==='users'">👥 Usuarios</button>
      </div>

      <!-- Foods tab -->
      <section *ngIf="tab === 'foods'" aria-label="Gestión de alimentos">
        <div class="toolbar">
          <input type="search" [(ngModel)]="foodQuery" (ngModelChange)="searchFoods()" placeholder="Buscar alimento..." class="search-input" aria-label="Buscar alimento" />
          <button class="btn-primary" (click)="openFoodForm()" aria-label="Añadir nuevo alimento">+ Nuevo alimento</button>
        </div>

        <!-- Food form -->
        <div class="form-card" *ngIf="showFoodForm" role="form" aria-label="Formulario de alimento">
          <h3>{{ editingFood?.id ? 'Editar' : 'Nuevo' }} alimento</h3>
          <div class="form-grid">
            <div class="form-group">
              <label for="fname">Nombre</label>
              <input id="fname" type="text" [(ngModel)]="foodForm.name" class="form-input" />
            </div>
            <div class="form-group">
              <label for="fcal">Calorías / 100g</label>
              <input id="fcal" type="number" [(ngModel)]="foodForm.caloriesPer100g" class="form-input" />
            </div>
            <div class="form-group">
              <label for="fpro">Proteína (g)</label>
              <input id="fpro" type="number" [(ngModel)]="foodForm.proteinG" class="form-input" />
            </div>
            <div class="form-group">
              <label for="fcar">Carbohidratos (g)</label>
              <input id="fcar" type="number" [(ngModel)]="foodForm.carbsG" class="form-input" />
            </div>
            <div class="form-group">
              <label for="ffat">Grasas (g)</label>
              <input id="ffat" type="number" [(ngModel)]="foodForm.fatG" class="form-input" />
            </div>
          </div>
          <div class="form-actions">
            <button class="btn-primary" (click)="saveFood()" aria-label="Guardar alimento">Guardar</button>
            <button class="btn-secondary" (click)="showFoodForm=false" aria-label="Cancelar">Cancelar</button>
          </div>
        </div>

        <table class="data-table" role="table" aria-label="Lista de alimentos">
          <thead>
            <tr>
              <th scope="col">Nombre</th>
              <th scope="col">Kcal/100g</th>
              <th scope="col">Prot.</th>
              <th scope="col">Carbs.</th>
              <th scope="col">Grasas</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let food of foods">
              <td>{{ food.name }}</td>
              <td>{{ food.caloriesPer100g }}</td>
              <td>{{ food.proteinG }}g</td>
              <td>{{ food.carbsG }}g</td>
              <td>{{ food.fatG }}g</td>
              <td>
                <button class="btn-icon" (click)="editFood(food)" [attr.aria-label]="'Editar ' + food.name">✏️</button>
                <button class="btn-icon danger" (click)="deleteFood(food.id)" [attr.aria-label]="'Eliminar ' + food.name">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- Users tab -->
      <section *ngIf="tab === 'users'" aria-label="Gestión de usuarios">
        <table class="data-table" role="table" aria-label="Lista de usuarios">
          <thead>
            <tr>
              <th scope="col">Email</th>
              <th scope="col">Rol</th>
              <th scope="col">Verificado</th>
              <th scope="col">Registro</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users">
              <td>{{ user.email }}</td>
              <td><span class="badge" [class.admin]="user.role === 'admin'">{{ user.role }}</span></td>
              <td><span class="verified" [class.yes]="user.isVerified">{{ user.isVerified ? '✓' : '✗' }}</span></td>
              <td>{{ user.createdAt | date:'dd/MM/yyyy' }}</td>
              <td>
                <button
                  class="btn-role"
                  (click)="toggleRole(user)"
                  [attr.aria-label]="'Cambiar rol de ' + user.email"
                >
                  {{ user.role === 'admin' ? '→ User' : '→ Admin' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>
  `,
  styles: [`
    .page { max-width:1000px; margin:0 auto; padding:2rem 1rem; }
    h1 { font-size:1.75rem; font-weight:700; color:#0F2D5E; margin:0 0 1.5rem; }
    h3 { font-size:1.1rem; font-weight:600; margin:0 0 1rem; color:#1F2937; }
    .stats { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:1rem; margin-bottom:1.5rem; }
    .stat-card { background:white; border-radius:12px; padding:1.25rem; text-align:center; box-shadow:0 1px 4px rgba(0,0,0,0.08); }
    .stat-value { font-size:2rem; font-weight:700; color:#1A56B0; }
    .stat-label { font-size:13px; color:#6B7280; margin-top:4px; }
    .tabs { display:flex; gap:4px; margin-bottom:1rem; background:#F3F4F6; padding:4px; border-radius:10px; width:fit-content; }
    .tabs button { padding:8px 20px; border:none; border-radius:8px; cursor:pointer; font-size:14px; font-weight:500; background:none; color:#6B7280; transition:all 0.2s; }
    .tabs button.active { background:white; color:#0F2D5E; box-shadow:0 1px 4px rgba(0,0,0,0.1); }
    .toolbar { display:flex; gap:1rem; margin-bottom:1rem; align-items:center; }
    .search-input { flex:1; padding:10px 14px; border:1.5px solid #E5E7EB; border-radius:8px; font-size:14px; }
    .search-input:focus { outline:none; border-color:#1A56B0; }
    .form-card { background:white; border-radius:12px; padding:1.5rem; margin-bottom:1rem; box-shadow:0 1px 4px rgba(0,0,0,0.08); }
    .form-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:1rem; margin-bottom:1rem; }
    .form-group { display:flex; flex-direction:column; gap:4px; }
    .form-group label { font-size:13px; font-weight:500; color:#374151; }
    .form-input { padding:8px 12px; border:1.5px solid #E5E7EB; border-radius:6px; font-size:14px; font-family:inherit; }
    .form-input:focus { outline:none; border-color:#1A56B0; }
    .form-actions { display:flex; gap:10px; }
    .data-table { width:100%; border-collapse:collapse; background:white; border-radius:12px; overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,0.08); }
    .data-table th { background:#F9FAFB; padding:12px 16px; text-align:left; font-size:12px; font-weight:600; color:#6B7280; text-transform:uppercase; letter-spacing:.05em; border-bottom:1px solid #E5E7EB; }
    .data-table td { padding:12px 16px; font-size:14px; color:#374151; border-bottom:1px solid #F3F4F6; }
    .data-table tr:last-child td { border-bottom:none; }
    .data-table tr:hover td { background:#F9FAFB; }
    .btn-primary { background:#1A56B0; color:white; border:none; padding:10px 18px; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; white-space:nowrap; }
    .btn-primary:hover { background:#0F2D5E; }
    .btn-secondary { background:#F3F4F6; color:#374151; border:none; padding:10px 18px; border-radius:8px; font-size:14px; cursor:pointer; }
    .btn-icon { background:none; border:none; cursor:pointer; font-size:16px; padding:4px 8px; border-radius:4px; }
    .btn-icon:hover { background:#F3F4F6; }
    .btn-icon.danger:hover { background:#FEE2E2; }
    .btn-role { background:#EFF6FF; color:#1A56B0; border:1px solid #BFDBFE; padding:4px 12px; border-radius:6px; font-size:13px; cursor:pointer; font-weight:500; }
    .btn-role:hover { background:#DBEAFE; }
    .badge { padding:2px 10px; border-radius:10px; font-size:12px; font-weight:500; background:#F3F4F6; color:#6B7280; }
    .badge.admin { background:#EFF6FF; color:#1A56B0; }
    .verified { font-weight:700; color:#EF4444; }
    .verified.yes { color:#10B981; }
    @media (max-width:640px) { .toolbar { flex-direction:column; } .data-table { font-size:12px; } .data-table th, .data-table td { padding:8px; } }
  `]
})
export class AdminComponent implements OnInit {
  private adminService = inject(AdminService);
  private cdr = inject(ChangeDetectorRef);

  tab = 'foods';
  stats: any = null;
  users: any[] = [];
  foods: any[] = [];
  totalFoods = 0;
  foodQuery = '';
  showFoodForm = false;
  editingFood: any = null;
  foodForm = { name: '', caloriesPer100g: 0, proteinG: 0, carbsG: 0, fatG: 0 };

  ngOnInit(): void {
    this.loadStats();
    this.loadFoods();
    this.loadUsers();
  }

  loadStats(): void {
    this.adminService.getStats().subscribe({
      next: s => { this.stats = s; this.cdr.detectChanges(); },
      error: () => {}
    });
  }

  loadUsers(): void {
    this.adminService.getUsers().subscribe({
      next: u => { this.users = u; this.cdr.detectChanges(); },
      error: () => {}
    });
  }

  loadFoods(): void {
    this.adminService.getFoods(this.foodQuery).subscribe({
      next: r => { this.foods = r.items; this.totalFoods = r.total; this.cdr.detectChanges(); },
      error: () => {}
    });
  }

  searchFoods(): void { this.loadFoods(); }

  openFoodForm(): void {
    this.editingFood = null;
    this.foodForm = { name: '', caloriesPer100g: 0, proteinG: 0, carbsG: 0, fatG: 0 };
    this.showFoodForm = true;
  }

  editFood(food: any): void {
    this.editingFood = food;
    this.foodForm = { name: food.name, caloriesPer100g: food.caloriesPer100g, proteinG: food.proteinG, carbsG: food.carbsG, fatG: food.fatG };
    this.showFoodForm = true;
  }

  saveFood(): void {
    if (this.editingFood?.id) {
      this.adminService.updateFood(this.editingFood.id, this.foodForm).subscribe({
        next: () => { this.showFoodForm = false; this.loadFoods(); },
        error: () => {}
      });
    } else {
      this.adminService.createFood(this.foodForm).subscribe({
        next: () => { this.showFoodForm = false; this.loadFoods(); },
        error: () => {}
      });
    }
  }

  deleteFood(id: number): void {
    if (!confirm('¿Eliminar este alimento?')) return;
    this.adminService.deleteFood(id).subscribe({
      next: () => this.loadFoods(),
      error: () => {}
    });
  }

  toggleRole(user: any): void {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    this.adminService.updateUserRole(user.id, newRole).subscribe({
      next: updated => {
        user.role = updated.role;
        this.loadStats();
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }
}
