import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

import { Layer, LayerPatch, LayerType, ShapeKind, createLayer } from '../shared/canvas/rendering/layer';

export interface TemplateEditorState {
  layers: Layer[];
  selectedLayerId: string | null;
  dirty: boolean;
}

const initialState: TemplateEditorState = {
  layers: [],
  selectedLayerId: null,
  dirty: false,
};

function buildLayer(type: LayerType, shape: ShapeKind): Layer {
  switch (type) {
    case 'image':
      return createLayer('image');
    case 'shape':
      if (shape === 'rect') {
        return createLayer('shape', 'rect');
      }

      if (shape === 'circle') {
        return createLayer('shape', 'circle');
      }

      return createLayer('shape', 'line');
    case 'icon':
      return createLayer('icon');
    case 'frame':
      return createLayer('frame');
    case 'text':
      return createLayer('text');
  }
}

export const TemplateEditorStore = signalStore(
  withState(initialState),
  withComputed(({ layers, selectedLayerId }) => ({
    selectedLayer: computed(() => layers().find((layer: Layer) => layer.id === selectedLayerId()) ?? null),
    canAddFrame: computed(() => !layers().some((layer: Layer) => layer.type === 'frame')),
  })),
  withMethods((store) => ({
    startEditing(layers: Layer[]): void {
      patchState(store, { layers, selectedLayerId: null, dirty: false });
    },
    select(id: string | null): void {
      patchState(store, { selectedLayerId: id });
    },
    addLayer(type: LayerType, shape: ShapeKind = 'rect'): void {
      if (type === 'frame' && store.layers().some((layer: Layer) => layer.type === 'frame')) {
        return;
      }

      const layer = buildLayer(type, shape);
      patchState(store, (state: TemplateEditorState) => ({
        layers: [...state.layers, layer],
        selectedLayerId: layer.id,
        dirty: true,
      }));
    },
    renameLayer(id: string, name: string): void {
      patchState(store, (state: TemplateEditorState) => ({
        layers: state.layers.map((layer: Layer) => (layer.id === id ? { ...layer, name } : layer)),
        dirty: true,
      }));
    },
    duplicateLayer(id: string): void {
      patchState(store, (state: TemplateEditorState) => {
        const index = state.layers.findIndex((layer: Layer) => layer.id === id);

        if (index === -1) {
          return state;
        }

        const source = state.layers[index];

        if (!source) {
          return state;
        }

        const copy: Layer = { ...source, id: crypto.randomUUID(), name: `${source.name} (Kopie)` };
        const layers = [...state.layers];
        layers.splice(index + 1, 0, copy);

        return { ...state, layers, selectedLayerId: copy.id, dirty: true };
      });
    },
    removeLayer(id: string): void {
      patchState(store, (state: TemplateEditorState) => ({
        layers: state.layers.filter((layer: Layer) => layer.id !== id),
        selectedLayerId: state.selectedLayerId === id ? null : state.selectedLayerId,
        dirty: true,
      }));
    },
    moveLayer(fromIndex: number, toIndex: number): void {
      patchState(store, (state: TemplateEditorState) => {
        const layers = [...state.layers];
        const [moved] = layers.splice(fromIndex, 1);

        if (moved === undefined) {
          return state;
        }

        layers.splice(toIndex, 0, moved);

        return { ...state, layers, dirty: true };
      });
    },
    patchLayer(id: string, changes: LayerPatch): void {
      patchState(store, (state: TemplateEditorState) => ({
        layers: state.layers.map((layer: Layer) => (layer.id === id ? ({ ...layer, ...changes } as Layer) : layer)),
        dirty: true,
      }));
    },
    markSaved(): void {
      patchState(store, { dirty: false });
    },
  })),
);
