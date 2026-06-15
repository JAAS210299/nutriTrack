import { environment } from '../../environments/environment';
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container" role="main">
      <div class="auth-card">
        <div class="logo" aria-hidden="true">🥗</div>
        <h1>NutriTrack</h1>
        <h2>Nueva contraseña</h2>

        <div *ngIf="status === 'notoken'" class="error-state" aria-live="polite">
          <div class="state-icon" aria-hidden="true">✗</div>
          <p>Enlace inválido. Solicita un nuevo enlace de recuperación.</p>
          <a routerLink="/forgot-password" class="btn-primary">Solicitar enlace</a>
        </div>

        <form (ngSubmit)="onSubmit()" *ngIf="status === 'form'" aria-label="Formulario nueva contraseña">
          <div class="form-group">
            <label for="password">Nueva contraseña</label>
            <input
              id="password"
              type="password"
              [(ngModel)]="password"
              name="password"
              required
              minlength="6"
              placeholder="Mínimo 6 caracteres"
              class="form-input"
              aria-required="true"
            />
          </div>
          <div class="form-group">
            <label for="confirm">Confirmar contraseña</label>
            <input
              id="confirm"
              type="password"
              [(ngModel)]="confirm"
              name="confirm"
              required
              placeholder="Repite la contraseña"
              class="form-input"
              aria-required="true"
            />
          </div>
          <div *ngIf="errorMessage" class="error-msg" role="alert">{{ errorMessage }}</div>
          <button type="submit" class="btn-primary" [disabled]="loading" aria-label="Guardar nueva contraseña">
            {{ loading ? 'Guardando...' : 'Guardar contraseña' }}
          </button>
        </form>

        <div *ngIf="status === 'success'" class="success-state" aria-live="polite">
          <div class="state-icon success" aria-hidden="true">✓</div>
          <h3>Contraseña actualizada</h3>
          <p>Tu contraseña ha sido cambiada correctamente.</p>
          <a routerLink="/login" class="btn-primary" aria-label="Ir a iniciar sesión">Iniciar sesión</a>
        </div>

        <div *ngIf="status === 'error'" class="error-state" aria-live="polite">
          <div class="state-icon" aria-hidden="true">✗</div>
          <h3>Enlace expirado</h3>
          <p>{{ errorMessage }}</p>
          <a routerLink="/forgot-password" class="btn-secondary">Solicitar nuevo enlace</a>
        </div>

        <a routerLink="/login" class="back-link" *ngIf="status === 'form'" aria-label="Volver al inicio de sesión">← Volver al login</a>
      </div>
    </div>
  `,
  styles: [`
    .auth-container { min-height:100vh; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,#0F2D5E 0%,#1A56B0 100%); padding:1rem; }
    .auth-card { background:white; border-radius:16px; padding:2.5rem 2rem; max-width:400px; width:100%; text-align:center; box-shadow:0 20px 60px rgba(0,0,0,0.2); }
    .logo { font-size:2.5rem; margin-bottom:0.5rem; }
    h1 { font-size:1.5rem; font-weight:700; color:#0F2D5E; margin:0 0 0.25rem; }
    h2 { font-size:1.1rem; font-weight:600; color:#374151; margin:0 0 1.5rem; }
    h3 { font-size:1.1rem; font-weight:600; margin:0.5rem 0; }
    form { text-align:left; }
    .form-group { display:flex; flex-direction:column; gap:4px; margin-bottom:1rem; }
    label { font-size:13px; font-weight:600; color:#374151; }
    .form-input { padding:10px 12px; border:1.5px solid #E5E7EB; border-radius:8px; font-size:14px; font-family:inherit; width:100%; box-sizing:border-box; }
    .form-input:focus { outline:none; border-color:#1A56B0; box-shadow:0 0 0 3px rgba(26,86,176,0.1); }
    .error-msg { background:#FEE2E2; color:#991B1B; padding:10px 12px; border-radius:8px; font-size:13px; margin-bottom:1rem; }
    .btn-primary { display:inline-block; width:100%; padding:11px; background:#1A56B0; color:white; border:none; border-radius:8px; font-size:15px; font-weight:600; cursor:pointer; text-decoration:none; box-sizing:border-box; text-align:center; margin-top:0.5rem; transition:background 0.2s; }
    .btn-primary:hover:not(:disabled) { background:#0F2D5E; }
    .btn-primary:disabled { opacity:0.6; cursor:not-allowed; }
    .btn-secondary { display:inline-block; padding:10px 24px; background:#F3F4F6; color:#374151; border-radius:8px; text-decoration:none; font-size:14px; font-weight:500; margin-top:0.5rem; }
    .success-state, .error-state { display:flex; flex-direction:column; align-items:center; padding:0.5rem 0; gap:0.5rem; }
    .state-icon { width:56px; height:56px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.5rem; font-weight:700; background:#FEE2E2; color:#991B1B; margin-bottom:0.25rem; }
    .state-icon.success { background:#D1FAE5; color:#065F46; }
    h3.success { color:#065F46; }
    p { font-size:14px; color:#6B7280; line-height:1.6; margin:0; }
    .back-link { display:inline-block; margin-top:1.5rem; color:#1A56B0; text-decoration:none; font-size:13px; font-weight:500; }
    .back-link:hover { text-decoration:underline; }
  `]
})
export class ResetPasswordComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  token = '';
  password = '';
  confirm = '';
  loading = false;
  status: 'notoken' | 'form' | 'success' | 'error' = 'form';
  errorMessage = '';

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) { this.status = 'notoken'; return; }
    this.token = token;
  }

  onSubmit(): void {
    if (this.password.length < 6) {
      this.cdr.detectChanges();
      return;
    }
    if (this.password !== this.confirm) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.http.post(environment.apiUrl + '/auth/reset-password', {
      token: this.token,
      newPassword: this.password
    }).subscribe({
      next: () => {
        this.status = 'success';
        this.loading = false;
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err) => {
        this.status = 'error';
        this.errorMessage = err?.error?.message || 'El enlace ha expirado. Solicita uno nuevo.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
