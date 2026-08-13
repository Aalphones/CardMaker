import { createFeature, createReducer, createSelector, on } from '@ngrx/store';

import { PrintItem, PrintOptions, PrintProjectActions } from './print-project.actions';

export interface PrintProjectState {
  options: PrintOptions;
  items: PrintItem[];
  loaded: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: PrintProjectState = {
  options: { cutMarks: true, bleed: false },
  items: [],
  loaded: false,
  saving: false,
  error: null,
};

export const printProjectFeature = createFeature({
  name: 'printProject',
  reducer: createReducer(
    initialState,
    on(PrintProjectActions.load, (state): PrintProjectState => ({ ...state, saving: true, error: null })),
    on(PrintProjectActions.loadSuccess, (state, { options, items }): PrintProjectState => ({
      ...state,
      options,
      items,
      loaded: true,
      saving: false,
    })),
    on(PrintProjectActions.loadFailure, (state, { message }): PrintProjectState => ({
      ...state,
      saving: false,
      error: message,
    })),
    on(PrintProjectActions.setOptions, (state): PrintProjectState => ({ ...state, saving: true, error: null })),
    on(PrintProjectActions.setOptionsSuccess, (state, { options }): PrintProjectState => ({
      ...state,
      options,
      saving: false,
    })),
    on(PrintProjectActions.setOptionsFailure, (state, { message }): PrintProjectState => ({
      ...state,
      saving: false,
      error: message,
    })),
    on(PrintProjectActions.addItem, (state): PrintProjectState => ({ ...state, saving: true, error: null })),
    on(PrintProjectActions.addItemSuccess, (state, { item }): PrintProjectState => {
      const alreadyPresent: boolean = state.items.some((existing: PrintItem) => existing.id === item.id);

      return {
        ...state,
        items: alreadyPresent
          ? state.items.map((existing: PrintItem) => (existing.id === item.id ? item : existing))
          : [...state.items, item],
        saving: false,
      };
    }),
    on(PrintProjectActions.addItemFailure, (state, { message }): PrintProjectState => ({
      ...state,
      saving: false,
      error: message,
    })),
    on(PrintProjectActions.setQuantity, (state): PrintProjectState => ({ ...state, saving: true, error: null })),
    on(PrintProjectActions.setQuantitySuccess, (state, { item }): PrintProjectState => ({
      ...state,
      items: state.items.map((existing: PrintItem) => (existing.id === item.id ? item : existing)),
      saving: false,
    })),
    on(PrintProjectActions.setQuantityFailure, (state, { message }): PrintProjectState => ({
      ...state,
      saving: false,
      error: message,
    })),
    on(PrintProjectActions.removeItem, (state): PrintProjectState => ({ ...state, saving: true, error: null })),
    on(PrintProjectActions.removeItemSuccess, (state, { id }): PrintProjectState => ({
      ...state,
      items: state.items.filter((existing: PrintItem) => existing.id !== id),
      saving: false,
    })),
    on(PrintProjectActions.removeItemFailure, (state, { message }): PrintProjectState => ({
      ...state,
      saving: false,
      error: message,
    })),
    on(PrintProjectActions.clear, (state): PrintProjectState => ({ ...state, saving: true, error: null })),
    on(PrintProjectActions.clearSuccess, (state): PrintProjectState => ({
      ...state,
      items: [],
      saving: false,
    })),
    on(PrintProjectActions.clearFailure, (state, { message }): PrintProjectState => ({
      ...state,
      saving: false,
      error: message,
    })),
  ),
  extraSelectors: ({ selectItems }) => ({
    selectTotalQuantity: createSelector(selectItems, (items: PrintItem[]) =>
      items.reduce((sum: number, item: PrintItem) => sum + item.quantity, 0),
    ),
  }),
});

export const {
  selectOptions,
  selectItems,
  selectLoaded,
  selectSaving,
  selectError,
  selectTotalQuantity,
} = printProjectFeature;
