# Phase 1 — Der Render-Motor

**Status:** complete (2026-08-13)

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

- [x] `shared/canvas/rendering/print.ts` anlegen: `PRINT_DPI = 300` und
      `PRINT_WIDTH_PX = canvasUnitsToPixels(CANVAS_WIDTH, PRINT_DPI)` (ergibt 744). Dazu ein
      Kommentar, dass die Höhe nicht extra konstant ist, sondern aus dem Kartenverhältnis
      folgt.
- [x] `shared/canvas/rendering/render-input.ts` anlegen: `CardRenderInput` wie im Kontrakt der
      README (`layers`, `content`). Keine weiteren Felder — Bilder und Schriften reicht Phase 2
      getrennt herein.
- [x] `shared/canvas/render-stage.ts` anlegen — die einzige Stelle, die `DrawItem` in
      Konva-Knoten übersetzt:
  - [x] `export function drawItemsToStage(stage: Konva.Stage, items: DrawItem[]): void`
  - [x] Eine `Konva.Layer` anlegen, für jeden `DrawItem` per `switch (item.element)` den
        passenden Knoten bauen: `image → Konva.Image`, `rect → Konva.Rect`,
        `ellipse → Konva.Ellipse`, `line → Konva.Line`, `text → Konva.Text`,
        `group → Konva.Group` samt `item.children` als `Konva.Image` (nur Bilder, wie in
        `DrawItem.children` dokumentiert).
  - [x] Kopfkommentar: *„Gegenstück zu `card-canvas.html`. Kommt dort ein Elementtyp dazu,
        gehört er auch hierher — sonst fehlt er still im Export."*
  - [x] Keine Ereignis-Anschlüsse (kein Klick, kein Ziehen) — das Bild ist tot.
- [x] `shared/canvas/card-renderer.service.ts` anlegen (`providedIn: 'root'`):
  - [x] `RenderResult` wie im Kontrakt; `missing` bleibt in dieser Phase immer leer und wird
        in Phase 2 gefüllt.
  - [x] `renderPng()`: `div` per `document.createElement('div')` erzeugen (DOCUMENT injizieren,
        nicht global `document`), `new Konva.Stage({ container, width: CANVAS_WIDTH, height:
        CANVAS_HEIGHT })`, Zeichenliste über `buildDrawItems(input.layers, context)` bauen,
        `drawItemsToStage()`, `stage.toBlob({ pixelRatio: targetWidthPx / CANVAS_WIDTH,
        mimeType: 'image/png' })`, im `finally` `stage.destroy()`.
  - [x] Der `DrawContext` für den Export ist fest: `selectedLayerId: null`, `interactive:
        false`, `imageEditing: false`, `activeImageLayerId: null` — damit erzeugt
        `buildDrawItems` von sich aus weder Auswahlrahmen noch aktiven Flächenrahmen. Kein
        Ausblenden nötig wie in `exportPng()`.
  - [x] `images`, `cardImages` und `loadedFonts` sind in dieser Phase noch leere Maps/Sets, die
        `renderPng` intern setzt — Phase 2 ersetzt genau diese drei Zeilen.
- [x] **Prüfen (Wackelstelle 1):** in der Anwendung einmal `renderPng` aufrufen, das Ergebnis
      durch `createImageBitmap(blob)` schicken und `width`/`height` ausgeben. Muss 744 × 1039
      sein. Das Ergebnis in `FINDINGS.md` notieren.
- [x] ADR `docs/decisions/022-kopfloser-renderer.md` schreiben (10 Zeilen): Kontext (Export und
      Druckbogen brauchen ein Bild ohne offenen Editor), Optionen (unsichtbare
      `CardCanvas`-Komponente / Bühne im Speicher), Entscheidung (Bühne im Speicher),
      Konsequenzen (zweiter Zeichenweg, `render-stage.ts` muss mit `card-canvas.html`
      gleichziehen; die Nummer 022 ist frei — höchste auf Platte ist 021, `docs/planning/`
      hatte beim Anlegen keine reservierten Nummern).
- [x] `docs/code-map.md`: unter `shared/canvas/` die neuen Dateien eintragen
      (`card-renderer.service.ts`, `render-stage.ts`, `rendering/print.ts`,
      `rendering/render-input.ts`).

## Report-Back

Der Motor steht: `CardRenderer.renderPng()` gibt ein PNG aus, ohne dass irgendwo ein Editor
offen ist. `npm run lint` und `npm run build` laufen grün.

**Wackelstelle 1 ist erledigt.** Gemessen im kopflosen Chrome mit dem echten Zeichenweg:
**744 × 1039**, gelesen aus dem Kopfsatz der erzeugten PNG-Datei. Der Prüfaufbau war ein
Wegwerf-Bündel neben der App und ist wieder gelöscht — er hing nicht an der Oberfläche, weil
die den Renderer erst ab Phase 4 aufruft.

**Zwei Abweichungen vom Plan, beide bewusst:**

1. **Der Maßstab sitzt auf der Konva-Ebene, nicht auf `pixelRatio`.** Der Plan wollte eine
   Bühne in Canvas-Einheiten und die Vergrößerung beim Ausgeben. Dabei landet die Zielbreite
   als Fließkomma-Produkt in der Leinwandgröße (630 × 744/630 ist nicht garantiert exakt 744)
   und wird beim Setzen abgeschnitten — aus 744 könnten 743 werden. Jetzt bekommt die Bühne
   gleich die Zielgröße in ganzen Bildpunkten, und die Ebene trägt den Maßstab. Das ist
   derselbe Aufbau wie in der sichtbaren Vorschau. Wichtig dabei: Konva rechnet eine
   Skalierung der **Bühne** beim Ausgeben nicht mit, die der **Ebene** schon.
2. **`drawItemsToStage()` bekommt den Maßstab als dritten Parameter** — Folge von (1), weil
   die Funktion die Konva-Ebene anlegt.

**Nebenbefund (nicht Teil der Phase, mitgenommen):** Die ADR-Übersicht führte 021 gar nicht
auf. Beide Zeilen — 021 und 022 — sind jetzt nachgetragen.
