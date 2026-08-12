import { createActionGroup, emptyProps, props } from '@ngrx/store';

import { Layer } from '../../shared/canvas/rendering/layer';

export interface TemplateSummary {
  id: number;
  name: string;
  description: string | null;
  layerCount: number;
  cardCount: number;
  previewUpdatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  id: number;
  name: string;
  description: string | null;
  layers: Layer[];
  previewUpdatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const TemplatesActions = createActionGroup({
  source: 'Templates',
  events: {
    Load: emptyProps(),
    'Load Success': props<{ items: TemplateSummary[] }>(),
    'Load Failure': props<{ message: string }>(),
    'Load One': props<{ id: number }>(),
    'Load One Success': props<{ template: Template }>(),
    'Load One Failure': props<{ message: string }>(),
    Create: props<{ name: string; description: string | null }>(),
    'Create Success': props<{ template: Template }>(),
    'Create Failure': props<{ message: string }>(),
    Save: props<{ id: number; name: string; description: string | null; layers: Layer[] }>(),
    'Save Success': props<{ template: Template }>(),
    'Save Failure': props<{ message: string }>(),
    Delete: props<{ id: number }>(),
    'Delete Success': props<{ id: number }>(),
    'Delete Failure': props<{ message: string }>(),
  },
});
