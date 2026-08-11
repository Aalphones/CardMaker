import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

import { Layer, LayerPatch, LayerType, ShapeKind, createLayer } from '../shared/canvas/rendering/layer';
import {
  Point,
  StageSize,
  clampZoom,
  fitZoom,
  nextZoomStep,
  previousZoomStep,
} from '../shared/canvas/rendering/units';

export type ZoomMode = 'fit' | 'manual';

export interface TemplateEditorState {
  layers: Layer[];
  selectedLayerId: string | null;
  dirty: boolean;

  // Reine Bedienzustände der Bühne — sie gehören weder in den NgRx-Store noch in die
  // gespeicherten Template-Daten: nichts davon überlebt das Schließen des Editors.
  zoomMode: ZoomMode;
  manualZoom: number;
  pan: Point;
  stageSize: StageSize;
  spaceDown: boolean;
  cursorPos: Point | null;
}

const initialState: TemplateEditorState = {
  layers: [],
  selectedLayerId: null,
  dirty: false,
  zoomMode: 'fit',
  manualZoom: 1,
  pan: { x: 0, y: 0 },
  stageSize: { width: 0, height: 0 },
  spaceDown: false,
  cursorPos: null,
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
  withComputed(({ layers, selectedLayerId, zoomMode, manualZoom, stageSize }) => ({
    selectedLayer: computed(() => layers().find((layer: Layer) => layer.id === selectedLayerId()) ?? null),
    canAddFrame: computed(() => !layers().some((layer: Layer) => layer.type === 'frame')),

    // „Eingepasst" ist kein einmal gesetzter Wert, sondern eine Rechnung: Beim Öffnen und
    // bei jeder Größenänderung der Bühne fällt der Maßstab dadurch von selbst neu aus.
    zoom: computed(() => (zoomMode() === 'fit' ? fitZoom(stageSize()) : manualZoom())),
  })),
  withComputed(({ zoom, stageSize, pan }) => ({
    view: computed(() => ({ size: stageSize(), zoom: zoom(), pan: pan() })),
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

    setStageSize(size: StageSize): void {
      patchState(store, { stageSize: size });
    },
    fitView(): void {
      patchState(store, { zoomMode: 'fit', pan: { x: 0, y: 0 } });
    },
    /** Maßstab von Hand setzen — `pan` kommt mit, weil Radzoom beides zugleich ändert. */
    zoomTo(zoom: number, pan: Point): void {
      patchState(store, { zoomMode: 'manual', manualZoom: clampZoom(zoom), pan });
    },
    zoomIn(): void {
      patchState(store, { zoomMode: 'manual', manualZoom: nextZoomStep(store.zoom()) });
    },
    zoomOut(): void {
      patchState(store, { zoomMode: 'manual', manualZoom: previousZoomStep(store.zoom()) });
    },
    panBy(deltaX: number, deltaY: number): void {
      patchState(store, (state: TemplateEditorState) => ({
        // Beim Verschieben aus dem eingepassten Zustand heraus wird der gerade gültige
        // Maßstab eingefroren — sonst spränge die Karte beim nächsten Einpassen zurück.
        zoomMode: 'manual' as ZoomMode,
        manualZoom: state.zoomMode === 'fit' ? fitZoom(state.stageSize) : state.manualZoom,
        pan: { x: state.pan.x + deltaX, y: state.pan.y + deltaY },
      }));
    },
    setSpaceDown(spaceDown: boolean): void {
      patchState(store, { spaceDown });
    },
    setCursorPos(cursorPos: Point | null): void {
      patchState(store, { cursorPos });
    },
  })),
);
