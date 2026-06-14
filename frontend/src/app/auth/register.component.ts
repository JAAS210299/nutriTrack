import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./auth.styles.scss']
})
export class RegisterComponent {
  form: FormGroup;
  loading = false;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get f() {
    return this.form.controls;
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.error = null;
    this.success = null;

    this.authService.register(this.form.value.email, this.form.value.password)
      .subscribe({
        next: (res) => {
          this.success = 'Registro exitoso. Revisa tu email para verificar.';
          this.form.reset();
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (err) => {
          this.error = err.error.message || 'Error al registrar';
          this.loading = false;
        }
      });
  }
}
