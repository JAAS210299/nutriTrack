import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="show" class="spinner-overlay" role="status" aria-label="Cargando...">
      <div class="spinner-wrap">
        <div class="spinner" aria-hidden="true"></div>
        <p *ngIf="message" class="spinner-msg">{{ message }}</p>
      </div>
    </div>
  `,
  styles: [`
    .spinner-overlay {
      display: flex; align-items: center; justify-content: center;
      padding: 3rem 1rem;
    }
    .spinner-wrap { display: flex; flex-direction: column; align-items: center; gap: 1rem; }
    .spinner {
      width: 40px; height: 40px;
      border: 4px solid #E5E7EB;
      border-top-color: #1A56B0;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .spinner-msg { font-size: 14px; color: #6B7280; margin: 0; }
  `]
})
export class SpinnerComponent {
  @Input() show = false;
  @Input() message = 'Cargando...';
}
