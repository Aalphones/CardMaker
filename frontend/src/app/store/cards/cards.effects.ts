import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatLatestFrom } from '@ngrx/operators';
import { Store } from '@ngrx/store';
import { Observable, catchError, filter, map, mergeMap, of, switchMap, tap } from 'rxjs';

import { Api } from '../../core/services/api';
import { CardImageLoader } from '../../shared/canvas/card-image-loader';
import { Card, CardImage, CardSummary, CardsActions } from './cards.actions';
import { cardsFeature } from './cards.feature';

interface CardsListResponse {
  items: CardSummary[];
}

@Injectable()
export class CardsEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(Api);
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly cardImages = inject(CardImageLoader);

  load$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CardsActions.load),
      concatLatestFrom(() => this.store.select(cardsFeature.selectSummariesLoaded)),
      filter(([, loaded]: [unknown, boolean]) => !loaded),
      switchMap(() => this.fetchSummaries()),
    );
  });

  refresh$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CardsActions.refresh),
      switchMap(() => this.fetchSummaries()),
    );
  });

  /**
   * Die Kurzfassung trägt Template- und Gruppennamen, die keine Antwort einer
   * Karten-Änderung mitliefert — die Liste wird deshalb nach jeder Änderung neu geholt
   * statt aus der geänderten Karte zusammengesetzt. Löschen kommt ohne aus: dort fällt
   * nur eine Zeile weg, das erledigt der Reducer.
   */
  refreshAfterChange$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CardsActions.createSuccess, CardsActions.saveSuccess, CardsActions.duplicateSuccess),
      map(() => CardsActions.refresh()),
    );
  });

  loadOne$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CardsActions.loadOne),
      switchMap(({ id }) =>
        this.api.get<Card>(`/cards/${id}`).pipe(
          map((card: Card) => CardsActions.loadOneSuccess({ card })),
          catchError((error: unknown) =>
            of(CardsActions.loadOneFailure({ message: resolveErrorMessage(error) })),
          ),
        ),
      ),
    );
  });

  /**
   * Ein im Editor abgelegtes Bild kann erst hochgeladen werden, wenn die Karte eine Kennung
   * hat — deshalb reist es beim Anlegen mit und wird hier direkt hinterhergeschickt.
   */
  create$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CardsActions.create),
      switchMap(({ input, pendingImage }) =>
        this.api.post<Card>('/cards', input).pipe(
          tap((card: Card) => void this.router.navigateByUrl(`/cards/${card.id}`)),
          mergeMap((card: Card) => {
            const success = CardsActions.createSuccess({ card });

            if (!pendingImage) {
              return of(success);
            }

            return of(
              success,
              CardsActions.uploadImage({
                cardId: card.id,
                layerId: pendingImage.layerId,
                file: pendingImage.file,
              }),
            );
          }),
          catchError((error: unknown) =>
            of(CardsActions.createFailure({ message: resolveErrorMessage(error) })),
          ),
        ),
      ),
    );
  });

  save$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CardsActions.save),
      switchMap(({ id, changes }) =>
        this.api.patch<Card>(`/cards/${id}`, changes).pipe(
          map((card: Card) => CardsActions.saveSuccess({ card })),
          catchError((error: unknown) =>
            of(CardsActions.saveFailure({ message: resolveErrorMessage(error) })),
          ),
        ),
      ),
    );
  });

  delete$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CardsActions.delete),
      switchMap(({ id }) =>
        this.api.delete(`/cards/${id}`).pipe(
          map(() => CardsActions.deleteSuccess({ id })),
          catchError((error: unknown) =>
            of(CardsActions.deleteFailure({ message: resolveErrorMessage(error) })),
          ),
        ),
      ),
    );
  });

  duplicate$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CardsActions.duplicate),
      switchMap(({ id }) =>
        this.api.post<Card>(`/cards/${id}/duplicate`, {}).pipe(
          map((card: Card) => CardsActions.duplicateSuccess({ card })),
          catchError((error: unknown) =>
            of(CardsActions.duplicateFailure({ message: resolveErrorMessage(error) })),
          ),
        ),
      ),
    );
  });

  uploadImage$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CardsActions.uploadImage),
      switchMap(({ cardId, layerId, file }) => {
        const formData = new FormData();

        formData.append('layerId', layerId);
        formData.append('file', file);

        // Kein Inhaltstyp von Hand: den setzt der Browser samt Trennmarke selbst.
        return this.api.postForm<CardImage>(`/cards/${cardId}/images`, formData).pipe(
          map((image: CardImage) => CardsActions.uploadImageSuccess({ cardId, image })),
          catchError((error: unknown) =>
            of(CardsActions.uploadImageFailure({ message: resolveErrorMessage(error) })),
          ),
        );
      }),
    );
  });

  updateImagePlacement$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CardsActions.updateImagePlacement),
      switchMap(({ cardId, layerId, placement }) =>
        this.api.patch<CardImage>(`/cards/${cardId}/images/${layerId}`, placement).pipe(
          map((image: CardImage) => CardsActions.updateImagePlacementSuccess({ cardId, image })),
          catchError((error: unknown) =>
            of(CardsActions.updateImagePlacementFailure({ message: resolveErrorMessage(error) })),
          ),
        ),
      ),
    );
  });

  removeImage$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(CardsActions.removeImage),
      switchMap(({ cardId, layerId }) =>
        this.api.delete(`/cards/${cardId}/images/${layerId}`).pipe(
          map(() => CardsActions.removeImageSuccess({ cardId, layerId })),
          catchError((error: unknown) =>
            of(CardsActions.removeImageFailure({ message: resolveErrorMessage(error) })),
          ),
        ),
      ),
    );
  });

  /**
   * Der Render-Zwischenspeicher hält Bilddateien unter `cardId:layerId` fest. Wird in
   * dieselbe Fläche ein neues Bild geladen, zeigt die Vorschau sonst weiter das alte.
   */
  reloadUploadedImage$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(CardsActions.uploadImageSuccess),
        tap(({ cardId, image }: { cardId: number; image: CardImage }) =>
          this.cardImages.reload(cardId, image.layerId),
        ),
      );
    },
    { dispatch: false },
  );

  forgetRemovedImage$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(CardsActions.removeImageSuccess),
        tap(({ cardId, layerId }: { cardId: number; layerId: string }) =>
          this.cardImages.forget(cardId, layerId),
        ),
      );
    },
    { dispatch: false },
  );

  private fetchSummaries(): Observable<
    ReturnType<typeof CardsActions.loadSuccess> | ReturnType<typeof CardsActions.loadFailure>
  > {
    return this.api.get<CardsListResponse>('/cards').pipe(
      map((response: CardsListResponse) => CardsActions.loadSuccess(response)),
      catchError((error: unknown) =>
        of(CardsActions.loadFailure({ message: resolveErrorMessage(error) })),
      ),
    );
  }
}

function resolveErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const body = error.error as { message?: string; fields?: Record<string, string> } | null;
    const fields = body?.fields;

    if (fields) {
      const fieldMessages = Object.values(fields);

      if (fieldMessages.length > 0) {
        return fieldMessages.join(' ');
      }
    }

    if (body?.message) {
      return body.message;
    }
  }

  return 'Die Karte konnte nicht gespeichert werden.';
}
