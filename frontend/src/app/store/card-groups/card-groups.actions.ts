import { createActionGroup, emptyProps, props } from '@ngrx/store';

export interface CardGroup {
  id: number;
  name: string;
  description: string | null;
  cardCount: number;
  createdAt: string;
  updatedAt: string;
}

export const CardGroupsActions = createActionGroup({
  source: 'CardGroups',
  events: {
    Load: emptyProps(),
    'Load Success': props<{ items: CardGroup[] }>(),
    'Load Failure': props<{ message: string }>(),
    Create: props<{ name: string; description: string | null }>(),
    'Create Success': props<{ cardGroup: CardGroup }>(),
    'Create Failure': props<{ message: string }>(),
    Update: props<{ id: number; name: string; description: string | null }>(),
    'Update Success': props<{ cardGroup: CardGroup }>(),
    'Update Failure': props<{ message: string }>(),
    Delete: props<{ id: number }>(),
    'Delete Success': props<{ id: number }>(),
    'Delete Failure': props<{ message: string }>(),
  },
});
