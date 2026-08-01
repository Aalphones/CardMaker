import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { catchError, throwError } from 'rxjs';

import { Notification } from '../../shared/services/notification';
import { AuthActions } from '../../store/auth/auth.actions';

interface ApiErrorBody {
  error: string;
  message: string;
  fields?: Record<string, string>;
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(Store);
  const notification = inject(Notification);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) {
        return throwError(() => error);
      }

      // Anmelden/Abmelden werten ihren eigenen Fehlerpfad im Auth-Effect aus — sonst würde
      // ein falsches Passwort hier schon als „Sitzung abgelaufen" umgedeutet.
      if (isAuthLifecycleRequest(req)) {
        return throwError(() => error);
      }

      if (error.status === 0) {
        notification.show('Server nicht erreichbar.');
        return throwError(() => error);
      }

      if (error.status === 401) {
        store.dispatch(AuthActions.sessionExpired());
        return throwError(() => error);
      }

      const body = error.error as ApiErrorBody | null;
      notification.show(body?.message ?? 'Unbekannter Fehler.');
      return throwError(() => error);
    }),
  );
};

function isAuthLifecycleRequest(req: HttpRequest<unknown>): boolean {
  return req.url.endsWith('/auth/login') || req.url.endsWith('/auth/logout');
}
