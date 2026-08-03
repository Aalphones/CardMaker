import { createFeature, createReducer, on } from '@ngrx/store';

import { Asset, AssetsActions } from './assets.actions';

export interface AssetsState {
  items: Asset[];
  loaded: boolean;
  loading: boolean;
  uploading: boolean;
  error: string | null;
}

const initialState: AssetsState = {
  items: [],
  loaded: false,
  loading: false,
  uploading: false,
  error: null,
};

export const assetsFeature = createFeature({
  name: 'assets',
  reducer: createReducer(
    initialState,
    on(AssetsActions.load, (state): AssetsState => ({ ...state, loading: true, error: null })),
    on(AssetsActions.loadSuccess, (state, { items }): AssetsState => ({
      ...state,
      items,
      loaded: true,
      loading: false,
    })),
    on(AssetsActions.loadFailure, (state, { message }): AssetsState => ({
      ...state,
      loading: false,
      error: message,
    })),
    on(AssetsActions.upload, (state): AssetsState => ({ ...state, uploading: true, error: null })),
    on(AssetsActions.uploadSuccess, (state, { asset }): AssetsState => ({
      ...state,
      items: [...state.items, asset],
      uploading: false,
    })),
    on(AssetsActions.uploadFailure, (state, { message }): AssetsState => ({
      ...state,
      uploading: false,
      error: message,
    })),
    on(AssetsActions.deleteSuccess, (state, { id }): AssetsState => ({
      ...state,
      items: state.items.filter((asset: Asset) => asset.id !== id),
    })),
    on(AssetsActions.deleteFailure, (state, { message }): AssetsState => ({ ...state, error: message })),
  ),
});

export const { selectItems, selectLoaded, selectLoading, selectUploading, selectError } = assetsFeature;
