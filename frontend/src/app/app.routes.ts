import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth-guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((module) => module.Login),
  },
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell').then((module) => module.Shell),
    canActivateChild: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'card-groups' },
      {
        path: 'card-groups',
        loadComponent: () =>
          import('./features/card-groups/card-groups-page/card-groups-page').then(
            (module) => module.CardGroupsPage,
          ),
      },
      {
        path: 'tokens',
        loadComponent: () =>
          import('./features/auth/tokens/tokens-page/tokens-page').then(
            (module) => module.TokensPage,
          ),
      },
      {
        path: '**',
        loadComponent: () =>
          import('./shared/components/not-found/not-found').then((module) => module.NotFound),
      },
    ],
  },
];
