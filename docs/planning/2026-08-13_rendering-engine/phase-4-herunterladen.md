# Phase 4 — Als Bild herunterladen

Der sichtbare Teil des Meilensteins: ein Knopf, der die Karte als Datei auf die Platte legt.
Zwei Stellen — im Karteneditor (der aktuelle Stand, auch ungespeichert) und in der
Kartenliste (der gespeicherte Stand).

## Kontext — vorher lesen

- `frontend/src/app/features/cards/card-editor/card-editor.html` — die Kopfzeile mit
  „Speichern"; dort kommt der neue Knopf daneben.
- `frontend/src/app/features/cards/cards-list/` — das Aktionsmenü je Kachel bzw. Tabellenzeile
  (dort stehen heute schon „Duplizieren" und „Löschen").
- `frontend/src/styles/_bausteine.scss` — die Bausteinklassen für Knöpfe; keine eigenen
  Grundregeln bauen.
- `frontend/src/app/shared/components/` — `field-hint` (Fragezeichen-Knopf mit aufklappbarem
  Hinweis) und `notification-list` für Fehlermeldungen.
- `docs/conventions/css.md`, `docs/conventions/angular.md`.

## Abnahmekriterien (die Struktur, da kein Mockup existiert)

- **Karteneditor:** in der Kopfzeile links neben „Speichern" ein Knopf „Als Bild
  herunterladen" im selben Pillen-Stil, als Zweitrang-Knopf (nicht die Hauptfarbe —
  „Speichern" bleibt die auffälligste Handlung). Direkt daneben ein Fragezeichen-Hinweis mit
  dem Text: *„Ergibt ein PNG mit 744 × 1039 Bildpunkten — das ist die Kartengröße 63 × 88 mm
  bei 300 Bildpunkten je Zoll, der übliche Wert fürs Drucken."*
- **Kartenliste:** im vorhandenen Aktionsmenü ein Eintrag „Als Bild herunterladen", oberhalb
  von „Löschen".
- Während des Erzeugens ist der Knopf gesperrt und beschriftet mit „Wird erzeugt …". Ein
  zweiter Klick kann nichts auslösen.
- Der Dateiname ist der Kartenname in Kleinschreibung, Umlaute ausgeschrieben, Leerzeichen zu
  Bindestrichen, alles andere weg — plus `.png`. Bleibt nichts übrig, heißt die Datei
  `karte.png`.
- Fehlt beim Rendern eine Bilddatei (`RenderResult.missing` nicht leer), wird die Datei
  trotzdem heruntergeladen **und** eine Meldung gezeigt: *„Fertig — aber diese Bilder fehlen
  im Bild: <Ebenennamen>."*
- Schlägt das Rendern ganz fehl, gibt es keine Datei und eine Klartext-Meldung; die Seite
  bleibt bedienbar.
- Ein Erstnutzer braucht keine Erklärung: der Knopf sagt, was passiert, und der Hinweis
  daneben ist optional.

## Checkliste

- [x] `shared/services/download-file.ts` anlegen: `downloadBlob(blob: Blob, fileName: string)`
      — Objekt-Adresse erzeugen, unsichtbares `<a download>` klicken, Adresse per
      `URL.revokeObjectURL` wieder freigeben (sonst bleibt der Blob im Speicher hängen).
- [x] `shared/services/card-file-name.ts` (oder als Funktion daneben): `cardFileName(name:
      string): string` nach der Regel oben. Umlaute: `ä→ae`, `ö→oe`, `ü→ue`, `ß→ss`.
- [x] `card-editor.ts`: Methode `downloadImage()` — `CardRenderer.renderPng({ layers:
      previewLayers(), content: previewContent() }, PRINT_WIDTH_PX)`, dann `downloadBlob`.
      Ladezustand als `signal<boolean>`, Fehler über den vorhandenen Meldungsdienst.
- [x] `card-editor.html`: Knopf + Fragezeichen-Hinweis wie in den Abnahmekriterien.
- [x] `cards-list`: Menüeintrag, der `CardRenderSource.inputForCard(id)` (Phase 3) und dann
      denselben Weg benutzt. Ladezustand pro Karte, nicht global — sonst sperrt ein Export die
      ganze Liste.
- [x] Bewegung: hat der Knopf einen Übergang, gehört ein `prefers-reduced-motion`-Zweig dazu
      (`docs/conventions/css.md`). Kein neuer Übergang eingeführt — nur vorhandene
      `.btn`/`.icon-button`-Bausteinklassen wiederverwendet, also entfällt der Zweig.
- [x] `docs/code-map.md`: die beiden neuen `shared/services/`-Dateien und den neuen Knopf bei
      `cards` eintragen.

## Report-Back

Kein Aktionsmenü existierte in `cards-list` (nur zwei nackte Icon-/Ghost-Knöpfe je Karte) —
der neue Knopf reiht sich als drittes Element ein (Icon im Raster, Text in der Tabelle), nicht
als Menüeintrag. Der Herunterladen-Knopf im Karteneditor sitzt in der Fußzeile
(`card-editor__actions`) links neben „Karte speichern" — eine eigene Kopfzeile mit „Speichern"
gibt es in diesem Editor nicht, die Fußzeile ist die einzig sinnvolle Entsprechung.

`npm run lint` und `npm run build` laufen grün.
