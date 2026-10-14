# Phase 7 — Template-Editor: Touch-Gesten

**Tier:** heikel (Zeigerereignisse mehrerer Finger, Zusammenspiel mit Konvas eigenem Ziehen)

## Kontext (vor dem Start lesen)

- `README.md` dieses Plans → „Konfidenz-Ausweis" (Abbruch des Ziehens), Scope-Grenze „Ein-Finger-Verschieben der Bühne"
- `docs/decisions/028-smartphone-bedienung.md`
- `frontend/src/app/features/templates/template-editor/template-editor.ts` — `panning` (Signal), `onStageWheel`, `onStagePointerDown/Move/Up/Leave`, `stagePoint`, `endPan`, `panPointerId`
- `frontend/src/app/signal-stores/template-editor.ts` — `view()`, `zoomTo(zoom, pan)`, `panBy(dx, dy)`
- `frontend/src/app/shared/canvas/rendering/units.ts` — `clampZoom`, `panKeepingAnchor`
- `frontend/src/app/shared/canvas/card-canvas/card-canvas.ts` — `panning`-Eingang, `transformerConfig`, `ANCHOR_SIZE_PX`/`ROTATE_ANCHOR_OFFSET_PX`, der Effekt, der den Transformer an den ausgewählten Knoten hängt (zeigt, wie Bühne und Transformer erreichbar sind)
- `frontend/src/app/shared/canvas/card-canvas/draw-items.ts` — `interactionConfig` (nur die ausgewählte Ebene ist ziehbar; `draggable` hängt **nicht** an `panning`)
- `.../template-editor/layer-list/layer-list.html`, `.ts`, `.scss` — `cdkDrag`, `startRename`, `selectedLayerId`
- `frontend/src/app/shared/services/pointer.ts`

## AK der Phase

1. Zwei Finger auf der Bühne zoomen stufenlos um den Mittelpunkt zwischen den Fingern (Grenzen wie beim Mausrad über `clampZoom`) und verschieben die Karte, wenn beide Finger sich gemeinsam bewegen.
2. Setzt der zweite Finger auf, während der erste eine Ebene zieht oder an einem Anfasser skaliert/dreht, bricht dieses Ziehen sofort ab; ab da bewegt sich nur noch die Ansicht. Ein danach gedrücktes Rückgängig stellt den Zustand vor dem Ziehen wieder her.
3. Hebt einer der zwei Finger ab, endet die Zwei-Finger-Geste; der verbleibende Finger bewirkt nichts, bis er abhebt. Ein neuer einzelner Finger wählt/zieht wieder Ebenen wie bisher.
4. Maus und Stift verhalten sich exakt wie vorher (Mausrad-Zoom, Verschieben mit Leertaste oder mittlerer Taste).
5. Auf Touch-Geräten sind die Anfasser des Transformers 20 px groß (statt 10 px) und der Dreh-Anfasser sitzt 40 px (statt 26 px) über der Ebene.
6. Auf Touch-Geräten lässt sich die Ebenenliste mit einem Finger scrollen; zum Umsortieren hält man eine Zeile 250 ms gedrückt und zieht dann. Mit der Maus beginnt das Ziehen sofort wie bisher.
7. Auf Touch-Geräten zeigt die ausgewählte Ebenenzeile einen Stift-Knopf („Ebene umbenennen", Tippfläche 44 px), der dasselbe Umbenennen startet wie der Doppelklick. Mit Maus ist der Knopf unsichtbar, der Doppelklick bleibt.

## Checkliste

### Zwei-Finger-Geste (`template-editor.ts`)

- [x] Felder:

```ts
  /** Aufliegende Finger auf der Bühne (Zeigerkennung → Bildschirmpunkt). Nur `pointerType === 'touch'`. */
  private readonly touchPoints = new Map<number, Point>();

  /** Laufende Zwei-Finger-Geste: Fingerabstand und Maßstab beim Aufsetzen, letzter Mittelpunkt (Bühnenkoordinaten). */
  private pinch: { startDistance: number; startZoom: number; lastMid: Point } | null = null;
```

- [x] `onStagePointerDown`, ganz am Anfang:

```ts
    if (event.pointerType === 'touch') {
      this.touchPoints.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (this.touchPoints.size === 2) {
        this.startPinch();
      }

      return;
    }
```

- [x] `onStagePointerMove`, ganz am Anfang:

```ts
    if (event.pointerType === 'touch') {
      if (this.touchPoints.has(event.pointerId)) {
        this.touchPoints.set(event.pointerId, { x: event.clientX, y: event.clientY });
        this.updatePinch();
      }

      return;
    }
```

- [x] `onStagePointerUp` (wird auch für `pointercancel` gerufen), ganz am Anfang:

```ts
    if (event.pointerType === 'touch') {
      this.touchPoints.delete(event.pointerId);

      if (this.pinch !== null && this.touchPoints.size < 2) {
        this.pinch = null;
        this.panning.set(false);
      }

      return;
    }
```

- [x] Neue private Methoden. `stagePoint` erwartet ein `MouseEvent` — für die gespeicherten Punkte eine Variante `clientToStage(point: Point): Point` daneben schreiben (gleiche Rechnung über `getBoundingClientRect()`) und `stagePoint` darauf umstellen.

```ts
  private startPinch(): void {
    const [first, second] = [...this.touchPoints.values()];
    // `panning` sperrt die Ebenen und bricht in card-canvas ein laufendes Ziehen ab.
    this.panning.set(true);
    this.pinch = {
      startDistance: Math.max(1, Math.hypot(second.x - first.x, second.y - first.y)),
      startZoom: this.editor.view().zoom,
      lastMid: this.clientToStage({ x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 }),
    };
  }

  private updatePinch(): void {
    const pinch = this.pinch;

    if (pinch === null || this.touchPoints.size < 2) {
      return;
    }

    const [first, second] = [...this.touchPoints.values()];
    const mid = this.clientToStage({ x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 });
    const distance = Math.hypot(second.x - first.x, second.y - first.y);

    this.editor.panBy(mid.x - pinch.lastMid.x, mid.y - pinch.lastMid.y);

    const view = this.editor.view();
    const zoom = clampZoom(pinch.startZoom * (distance / pinch.startDistance));

    this.editor.zoomTo(zoom, panKeepingAnchor(view, mid, zoom));
    pinch.lastMid = mid;
  }
```

- Beim Planen geprüft: `zoomTo` und `panBy` setzen beide `zoomMode: 'manual'` (`signal-stores/template-editor.ts`), die Bühne passt die Karte nach der Geste also nicht wieder selbst ein. Am Store ist nichts zu ändern.
- [x] Der dritte und jeder weitere Finger wird mitgezählt, aber nur die ersten zwei (Einfügereihenfolge der `Map`) gehen in die Rechnung ein — keine Sonderbehandlung nötig.

### Laufendes Ziehen abbrechen (`card-canvas.ts`)

- [x] Im Konstruktor einen Effekt ergänzen:

```ts
    // Setzt im Template-Editor ein zweiter Finger auf, wird `panning` wahr. Konva zieht die
    // ausgewählte Ebene sonst mit dem ersten Finger weiter, denn `draggable` hängt nicht an
    // `panning` (draw-items.ts) — also das laufende Ziehen bzw. Skalieren hier beenden.
    effect(() => {
      if (!this.panning()) {
        return;
      }

      untracked(() => this.stopActiveGesture());
    });
```

- [x] `stopActiveGesture()`: Bühne und Transformer genauso holen wie im bestehenden Transformer-Effekt; dann `if (transformer?.isTransforming()) { transformer.stopTransform(); }` und für den Knoten der ausgewählten Ebene (`stage.findOne('.' + selectedLayerId)`) `if (node?.isDragging()) { node.stopDrag(); }`. `stopDrag()` löst `dragend` aus — der bestehende Weg meldet dann den bis dahin gezogenen Versatz als `layerTransformed`; das ist gewollt (der Verlaufseintrag aus `gestureStart` liegt schon davor, Rückgängig stellt den Ausgangszustand her).

### Anfasser auf Touch-Geräten (`card-canvas.ts`)

- [x] Konstanten ergänzen: `const TOUCH_ANCHOR_SIZE_PX = 20;` und `const TOUCH_ROTATE_ANCHOR_OFFSET_PX = 40;` (Kommentar: „Fingerkuppe statt Mauszeiger — 20px Anfasser + Abstand der Tippfläche").
- [x] Feld `private readonly coarsePointer = isCoarsePointer();`; in `transformerConfig` `anchorSize: (this.coarsePointer ? TOUCH_ANCHOR_SIZE_PX : ANCHOR_SIZE_PX) / scale` und `rotateAnchorOffset` entsprechend.

### Ebenenliste

- [x] `layer-list.html`: am Element mit `cdkDrag` ergänzen `[cdkDragStartDelay]="{ touch: 250, mouse: 0 }"`.
- [x] Direkt nach dem Namens-Knopf (bzw. dem Umbenennen-Feld) einfügen, nur für die ausgewählte, gerade nicht umbenannte Ebene — die Bedingung für „wird gerade umbenannt" aus der bestehenden `@if`-Verzweigung um Namensknopf/Eingabefeld übernehmen:

```html
<button
  type="button"
  class="icon-button layer-list__rename"
  aria-label="Ebene umbenennen"
  (click)="startRename(layer.id)"
>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
  </svg>
</button>
```

- [x] `layer-list.scss`: `.layer-list__rename { display: none; flex: none; padding: 2px; border: 0; border-radius: var(--radius-sm); background: transparent; color: var(--color-text-primary); }` und im `bp.touch`-Block aus Phase 6 `.layer-list__rename { display: inline-flex; }`.
- [x] Ist `startRename` in `layer-list.ts` `protected`, reicht das für die Vorlage; sonst nichts ändern.

### Doc

- [x] `docs/code-map.md` → `template-editor/` bzw. `signal-stores/`: Satz ergänzen „Auf Touch-Geräten zoomen und verschieben zwei Finger die Bühne (`template-editor.ts`, Zeigerereignisse); ein zweiter Finger bricht das Ziehen einer Ebene ab (`card-canvas`)".

## Report-Back

- Status: **complete**. Lint grün, Produktions-Build ohne Fehler.
- Abweichung: `startPinch`/`updatePinch` prüfen die zwei Punkte per Guard statt Destrukturieren ohne Prüfung (`noUncheckedIndexedAccess`). Der Stift-Knopf erhält im Touch-Block zusätzlich 44 px Tippfläche (AK 7), nicht nur `display: inline-flex`.
- Nebenwirkung Desktop: Der Abbruch-Effekt in `card-canvas` hört auf den `panning`-Eingang, und der ist `panning() || spaceDown()`. Wer mitten im Ziehen einer Ebene die Leertaste drückt, beendet das Ziehen jetzt an der Stelle (vorher zog Konva weiter). Bewusst so gelassen.
- Offen für das Gerät: ob `stopDrag()` beim zweiten Finger sauber einen Verlaufsschritt ergibt → Smoke-Punkt 1.
