# Phase 5 — Export als PDF und PNG

Rating: **heikel** — neue Abhängigkeit, Speicherverhalten, Renderer im Mengenbetrieb.

## Kontext (vorher lesen)

- `frontend/src/app/shared/canvas/card-renderer.service.ts` — `renderPng(input, breite)`
- `frontend/src/app/shared/canvas/card-render-source.service.ts` — besorgt einer gespeicherten
  Karte ihren `CardRenderInput` (genau das, was hier gebraucht wird)
- `frontend/src/app/shared/services/download-file.ts` — `downloadBlob()`
- `frontend/src/app/shared/services/card-file-name.ts`
- `docs/conventions/stack.md`, `docs/decisions/022-kopfloser-renderer.md`
- `sheet-layout.ts` aus Phase 4 — die einzige Geometriequelle
- `~/.claude/skills/mode-dependencies` (neue Abhängigkeit)

## Entschieden (nicht neu abwägen)

- **PDF mit `jspdf`** (MIT, im Browser, Einheit Millimeter, `addImage` mit
  Millimeter-Koordinaten). Alternative war `pdf-lib` — mächtiger beim Bearbeiten
  vorhandener PDFs, aber es rechnet in Punkten und wir bräuchten die Umrechnung selbst.
  Begründung gehört als ADR-023 in die Ablage.
- **jsPDF wird ausschließlich dynamisch geladen** — `const { jsPDF } = await import('jspdf');`
  im Knopf-Handler, **niemals** als Import am Dateikopf. Gemessen am 13.08.2026: ein Import am
  Kopf hebt das Start-Bundle von 358 kB auf 771 kB, weil jsPDF `html2canvas` (203 kB),
  `canvg` (159 kB) und `dompurify` (29 kB) mitzieht. Wir benutzen davon nichts; dynamisch
  geladen kostet es erst beim ersten Druck etwas. Nach der Umsetzung gegenprüfen:
  `npx ng build` — „Initial total" muss im Bereich des Vorher-Werts bleiben.
- **Karten werden je Karten-Kennung genau einmal gerendert** und für jedes Exemplar erneut
  platziert. Ein Zwischenspeicher `Map<cardId, Blob>` lebt nur für die Dauer eines Exports.
- **Zielbreite beim Rendern**: ohne Beschnitt `PRINT_WIDTH_PX` (744), mit Beschnitt 768 —
  damit bleiben es echte 300 DPI auf 65 mm statt eines hochskalierten Bildes.
- **Ein PNG je Bogen**, nacheinander heruntergeladen: `druckbogen-1.png`, `druckbogen-2.png`.
  Kein Archiv — dafür bräuchte es eine weitere Abhängigkeit ohne erkennbaren Gewinn.

## Dateigröße — der Netzwerkdrucker muss das Ding noch schlucken

Ein Druckbogen aus neun PNG-Karten ist ohne Gegenmaßnahme grob 15–20 MB **pro Seite**; viele
Netzwerkdrucker und Druckerwarteschlangen brechen dort ab oder brauchen ewig. Deshalb:

- **Karten fürs Druckbogen als JPEG, Qualität 0,9** statt PNG (`toBlob({ mimeType:
  'image/jpeg', quality: 0.9 })`). Erwartete Größenordnung: 250–500 kB je Karte statt
  1,5–2,5 MB → grob 3–5 MB je Seite. Das ist eine Schätzung, kein Messwert — der erste echte
  Export misst nach (Smoke-Punkt).
- **JPEG kennt keine Durchsichtigkeit**: Vor dem Zeichnen bekommt die Bühne ein weißes
  Grundrechteck über die volle Kartenfläche. Ohne das werden durchsichtige Stellen schwarz.
  Für „Als Bild herunterladen" in Karteneditor und Kartenliste bleibt es bei PNG mit
  Durchsichtigkeit — dort geht es nicht ums Drucken.
- **Nach dem Erzeugen nennt der Bildschirm die Dateigröße** in Klartext („PDF erstellt —
  7,4 MB"). Liegt sie über 20 MB, erscheint daneben ein Knopf **„Kleinere Datei erzeugen
  (200 dpi)"**, der denselben Export mit `PRINT_DPI = 200` und Qualität 0,8 wiederholt. Kein
  Regler, den man vorher verstehen müsste — der Hebel taucht auf, wenn er gebraucht wird.
- Die Auflösung ist damit **kein** gespeicherter Wert im Druckprojekt, sondern ein Ausweichweg
  im Moment des Exports.

## Abnahmekriterien

- „Als PDF drucken" erzeugt eine PDF-Datei `druckprojekt.pdf`: A4-Seiten, je Bogen eine Seite,
  jede Karte an den Koordinaten aus `buildSheets`, in der dort genannten Größe.
- Schnittmarken werden bei eingeschalteter Option als Linien gezeichnet (`setLineWidth(0.2)`,
  Schwarz), Koordinaten aus `sheetMarks`.
- „PNG exportieren" erzeugt je Bogen ein PNG mit 2480 × 3508 Bildpunkten, weißem Grund,
  denselben Positionen (über `mmToPx(..., 300)`), denselben Marken.
- Während des Exports zeigt der auslösende Knopf den Fortschritt („Karte 4 von 12", danach
  „Bogen 1 von 2"); beide Knöpfe sind währenddessen gesperrt, die übrige Oberfläche nicht.
- Kann eine Karte nicht geladen oder gezeichnet werden, bricht der Export **nicht** ab: Ihr
  Feld bleibt leer, und am Ende nennt eine Meldung die betroffenen Kartennamen.
- Nach dem Export sind alle Zwischen-Zeichenflächen abgeräumt (kein wachsender
  Speicherverbrauch bei mehreren Läufen hintereinander).
- Ein PDF mit zwei vollen Bögen (18 Karten) bleibt unter 10 MB; die erzeugte Größe steht in
  Klartext auf dem Bildschirm.
- Über 20 MB erscheint „Kleinere Datei erzeugen (200 dpi)" und liefert eine merklich kleinere
  Datei mit identischem Seitenaufbau.
- `npx ng build` zeigt nach der Phase kein nennenswert größeres Start-Bundle als davor
  (jsPDF liegt in einem eigenen, erst beim Klick geladenen Stück).

## Checkliste

- [ ] `npm install jspdf` im `frontend/` (siehe `mode-dependencies`), Version in
      `docs/conventions/stack.md` nachtragen.
- [ ] `docs/decisions/023-pdf-erzeugung-mit-jspdf.md` — Kontext, Optionen (`jspdf` /
      `pdf-lib` / Browser-Druckdialog über HTML), Entscheidung, Folgen.
- [ ] `card-renderer.service.ts` um Ausgabeformat erweitern: `renderPng` bekommt einen
      zweiten, optionalen Parameter `{ mimeType, quality, opaqueBackground }`. Bei
      `opaqueBackground` zeichnet der Renderer zuerst ein weißes Rechteck über die volle
      Kartenfläche. Voreinstellung bleibt PNG mit Durchsichtigkeit — bestehende Aufrufer
      (Karteneditor, Kartenliste, Vorschaubilder) ändern sich nicht.
- [ ] `frontend/src/app/features/print-project/print-export.service.ts`:
  - `renderCards(items, options, fortschritt)` → `Map<cardId, Blob>`, über
    `CardRenderSource` + `CardRenderer` als JPEG mit weißem Grund, je Kennung einmal,
    sequenziell (nicht parallel — neun gleichzeitige Bühnen in Druckauflösung sind der
    sichere Weg in den Speicherfehler).
  - `exportPdf(sheets, bilder, options)` — jsPDF in `{ unit: 'mm', format: 'a4' }`,
    `addPage()` je weiterem Bogen, Bilder als Daten-Adresse (`Blob` → `FileReader`).
  - `exportPngSheets(sheets, bilder, options)` — je Bogen eine `canvas` in 2480 × 3508,
    weiß füllen, `drawImage`, Marken als Rechtecke, `toBlob`, herunterladen, Fläche freigeben
    (`canvas.width = 0`), erst dann den nächsten Bogen.
  - Marken-Zeichnen einmal je Ausgabeweg, Koordinaten immer aus `sheetMarks`.
- [ ] Fortschritt als Signal in der Seite anbinden, Knöpfe während des Laufs sperren.
- [ ] Fehlende Karten sammeln und am Ende über `notification.ts` melden.
- [ ] `docs/code-map.md`: `print-export.service.ts` in der Feature-Beschreibung nennen.

## Report-Back

_(beim Abschluss der Phase füllen)_
