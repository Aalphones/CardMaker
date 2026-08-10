import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatLatestFrom } from '@ngrx/operators';
import { Store } from '@ngrx/store';
import { catchError, filter, map, of, switchMap } from 'rxjs';

import { Api } from '../../core/services/api';
import { Asset, AssetsActions } from './assets.actions';
import { assetsFeature } from './assets.feature';

interface AssetsListResponse {
  items: Asset[];
}

@Injectable()
export class AssetsEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(Api);
  private readonly store = inject(Store);

  load$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AssetsActions.load),
      concatLatestFrom(() => this.store.select(assetsFeature.selectLoaded)),
      filter(([, loaded]: [unknown, boolean]) => !loaded),
      switchMap(() =>
        this.api.get<AssetsListResponse>('/assets').pipe(
          map((response: AssetsListResponse) => AssetsActions.loadSuccess(response)),
          catchError((error: unknown) => of(AssetsActions.loadFailure({ message: resolveErrorMessage(error) }))),
        ),
      ),
    );
  });

  upload$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AssetsActions.upload),
      switchMap(({ file, kind, name }) => {
        const formData = new FormData();
        formData.set('file', file);
        formData.set('kind', kind);
        formData.set('name', name);

        return this.api.postForm<Asset>('/assets', formData).pipe(
          map((asset: Asset) => AssetsActions.uploadSuccess({ asset })),
          catchError((error: unknown) =>
            of(
              AssetsActions.uploadFailure({
                message: resolveErrorMessage(error),
                fileError: resolveFileFieldError(error),
              }),
            ),
          ),
        );
      }),
    );
  });

  delete$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AssetsActions.delete),
      switchMap(({ id }) =>
        this.api.delete(`/assets/${id}`).pipe(
          map(() => AssetsActions.deleteSuccess({ id })),
          catchError((error: unknown) => of(AssetsActions.deleteFailure({ message: resolveErrorMessage(error) }))),
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
  return 'Der Bildvorrat konnte nicht aktualisiert werden.';
}

function resolveFileFieldError(error: unknown): string | null {
  if (error instanceof HttpErrorResponse) {
    const body = error.error as { fields?: Record<string, string> } | null;
    return body?.fields?.['file'] ?? null;
  }
  return null;
}
