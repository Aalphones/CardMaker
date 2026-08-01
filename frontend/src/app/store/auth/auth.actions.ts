import { createActionGroup, emptyProps, props } from '@ngrx/store';

import { AuthUser } from '../../core/auth/auth-storage';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    Login: props<{ email: string; password: string; redirectTo: string }>(),
    'Login Success': props<{ user: AuthUser; token: string; expiresAt: string }>(),
    'Login Failure': props<{ message: string }>(),
    Logout: emptyProps(),
    'Logout Complete': emptyProps(),
    'Restore Session': emptyProps(),
    'Session Expired': emptyProps(),
  },
});
