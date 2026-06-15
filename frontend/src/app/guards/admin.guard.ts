import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);

  try {
    const token = localStorage.getItem('token');
    if (!token) { router.navigate(['/login']); return false; }

    // Decodifica el payload del JWT (base64)
    const payload = JSON.parse(atob(token.split('.')[1]));

    if (payload.role === 'admin') return true;
  } catch {
    // token inválido
  }

  router.navigate(['/dashboard']);
  return false;
};
