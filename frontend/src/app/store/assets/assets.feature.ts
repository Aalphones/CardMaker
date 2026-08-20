import { createFeature, createReducer, on } from '@ngrx/store';

import { Asset, AssetsActions } from './assets.actions';

export interface AssetsState {
  items: Asset[];
  loaded: boolean;
  loading: boolean;
  uploading: boolean;
  error: string | null;
  uploadFileError: string | null;
  lastUploaded: Asset | null;
  renaming: boolean;
  renameError: string | null;
}

const initialState: AssetsState = {
  items: [],
  loaded: false,
  loading: false,
  uploading: false,
  error: null,
  uploadFileError: null,
  lastUploaded: null,
  renaming: false,
  renameError: null,
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
    on(AssetsActions.upload, (state): AssetsState => ({
      ...state,
      uploading: true,
      error: null,
      uploadFileError: null,
      lastUploaded: null,
    })),
    on(AssetsActions.uploadSuccess, (state, { asset }): AssetsState => ({
      ...state,
      items: [...state.items, asset],
      uploading: false,
      lastUploaded: asset,
    })),
    on(AssetsActions.uploadFailure, (state, { message, fileError }): AssetsState => ({
      ...state,
      uploading: false,
      error: message,
      uploadFileError: fileError,
    })),
    on(AssetsActions.rename, (state): AssetsState => ({
      ...state,
      renaming: true,
      renameError: null,
    })),
    on(AssetsActions.renameSuccess, (state, { asset }): AssetsState => ({
      ...state,
      items: state.items.map((item: Asset) => (item.id === asset.id ? asset : item)),
      renaming: false,
    })),
    on(AssetsActions.renameFailure, (state, { message }): AssetsState => ({
      ...state,
      renaming: false,
      renameError: message,
    })),
    on(AssetsActions.deleteSuccess, (state, { id }): AssetsState => ({
      ...state,
      items: state.items.filter((asset: Asset) => asset.id !== id),
    })),
    on(AssetsActions.deleteFailure, (state, { message }): AssetsState => ({ ...state, error: message })),
  ),
});

export const {
  selectItems,
  selectLoaded,
  selectLoading,
  selectUploading,
  selectError,
  selectUploadFileError,
  selectLastUploaded,
  selectRenaming,
  selectRenameError,
} = assetsFeature;
