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

- [x] `card-editor.ts`: `uploadPreview` benutzt `CardRenderer.renderPng({ layers:
      previewLayers(), content: previewContent() }, PREVIEW_WIDTH_PX)` statt
      `this.canvas()?.exportPng(...)`. Der Hochlade-Teil bleibt unverändert.
- [x] Dasselbe im Template-Editor — dort ohne Karteninhalt: neue Konstante
      `EMPTY_CARD_CONTENT` in `card-content.ts` (der `CardRenderInput`-Kontrakt verlangt
      `CardContent`, kein `null`).
- [x] `CardCanvas.exportPng()` gelöscht. Der Transformer-`viewChild` bleibt — er wird weiter
      für die Anfasser gebraucht (`afterRenderEffect`).
- [x] `viewChild(CardCanvas)` in beiden Editoren entfernt — er tat danach nichts mehr.
- [x] `ACTIVE_AREA_NAME` wird weiterhin von `draw-items.ts` benutzt (Name für den Rahmen der
      aktiven Bildfläche); der Kommentar dort verweist jetzt auf `activeImageLayerId: null`
      im Export statt auf `exportPng`.
- [x] `docs/code-map.md`: `exportPng()`-Halbsatz bei `card-canvas/` entfernt, `templates`- und
      `cards`-Zeilen auf `CardRenderer.renderPng()` umgeschrieben.
- [x] `docs/PROJECT.md`: Meilenstein 4 als erledigt markiert (2026-08-13, Archivpfad).
- [x] `docs/decisions/021-vorschaubilder.md`: Zeile in den Konsequenzen ergänzt.
- [ ] Smoke-Checkliste der README durchgehen (das macht der Nutzer am Bildschirm), dann Plan
      nach `docs/archive/2026-08/` verschieben und `STATE.md` auf den nächsten Plan zeigen
      lassen.

## Report-Back

`npm run lint` und `npm run build` laufen grün. Beide Vorschau-Uploads (Karteneditor,
Template-Editor) laufen jetzt über `CardRenderer.renderPng()` — ein Zeichenweg für Export **und**
Vorschau, wie im Plan vorgesehen. `CardCanvas` hat keine `exportPng`-Methode mehr, die drei
Kunstgriffe (Anfasser/aktive-Fläche ausblenden, Maßstab aus gemessener Breite) sind mit ihr
verschwunden — der Motor braucht sie nie, weil seine Bühne unsichtbar und fest ist.

**Unsicherste Stelle:** keine — reines Umverdrahten auf einen bereits in Phase 1–4 geprüften
Zeichenweg, kein neuer Code-Pfad. Der offene Punkt ist nicht Code, sondern der noch nie
gefahrene Bildschirm-Rundlauf (Smoke-Checkliste unten) — das ist der eigentliche Prüfpunkt vor
dem Archivieren.
