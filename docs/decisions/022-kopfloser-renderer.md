# 022 — Karten werden auf einer Bühne im Speicher gerendert, nicht in einer versteckten Komponente

**Status:** Akzeptiert (2026-08-13)

## Kontext

Ein Kartenbild in Druckauflösung soll entstehen, ohne dass ein Editor offen ist: beim
Herunterladen aus der Kartenliste und später für die Druckbögen, wo neun Karten auf eine
A4-Seite gerechnet werden. Bisher entsteht ein Bild nur über `CardCanvas.exportPng()` — also
über die sichtbare Zeichenfläche eines geöffneten Editors.

## Optionen

- (a) **Versteckte Komponente.** Die vorhandene `CardCanvas` unsichtbar einhängen und ihr
  `exportPng()` benutzen — nur ein Zeichenweg.
- (b) **Bühne im Speicher.** Ein Dienst baut die Konva-Knoten selbst auf einer Bühne, deren
  Container nie im Dokument hängt.

## Entscheidung

**(b).** Bei (a) müsste der Aufrufer auf Angulars Lebenszyklus warten (wann ist die Bühne
fertig gezeichnet?), die Bühnengröße hinge an der gemessenen Fensterbreite statt fest zu
sein, und ein Druckbogen müsste neun solcher Komponenten gleichzeitig einhängen. (b) ist eine
Funktion mit einem Rückgabewert: Ebenen rein, PNG raus.

## Konsequenzen

- Es gibt einen **zweiten Zeichenweg**: `render-stage.ts` übersetzt dieselbe Zeichenliste in
  Konva-Knoten wie `card-canvas.html`. Kommt dort ein Elementtyp dazu und hier nicht, fehlt er
  still im Export. Beide Wege lesen deshalb dieselbe `DrawItem`-Liste aus `draw-items.ts`, und
  die Übersetzung steckt in genau einer Datei mit einem Verweis auf die Vorlage.
- Der Maßstab sitzt wie in der sichtbaren Vorschau auf der Konva-Ebene, nicht auf der Bühne:
  Konva rechnet die Bühnen-eigene Skalierung beim Ausgeben nicht mit, die der Ebene schon.
- Bedienhilfen können gar nicht erst ins Bild geraten — ohne Auswahl und ohne Bildbearbeitung
  erzeugt die Zeichenliste weder Auswahlrahmen noch Flächenrahmen. Das nachträgliche
  Ausblenden aus `exportPng()` entfällt.
- Die Bühne wird nach jedem Aufruf zerstört, auch wenn das Ausgeben fehlschlägt — sonst
  bliebe pro Export eine Leinwand im Speicher liegen.
