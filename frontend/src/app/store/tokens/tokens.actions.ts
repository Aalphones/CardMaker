import { createActionGroup, emptyProps, props } from '@ngrx/store';

export interface AccessToken {
  id: number;
  name: string;
  createdAt: string;
  lastUsedAt: string | null;
}

export interface AccessTokenWithSecret {
  id: number;
  name: string;
  token: string;
}

export const TokensActions = createActionGroup({
  source: 'Tokens',
  events: {
    Load: emptyProps(),
    'Load Success': props<{ items: AccessToken[] }>(),
    'Load Failure': props<{ message: string }>(),
    Create: props<{ name: string }>(),
    'Create Success': props<{ token: AccessTokenWithSecret }>(),
    'Create Failure': props<{ message: string }>(),
    Delete: props<{ id: number }>(),
    'Delete Success': props<{ id: number }>(),
    'Delete Failure': props<{ message: string }>(),
    'Dismiss New Token': emptyProps(),
  },
});
