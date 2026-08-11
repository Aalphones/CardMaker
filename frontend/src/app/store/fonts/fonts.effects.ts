import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatLatestFrom } from '@ngrx/operators';
import { Store } from '@ngrx/store';
import { catchError, filter, map, of, switchMap } from 'rxjs';

import { Api } from '../../core/services/api';
import { Font, FontsActions } from './fonts.actions';
import { fontsFeature } from './fonts.feature';

interface FontsListResponse {
  items: Font[];
}

@Injectable()
export class FontsEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(Api);
  private readonly store = inject(Store);

  load$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(FontsActions.load),
      concatLatestFrom(() => this.store.select(fontsFeature.selectLoaded)),
      filter(([, loaded]: [unknown, boolean]) => !loaded),
      switchMap(() =>
        this.api.get<FontsListResponse>('/fonts').pipe(
          map((response: FontsListResponse) => FontsActions.loadSuccess(response)),
          catchError((error: unknown) =>
            of(FontsActions.loadFailure({ message: resolveErrorMessage(error) })),
          ),
        ),
      ),
    );
  });

  upload$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(FontsActions.upload),
      switchMap(({ file, name }) => {
        const formData = new FormData();
        formData.set('file', file);
        formData.set('name', name);

        return this.api.postForm<Font>('/fonts', formData).pipe(
          map((font: Font) => FontsActions.uploadSuccess({ font })),
          catchError((error: unknown) =>
            of(
              FontsActions.uploadFailure({
                message: resolveErrorMessage(error),
                fileError: resolveFileFieldError(error),
              }),
            ),
          ),
        );
      }),
    );
  });

  rename$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(FontsActions.rename),
      switchMap(({ id, name }) =>
        this.api.patch<Font>(`/fonts/${id}`, { name }).pipe(
          map((font: Font) => FontsActions.renameSuccess({ font })),
          catchError((error: unknown) =>
            of(FontsActions.renameFailure({ message: resolveErrorMessage(error) })),
          ),
        ),
      ),
    );
  });

  delete$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(FontsActions.delete),
      switchMap(({ id }) =>
        this.api.delete(`/fonts/${id}`).pipe(
          map(() => FontsActions.deleteSuccess({ id })),
          catchError((error: unknown) =>
            of(FontsActions.deleteFailure({ message: resolveErrorMessage(error) })),
          ),
        ),
      ),
    );
  });
}

/**
 * Der Server erklärt im Klartext, warum es nicht ging — beim Löschen einer benutzten Schrift
 * steht dort, welches Template sie noch braucht. Diese Meldung durchreichen, statt sie durch
 * einen eigenen Allgemeinplatz zu ersetzen.
 */
function resolveErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const body = error.error as { message?: string } | null;
    if (body?.message) {
      return body.message;
    }
  }
  return 'Der Schriftvorrat konnte nicht aktualisiert werden.';
}

function resolveFileFieldError(error: unknown): string | null {
  if (error instanceof HttpErrorResponse) {
    const body = error.error as { fields?: Record<string, string> } | null;
    return body?.fields?.['file'] ?? null;
  }
  return null;
}
