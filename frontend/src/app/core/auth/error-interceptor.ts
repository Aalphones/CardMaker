import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { Notification } from '../../shared/services/notification';
import { clearStoredAuth } from './auth-storage';

interface ApiErrorBody {
  error: string;
  message: string;
  fields?: Record<string, string>;
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const notification = inject(Notification);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) {
        return throwError(() => error);
      }

      if (error.status === 0) {
        notification.show('Server nicht erreichbar.');
        return throwError(() => error);
      }

      if (error.status === 401) {
        clearStoredAuth();
        void router.navigateByUrl('/login');
        return throwError(() => error);
      }

      const body = error.error as ApiErrorBody | null;
      notification.show(body?.message ?? 'Unbekannter Fehler.');
      return throwError(() => error);
    }),
  );
};
