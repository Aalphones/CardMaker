import { Injectable, Signal, inject } from '@angular/core';
import { Store, createSelector } from '@ngrx/store';

import { CardImagePlacement, CardInput, CardSummary, CardsActions } from './cards.actions';
import { cardsFeature } from './cards.feature';

@Injectable({
  providedIn: 'root',
})
export class CardsFacade {
  private readonly store = inject(Store);
  private readonly summaryByIdSignals = new Map<number, Signal<CardSummary | undefined>>();

  readonly summaries = this.store.selectSignal(cardsFeature.selectSummaries);
  readonly summariesLoaded = this.store.selectSignal(cardsFeature.selectSummariesLoaded);
  readonly summariesLoading = this.store.selectSignal(cardsFeature.selectSummariesLoading);
  readonly current = this.store.selectSignal(cardsFeature.selectCurrent);
  readonly currentLoading = this.store.selectSignal(cardsFeature.selectCurrentLoading);
  readonly error = this.store.selectSignal(cardsFeature.selectError);

  ensureLoaded(): void {
    this.store.dispatch(CardsActions.load());
  }

  loadOne(id: number): void {
    this.store.dispatch(CardsActions.loadOne({ id }));
  }

  /** Pro Kennung gecached — sonst legt jeder Konsument eine eigene Selektor-Instanz an. */
  summaryById(id: number): Signal<CardSummary | undefined> {
    let signal = this.summaryByIdSignals.get(id);

    if (!signal) {
      const selectSummaryById = createSelector(
        cardsFeature.selectSummaries,
        (summaries: CardSummary[]) => summaries.find((summary: CardSummary) => summary.id === id),
      );
      signal = this.store.selectSignal(selectSummaryById);
      this.summaryByIdSignals.set(id, signal);
    }

    return signal;
  }

  create(input: CardInput): void {
    this.store.dispatch(CardsActions.create({ input }));
  }

  save(id: number, changes: Partial<CardInput>): void {
    this.store.dispatch(CardsActions.save({ id, changes }));
  }

  remove(id: number): void {
    this.store.dispatch(CardsActions.delete({ id }));
  }

  duplicate(id: number): void {
    this.store.dispatch(CardsActions.duplicate({ id }));
  }

  uploadImage(cardId: number, layerId: string, file: File): void {
    this.store.dispatch(CardsActions.uploadImage({ cardId, layerId, file }));
  }

  updateImagePlacement(cardId: number, layerId: string, placement: CardImagePlacement): void {
    this.store.dispatch(CardsActions.updateImagePlacement({ cardId, layerId, placement }));
  }

  removeImage(cardId: number, layerId: string): void {
    this.store.dispatch(CardsActions.removeImage({ cardId, layerId }));
  }
}
