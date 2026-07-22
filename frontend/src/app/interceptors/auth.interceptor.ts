import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError, EMPTY } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  let modifiedReq = req;
  if (!req.url.includes('/api/auth/')) {
    if (!authService.isLoggedIn()) {
      // Token is already expired or missing, prevent the request
      authService.logout();
      router.navigate(['/']);
      return EMPTY;
    }

    modifiedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/']);
        
        // Re-throw the error so component subscribers can reset their loading state
        return throwError(() => error);
      }
      
      if (error.status === 403 && (error.error?.error === 'ACCOUNT_SUSPENDED' || error.error?.message?.includes('suspended'))) {
        router.navigate(['/profile']);
        return EMPTY; // Stop propagation to avoid toast errors
      }
      
      return throwError(() => error);
    })
  );
};
