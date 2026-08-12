import { createFeature, createReducer, on } from '@ngrx/store';

import { Template, TemplateSummary, TemplatesActions } from './templates.actions';

export interface TemplatesState {
  summaries: TemplateSummary[];
  summariesLoaded: boolean;
  summariesLoading: boolean;
  current: Template | null;
  currentLoading: boolean;
  error: string | null;
}

const initialState: TemplatesState = {
  summaries: [],
  summariesLoaded: false,
  summariesLoading: false,
  current: null,
  currentLoading: false,
  error: null,
};

function toSummary(template: Template): TemplateSummary {
  return {
    id: template.id,
    name: template.name,
    description: template.description,
    layerCount: template.layers.length,
    previewUpdatedAt: template.previewUpdatedAt,
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,
  };
}

export const templatesFeature = createFeature({
  name: 'templates',
  reducer: createReducer(
    initialState,
    on(TemplatesActions.load, (state): TemplatesState => ({ ...state, summariesLoading: true, error: null })),
    on(TemplatesActions.loadSuccess, (state, { items }): TemplatesState => ({
      ...state,
      summaries: items,
      summariesLoaded: true,
      summariesLoading: false,
    })),
    on(TemplatesActions.loadFailure, (state, { message }): TemplatesState => ({
      ...state,
      summariesLoading: false,
      error: message,
    })),
    on(TemplatesActions.loadOne, (state): TemplatesState => ({ ...state, currentLoading: true, error: null })),
    on(TemplatesActions.loadOneSuccess, (state, { template }): TemplatesState => ({
      ...state,
      current: template,
      currentLoading: false,
    })),
    on(TemplatesActions.loadOneFailure, (state, { message }): TemplatesState => ({
      ...state,
      currentLoading: false,
      error: message,
    })),
    on(TemplatesActions.createSuccess, (state, { template }): TemplatesState => ({
      ...state,
      summaries: [...state.summaries, toSummary(template)],
      current: template,
    })),
    on(TemplatesActions.createFailure, (state, { message }): TemplatesState => ({ ...state, error: message })),
    on(TemplatesActions.saveSuccess, (state, { template }): TemplatesState => ({
      ...state,
      current: template,
      summaries: state.summaries.map((summary: TemplateSummary) =>
        summary.id === template.id ? toSummary(template) : summary,
      ),
    })),
    on(TemplatesActions.saveFailure, (state, { message }): TemplatesState => ({ ...state, error: message })),
    on(TemplatesActions.deleteSuccess, (state, { id }): TemplatesState => ({
      ...state,
      summaries: state.summaries.filter((summary: TemplateSummary) => summary.id !== id),
      current: state.current?.id === id ? null : state.current,
    })),
    on(TemplatesActions.deleteFailure, (state, { message }): TemplatesState => ({ ...state, error: message })),
  ),
});

export const {
  selectSummaries,
  selectSummariesLoaded,
  selectSummariesLoading,
  selectCurrent,
  selectCurrentLoading,
  selectError,
} = templatesFeature;
