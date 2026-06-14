import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login.component';
import { RegisterComponent } from './auth/register.component';
import { VerifyComponent } from './auth/verify.component';
import { ProfileComponent } from './profile.component';
import { AuthGuard } from './guards/auth.guard';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div style="text-align: center; padding: 40px;">
      <h1>Dashboard - Próximamente</h1>
      <nav style="margin-top: 30px;">
        <a routerLink="/profile" style="margin: 0 15px; text-decoration: none; color: #667eea; font-weight: 600;">
          Mi Perfil
        </a>
      </nav>
    </div>
  `,
})
class DashboardComponent {}

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'auth/verify', component: VerifyComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] }
];
