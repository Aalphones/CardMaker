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
| 2 | [Store, Route, Seitenspalte](phase-2-store-und-navigation.md) | standard | pending |
| 3 | [Der Druckprojekt-Bildschirm](phase-3-bildschirm.md) | standard | pending |
| 4 | [Bogen-Aufbau und Vorschau](phase-4-bogen-aufbau.md) | heikel | pending |
| 5 | [Export als PDF und PNG](phase-5-export.md) | heikel | pending |
| 6 | [Schärfe-Hinweis und Abschluss](phase-6-schaerfe-und-abschluss.md) | standard | pending |

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

**Geometrie-Kontrakt** (Phase 4 legt ihn fest, Phase 5 rechnet damit): eine reine Funktion
`buildSheets(items, options)` liefert Bögen mit Positionen in **Millimetern**. PDF- und
PNG-Ausgabe teilen sich diese eine Rechnung — es gibt keine zweite Stelle, die Ränder oder
Schnittmarken kennt.

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

_(beim Archivieren füllen)_

## Files touched

_(beim Archivieren füllen)_

## Commits

_(beim Archivieren füllen)_

## Deviations from plan

_(beim Archivieren füllen)_

## Follow-ups

_(beim Archivieren füllen)_
