import { createFeature, createReducer, on } from '@ngrx/store';

import { Card, CardImage, CardSummary, CardsActions } from './cards.actions';

export interface CardsState {
  summaries: CardSummary[];
  summariesLoaded: boolean;
  summariesLoading: boolean;
  current: Card | null;
  currentLoading: boolean;
  /** Bildflächen, deren Datei gerade zum Server unterwegs ist. */
  uploadingImageLayerIds: string[];
  error: string | null;
}

const initialState: CardsState = {
  summaries: [],
  summariesLoaded: false,
  summariesLoading: false,
  current: null,
  currentLoading: false,
  uploadingImageLayerIds: [],
  error: null,
};

function withoutLayerId(layerIds: string[], layerId: string): string[] {
  return layerIds.filter((existing: string) => existing !== layerId);
}

/**
 * Bilder gehören zur geöffneten Karte, nicht zu einer beliebigen — deshalb bewegt jede
 * Bild-Antwort den Zustand nur, wenn sie zur gerade geöffneten Karte gehört.
 */
function withImage(state: CardsState, cardId: number, image: CardImage): CardsState {
  if (state.current === null || state.current.id !== cardId) {
    return state;
  }

  const others = state.current.images.filter(
    (existing: CardImage) => existing.layerId !== image.layerId,
  );

  return {
    ...state,
    current: { ...state.current, images: [...others, image] },
  };
}

export const cardsFeature = createFeature({
  name: 'cards',
  reducer: createReducer(
    initialState,
    on(
      CardsActions.load,
      CardsActions.refresh,
      (state): CardsState => ({ ...state, summariesLoading: true, error: null }),
    ),
    on(
      CardsActions.loadSuccess,
      (state, { items }): CardsState => ({
        ...state,
        summaries: items,
        summariesLoaded: true,
        summariesLoading: false,
      }),
    ),
    on(
      CardsActions.loadFailure,
      (state, { message }): CardsState => ({
        ...state,
        summariesLoading: false,
        error: message,
      }),
    ),
    on(
      CardsActions.loadOne,
      (state): CardsState => ({ ...state, currentLoading: true, error: null }),
    ),
    on(
      CardsActions.loadOneSuccess,
      (state, { card }): CardsState => ({ ...state, current: card, currentLoading: false }),
    ),
    on(
      CardsActions.loadOneFailure,
      (state, { message }): CardsState => ({
        ...state,
        currentLoading: false,
        error: message,
      }),
    ),
    on(CardsActions.createSuccess, (state, { card }): CardsState => ({ ...state, current: card })),
    on(CardsActions.createFailure, (state, { message }): CardsState => ({ ...state, error: message })),
    on(CardsActions.saveSuccess, (state, { card }): CardsState => ({ ...state, current: card })),
    on(CardsActions.saveFailure, (state, { message }): CardsState => ({ ...state, error: message })),
    on(
      CardsActions.deleteSuccess,
      (state, { id }): CardsState => ({
        ...state,
        summaries: state.summaries.filter((summary: CardSummary) => summary.id !== id),
        current: state.current?.id === id ? null : state.current,
      }),
    ),
    on(CardsActions.deleteFailure, (state, { message }): CardsState => ({ ...state, error: message })),
    on(CardsActions.duplicateFailure, (state, { message }): CardsState => ({ ...state, error: message })),
    on(
      CardsActions.uploadImage,
      (state, { layerId }): CardsState => ({
        ...state,
        uploadingImageLayerIds: [...withoutLayerId(state.uploadingImageLayerIds, layerId), layerId],
      }),
    ),
    on(CardsActions.uploadImageSuccess, (state, { cardId, image }): CardsState => ({
      ...withImage(state, cardId, image),
      uploadingImageLayerIds: withoutLayerId(state.uploadingImageLayerIds, image.layerId),
    })),
    on(
      CardsActions.uploadImageFailure,
      (state, { layerId, message }): CardsState => ({
        ...state,
        uploadingImageLayerIds: withoutLayerId(state.uploadingImageLayerIds, layerId),
        error: message,
      }),
    ),
    on(CardsActions.updateImagePlacementSuccess, (state, { cardId, image }): CardsState =>
      withImage(state, cardId, image),
    ),
    on(
      CardsActions.updateImagePlacementFailure,
      (state, { message }): CardsState => ({ ...state, error: message }),
    ),
    on(CardsActions.removeImageSuccess, (state, { cardId, layerId }): CardsState => {
      if (state.current === null || state.current.id !== cardId) {
        return state;
      }

      return {
        ...state,
        current: {
          ...state.current,
          images: state.current.images.filter((image: CardImage) => image.layerId !== layerId),
        },
      };
    }),
    on(CardsActions.removeImageFailure, (state, { message }): CardsState => ({ ...state, error: message })),
  ),
});

export const {
  selectSummaries,
  selectSummariesLoaded,
  selectSummariesLoading,
  selectCurrent,
  selectCurrentLoading,
  selectUploadingImageLayerIds,
  selectError,
} = cardsFeature;
