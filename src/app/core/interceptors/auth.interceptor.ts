import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);
  const token = auth.token();
  let outgoing = request;
  if (token && request.url.startsWith(environment.apiBaseUrl)) {
    outgoing = request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(outgoing).pipe(catchError(error => {
    if (error.status === 401 && !request.url.includes('/auth/login')) {
      auth.clearInvalidSession();
      toast.error('Your session has expired. Please sign in again.');
      router.navigate(['/login']);
    }
    return throwError(() => error);
  }));
};
