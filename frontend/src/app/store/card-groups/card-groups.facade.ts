import { Injectable, Signal, inject } from '@angular/core';
import { Store, createSelector } from '@ngrx/store';

import { CardGroup, CardGroupsActions } from './card-groups.actions';
import { cardGroupsFeature } from './card-groups.feature';

@Injectable({
  providedIn: 'root',
})
export class CardGroupsFacade {
  private readonly store = inject(Store);
  private readonly byIdSignals = new Map<number, Signal<CardGroup | undefined>>();

  readonly all = this.store.selectSignal(cardGroupsFeature.selectItems);
  readonly loaded = this.store.selectSignal(cardGroupsFeature.selectLoaded);
  readonly loading = this.store.selectSignal(cardGroupsFeature.selectLoading);
  readonly error = this.store.selectSignal(cardGroupsFeature.selectError);

  ensureLoaded(): void {
    this.store.dispatch(CardGroupsActions.load());
  }

  byId(id: number): Signal<CardGroup | undefined> {
    let signal = this.byIdSignals.get(id);

    if (!signal) {
      const selectById = createSelector(cardGroupsFeature.selectItems, (items: CardGroup[]) =>
        items.find((item: CardGroup) => item.id === id),
      );
      signal = this.store.selectSignal(selectById);
      this.byIdSignals.set(id, signal);
    }

    return signal;
  }

  create(name: string, description: string | null): void {
    this.store.dispatch(CardGroupsActions.create({ name, description }));
  }

  update(id: number, name: string, description: string | null): void {
    this.store.dispatch(CardGroupsActions.update({ id, name, description }));
  }

  remove(id: number): void {
    this.store.dispatch(CardGroupsActions.delete({ id }));
  }
}
