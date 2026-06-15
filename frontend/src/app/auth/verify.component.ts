import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="verify-container" role="main">
      <div class="verify-card">
        <div class="logo" aria-hidden="true">🥗</div>
        <h1>NutriTrack</h1>

        <!-- Cargando -->
        <div *ngIf="status === 'loading'" class="state loading" aria-live="polite" aria-busy="true">
          <div class="spinner" aria-hidden="true"></div>
          <p>Verificando tu cuenta...</p>
        </div>

        <!-- Éxito -->
        <div *ngIf="status === 'success'" class="state success" aria-live="polite">
          <div class="icon success-icon" aria-hidden="true">✓</div>
          <h2>¡Cuenta verificada!</h2>
          <p>Tu cuenta ha sido verificada correctamente. Ya puedes iniciar sesión.</p>
          <a routerLink="/login" class="btn-primary" aria-label="Ir a iniciar sesión">Iniciar sesión</a>
        </div>

        <!-- Error -->
        <div *ngIf="status === 'error'" class="state error" aria-live="polite">
          <div class="icon error-icon" aria-hidden="true">✗</div>
          <h2>Enlace inválido</h2>
          <p>{{ errorMessage }}</p>
          <a routerLink="/login" class="btn-secondary" aria-label="Volver al inicio de sesión">Volver al login</a>
        </div>

        <!-- Sin token -->
        <div *ngIf="status === 'notoken'" class="state error" aria-live="polite">
          <div class="icon error-icon" aria-hidden="true">✗</div>
          <h2>Enlace incompleto</h2>
          <p>El enlace de verificación no es válido. Revisa el email e inténtalo de nuevo.</p>
          <a routerLink="/login" class="btn-secondary">Volver al login</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .verify-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0F2D5E 0%, #1A56B0 100%);
      padding: 1rem;
    }
    .verify-card {
      background: white;
      border-radius: 16px;
      padding: 2.5rem 2rem;
      max-width: 400px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    }
    .logo { font-size: 2.5rem; margin-bottom: 0.5rem; }
    h1 { font-size: 1.5rem; font-weight: 700; color: #0F2D5E; margin: 0 0 2rem; }
    h2 { font-size: 1.25rem; font-weight: 600; margin: 1rem 0 0.5rem; }
    p { font-size: 14px; color: #6B7280; line-height: 1.6; margin: 0 0 1.5rem; }

    .state { display: flex; flex-direction: column; align-items: center; }

    .spinner {
      width: 48px; height: 48px;
      border: 4px solid #E5E7EB;
      border-top-color: #1A56B0;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 1rem;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .icon {
      width: 56px; height: 56px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem; font-weight: 700;
      margin-bottom: 0.5rem;
    }
    .success-icon { background: #D1FAE5; color: #065F46; }
    .error-icon { background: #FEE2E2; color: #991B1B; }
    .success h2 { color: #065F46; }
    .error h2 { color: #991B1B; }
    .loading p { color: #6B7280; }

    .btn-primary {
      display: inline-block;
      background: #1A56B0; color: white;
      padding: 10px 28px; border-radius: 8px;
      text-decoration: none; font-size: 14px; font-weight: 600;
      transition: background 0.2s;
    }
    .btn-primary:hover { background: #0F2D5E; }
    .btn-secondary {
      display: inline-block;
      background: #F3F4F6; color: #374151;
      padding: 10px 28px; border-radius: 8px;
      text-decoration: none; font-size: 14px; font-weight: 500;
    }
    .btn-secondary:hover { background: #E5E7EB; }
  `]
})
export class VerifyComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  status: 'loading' | 'success' | 'error' | 'notoken' = 'loading';
  errorMessage = 'El enlace de verificación es inválido o ha expirado.';

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.status = 'notoken';
      this.cdr.detectChanges();
      return;
    }

    this.auth.verifyEmail(token).subscribe({
      next: () => {
        this.status = 'success';
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err) => {
        this.status = 'error';
        this.errorMessage = err?.error?.message || 'El enlace de verificación es inválido o ha expirado.';
        this.cdr.detectChanges();
      }
    });
  }
}
