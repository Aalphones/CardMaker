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
import { assetsFeature } from './store/assets/assets.feature';
import { AssetsEffects } from './store/assets/assets.effects';
import { AuthActions } from './store/auth/auth.actions';
import { authFeature } from './store/auth/auth.feature';
import { AuthEffects } from './store/auth/auth.effects';
import { cardGroupsFeature } from './store/card-groups/card-groups.feature';
import { CardGroupsEffects } from './store/card-groups/card-groups.effects';
import { cardsFeature } from './store/cards/cards.feature';
import { CardsEffects } from './store/cards/cards.effects';
import { fontsFeature } from './store/fonts/fonts.feature';
import { FontsEffects } from './store/fonts/fonts.effects';
import { templatesFeature } from './store/templates/templates.feature';
import { TemplatesEffects } from './store/templates/templates.effects';
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
    provideState(cardGroupsFeature),
    provideState(cardsFeature),
    provideState(templatesFeature),
    provideState(assetsFeature),
    provideState(fontsFeature),
    provideEffects(
      AuthEffects,
      TokensEffects,
      CardGroupsEffects,
      CardsEffects,
      TemplatesEffects,
      AssetsEffects,
      FontsEffects,
    ),
    provideAppInitializer(() => inject(Store).dispatch(AuthActions.restoreSession())),
    ...(environment.production ? [] : [provideStoreDevtools({ maxAge: 25 })]),
  ],
};
