import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, filter, map, of, switchMap, tap } from 'rxjs';

import { Api } from '../../core/services/api';
import { StoredAuth, clearStoredAuth, readStoredAuth } from '../../core/auth/auth-storage';
import { isExpired, writeStoredAuth } from '../../core/services/auth';
import { AuthActions } from './auth.actions';

@Injectable()
export class AuthEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(Api);
  private readonly router = inject(Router);

  login$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ email, password, redirectTo }) =>
        this.api.post<StoredAuth>('/auth/login', { email, password }).pipe(
          tap((response: StoredAuth) => {
            writeStoredAuth(response);
            void this.router.navigateByUrl(redirectTo);
          }),
          map((response: StoredAuth) => AuthActions.loginSuccess(response)),
          catchError((error: unknown) =>
            of(AuthActions.loginFailure({ message: resolveLoginErrorMessage(error) })),
          ),
        ),
      ),
    );
  });

  logout$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuthActions.logout),
      switchMap(() =>
        this.api.post('/auth/logout', {}).pipe(
          map(() => AuthActions.logoutComplete()),
          catchError(() => of(AuthActions.logoutComplete())),
        ),
      ),
    );
  });

  logoutComplete$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(AuthActions.logoutComplete),
        tap(() => {
          clearStoredAuth();
          void this.router.navigateByUrl('/login');
        }),
      );
    },
    { dispatch: false },
  );

  sessionExpired$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(AuthActions.sessionExpired),
        tap(() => {
          clearStoredAuth();
          void this.router.navigate(['/login'], { queryParams: { reason: 'expired' } });
        }),
      );
    },
    { dispatch: false },
  );

  restoreSession$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AuthActions.restoreSession),
      map(() => readStoredAuth()),
      filter((stored): stored is StoredAuth => stored !== null),
      map((stored: StoredAuth) =>
        isExpired(stored.expiresAt, new Date())
          ? AuthActions.sessionExpired()
          : AuthActions.loginSuccess(stored),
      ),
    );
  });
}

function resolveLoginErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'Anmeldung fehlgeschlagen.';
  }
  if (error.status === 0) {
    return 'Server nicht erreichbar.';
  }
  const body = error.error as { message?: string } | null;
  return body?.message ?? 'Anmeldung fehlgeschlagen.';
}
