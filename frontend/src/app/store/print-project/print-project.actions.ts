import { createActionGroup, emptyProps, props } from '@ngrx/store';

/** Deckel aus dem Backend-Validator — Anzahl je Position darf nicht darüber hinaus. */
export const PRINT_ITEM_MAX_QUANTITY = 99;

export interface PrintOptions {
  cutMarks: boolean;
  bleed: boolean;
}

export interface PrintItem {
  id: number;
  cardId: number;
  cardName: string;
  quantity: number;
  previewUpdatedAt: string | null;
}

export const PrintProjectActions = createActionGroup({
  source: 'PrintProject',
  events: {
    Load: emptyProps(),
    'Load Success': props<{ options: PrintOptions; items: PrintItem[] }>(),
    'Load Failure': props<{ message: string }>(),
    'Set Options': props<{ options: PrintOptions }>(),
    'Set Options Success': props<{ options: PrintOptions }>(),
    'Set Options Failure': props<{ message: string }>(),
    'Add Item': props<{ cardId: number; quantity?: number }>(),
    'Add Item Success': props<{ item: PrintItem }>(),
    'Add Item Failure': props<{ message: string }>(),
    'Set Quantity': props<{ id: number; quantity: number }>(),
    'Set Quantity Success': props<{ item: PrintItem }>(),
    'Set Quantity Failure': props<{ message: string }>(),
    'Remove Item': props<{ id: number }>(),
    'Remove Item Success': props<{ id: number }>(),
    'Remove Item Failure': props<{ message: string }>(),
    Clear: emptyProps(),
    'Clear Success': emptyProps(),
    'Clear Failure': props<{ message: string }>(),
  },
});
