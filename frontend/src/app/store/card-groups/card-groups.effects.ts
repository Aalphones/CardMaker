import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatLatestFrom } from '@ngrx/operators';
import { Store } from '@ngrx/store';
import { catchError, filter, map, of, switchMap, tap } from 'rxjs';

import { Api } from '../../core/services/api';
import { CardGroup, CardGroupsActions } from './card-groups.actions';
import { cardGroupsFeature } from './card-groups.feature';

interface CardGroupsListResponse {
  items: CardGroup[];
}

@Injectable()
export class CardGroupsEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(Api);
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  load$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CardGroupsActions.load),
      concatLatestFrom(() => this.store.select(cardGroupsFeature.selectLoaded)),
      filter(([, loaded]: [unknown, boolean]) => !loaded),
      switchMap(() =>
        this.api.get<CardGroupsListResponse>('/card-groups').pipe(
          map((response: CardGroupsListResponse) => CardGroupsActions.loadSuccess(response)),
          catchError((error: unknown) =>
            of(CardGroupsActions.loadFailure({ message: resolveErrorMessage(error) })),
          ),
        ),
      ),
    );
  });

  create$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CardGroupsActions.create),
      switchMap(({ name, description }) =>
        this.api.post<CardGroup>('/card-groups', { name, description }).pipe(
          tap(() => void this.router.navigateByUrl('/card-groups')),
          map((cardGroup: CardGroup) => CardGroupsActions.createSuccess({ cardGroup })),
          catchError((error: unknown) =>
            of(CardGroupsActions.createFailure({ message: resolveErrorMessage(error) })),
          ),
        ),
      ),
    );
  });

  update$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CardGroupsActions.update),
      switchMap(({ id, name, description }) =>
        this.api.patch<CardGroup>(`/card-groups/${id}`, { name, description }).pipe(
          tap(() => void this.router.navigateByUrl('/card-groups')),
          map((cardGroup: CardGroup) => CardGroupsActions.updateSuccess({ cardGroup })),
          catchError((error: unknown) =>
            of(CardGroupsActions.updateFailure({ message: resolveErrorMessage(error) })),
          ),
        ),
      ),
    );
  });

  delete$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CardGroupsActions.delete),
      switchMap(({ id }) =>
        this.api.delete(`/card-groups/${id}`).pipe(
          map(() => CardGroupsActions.deleteSuccess({ id })),
          catchError((error: unknown) =>
            of(CardGroupsActions.deleteFailure({ message: resolveErrorMessage(error) })),
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
  return 'Kartengruppen konnten nicht aktualisiert werden.';
}
