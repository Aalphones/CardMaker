import { createFeature, createReducer, on } from '@ngrx/store';

import { CardGroup, CardGroupsActions } from './card-groups.actions';

export interface CardGroupsState {
  items: CardGroup[];
  loaded: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: CardGroupsState = {
  items: [],
  loaded: false,
  loading: false,
  error: null,
};

export const cardGroupsFeature = createFeature({
  name: 'cardGroups',
  reducer: createReducer(
    initialState,
    on(CardGroupsActions.load, (state): CardGroupsState => ({ ...state, loading: true, error: null })),
    on(CardGroupsActions.loadSuccess, (state, { items }): CardGroupsState => ({
      ...state,
      items,
      loaded: true,
      loading: false,
    })),
    on(CardGroupsActions.loadFailure, (state, { message }): CardGroupsState => ({
      ...state,
      loading: false,
      error: message,
    })),
    on(CardGroupsActions.createSuccess, (state, { cardGroup }): CardGroupsState => ({
      ...state,
      items: [...state.items, cardGroup],
    })),
    on(CardGroupsActions.createFailure, (state, { message }): CardGroupsState => ({
      ...state,
      error: message,
    })),
    on(CardGroupsActions.updateSuccess, (state, { cardGroup }): CardGroupsState => ({
      ...state,
      items: state.items.map((item: CardGroup) => (item.id === cardGroup.id ? cardGroup : item)),
    })),
    on(CardGroupsActions.updateFailure, (state, { message }): CardGroupsState => ({
      ...state,
      error: message,
    })),
    on(CardGroupsActions.deleteSuccess, (state, { id }): CardGroupsState => ({
      ...state,
      items: state.items.filter((item: CardGroup) => item.id !== id),
    })),
    on(CardGroupsActions.deleteFailure, (state, { message }): CardGroupsState => ({
      ...state,
      error: message,
    })),
  ),
});

export const { selectItems, selectLoaded, selectLoading, selectError } = cardGroupsFeature;
