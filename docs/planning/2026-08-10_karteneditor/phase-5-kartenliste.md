# Phase 5 — Alle Karten

**Rating:** standard

## Kontext — vorher lesen

- [`docs/design/handoff-organic/README.md`](../../design/handoff-organic/README.md)
  — Abschnitte „3. Alle Karten (cards list)" und „Interactions → Cards list"
- `frontend/src/app/features/card-groups/card-groups-list/` — Muster für Liste, Suche,
  Löschabfrage
- `frontend/src/styles/_bausteine.scss` (aus dem Design-Plan)
- `frontend/src/app/shared/canvas/card-canvas/` — für die Kachelvorschau

## Abnahmekriterien

- Route `cards`, Ordner `features/cards/cards-list/`.
- **Kopf**: Überschrift „Alle Karten" plus gedämpfte Zeile mit der Anzahl; rechts ein
  Zweitrang-Umschalter „Als Tabelle" / „Als Raster" (Beschriftung wechselt) und der
  Erstrang-Button „Neue Karte" mit Plus-Symbol.
- **Filterzeile** (umbrechend, Abstand 13.2px, unten ausgerichtet):
  Suchfeld „Suchen" (20rem, Platzhalter „Kartenname …") · Auswahl „Template" (14rem,
  erster Eintrag „Alle Templates") · Auswahl „Sortierung" (12rem: Zuletzt geändert |
  Name A–Z | Kartengruppe).
- **Gruppen-Chips**: Pillen-Buttons „Alle", je eine pro Gruppe, „Ohne Gruppe" — jeweils
  mit gedämpfter Anzahl. Ausgewählt = Akzentfläche, sonst Umriss.
- Suche, Template-Auswahl und Gruppen-Chip wirken **zusammen** (alle drei müssen passen).
  Suche vergleicht ohne Rücksicht auf Groß-/Kleinschreibung als Teilzeichenkette.
  Sortierung nach Namen über `localeCompare` mit deutschem Gebietsschema.
- **Rasteransicht**: `repeat(auto-fill, minmax(11rem, 1fr))`, Abstand 17.6px.
  Kachel = Karte mit kleinem Schatten, Innenabstand 8.8px. Vorschaubild über die volle
  Breite im Seitenverhältnis 630/880, Radius 10px, Hintergrund `--color-neutral-200`.
  Darunter Name (Caprasimo 15px) und gedämpfte Meta-Zeile „Gruppe · Template".
  Fußzeile: Icon-Buttons für Duplizieren (14px) und Löschen (14px, in
  `--color-accent-700`).
- **Tabellenansicht**: Spalten Karte | Kartengruppe | Template | Geändert | Aktionen.
- **Leeres Ergebnis**: gedämpfte Zeile „Keine Karte passt zu Suche und Filter."
- **Gar keine Karten**: Karte mit gedämpftem Absatz und Erstrang-Button „Neue Karte".
- Ein Klick auf Vorschaubild oder Name öffnet den Karteneditor; „Neue Karte" öffnet ihn
  leer.
- Duplizieren legt die Kopie an und stellt sie an den Anfang der Liste; Löschen fragt
  über den bestehenden Bestätigungsdialog nach.

## Bewusst weggelassen

- Die **Seltenheits-Markierung** aus dem Entwurf (Tag in der Kachelfußzeile) — es gibt
  kein solches Feld (Entscheidung 2026-08-10, siehe README).
- Der **Knopf „ins Druckprojekt"** samt Zähler in der Seitenspalte — gehört zu
  Meilenstein 5. In der Kachelfußzeile bleibt links Platz dafür; kein Platzhalterknopf.

## Checkliste

- [ ] `features/cards/cards-list/` anlegen (Komponente, Vorlage, Stylesheet),
      `ChangeDetectionStrategy.OnPush`, Filterzustand in Signalen, gefilterte Liste als
      abgeleitetes Signal.
- [ ] Umschalter Raster/Tabelle; die gewählte Ansicht bleibt während der Sitzung
      erhalten (Signal in der Komponente reicht — keine Speicherung im Browser).
- [ ] Kachelvorschau: `card-canvas` im nicht-bedienbaren Zustand mit den Ebenen des
      Templates und den Werten der Karte. 🟡 Bei vielen Karten laufen sonst sehr viele
      Konva-Bühnen gleichzeitig — Vorschau erst zeichnen, wenn die Kachel sichtbar wird
      (`IntersectionObserver`), sonst nur die graue Fläche. Diese Grenze im
      Report-Back mit der tatsächlich beobachteten Kartenzahl belegen.
- [ ] Gruppen-Chips mit Anzahl; „Ohne Gruppe" zählt Karten ohne Zuordnung.
- [ ] Sortierung „Kartengruppe": nach Gruppennamen, Karten ohne Gruppe ans Ende.
- [ ] Duplizieren und Löschen über die Fassade; Löschen mit Bestätigungsdialog.
- [ ] Tastaturbedienung prüfen: Filterzeile, Chips und Kacheln müssen mit Tabulator
      erreichbar und mit Enter auslösbar sein — Kacheln sind Verweise, keine
      klickbaren `<div>`.
- [ ] `docs/code-map.md` nachziehen.

## Report-Back
