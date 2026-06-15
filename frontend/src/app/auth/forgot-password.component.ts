import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container" role="main">
      <div class="auth-card">
        <div class="logo" aria-hidden="true">🥗</div>
        <h1>NutriTrack</h1>
        <h2>Recuperar contraseña</h2>
        <p class="subtitle">Introduce tu email y te enviaremos un enlace para restablecer tu contraseña.</p>

        <form (ngSubmit)="onSubmit()" *ngIf="!sent" aria-label="Formulario de recuperación">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              [(ngModel)]="email"
              name="email"
              required
              placeholder="tu@email.com"
              class="form-input"
              [disabled]="loading"
              aria-required="true"
            />
          </div>
          <div *ngIf="error" class="error-msg" role="alert">{{ error }}</div>
          <button type="submit" class="btn-primary" [disabled]="loading || !email" aria-label="Enviar enlace de recuperación">
            {{ loading ? 'Enviando...' : 'Enviar enlace' }}
          </button>
        </form>

        <div *ngIf="sent" class="success-state" aria-live="polite">
          <div class="success-icon" aria-hidden="true">📧</div>
          <h3>Email enviado</h3>
          <p>Revisa tu bandeja de entrada y sigue el enlace para restablecer tu contraseña.</p>
          <p class="hint">Si no lo ves, revisa la carpeta de spam.</p>
        </div>

        <a routerLink="/login" class="back-link" aria-label="Volver al inicio de sesión">← Volver al login</a>
      </div>
    </div>
  `,
  styles: [`
    .auth-container { min-height:100vh; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,#0F2D5E 0%,#1A56B0 100%); padding:1rem; }
    .auth-card { background:white; border-radius:16px; padding:2.5rem 2rem; max-width:400px; width:100%; text-align:center; box-shadow:0 20px 60px rgba(0,0,0,0.2); }
    .logo { font-size:2.5rem; margin-bottom:0.5rem; }
    h1 { font-size:1.5rem; font-weight:700; color:#0F2D5E; margin:0 0 0.25rem; }
    h2 { font-size:1.1rem; font-weight:600; color:#374151; margin:0 0 0.75rem; }
    h3 { font-size:1.1rem; font-weight:600; color:#065F46; margin:0.5rem 0; }
    .subtitle { font-size:13px; color:#6B7280; margin:0 0 1.5rem; line-height:1.6; }
    form { text-align:left; }
    .form-group { display:flex; flex-direction:column; gap:4px; margin-bottom:1rem; }
    label { font-size:13px; font-weight:600; color:#374151; }
    .form-input { padding:10px 12px; border:1.5px solid #E5E7EB; border-radius:8px; font-size:14px; font-family:inherit; width:100%; box-sizing:border-box; }
    .form-input:focus { outline:none; border-color:#1A56B0; box-shadow:0 0 0 3px rgba(26,86,176,0.1); }
    .form-input:disabled { background:#F9FAFB; cursor:not-allowed; }
    .error-msg { background:#FEE2E2; color:#991B1B; padding:10px 12px; border-radius:8px; font-size:13px; margin-bottom:1rem; }
    .btn-primary { width:100%; padding:11px; background:#1A56B0; color:white; border:none; border-radius:8px; font-size:15px; font-weight:600; cursor:pointer; transition:background 0.2s; }
    .btn-primary:hover:not(:disabled) { background:#0F2D5E; }
    .btn-primary:disabled { opacity:0.6; cursor:not-allowed; }
    .success-state { display:flex; flex-direction:column; align-items:center; padding:1rem 0; }
    .success-icon { font-size:3rem; margin-bottom:0.5rem; }
    p { font-size:14px; color:#6B7280; line-height:1.6; margin:0.25rem 0; }
    .hint { font-size:12px; color:#9CA3AF; }
    .back-link { display:inline-block; margin-top:1.5rem; color:#1A56B0; text-decoration:none; font-size:13px; font-weight:500; }
    .back-link:hover { text-decoration:underline; }
  `]
})
export class ForgotPasswordComponent {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  email = '';
  loading = false;
  sent = false;
  error = '';

  onSubmit(): void {
    if (!this.email) return;
    this.loading = true;
    this.error = '';

    this.http.post('http://localhost:3000/api/auth/forgot-password', { email: this.email }).subscribe({
      next: () => {
        this.sent = true;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Error al enviar el email. Inténtalo de nuevo.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
