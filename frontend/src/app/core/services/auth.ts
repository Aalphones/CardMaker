import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';

import { AUTH_STORAGE_KEY, StoredAuth } from '../auth/auth-storage';
import { AuthActions } from '../../store/auth/auth.actions';
import { authFeature } from '../../store/auth/auth.feature';

// Nur eine Bequemlichkeit für die Oberfläche (sofort ausloggen statt auf eine 401 zu warten) —
// verbindlich entscheidet immer der Server (Ablaufprüfung in der Datenbankabfrage, Phase 4).
export function isExpired(expiresAt: string, now: Date): boolean {
  return new Date(expiresAt).getTime() <= now.getTime();
}

export function writeStoredAuth(auth: StoredAuth): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly store = inject(Store);

  readonly user = this.store.selectSignal(authFeature.selectUser);
  readonly isAuthenticated = this.store.selectSignal(authFeature.selectIsAuthenticated);
  readonly loading = this.store.selectSignal(authFeature.selectLoading);
  readonly error = this.store.selectSignal(authFeature.selectError);

  login(email: string, password: string, redirectTo: string): void {
    this.store.dispatch(AuthActions.login({ email, password, redirectTo }));
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }

  restoreSession(): void {
    this.store.dispatch(AuthActions.restoreSession());
  }
}
