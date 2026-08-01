import { createFeature, createReducer, createSelector, on } from '@ngrx/store';

import { AuthUser } from '../../core/auth/auth-storage';
import { AuthActions } from './auth.actions';

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  expiresAt: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  expiresAt: null,
  loading: false,
  error: null,
};

export const authFeature = createFeature({
  name: 'auth',
  reducer: createReducer(
    initialState,
    on(AuthActions.login, (state): AuthState => ({ ...state, loading: true, error: null })),
    on(AuthActions.loginSuccess, (state, { user, token, expiresAt }): AuthState => ({
      ...state,
      user,
      token,
      expiresAt,
      loading: false,
      error: null,
    })),
    on(AuthActions.loginFailure, (state, { message }): AuthState => ({
      ...state,
      user: null,
      token: null,
      expiresAt: null,
      loading: false,
      error: message,
    })),
    on(AuthActions.logoutComplete, (): AuthState => initialState),
    on(AuthActions.sessionExpired, (): AuthState => initialState),
  ),
  extraSelectors: ({ selectToken }) => ({
    selectIsAuthenticated: createSelector(
      selectToken,
      (token: string | null): boolean => token !== null,
    ),
  }),
});

export const {
  selectUser,
  selectToken,
  selectExpiresAt,
  selectLoading,
  selectError,
  selectIsAuthenticated,
} = authFeature;
