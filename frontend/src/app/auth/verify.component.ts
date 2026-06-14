import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="verify-container">
      <div class="verify-card">
        <h1>NutriTrack</h1>
        <div *ngIf="loading" class="loading">
          <p>Verificando tu email...</p>
        </div>
        <div *ngIf="success" class="success">
          <h2>¡Email verificado!</h2>
          <p>Tu cuenta ha sido verificada exitosamente.</p>
          <p>Serás redirigido al login en 3 segundos...</p>
        </div>
        <div *ngIf="error" class="error">
          <h2>Error en la verificación</h2>
          <p>{{ error }}</p>
          <a href="/login">Volver al login</a>
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
      background: linear-gradient(135deg, #0052cc 0%, #0073e6 100%);
      padding: 20px;
    }
    .verify-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
      padding: 40px;
      max-width: 400px;
      text-align: center;
    }
    h1 {
      color: #0052cc;
      margin-bottom: 30px;
    }
    .loading, .success, .error {
      padding: 20px;
    }
    .success {
      color: #28a745;
      background: #f0f9f5;
      border-radius: 6px;
    }
    .error {
      color: #dc3545;
      background: #fdf5f5;
      border-radius: 6px;
    }
    a {
      color: #0052cc;
      text-decoration: none;
      font-weight: 600;
      margin-top: 10px;
      display: inline-block;
    }
  `]
})
export class VerifyComponent implements OnInit {
  loading = true;
  success = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (!token) {
        this.error = 'Token de verificación no encontrado';
        this.loading = false;
        return;
      }

      // Call backend to verify email
      this.authService.verifyEmail(token).subscribe({
        next: (response) => {
          this.loading = false;
          this.success = true;
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message || 'Error al verificar email';
        }
      });
    });
  }
}
