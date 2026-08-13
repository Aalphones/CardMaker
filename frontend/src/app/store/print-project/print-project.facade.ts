import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';

import { PrintOptions, PrintProjectActions } from './print-project.actions';
import { printProjectFeature } from './print-project.feature';

@Injectable({
  providedIn: 'root',
})
export class PrintProjectFacade {
  private readonly store = inject(Store);

  readonly options = this.store.selectSignal(printProjectFeature.selectOptions);
  readonly items = this.store.selectSignal(printProjectFeature.selectItems);
  readonly loaded = this.store.selectSignal(printProjectFeature.selectLoaded);
  readonly saving = this.store.selectSignal(printProjectFeature.selectSaving);
  readonly error = this.store.selectSignal(printProjectFeature.selectError);
  readonly totalQuantity = this.store.selectSignal(printProjectFeature.selectTotalQuantity);

  ensureLoaded(): void {
    this.store.dispatch(PrintProjectActions.load());
  }

  setOptions(options: PrintOptions): void {
    this.store.dispatch(PrintProjectActions.setOptions({ options }));
  }

  addItem(cardId: number, quantity?: number): void {
    this.store.dispatch(PrintProjectActions.addItem({ cardId, quantity }));
  }

  setQuantity(id: number, quantity: number): void {
    this.store.dispatch(PrintProjectActions.setQuantity({ id, quantity }));
  }

  removeItem(id: number): void {
    this.store.dispatch(PrintProjectActions.removeItem({ id }));
  }

  clear(): void {
    this.store.dispatch(PrintProjectActions.clear());
  }
}
