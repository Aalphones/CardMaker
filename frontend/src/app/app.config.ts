import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { Store, provideState, provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { authTokenInterceptor } from './core/auth/auth-token-interceptor';
import { errorInterceptor } from './core/auth/error-interceptor';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { AuthActions } from './store/auth/auth.actions';
import { authFeature } from './store/auth/auth.feature';
import { AuthEffects } from './store/auth/auth.effects';
import { tokensFeature } from './store/tokens/tokens.feature';
import { TokensEffects } from './store/tokens/tokens.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authTokenInterceptor, errorInterceptor])),
    provideStore(),
    provideState(authFeature),
    provideState(tokensFeature),
    provideEffects(AuthEffects, TokensEffects),
    provideAppInitializer(() => inject(Store).dispatch(AuthActions.restoreSession())),
    ...(environment.production ? [] : [provideStoreDevtools({ maxAge: 25 })]),
  ],
};
