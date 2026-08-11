// Tastaturbedienung des Template-Editors — reine Zuordnung Tastenereignis → Aktion, ohne
// Angular-Abhängigkeit. Die Editor-Komponente hängt sie ans Fenster und führt die Aktionen
// aus; der Kürzel-Dialog zeigt dieselbe Tabelle an. Beides liest aus SHORTCUT_ROWS, damit
// Anzeige und Wirkung nicht auseinanderlaufen können.

import { LayerType, ShapeKind } from '../../../shared/canvas/rendering/layer';

/** Um wie viele Canvas-Einheiten die Pfeiltasten verschieben — mit Umschalttaste zehnmal so weit. */
const ARROW_STEP = 1;
const ARROW_STEP_FAST = 10;

export type EditorAction =
  | { kind: 'deselect' }
  | { kind: 'escape' }
  | { kind: 'blurField' }
  | { kind: 'addLayer'; type: LayerType; shape?: ShapeKind }
  | { kind: 'move'; deltaX: number; deltaY: number }
  | { kind: 'order'; direction: 1 | -1 }
  | { kind: 'duplicate' }
  | { kind: 'remove' }
  | { kind: 'toggleVisible' }
  | { kind: 'rename' }
  | { kind: 'save' }
  | { kind: 'undo' }
  | { kind: 'redo' }
  | { kind: 'zoomIn' }
  | { kind: 'zoomOut' }
  | { kind: 'fitView' }
  | { kind: 'resetZoom' }
  | { kind: 'showShortcuts' };

/** Die Aktionen, die ohne ausgewählte Ebene kein Ziel hätten. */
export type LayerAction = Extract<
  EditorAction,
  { kind: 'move' | 'order' | 'duplicate' | 'remove' | 'toggleVisible' | 'rename' }
>;

export interface ShortcutRow {
  /** Klartext für den Kürzel-Dialog. */
  readonly label: string;
  /** Tasten, wie sie im Dialog stehen — jeder Eintrag wird eine eigene Taste. */
  readonly keys: readonly string[];
  /** Trennzeichen zwischen den Tasten, wenn es zwei Wege für dieselbe Aktion gibt. */
  readonly separator?: string;
  /** `null`, wenn das Ereignis diese Zeile nicht meint. Zeilen ohne Ausgang zeigen nur an. */
  readonly resolve?: (event: KeyboardEvent) => EditorAction | null;
}

/** Cmd auf macOS, Strg überall sonst — und nie beides zugleich mit Alt. */
function isCommand(event: KeyboardEvent): boolean {
  return (event.ctrlKey || event.metaKey) && !event.altKey;
}

function isPlainKey(event: KeyboardEvent, ...keys: string[]): boolean {
  return !isCommand(event) && !event.altKey && keys.includes(event.key);
}

function addLayerRow(
  label: string,
  keys: [string, string],
  variants: [EditorAction, EditorAction],
): ShortcutRow {
  return {
    label,
    keys,
    separator: '/',
    resolve: (event: KeyboardEvent): EditorAction | null => {
      if (isPlainKey(event, keys[0].toLowerCase(), keys[0])) {
        return variants[0];
      }

      if (isPlainKey(event, keys[1].toLowerCase(), keys[1])) {
        return variants[1];
      }

      return null;
    },
  };
}

/** Reihenfolge und Beschriftung kommen aus dem Entwurf (Handoff, „Keyboard shortcuts"). */
export const SHORTCUT_ROWS: readonly ShortcutRow[] = [
  {
    label: 'Auswahl aufheben',
    keys: ['V', 'Esc'],
    separator: '/',
    resolve: (event: KeyboardEvent): EditorAction | null => {
      if (isPlainKey(event, 'v', 'V')) {
        return { kind: 'deselect' };
      }

      // Escape kann mehr als abwählen — welche Stufe dran ist, entscheidet der Editor.
      if (isPlainKey(event, 'Escape')) {
        return { kind: 'escape' };
      }

      return null;
    },
  },
  addLayerRow(
    'Text / Bildfläche',
    ['T', 'I'],
    [
      { kind: 'addLayer', type: 'text' },
      { kind: 'addLayer', type: 'image' },
    ],
  ),
  addLayerRow(
    'Icon / Rahmen',
    ['K', 'F'],
    [
      { kind: 'addLayer', type: 'icon' },
      { kind: 'addLayer', type: 'frame' },
    ],
  ),
  addLayerRow(
    'Rechteck / Kreis',
    ['R', 'O'],
    [
      { kind: 'addLayer', type: 'shape', shape: 'rect' },
      { kind: 'addLayer', type: 'shape', shape: 'circle' },
    ],
  ),
  {
    label: 'Linie',
    keys: ['L'],
    resolve: (event: KeyboardEvent): EditorAction | null =>
      isPlainKey(event, 'l', 'L') ? { kind: 'addLayer', type: 'shape', shape: 'line' } : null,
  },
  {
    label: 'Verschieben (1 / 10 Einheiten)',
    keys: ['Pfeiltasten', 'Umschalt+Pfeiltasten'],
    separator: '/',
    resolve: (event: KeyboardEvent): EditorAction | null => {
      if (isCommand(event) || event.altKey) {
        return null;
      }

      const step = event.shiftKey ? ARROW_STEP_FAST : ARROW_STEP;

      switch (event.key) {
        case 'ArrowLeft':
          return { kind: 'move', deltaX: -step, deltaY: 0 };
        case 'ArrowRight':
          return { kind: 'move', deltaX: step, deltaY: 0 };
        case 'ArrowUp':
          return { kind: 'move', deltaX: 0, deltaY: -step };
        case 'ArrowDown':
          return { kind: 'move', deltaX: 0, deltaY: step };
        default:
          return null;
      }
    },
  },
  {
    label: 'Nach vorn / nach hinten',
    keys: [']', '['],
    separator: '/',
    resolve: (event: KeyboardEvent): EditorAction | null => {
      if (isPlainKey(event, ']')) {
        return { kind: 'order', direction: 1 };
      }

      if (isPlainKey(event, '[')) {
        return { kind: 'order', direction: -1 };
      }

      return null;
    },
  },
  {
    label: 'Duplizieren',
    keys: ['Strg', 'D'],
    separator: '+',
    resolve: (event: KeyboardEvent): EditorAction | null =>
      isCommand(event) && event.key.toLowerCase() === 'd' ? { kind: 'duplicate' } : null,
  },
  {
    label: 'Löschen',
    keys: ['Entf', 'Rücktaste'],
    separator: '/',
    resolve: (event: KeyboardEvent): EditorAction | null =>
      isPlainKey(event, 'Delete', 'Backspace') ? { kind: 'remove' } : null,
  },
  {
    label: 'Sichtbarkeit umschalten',
    keys: ['H'],
    resolve: (event: KeyboardEvent): EditorAction | null =>
      isPlainKey(event, 'h', 'H') ? { kind: 'toggleVisible' } : null,
  },
  {
    label: 'Umbenennen',
    keys: ['F2'],
    resolve: (event: KeyboardEvent): EditorAction | null =>
      isPlainKey(event, 'F2') ? { kind: 'rename' } : null,
  },
  {
    label: 'Speichern',
    keys: ['Strg', 'S'],
    separator: '+',
    resolve: (event: KeyboardEvent): EditorAction | null =>
      isCommand(event) && event.key.toLowerCase() === 's' ? { kind: 'save' } : null,
  },
  {
    label: 'Rückgängig / Wiederherstellen',
    keys: ['Strg+Z', 'Umschalt+Strg+Z'],
    separator: '/',
    resolve: (event: KeyboardEvent): EditorAction | null => {
      if (!isCommand(event) || event.key.toLowerCase() !== 'z') {
        return null;
      }

      return event.shiftKey ? { kind: 'redo' } : { kind: 'undo' };
    },
  },
  {
    label: 'Größer / kleiner',
    keys: ['+', '−'],
    separator: '/',
    resolve: (event: KeyboardEvent): EditorAction | null => {
      // Auf deutscher Tastatur liegt „+" ohne Umschalt, auf englischer teilt es sich die
      // Taste mit „=" — beide Schreibweisen kommen an, je nach Belegung.
      if (isPlainKey(event, '+', '=')) {
        return { kind: 'zoomIn' };
      }

      if (isPlainKey(event, '-', '_')) {
        return { kind: 'zoomOut' };
      }

      return null;
    },
  },
  {
    label: 'Einpassen / 100 %',
    keys: ['Strg+0', 'Strg+1'],
    separator: '/',
    resolve: (event: KeyboardEvent): EditorAction | null => {
      if (!isCommand(event)) {
        return null;
      }

      if (event.key === '0') {
        return { kind: 'fitView' };
      }

      if (event.key === '1') {
        return { kind: 'resetZoom' };
      }

      return null;
    },
  },
  {
    label: 'Ansicht verschieben',
    keys: ['Leertaste+Ziehen', 'Mittlere Maustaste'],
    separator: '/',
  },
  {
    label: 'Tastenkürzel anzeigen',
    keys: ['?'],
    resolve: (event: KeyboardEvent): EditorAction | null =>
      isPlainKey(event, '?') ? { kind: 'showShortcuts' } : null,
  },
];

/** Eingabefelder gehören dem Tippenden — geprüft wird am Ziel-Element, nicht an einem Merker. */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

/** Ein offenes Menü führt seine Tastatur selbst (Pfeiltasten, Escape, Buchstaben). */
export function isMenuTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const role = target.getAttribute('role');

  return role === 'menu' || role === 'menuitem' || target.closest('[role="menu"]') !== null;
}

/**
 * Die eine Zuordnung Tastenereignis → Aktion. Wird gerade getippt oder ist ein Menü offen,
 * greift nur noch Speichern; Escape verlässt in einem Eingabefeld das Feld, statt die
 * Auswahl aufzuheben.
 */
export function resolveShortcut(event: KeyboardEvent): EditorAction | null {
  const typing = isTypingTarget(event.target);

  if (typing || isMenuTarget(event.target)) {
    if (isCommand(event) && event.key.toLowerCase() === 's') {
      return { kind: 'save' };
    }

    if (typing && isPlainKey(event, 'Escape')) {
      return { kind: 'blurField' };
    }

    return null;
  }

  for (const row of SHORTCUT_ROWS) {
    const action = row.resolve?.(event) ?? null;

    if (action) {
      return action;
    }
  }

  return null;
}
