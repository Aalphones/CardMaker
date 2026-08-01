import { createFeature, createReducer, on } from '@ngrx/store';

import { AccessToken, AccessTokenWithSecret, TokensActions } from './tokens.actions';

export interface TokensState {
  items: AccessToken[];
  loaded: boolean;
  loading: boolean;
  error: string | null;
  newToken: AccessTokenWithSecret | null;
}

const initialState: TokensState = {
  items: [],
  loaded: false,
  loading: false,
  error: null,
  newToken: null,
};

export const tokensFeature = createFeature({
  name: 'tokens',
  reducer: createReducer(
    initialState,
    on(TokensActions.load, (state): TokensState => ({ ...state, loading: true, error: null })),
    on(TokensActions.loadSuccess, (state, { items }): TokensState => ({
      ...state,
      items,
      loaded: true,
      loading: false,
    })),
    on(TokensActions.loadFailure, (state, { message }): TokensState => ({
      ...state,
      loading: false,
      error: message,
    })),
    on(TokensActions.createSuccess, (state, { token }): TokensState => ({
      ...state,
      items: [
        ...state.items,
        { id: token.id, name: token.name, createdAt: new Date().toISOString(), lastUsedAt: null },
      ],
      newToken: token,
    })),
    on(TokensActions.createFailure, (state, { message }): TokensState => ({
      ...state,
      error: message,
    })),
    on(TokensActions.deleteSuccess, (state, { id }): TokensState => ({
      ...state,
      items: state.items.filter((item: AccessToken) => item.id !== id),
    })),
    on(TokensActions.deleteFailure, (state, { message }): TokensState => ({
      ...state,
      error: message,
    })),
    on(TokensActions.dismissNewToken, (state): TokensState => ({ ...state, newToken: null })),
  ),
});

export const { selectItems, selectLoaded, selectLoading, selectError, selectNewToken } =
  tokensFeature;
