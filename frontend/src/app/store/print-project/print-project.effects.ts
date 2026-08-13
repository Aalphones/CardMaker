import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatLatestFrom } from '@ngrx/operators';
import { Store } from '@ngrx/store';
import { catchError, filter, map, of, switchMap } from 'rxjs';

import { Api } from '../../core/services/api';
import { Notification } from '../../shared/services/notification';
import { PrintItem, PrintOptions, PrintProjectActions } from './print-project.actions';
import { printProjectFeature } from './print-project.feature';

interface PrintProjectResponse {
  options: PrintOptions;
  items: PrintItem[];
}

@Injectable()
export class PrintProjectEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(Api);
  private readonly store = inject(Store);
  private readonly notification = inject(Notification);

  load$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PrintProjectActions.load),
      concatLatestFrom(() => this.store.select(printProjectFeature.selectLoaded)),
      filter(([, loaded]: [unknown, boolean]) => !loaded),
      switchMap(() =>
        this.api.get<PrintProjectResponse>('/print-project').pipe(
          map((response: PrintProjectResponse) => PrintProjectActions.loadSuccess(response)),
          catchError((error: unknown) =>
            of(PrintProjectActions.loadFailure({ message: this.reportError(error) })),
          ),
        ),
      ),
    );
  });

  setOptions$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PrintProjectActions.setOptions),
      switchMap(({ options }) =>
        this.api.put<PrintOptions>('/print-project/options', options).pipe(
          map((updated: PrintOptions) => PrintProjectActions.setOptionsSuccess({ options: updated })),
          catchError((error: unknown) =>
            of(PrintProjectActions.setOptionsFailure({ message: this.reportError(error) })),
          ),
        ),
      ),
    );
  });

  addItem$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PrintProjectActions.addItem),
      switchMap(({ cardId, quantity }) =>
        this.api.post<PrintItem>('/print-project/items', { cardId, quantity }).pipe(
          map((item: PrintItem) => PrintProjectActions.addItemSuccess({ item })),
          catchError((error: unknown) =>
            of(PrintProjectActions.addItemFailure({ message: this.reportError(error) })),
          ),
        ),
      ),
    );
  });

  setQuantity$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PrintProjectActions.setQuantity),
      switchMap(({ id, quantity }) =>
        this.api.patch<PrintItem>(`/print-project/items/${id}`, { quantity }).pipe(
          map((item: PrintItem) => PrintProjectActions.setQuantitySuccess({ item })),
          catchError((error: unknown) =>
            of(PrintProjectActions.setQuantityFailure({ message: this.reportError(error) })),
          ),
        ),
      ),
    );
  });

  removeItem$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PrintProjectActions.removeItem),
      switchMap(({ id }) =>
        this.api.delete(`/print-project/items/${id}`).pipe(
          map(() => PrintProjectActions.removeItemSuccess({ id })),
          catchError((error: unknown) =>
            of(PrintProjectActions.removeItemFailure({ message: this.reportError(error) })),
          ),
        ),
      ),
    );
  });

  clear$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(PrintProjectActions.clear),
      switchMap(() =>
        this.api.delete('/print-project/items').pipe(
          map(() => PrintProjectActions.clearSuccess()),
          catchError((error: unknown) =>
            of(PrintProjectActions.clearFailure({ message: this.reportError(error) })),
          ),
        ),
      ),
    );
  });

  private reportError(error: unknown): string {
    const message: string = resolveErrorMessage(error);
    this.notification.show(message);
    return message;
  }
}

function resolveErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const body = error.error as { message?: string } | null;
    if (body?.message) {
      return body.message;
    }
  }
  return 'Das Druckprojekt konnte nicht aktualisiert werden.';
}
