import { Injectable, Signal, inject } from '@angular/core';
import { Store, createSelector } from '@ngrx/store';

import { Layer } from '../../shared/canvas/rendering/layer';
import { TemplateSummary, TemplatesActions } from './templates.actions';
import { templatesFeature } from './templates.feature';

@Injectable({
  providedIn: 'root',
})
export class TemplatesFacade {
  private readonly store = inject(Store);
  private readonly summaryByIdSignals = new Map<number, Signal<TemplateSummary | undefined>>();

  readonly summaries = this.store.selectSignal(templatesFeature.selectSummaries);
  readonly summariesLoaded = this.store.selectSignal(templatesFeature.selectSummariesLoaded);
  readonly summariesLoading = this.store.selectSignal(templatesFeature.selectSummariesLoading);
  readonly current = this.store.selectSignal(templatesFeature.selectCurrent);
  readonly currentLoading = this.store.selectSignal(templatesFeature.selectCurrentLoading);
  readonly error = this.store.selectSignal(templatesFeature.selectError);

  ensureLoaded(): void {
    this.store.dispatch(TemplatesActions.load());
  }

  loadOne(id: number): void {
    this.store.dispatch(TemplatesActions.loadOne({ id }));
  }

  summaryById(id: number): Signal<TemplateSummary | undefined> {
    let signal = this.summaryByIdSignals.get(id);

    if (!signal) {
      const selectSummaryById = createSelector(
        templatesFeature.selectSummaries,
        (summaries: TemplateSummary[]) => summaries.find((summary: TemplateSummary) => summary.id === id),
      );
      signal = this.store.selectSignal(selectSummaryById);
      this.summaryByIdSignals.set(id, signal);
    }

    return signal;
  }

  create(name: string, description: string | null): void {
    this.store.dispatch(TemplatesActions.create({ name, description }));
  }

  save(id: number, name: string, description: string | null, layers: Layer[]): void {
    this.store.dispatch(TemplatesActions.save({ id, name, description, layers }));
  }

  remove(id: number): void {
    this.store.dispatch(TemplatesActions.delete({ id }));
  }
}
