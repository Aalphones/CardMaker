# Phase 5 — Vorschaubilder auf denselben Motor legen

Aufräumen, kein neues Feature: die Kachel-Vorschaubilder entstehen heute aus der sichtbaren
Bühne des offenen Editors. Künftig kommen sie aus dem Motor — ein Zeichenweg statt zwei.
Sichtbar ändert sich nichts, deshalb steht die Phase ganz hinten.

## Was der heutige Weg tut (Chesterton's Fence)

`CardCanvas.exportPng(targetWidth)` (ab Zeile 288) nimmt die **sichtbare** Bühne, versteckt
vorher zwei Bedienhilfen und schießt sie in ein PNG:

- Der Konva-Transformer (die Anfasser) wird per `hide()` weggenommen statt per `nodes([])`
  abgehängt — das Abhängen würde die Auswahl wegwerfen, die ein `afterRenderEffect` verwaltet.
- Die Knoten mit dem Namen `ACTIVE_AREA_NAME` (der Rahmen um die gerade bearbeitete
  Bildfläche) werden ebenfalls versteckt, sonst brennen sie sich ins Vorschaubild.
- Das Pixelverhältnis wird aus der **gemessenen** Bühnenbreite gerechnet, weil die mit der
  Fensterbreite wandert.

Alle drei Kunstgriffe existieren nur, weil die Bühne sichtbar und fensterabhängig ist. Der
Motor hat keine davon nötig: seine Bühne ist fest 630 × 880 groß und zeichnet
Bedienhilfen gar nicht erst (`selectedLayerId: null`, `interactive: false`). Deshalb kann
`exportPng()` ersatzlos weg — der Konstante `ACTIVE_AREA_NAME` nicht, die braucht
`draw-items.ts` weiterhin zum Zeichnen des Rahmens.

## Kontext — vorher lesen

- `frontend/src/app/shared/canvas/card-canvas/card-canvas.ts` ab Zeile 288 (`exportPng`).
- `frontend/src/app/features/cards/card-editor/card-editor.ts`, Methode `uploadPreview` (ab
  Zeile 823) und `refreshPreviewImage` (ab 782).
- Der entsprechende Weg im Template-Editor (Vorschaubild nach dem Speichern hochladen) —
  Einstieg über `PreviewUploadService` in `frontend/src/app/features/templates/`.
- `frontend/src/app/shared/canvas/preview-upload.service.ts` — `PREVIEW_WIDTH_PX = 420`.

## Abnahmekriterien

- Nach dem Speichern einer Karte zeigt die Kachel in der Liste ein aktualisiertes Vorschaubild
  wie bisher; dasselbe für ein Template im Template-Editor.
- Die Vorschaubilder sind weiterhin 420 Bildpunkte breit.
- Auf keinem Vorschaubild ist ein Auswahlrahmen, ein Anfasser oder der Rahmen einer aktiven
  Bildfläche zu sehen — auch dann nicht, wenn beim Speichern eine Ebene ausgewählt war.
- `CardCanvas` hat keine `exportPng`-Methode mehr, und niemand ruft sie noch auf.

## Checkliste

- [ ] `card-editor.ts`: `uploadPreview` benutzt `CardRenderer.renderPng({ layers:
      previewLayers(), content: previewContent() }, PREVIEW_WIDTH_PX)` statt
      `this.canvas()?.exportPng(...)`. Der Hochlade-Teil bleibt unverändert.
- [ ] Dasselbe im Template-Editor — dort ohne Karteninhalt, also `content: null` bzw. der
      leere Inhalt, den `buildDrawItems` schon kennt.
- [ ] `CardCanvas.exportPng()` löschen, dazu das `viewChild` auf den Transformer prüfen: wird
      es nur noch für die Anfasser gebraucht, bleibt es; wurde es nur für den Export gehalten,
      geht es mit.
- [ ] `viewChild(CardCanvas)` in beiden Editoren entfernen, falls es danach nichts mehr tut.
- [ ] Prüfen, dass `ACTIVE_AREA_NAME` weiterhin von `draw-items.ts` benutzt wird — nur der
      Kommentar dort, der aufs Ausblenden in `exportPng` verweist, muss angepasst werden.
- [ ] `docs/code-map.md`: bei `card-canvas/` den `exportPng()`-Halbsatz entfernen, bei den
      Feature-Zeilen `templates` und `cards` den Satz zur Vorschau-Erzeugung auf den Motor
      umschreiben.
- [ ] `docs/PROJECT.md`: Meilenstein 4 als erledigt markieren (Datum + Archivpfad), Muster wie
      bei den Meilensteinen 1–3.
- [ ] `docs/decisions/021-vorschaubilder.md`: eine Zeile in den Konsequenzen ergänzen, dass die
      Bilder seit Meilenstein 4 aus dem kopflosen Renderer kommen.
- [ ] Smoke-Checkliste der README durchgehen (das macht der Nutzer am Bildschirm), dann Plan
      nach `docs/archive/2026-08/` verschieben und `STATE.md` auf den nächsten Plan zeigen
      lassen.

## Report-Back
