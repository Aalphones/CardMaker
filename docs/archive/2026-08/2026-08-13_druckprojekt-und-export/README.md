# Meilenstein 5 — Druckprojekt & Export

Karten sammeln, auf DIN-A4-Bögen zu 3×3 anordnen und als PDF oder PNG in Druckauflösung
ausgeben. Der Renderer aus Meilenstein 4 zeichnet dabei jede Karte, dieser Plan setzt sie
nur noch aufs Blatt.

**Entschieden vorab (Sascha, 2026-08-13):** Es gibt **genau ein** Druckprojekt — ein
Warenkorb, im Backend gespeichert, Bildschirm exakt wie im Prototyp. Keine Verwaltung
mehrerer benannter Projekte. Und: Vor dem Export warnt eine Zeile, wenn Motive für 300 DPI
zu wenig Bildpunkte haben.

## Phasen

| # | Phase | Rating | Status |
|---|---|---|---|
| 1 | [Backend: Druckprojekt speichern](phase-1-backend.md) | standard | **complete** |
| 2 | [Store, Route, Seitenspalte](phase-2-store-und-navigation.md) | standard | **complete** |
| 3 | [Der Druckprojekt-Bildschirm](phase-3-bildschirm.md) | standard | **complete** |
| 4 | [Bogen-Aufbau und Vorschau](phase-4-bogen-aufbau.md) | heikel | **complete** |
| 5 | [Export als PDF und PNG](phase-5-export.md) | heikel | **complete** |
| 6 | [Schärfe-Hinweis und Abschluss](phase-6-schaerfe-und-abschluss.md) | standard | **complete** |

## Kontrakt (Backend ↔ Frontend)

Wire-Format camelCase, wie überall (`docs/conventions/php.md`).

```
GET    /api/print-project              → { options: PrintOptions, items: PrintItem[] }
PUT    /api/print-project/options      body: PrintOptions            → dasselbe Objekt
POST   /api/print-project/items        body: { cardId, quantity? }   → PrintItem (201)
PATCH  /api/print-project/items/{id}   body: { quantity }            → PrintItem
DELETE /api/print-project/items/{id}   → 204
DELETE /api/print-project/items        → 204   (alles entfernen)

PrintItem    = { id, cardId, cardName, quantity, previewUpdatedAt }
PrintOptions = { cutMarks: boolean, bleed: boolean }
```

`cardName` und `previewUpdatedAt` kommen aus dem Verbund mit `cards` — die Liste zeigt
Namen und Kachelbild, ohne dass das Frontend alle Karten nachlädt. `POST items` mit einer
bereits enthaltenen Karte erhöht deren Anzahl um 1 und gibt die vorhandene Position zurück
(200 statt 201) — genau das Verhalten aus dem Prototyp („Im Druckprojekt +1").

**Geometrie-Kontrakt** (Phase 4 hat ihn festgelegt, Phase 5 rechnet damit): eine reine Funktion
`buildSheets(items, options)` liefert Bögen mit Positionen in **Millimetern**. PDF- und
PNG-Ausgabe teilen sich diese eine Rechnung — es gibt keine zweite Stelle, die Ränder oder
Schnittmarken kennt. `frontend/src/app/shared/canvas/rendering/sheet-layout.ts` exportiert:

```
buildSheets(items, options): PrintSheet[]     PrintSheet = { index, slots }
                                              slot       = { cardId, xMm, yMm, widthMm, heightMm }
sheetFrames(options): SheetFrame[]            die neun Plätze, auch die leeren
sheetGeometry(options)                        { widthMm, heightMm, marginXMm, marginYMm }
sheetMarks(options): SheetMark[]              { x1Mm, y1Mm, x2Mm, y2Mm }, leer wenn ausgeschaltet
mmToPx(millimeters, dpi): number              die einzige Umrechnung in Bildpunkte
```

`items` braucht nur `{ cardId, quantity }`, `options` nur `{ cutMarks, bleed }` — beides
strukturgleich zum Store, aber ohne Abhängigkeit dorthin.

## Finale Abnahmekriterien

1. Der Seitenspalten-Eintrag „Druckprojekte" ist nicht mehr gesperrt und trägt eine Plakette
   mit der Gesamtzahl der Exemplare im Druckprojekt.
2. In der Kartenliste legt ein Knopf je Karte diese ins Druckprojekt; ist sie schon drin,
   erhöht derselbe Knopf die Anzahl und färbt sich in der Akzentfarbe.
3. Der Druckprojekt-Bildschirm zeigt leer den Hinweistext + „Zu allen Karten", gefüllt links
   die Positionsliste (Name, −/Anzahl/+, Entfernen, „Alles entfernen") und die Druckoptionen,
   rechts eine Bogen-Vorschau je Seite.
4. Anzahl ändern, entfernen und leeren überleben einen Neuladen der Seite (Backend).
5. „Als PDF drucken" lädt eine PDF-Datei herunter: A4, je Seite 3×3 Karten, jede Karte exakt
   63×88 mm, Karten in Druckauflösung (300 DPI).
6. „PNG exportieren" lädt je Bogen eine PNG-Datei in 2480×3508 Bildpunkten herunter.
   **Druckertauglich:** Die Karten sitzen im PDF als JPEG (Qualität 0,9) auf weißem Grund,
   ein PDF mit zwei vollen Bögen bleibt unter 10 MB. Der Bildschirm nennt die erzeugte
   Dateigröße; über 20 MB bietet er „Kleinere Datei erzeugen (200 dpi)" an.
7. Schnittmarken (Vorgabe: an) zeichnen Hilfslinien in den Blatträndern, nie über die Karten.
   Beschnitt (Vorgabe: aus) druckt jede Karte 2 mm größer, damit beim Schneiden keine weißen
   Ränder entstehen; beide Schalter haben einen Fragezeichen-Hinweis in Klartext.
8. Vor dem Export nennt eine Zeile die Karten, deren Motiv für 300 DPI zu grob ist — sie
   blockiert nichts.
9. Während eines Exports zeigt der Knopf einen Fortschritt („Karte 4 von 12"); die Oberfläche
   bleibt bedienbar.

## Smoke-Checkliste (Bildschirm-Rundlauf, unsicherste Stellen zuerst)

1. **Ein PDF mit 12 Karten erzeugen und in Acrobat/Vorschau bei 100 % messen** — ist eine
   Karte 63×88 mm? Sind es zwei Seiten (9 + 3)?
2. **Dateigröße prüfen und einmal wirklich am Netzwerkdrucker ausgeben** — kommt der Auftrag
   durch, ohne dass die Warteschlange hängt? Sind durchsichtige Stellen weiß und nicht
   schwarz (JPEG kennt keine Durchsichtigkeit)?
3. **Beschnitt an/aus vergleichen** (mit echten Karten, nach dem Bauen) — bei „an" muss jede
   Karte sichtbar minimal größer sein und das Raster trotzdem zentriert auf dem Blatt sitzen.
4. **Schnittmarken** — liegen die Striche in den Rändern auf einer Linie mit den Kartenkanten
   und laufen nirgends über eine Karte?
5. Ein PNG eines Bogens öffnen und die Bildgröße prüfen: 2480×3508.
6. Dieselbe Karte zweimal ins Projekt legen — wird sie nur **einmal** gerendert (Export merklich
   schneller als bei zwei verschiedenen Karten)?
7. Anzahl erhöhen, Seite neu laden — steht die Anzahl noch?
8. Eine Karte mit kleinem Motiv (z. B. 300 px breit) ins Projekt legen — erscheint der
   Schärfe-Hinweis, und lässt sich trotzdem exportieren?
9. Eine Karte löschen, die im Druckprojekt liegt — verschwindet sie auch dort?

## Summary

Meilenstein 5 ist abgeschlossen: genau ein Druckprojekt (Warenkorb) im Backend, Seitenspalten-
Eintrag mit Plakette, „Drucken"-Knopf in der Kartenliste, der Druckprojekt-Bildschirm
(Positionsliste, Druckoptionen, Bogen-Vorschau), die gemeinsame Millimeter-Geometrie für
Vorschau/PDF/PNG, der Export selbst (PDF und PNG, JPEG-Kompression, 200-dpi-Ausweg für zu
große Dateien) sowie der Schärfe-Hinweis für zu grobe Motive vor dem Export.

## Files touched

- Backend: `PrintProjectController`/`Service`/`Repository`/`Validator`, Migration
  `print_project_items`/`print_project_options`
- Frontend Store: `store/print-project/*` (actions, effects, feature, facade)
- Frontend Rendering: `shared/canvas/rendering/sheet-layout.ts`, `print.ts`,
  `image-sharpness.ts` (neu, Phase 6)
- Frontend Features: `features/print-project/*` (Seite, Bogen-Vorschau, Export-Service)
- Docs: `docs/code-map.md`, `docs/models.md`, `docs/routes.md`, `docs/decisions/023-*.md`,
  `docs/PROJECT.md`

## Commits

- `d011a8e` Backend: Druckprojekt speichern
- `9388655` Store, Route, Seitenspalten-Eintrag
- `2732aa6` Druckprojekt-Bildschirm und „Drucken"-Knopf
- `1363a42` Bogen-Geometrie und Vorschau
- `0a6a111` Export als PDF und PNG
- Phase 6 (Schärfe-Hinweis, dieser Commit)

## Deviations from plan

Keine — alle sechs Phasen wie geplant umgesetzt.

## Follow-ups

- Smoke-Checkliste oben ist noch nicht vom Nutzer gefahren worden (neuer Meilenstein, keine
  Regression-Historie).
- Weiterhin offen aus früheren Meilensteinen: der Bildschirm-Rundlauf gegen die
  Smoke-Checklisten von Meilenstein 3 und 4 ist nie gefahren worden (siehe
  `docs/archive/2026-08/2026-08-10_karteneditor/phase-9-abschluss.md` und
  `docs/archive/2026-08/2026-08-13_rendering-engine/README.md`).
- Backend-Migration/Endpunkte dieses Meilensteins waren lokal nicht lauffähig (PHP-
  Versionsdifferenz `vendor/`) — erster echter Beleg ist der nächste Deploy mit
  `POST /api/migrate`.
