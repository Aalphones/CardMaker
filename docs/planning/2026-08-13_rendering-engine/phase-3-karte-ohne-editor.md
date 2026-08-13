# Phase 3 — Eine gespeicherte Karte ohne Editor rendern

Der Motor kann zeichnen, sobald ihm jemand Ebenen und Karteninhalt hinhält. Bisher kann das
nur der Karteneditor, weil die Umrechnung „gespeicherte Karte → Karteninhalt" in seinen
`computed()`-Feldern steckt. Diese Phase zieht sie heraus, damit auch die Kartenliste (und
später der Druckbogen) rendern kann.

## Kontext — vorher lesen

- `frontend/src/app/features/cards/card-editor/card-editor.ts`, Zeilen 260–300 —
  `previewLayers` und `previewContent`. Genau diese Zuordnung wird zur reinen Funktion. Die
  Editor-Fassung arbeitet auf dem **Entwurfsstand** (Formularwerte, noch nicht gespeicherte
  Bildausschnitte) und bleibt deshalb bestehen; die neue Funktion arbeitet auf dem
  **gespeicherten** Stand.
- `frontend/src/app/shared/canvas/rendering/card-content.ts` — `CardContent` und
  `CardImagePlacement`.
- `frontend/src/app/store/cards/cards.facade.ts` und `store/templates/templates.facade.ts` —
  wie eine Karte bzw. ein Template geladen und ausgewählt wird (`ensureLoaded`, `current`).
- `docs/conventions/state-management.md` — Facade-Pflicht pro Domain-Slice.

## Abnahmekriterien

- `buildRenderInput(card, template)` ist eine reine Funktion ohne Angular-Bezug: gleiche
  Eingabe, gleiche Ausgabe, keine Signale.
- Für eine gespeicherte Karte, die gerade im Editor offen ist, liefert sie inhaltlich
  dasselbe wie die Vorschau des Editors (gleiche Texte, Abweichungen, Icon-Wahl,
  Bildausschnitte).
- Ist das Template einer Karte nicht ladbar, kommt ein klar benannter Fehler zurück, kein
  halbes Bild.

## Checkliste

- [ ] `shared/canvas/rendering/card-render-input.ts` anlegen:
      `export function buildRenderInput(card: Card, template: Template): CardRenderInput` —
      `layers` aus `template.layers`, `content` aus `card` (`cardId`, `values`, `iconChoices`,
      `textOverrides`, `images`). Eins zu eins wie `previewContent` im Editor, nur ohne
      Entwurfsstand.
- [ ] `shared/canvas/card-render-source.service.ts` anlegen (`providedIn: 'root'`):
      `await inputForCard(cardId: number): Promise<CardRenderInput>` — Karte und Template über
      die Facades besorgen (`ensureLoaded()` abwarten, dann auswählen) und durch
      `buildRenderInput` schicken. Fehlt eines von beiden, wirft die Methode einen Fehler mit
      Klartext-Meldung („Die Karte oder ihr Template konnte nicht geladen werden.").
- [ ] `card-editor.ts`: `previewContent` benutzt weiterhin den Entwurfsstand, **aber** die
      Feld-für-Feld-Zuordnung kommt aus `buildRenderInput`, damit es nur eine Stelle gibt, die
      weiß, wie eine Karte in einen `CardContent` fällt. Wenn sich das nicht ohne Verrenkung
      machen lässt: bestehen lassen und in `FINDINGS.md` notieren — der Editor ist hier nicht
      das Ziel der Phase.
- [ ] `docs/code-map.md`: beide neuen Dateien eintragen.

## Report-Back
