# Phase 4 — Bogen-Aufbau und Vorschau

Rating: **heikel** — hier entsteht die Geometrie, auf der beide Ausgabewege sitzen.

## Kontext (vorher lesen)

- `frontend/src/app/shared/canvas/rendering/print.ts` — `PRINT_DPI`, `PRINT_WIDTH_PX`
- `frontend/src/app/shared/canvas/rendering/units.ts` — Canvas-Einheiten → Pixel
- `frontend/src/app/shared/canvas/rendering/layer.ts` — `CANVAS_WIDTH`/`CANVAS_HEIGHT`
- `docs/design/handoff-organic/README.md` → „9. Druckprojekt", rechte Spalte (Bogen-Optik)
- README dieses Plans → Geometrie-Kontrakt

## Die Rechnung (verbindlich, nicht selbst herleiten)

Alle Werte in Millimetern. Blatt A4 = 210 × 297. Fertige Karte = 63 × 88.

| | ohne Beschnitt | mit Beschnitt |
|---|---|---|
| gedruckte Kartengröße | 63 × 88 | 65 × 90 (je 1 mm über jede Kante) |
| Rasterfläche (3×3, ohne Abstand) | 189 × 264 | 195 × 270 |
| linker/rechter Rand | 10,5 | 7,5 |
| oberer/unterer Rand | 16,5 | 13,5 |

Karte an Spalte `col` (0–2), Zeile `row` (0–2):
`x = randX + col * breite`, `y = randY + row * höhe`.

**Schnittlinien** (dort wird geschnitten, immer auf der Kante der *fertigen* Karte):

- ohne Beschnitt: `x ∈ {10,5 · 73,5 · 136,5 · 199,5}`, `y ∈ {16,5 · 104,5 · 192,5 · 280,5}`
- mit Beschnitt: je Karte zwei Linien, `x = blockX + 1` und `x = blockX + 64`
  (analog `y = blockY + 1` und `y = blockY + 89`)

**Schnittmarken** sind Striche von 5 mm Länge und 0,2 mm Stärke in Schwarz, gezeichnet
**nur in den Blatträndern** als Verlängerung jeder Schnittlinie: oben von `randY − 5` bis
`randY`, unten von `blattunterkante − rand` bis `+5`, links/rechts entsprechend. Über eine
Karte läuft nie ein Strich.

**Bögen füllen:** die Positionen in ihrer Reihenfolge, jede Position so oft wie ihre Anzahl,
zeilenweise von links oben. Ein angefangener letzter Bogen bleibt teilweise leer.

## Abnahmekriterien

- `sheet-layout.ts` exportiert `buildSheets(items, options): PrintSheet[]` als **reine**
  Funktion ohne Angular- und ohne Konva-Abhängigkeit. Ein `PrintSheet` ist
  `{ index, slots: { cardId, xMm, yMm, widthMm, heightMm }[] }`, dazu liefert das Modul
  `sheetMarks(options): { x1Mm, y1Mm, x2Mm, y2Mm }[]` und die Konstanten des Blattes.
- Zwölf Exemplare ergeben zwei Bögen (9 + 3); null Exemplare ergeben null Bögen.
- Die Bogen-Vorschau rechts im Bildschirm zeigt je Bogen ein Blatt (Breite 420 px,
  Seitenverhältnis 210/297, weiß, Radius 4 px, Schatten), darin das 3×3-Raster; belegte
  Felder zeigen das Kachel-Vorschaubild der Karte, leere Felder `--color-neutral-100`.
  Ist „Schnittmarken" an, bekommen die Felder einen gestrichelten Rand (nur Vorschau-Optik).
- Die Vorschau **rechnet nicht selbst** — Positionen und Größen kommen aus `buildSheets`, in
  Prozent der Blattmaße umgerechnet.
- Die Zusammenfassung oben nennt die echte Bogenzahl aus `buildSheets`.

## Checkliste

- [x] `frontend/src/app/shared/canvas/rendering/sheet-layout.ts` mit den Konstanten
      (`SHEET_WIDTH_MM = 210`, `SHEET_HEIGHT_MM = 297`, `CARD_WIDTH_MM = 63`,
      `CARD_HEIGHT_MM = 88`, `BLEED_MM = 1`, `MARK_LENGTH_MM = 5`, `MARK_WIDTH_MM = 0.2`,
      `COLUMNS = 3`, `ROWS = 3`), `buildSheets()` und `sheetMarks()`. Kommentar im Kopf: warum
      Beschnitt hier Vergrößern heißt (das interne Canvas endet exakt an der Kartenkante, es
      gibt kein Material über den Rand hinaus).
- [x] Millimeter → Bildpunkte als eine Funktion `mmToPx(mm, dpi)` im selben Modul — jede
      spätere Umrechnung geht dort durch.
- [x] Bogen-Vorschau in `print-project-page` (eigene Unterkomponente `print-sheet/`),
      gefüttert aus `buildSheets`.
- [x] Zusammenfassungstext auf die echte Bogenzahl umstellen.
- [x] `docs/code-map.md`: `sheet-layout.ts` in der `rendering/`-Aufzählung ergänzen.

## Report-Back

Status: **complete**.

Die Rechnung steht in `sheet-layout.ts` und ist gegen die Tabelle im Plan durchgerechnet
worden (Bündel gebaut, Zahlen ausgegeben): ohne Beschnitt Ränder 10,5 / 16,5 mm und
Schnittlinien bei 10,5 · 73,5 · 136,5 · 199,5 bzw. 16,5 · 104,5 · 192,5 · 280,5; mit
Beschnitt Ränder 7,5 / 13,5 mm, Karten 65 × 90 mm und je zwei Linien pro Karte
(8,5 · 71,5 · 73,5 · 136,5 · 138,5 · 201,5). Zwölf Exemplare ergeben 9 + 3, null Exemplare
null Bögen. `mmToPx(210, 300)` / `mmToPx(297, 300)` = 2480 × 3508, eine Karte 744 × 1039 —
deckungsgleich mit `PRINT_WIDTH_PX` aus Meilenstein 4.

**Abweichungen vom Plan:**

- Zusätzlich exportiert: `sheetFrames(options)` (die neun Plätze, auch die leeren) und
  `sheetGeometry(options)` (Kartengröße + Ränder). Die Vorschau braucht die leeren Felder,
  und ohne diese Aufteilung hätte `sheetMarks` die Ränder ein zweites Mal hergeleitet — genau
  die zweite Rechnung, die der Kontrakt verbietet. `buildSheets` sitzt selbst auf `sheetFrames`.
- `sheetMarks(options)` gibt bei ausgeschalteten Schnittmarken eine leere Liste zurück, statt
  die Entscheidung dem Aufrufer zu überlassen.
- Die Optionen kommen als eigener Typ `SheetOptions` statt als `PrintOptions` aus dem Store —
  strukturgleich, aber so bleibt das Modul frei von der Zustandsverwaltung. Ebenso
  `SheetItem` (nur `cardId` + `quantity`) statt `PrintItem`.
- Statt eines Rasters mit Abstand (Entwurf: `grid` + 8 px gap, 24 px Innenrand) sitzen die
  Felder absolut in Prozent der Blattmaße — das ist die Vorgabe „die Vorschau rechnet nicht
  selbst" und zeigt die echte Anordnung, nicht eine hübschere.
- Neue Farb-Tokens `--color-print-paper` (Papierweiß) und `--color-print-slot-empty`, damit im
  Komponenten-Stylesheet kein roher Farbwert steht.
- Die Komponentenklasse heißt `PrintSheetPreview`, nicht `PrintSheet` — der Name war schon vom
  Datentyp aus `sheet-layout.ts` belegt.
