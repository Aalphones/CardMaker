import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth-guard';
import { pendingChangesGuard } from './shared/guards/pending-changes-guard';

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
          import('./features/card-groups/card-groups-list/card-groups-list').then(
            (module) => module.CardGroupsList,
          ),
      },
      {
        path: 'card-groups/new',
        loadComponent: () =>
          import('./features/card-groups/card-groups-detail/card-groups-detail').then(
            (module) => module.CardGroupsDetail,
          ),
        canDeactivate: [pendingChangesGuard],
      },
      {
        path: 'card-groups/:id',
        loadComponent: () =>
          import('./features/card-groups/card-groups-detail/card-groups-detail').then(
            (module) => module.CardGroupsDetail,
          ),
        canDeactivate: [pendingChangesGuard],
      },
      {
        path: 'cards',
        loadComponent: () =>
          import('./features/cards/cards-list/cards-list').then((module) => module.CardsList),
      },
      {
        path: 'cards/new',
        loadComponent: () =>
          import('./features/cards/card-editor/card-editor').then((module) => module.CardEditor),
        canDeactivate: [pendingChangesGuard],
      },
      {
        path: 'cards/:id',
        loadComponent: () =>
          import('./features/cards/card-editor/card-editor').then((module) => module.CardEditor),
        canDeactivate: [pendingChangesGuard],
      },
      {
        path: 'templates',
        loadComponent: () =>
          import('./features/templates/templates-list/templates-list').then(
            (module) => module.TemplatesList,
          ),
      },
      {
        path: 'templates/:id',
        loadComponent: () =>
          import('./features/templates/template-editor/template-editor').then(
            (module) => module.TemplateEditor,
          ),
        canDeactivate: [pendingChangesGuard],
      },
      {
        path: 'assets',
        loadComponent: () =>
          import('./features/assets/asset-library/asset-library').then(
            (module) => module.AssetLibrary,
          ),
      },
      {
        path: 'prompts',
        loadComponent: () =>
          import('./features/prompts/prompts-page/prompts-page').then(
            (module) => module.PromptsPage,
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
        path: 'print-project',
        loadComponent: () =>
          import('./features/print-project/print-project-page/print-project-page').then(
            (module) => module.PrintProjectPage,
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
