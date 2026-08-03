import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatLatestFrom } from '@ngrx/operators';
import { Store } from '@ngrx/store';
import { catchError, filter, map, of, switchMap, tap } from 'rxjs';

import { Api } from '../../core/services/api';
import { Template, TemplateSummary, TemplatesActions } from './templates.actions';
import { templatesFeature } from './templates.feature';

interface TemplatesListResponse {
  items: TemplateSummary[];
}

@Injectable()
export class TemplatesEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(Api);
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  load$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(TemplatesActions.load),
      concatLatestFrom(() => this.store.select(templatesFeature.selectSummariesLoaded)),
      filter(([, loaded]: [unknown, boolean]) => !loaded),
      switchMap(() =>
        this.api.get<TemplatesListResponse>('/templates').pipe(
          map((response: TemplatesListResponse) => TemplatesActions.loadSuccess(response)),
          catchError((error: unknown) =>
            of(TemplatesActions.loadFailure({ message: resolveErrorMessage(error) })),
          ),
        ),
      ),
    );
  });

  loadOne$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(TemplatesActions.loadOne),
      switchMap(({ id }) =>
        this.api.get<Template>(`/templates/${id}`).pipe(
          map((template: Template) => TemplatesActions.loadOneSuccess({ template })),
          catchError((error: unknown) =>
            of(TemplatesActions.loadOneFailure({ message: resolveErrorMessage(error) })),
          ),
        ),
      ),
    );
  });

  create$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(TemplatesActions.create),
      switchMap(({ name, description }) =>
        this.api.post<Template>('/templates', { name, description }).pipe(
          tap((template: Template) => void this.router.navigateByUrl(`/templates/${template.id}`)),
          map((template: Template) => TemplatesActions.createSuccess({ template })),
          catchError((error: unknown) =>
            of(TemplatesActions.createFailure({ message: resolveErrorMessage(error) })),
          ),
        ),
      ),
    );
  });

  save$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(TemplatesActions.save),
      switchMap(({ id, name, description, layers }) =>
        this.api.patch<Template>(`/templates/${id}`, { name, description, layers }).pipe(
          map((template: Template) => TemplatesActions.saveSuccess({ template })),
          catchError((error: unknown) =>
            of(TemplatesActions.saveFailure({ message: resolveErrorMessage(error) })),
          ),
        ),
      ),
    );
  });

  delete$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(TemplatesActions.delete),
      switchMap(({ id }) =>
        this.api.delete(`/templates/${id}`).pipe(
          map(() => TemplatesActions.deleteSuccess({ id })),
          catchError((error: unknown) =>
            of(TemplatesActions.deleteFailure({ message: resolveErrorMessage(error) })),
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
  return 'Templates konnten nicht aktualisiert werden.';
}
