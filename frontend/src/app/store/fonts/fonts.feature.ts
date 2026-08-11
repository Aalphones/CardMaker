import { createFeature, createReducer, on } from '@ngrx/store';

import { Font, FontsActions } from './fonts.actions';

export interface FontsState {
  items: Font[];
  loaded: boolean;
  loading: boolean;
  uploading: boolean;
  error: string | null;
  uploadFileError: string | null;
  lastUploaded: Font | null;
}

const initialState: FontsState = {
  items: [],
  loaded: false,
  loading: false,
  uploading: false,
  error: null,
  uploadFileError: null,
  lastUploaded: null,
};

export const fontsFeature = createFeature({
  name: 'fonts',
  reducer: createReducer(
    initialState,
    on(FontsActions.load, (state): FontsState => ({ ...state, loading: true, error: null })),
    on(FontsActions.loadSuccess, (state, { items }): FontsState => ({
      ...state,
      items,
      loaded: true,
      loading: false,
    })),
    on(FontsActions.loadFailure, (state, { message }): FontsState => ({
      ...state,
      loading: false,
      error: message,
    })),
    on(FontsActions.upload, (state): FontsState => ({
      ...state,
      uploading: true,
      error: null,
      uploadFileError: null,
      lastUploaded: null,
    })),
    on(FontsActions.uploadSuccess, (state, { font }): FontsState => ({
      ...state,
      items: [...state.items, font],
      uploading: false,
      lastUploaded: font,
    })),
    on(FontsActions.uploadFailure, (state, { message, fileError }): FontsState => ({
      ...state,
      uploading: false,
      error: message,
      uploadFileError: fileError,
    })),
    on(FontsActions.renameSuccess, (state, { font }): FontsState => ({
      ...state,
      items: state.items.map((item: Font) => (item.id === font.id ? font : item)),
    })),
    on(FontsActions.renameFailure, (state, { message }): FontsState => ({
      ...state,
      error: message,
    })),
    on(FontsActions.deleteSuccess, (state, { id }): FontsState => ({
      ...state,
      items: state.items.filter((font: Font) => font.id !== id),
    })),
    on(FontsActions.deleteFailure, (state, { message }): FontsState => ({
      ...state,
      error: message,
    })),
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
} = fontsFeature;
