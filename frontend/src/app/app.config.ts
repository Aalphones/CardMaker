import { DEFAULT_DIALOG_CONFIG, DialogConfig } from '@angular/cdk/dialog';
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
import { printProjectFeature } from './store/print-project/print-project.feature';
import { PrintProjectEffects } from './store/print-project/print-project.effects';
import { templatesFeature } from './store/templates/templates.feature';
import { TemplatesEffects } from './store/templates/templates.effects';
import { tokensFeature } from './store/tokens/tokens.feature';
import { TokensEffects } from './store/tokens/tokens.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // Die CDK-Vorgabe 80vw ließe auf dem Smartphone links und rechts je 36px ungenutzt.
    // Ausbreiten statt nur maxWidth übergeben: ein eigener DEFAULT_DIALOG_CONFIG ersetzt die
    // Vorgaben komplett (dialog.mjs: `this._defaultOptions || new DialogConfig()`).
    {
      provide: DEFAULT_DIALOG_CONFIG,
      useValue: { ...new DialogConfig(), maxWidth: 'calc(100vw - 1rem)' },
    },
    provideHttpClient(withInterceptors([authTokenInterceptor, errorInterceptor])),
    provideStore(),
    provideState(authFeature),
    provideState(tokensFeature),
    provideState(cardGroupsFeature),
    provideState(cardsFeature),
    provideState(templatesFeature),
    provideState(assetsFeature),
    provideState(fontsFeature),
    provideState(printProjectFeature),
    provideEffects(
      AuthEffects,
      TokensEffects,
      CardGroupsEffects,
      CardsEffects,
      TemplatesEffects,
      AssetsEffects,
      FontsEffects,
      PrintProjectEffects,
    ),
    provideAppInitializer(() => inject(Store).dispatch(AuthActions.restoreSession())),
    ...(environment.production ? [] : [provideStoreDevtools({ maxAge: 25 })]),
  ],
};
