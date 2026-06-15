import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar" role="navigation" aria-label="Navegación principal">
      <div class="navbar-brand">
        <a routerLink="/dashboard" class="brand-link" aria-label="NutriTrack - Inicio">
          <span class="brand-icon" aria-hidden="true">🥗</span>
          <span class="brand-name">NutriTrack</span>
        </a>
      </div>
      <ul class="navbar-links" role="list">
        <li>
          <a routerLink="/dashboard" routerLinkActive="active" aria-label="Dashboard">
            <span aria-hidden="true">📊</span> Dashboard
          </a>
        </li>
        <li>
          <a routerLink="/diary" routerLinkActive="active" aria-label="Diario de comidas">
            <span aria-hidden="true">📝</span> Diario
          </a>
        </li>
        <li>
          <a routerLink="/history" routerLinkActive="active" aria-label="Historial semanal">
            <span aria-hidden="true">📈</span> Historial
          </a>
        </li>
        <li>
          <a routerLink="/profile" routerLinkActive="active" aria-label="Mi perfil">
            <span aria-hidden="true">👤</span> Perfil
          </a>
        </li>
      </ul>
      <button class="logout-btn" (click)="logout()" aria-label="Cerrar sesión">
        <span aria-hidden="true">🚪</span> Salir
      </button>
    </nav>
  `,
  styles: [`
    .navbar {
      display: flex; align-items: center; gap: 1rem;
      background: #0F2D5E; padding: 0 1.5rem; height: 60px;
      position: sticky; top: 0; z-index: 100;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    .brand-link { display:flex; align-items:center; gap:8px; text-decoration:none; }
    .brand-icon { font-size:24px; }
    .brand-name { color:white; font-size:18px; font-weight:700; }
    .navbar-links { display:flex; list-style:none; gap:0.25rem; margin:0; padding:0; flex:1; justify-content:center; }
    .navbar-links a {
      display:flex; align-items:center; gap:6px;
      color:rgba(255,255,255,0.75); text-decoration:none;
      padding:6px 14px; border-radius:6px; font-size:14px; font-weight:500;
      transition:all 0.2s;
    }
    .navbar-links a:hover, .navbar-links a.active {
      background:rgba(255,255,255,0.15); color:white;
    }
    .logout-btn {
      background:rgba(255,255,255,0.1); color:white; border:none;
      padding:6px 14px; border-radius:6px; cursor:pointer;
      font-size:14px; font-weight:500; display:flex; align-items:center; gap:6px;
      transition:background 0.2s;
    }
    .logout-btn:hover { background:rgba(239,68,68,0.7); }
    @media (max-width:640px) {
      .brand-name { display:none; }
      .navbar-links a span:not([aria-hidden]) { display:none; }
    }
  `]
})
export class NavbarComponent {
  private auth = inject(AuthService);
  logout() { this.auth.logout(); }
}
