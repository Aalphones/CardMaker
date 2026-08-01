import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatLatestFrom } from '@ngrx/operators';
import { Store } from '@ngrx/store';
import { catchError, filter, map, of, switchMap } from 'rxjs';

import { Api } from '../../core/services/api';
import { AccessToken, AccessTokenWithSecret, TokensActions } from './tokens.actions';
import { tokensFeature } from './tokens.feature';

interface TokensListResponse {
  items: AccessToken[];
}

@Injectable()
export class TokensEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(Api);
  private readonly store = inject(Store);

  load$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(TokensActions.load),
      concatLatestFrom(() => this.store.select(tokensFeature.selectLoaded)),
      filter(([, loaded]: [unknown, boolean]) => !loaded),
      switchMap(() =>
        this.api.get<TokensListResponse>('/tokens').pipe(
          map((response: TokensListResponse) => TokensActions.loadSuccess(response)),
          catchError((error: unknown) =>
            of(TokensActions.loadFailure({ message: resolveErrorMessage(error) })),
          ),
        ),
      ),
    );
  });

  create$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(TokensActions.create),
      switchMap(({ name }) =>
        this.api.post<AccessTokenWithSecret>('/tokens', { name }).pipe(
          map((token: AccessTokenWithSecret) => TokensActions.createSuccess({ token })),
          catchError((error: unknown) =>
            of(TokensActions.createFailure({ message: resolveErrorMessage(error) })),
          ),
        ),
      ),
    );
  });

  delete$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(TokensActions.delete),
      switchMap(({ id }) =>
        this.api.delete(`/tokens/${id}`).pipe(
          map(() => TokensActions.deleteSuccess({ id })),
          catchError((error: unknown) =>
            of(TokensActions.deleteFailure({ message: resolveErrorMessage(error) })),
          ),
        ),
      ),
    );
  });
}

function resolveErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const body = error.error as { message?: string } | null;
    if (body?.message) {
      return body.message;
    }
  }
  return 'Zugriffstoken konnten nicht aktualisiert werden.';
}
