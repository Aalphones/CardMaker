# Phase 1 — Der Render-Motor

Eine Karte im Speicher zeichnen und als PNG ausgeben, ohne sichtbare Bühne und ohne Angular-
Vorlage. Diese Phase kümmert sich **nicht** ums Laden von Bildern und Schriften — die kommen
in Phase 2 dazu; hier werden sie als Parameter hereingereicht.

## Kontext — vorher lesen

- `frontend/src/app/shared/canvas/card-canvas/draw-items.ts` — `buildDrawItems()`,
  `DrawItem`, `DrawContext`. Das ist die Zeichenliste, die der Motor abarbeitet.
- `frontend/src/app/shared/canvas/card-canvas/card-canvas.html` — die Vorlage, die dieselbe
  Liste heute in Konva-Elemente übersetzt. Der Motor macht genau diese Übersetzung von Hand;
  die sechs `@case`-Zweige sind die vollständige Liste der Fälle.
- `frontend/src/app/shared/canvas/card-canvas/card-canvas.ts` — nur `exportPng()` (ab Zeile
  288): dort steht, wie heute aus einer Bühne ein PNG wird (`stage.toBlob`, Pixelverhältnis).
- `frontend/src/app/shared/canvas/rendering/units.ts` — `canvasUnitsToPixels()`.
- `frontend/src/app/shared/canvas/rendering/layer.ts` — `CANVAS_WIDTH`, `CANVAS_HEIGHT`.
- `docs/conventions/angular.md`, `docs/decisions/005-client-side-rendering.md`.

## Abnahmekriterien

- `CardRenderer.renderPng(input, PRINT_WIDTH_PX)` liefert einen PNG-Blob mit genau
  744 × 1039 Bildpunkten.
- Das Bild enthält keine Auswahlanzeige und keinen Rahmen einer aktiven Bildfläche.
- Nach dem Aufruf hängt keine Bühne mehr im Speicher (`stage.destroy()` gelaufen), auch wenn
  das Ausgeben fehlschlägt.
- Alle sechs Elementarten aus der Vorlage werden gezeichnet: `image`, `rect`, `ellipse`,
  `line`, `text`, `group` (mit Bild-Kindern).

## Checkliste

- [ ] `shared/canvas/rendering/print.ts` anlegen: `PRINT_DPI = 300` und
      `PRINT_WIDTH_PX = canvasUnitsToPixels(CANVAS_WIDTH, PRINT_DPI)` (ergibt 744). Dazu ein
      Kommentar, dass die Höhe nicht extra konstant ist, sondern aus dem Kartenverhältnis
      folgt.
- [ ] `shared/canvas/rendering/render-input.ts` anlegen: `CardRenderInput` wie im Kontrakt der
      README (`layers`, `content`). Keine weiteren Felder — Bilder und Schriften reicht Phase 2
      getrennt herein.
- [ ] `shared/canvas/render-stage.ts` anlegen — die einzige Stelle, die `DrawItem` in
      Konva-Knoten übersetzt:
  - [ ] `export function drawItemsToStage(stage: Konva.Stage, items: DrawItem[]): void`
  - [ ] Eine `Konva.Layer` anlegen, für jeden `DrawItem` per `switch (item.element)` den
        passenden Knoten bauen: `image → Konva.Image`, `rect → Konva.Rect`,
        `ellipse → Konva.Ellipse`, `line → Konva.Line`, `text → Konva.Text`,
        `group → Konva.Group` samt `item.children` als `Konva.Image` (nur Bilder, wie in
        `DrawItem.children` dokumentiert).
  - [ ] Kopfkommentar: *„Gegenstück zu `card-canvas.html`. Kommt dort ein Elementtyp dazu,
        gehört er auch hierher — sonst fehlt er still im Export."*
  - [ ] Keine Ereignis-Anschlüsse (kein Klick, kein Ziehen) — das Bild ist tot.
- [ ] `shared/canvas/card-renderer.service.ts` anlegen (`providedIn: 'root'`):
  - [ ] `RenderResult` wie im Kontrakt; `missing` bleibt in dieser Phase immer leer und wird
        in Phase 2 gefüllt.
  - [ ] `renderPng()`: `div` per `document.createElement('div')` erzeugen (DOCUMENT injizieren,
        nicht global `document`), `new Konva.Stage({ container, width: CANVAS_WIDTH, height:
        CANVAS_HEIGHT })`, Zeichenliste über `buildDrawItems(input.layers, context)` bauen,
        `drawItemsToStage()`, `stage.toBlob({ pixelRatio: targetWidthPx / CANVAS_WIDTH,
        mimeType: 'image/png' })`, im `finally` `stage.destroy()`.
  - [ ] Der `DrawContext` für den Export ist fest: `selectedLayerId: null`, `interactive:
        false`, `imageEditing: false`, `activeImageLayerId: null` — damit erzeugt
        `buildDrawItems` von sich aus weder Auswahlrahmen noch aktiven Flächenrahmen. Kein
        Ausblenden nötig wie in `exportPng()`.
  - [ ] `images`, `cardImages` und `loadedFonts` sind in dieser Phase noch leere Maps/Sets, die
        `renderPng` intern setzt — Phase 2 ersetzt genau diese drei Zeilen.
- [ ] **Prüfen (Wackelstelle 1):** in der Anwendung einmal `renderPng` aufrufen, das Ergebnis
      durch `createImageBitmap(blob)` schicken und `width`/`height` ausgeben. Muss 744 × 1039
      sein. Das Ergebnis in `FINDINGS.md` notieren.
- [ ] ADR `docs/decisions/022-kopfloser-renderer.md` schreiben (10 Zeilen): Kontext (Export und
      Druckbogen brauchen ein Bild ohne offenen Editor), Optionen (unsichtbare
      `CardCanvas`-Komponente / Bühne im Speicher), Entscheidung (Bühne im Speicher),
      Konsequenzen (zweiter Zeichenweg, `render-stage.ts` muss mit `card-canvas.html`
      gleichziehen; die Nummer 022 ist frei — höchste auf Platte ist 021, `docs/planning/`
      hatte beim Anlegen keine reservierten Nummern).
- [ ] `docs/code-map.md`: unter `shared/canvas/` die neuen Dateien eintragen
      (`card-renderer.service.ts`, `render-stage.ts`, `rendering/print.ts`,
      `rendering/render-input.ts`).

## Report-Back
