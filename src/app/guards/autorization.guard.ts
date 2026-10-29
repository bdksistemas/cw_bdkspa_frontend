import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service'; // Asegúrate de que la ruta de importación sea correcta
import { inject } from '@angular/core';

export const autorizationGuard: CanActivateFn = (route, state) => {

  let authService = inject(AuthService);
  let routerService = inject(Router);



  if (authService.isAuthenticated()) {
    return true;
  } else {
    console.error('Acceso denegado: El usuario no está autenticado');
    routerService.navigate(['/login']); // Redirige al usuario al componente de inicio de sesión
    return false;
  }
};
