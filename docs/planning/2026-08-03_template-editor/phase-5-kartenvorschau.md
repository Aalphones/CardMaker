# Phase 5 — Kartenvorschau auf Konva

**Rating:** heikel · **Status:** pending

Aus einer Ebenenliste wird ein Bild. Das Herzstück — und der Teil, den Meilenstein 4
(Drucken in 300 DPI) unverändert wiederverwenden soll. Deshalb liegt alles, was rechnet,
getrennt von allem, was zeichnet.

Diese Phase hängt nur am Datenmodell, nicht am Backend. Sie darf vor Phase 2/3 gebaut
werden, wenn es zeitlich besser passt.

## Kontext (vorher lesen)

- [`README.md`](README.md) dieses Plans → „Die fünf Ebenentypen" (die Zeichenregeln)
- `docs/decisions/005-client-side-rendering.md`
- `docs/decisions/001-canvas-rendering-konva.md`
- `docs/conventions/state-management.md` → Fallstrick „Konva-Transform-Events und
  Reducer-Frequenz"
- `frontend/src/app/shared/canvas/rendering/units.ts` — die vorhandene Umrechnung
- `frontend/src/app/shared/canvas/rendering/layer.ts` (aus Phase 4)
- `node_modules/ng2-konva/README.md` — Anwendungsbeispiel

**Was `ng2-konva` 12.0.1 bietet** (geprüft am 2026-08-03): `ko-stage` sowie
`ko-layer`, `ko-group`, `ko-rect`, `ko-circle`, `ko-ellipse`, `ko-line`, `ko-image`,
`ko-text`, `ko-transformer` und weitere über eine einzige Komponente `CoreShapeComponent`.
Alles wird über eine einzige Eingabe `[config]` gesteuert (ein Modell-Signal), Ereignisse
wie `dragend` und `transformend` sind als Ausgaben vorhanden, `getNode()` liefert den
darunterliegenden Konva-Knoten. Importiert werden nur `StageComponent` und
`CoreShapeComponent`.

## Abnahmekriterien

1. Eine Beispiel-Ebenenliste wird als Karte gezeichnet — alle fünf Typen sichtbar.
2. Die Zeichenreihenfolge stimmt: Index 0 des Arrays liegt zuunterst.
3. Ausgeblendete Ebenen (`visible: false`) erscheinen nicht.
4. Die Karte behält bei jeder Fenstergröße das Verhältnis 630:880 und ist scharf.
5. Ein Textfeld mit zu langem Text wird verkleinert, bis es passt, aber nie unter die
   Mindestgröße — und was dann noch nicht passt, wird abgeschnitten statt herauszulaufen.
6. Ein Rahmen liegt immer vollflächig, unabhängig von seiner Position in der Liste — er
   **wird** aber an seiner Listenposition gezeichnet, nicht zwangsweise zuoberst.
7. Ohne zugeordnetes Bild zeigen Bildfläche, Icon und Rahmen einen erkennbaren Platzhalter
   statt nichts.

## Checkliste

- [ ] **Reine Rechenfunktion `frontend/src/app/shared/canvas/rendering/auto-shrink.ts`** —
      `fitFontSize(options): number`. Bekommt Text, Boxbreite/-höhe, Start- und
      Mindestschriftgröße, Schriftart, Zeilenabstand und eine Messfunktion als Parameter,
      liefert die größte passende Schriftgröße. Absteigend in Einer-Schritten von der
      Startgröße bis zur Mindestgröße, erste passende gewinnt. **Keine Konva-Abhängigkeit** —
      die Messfunktion wird hineingereicht. Grund als Kommentar: Meilenstein 4 misst anders
      (Zielauflösung), soll aber dieselbe Regel benutzen.
- [ ] **Messbrücke `frontend/src/app/shared/canvas/rendering/measure-text.ts`** — kapselt
      das Messen mit `Konva.Text` (Knoten mit fester `width` und `wrap: 'word'` bauen,
      `getClientRect().height` lesen, Knoten wieder verwerfen).
      **Das ist der unsicherste Punkt dieser Phase.** Vor dem Weiterbauen prüfen: Textknoten
      anlegen, Text schrittweise verlängern, gemessene Höhe protokollieren. Liefert Konva
      keine brauchbare Höhe, den Ausweg nehmen: Zeilenzahl aus dem Umbruch (`textArr` am
      Konva-Textknoten) mal Schriftgröße mal Zeilenabstand. Ergebnis unten festhalten.
- [ ] **Bildlader `frontend/src/app/shared/canvas/asset-image-loader.ts`** — Dienst, der zu
      einer Bildnummer ein `HTMLImageElement` liefert. Ruft `/assets/{id}/file` über den
      vorhandenen `Api`-Dienst als `blob` ab (damit der Anmelde-Abfänger greift), erzeugt
      eine Objekt-Adresse, setzt sie am Bildelement und hält beides in einer Karte im
      Speicher. Bereits geladene Nummern nicht erneut abrufen. Beim Zerstören des Dienstes
      die Objekt-Adressen wieder freigeben.
      Nach außen ein Signal je Bildnummer, damit die Vorschau von selbst neu zeichnet,
      sobald ein Bild da ist.
- [ ] **Komponente `frontend/src/app/shared/canvas/card-canvas/`** — zeichnet eine
      Ebenenliste. Eingaben: `layers` (Pflicht), `selectedLayerId` (optional),
      `interactive` (Standard `false`). Ausgaben: `layerClicked`.
      - Äußerer Behälter hält das Verhältnis 630:880 (`aspect-ratio`), misst seine Breite
        und gibt dem `ko-stage` genau diese Pixelmaße. Ein `scale` auf der Konva-Ebene
        rechnet Canvas-Einheiten in Bildschirmpunkte um — **alle Ebenenwerte bleiben in
        Canvas-Einheiten**, umgerechnet wird nur einmal, am Bühnenmaßstab.
      - Für scharfe Kanten auf hochauflösenden Bildschirmen `Konva.pixelRatio` beziehungsweise
        die Bühnengröße mit `devicePixelRatio` multiplizieren.
      - Hinter der Karte ein helles Schachbrettmuster (reines CSS am Behälter), damit
        Transparenz sichtbar wird.
      - Eine `@for`-Schleife über die Ebenen, `track layer.id`, darin eine Fallunterscheidung
        nach `type`. Die Reihenfolge im Vorlagen-Baum **ist** die Zeichenreihenfolge —
        `ng2-konva` gleicht sie über eine Beobachtung des DOM ab.
      - Abbildung auf Konva: `image` → `ko-image`, `shape/rect` → `ko-rect`,
        `shape/circle` → `ko-ellipse` (Radien = halbe Breite/Höhe, damit gleiche Werte einen
        Kreis ergeben), `shape/line` → `ko-line`, `icon` → `ko-image`, `frame` → `ko-image`
        mit fest `x=0, y=0, width=630, height=880`, `text` → `ko-text`.
      - Drehung: Konva dreht um den Ursprung des Knotens; da `x`/`y` die obere linke Ecke
        sind, passt `rotation` direkt. Bei der Ellipse den Mittelpunkt entsprechend versetzen.
      - Textknoten bekommen `wrap: 'word'`, `ellipsis: true`, die per `fitFontSize`
        ermittelte Größe (nur wenn `autoShrink` an ist, sonst die Standardgröße), sowie
        Umrandung (`stroke`, `strokeWidth`, `fillAfterStrokeEnabled: true`) und Schatten.
      - Platzhalter ohne Bild: gestricheltes Rechteck in der Fläche der Ebene plus
        Beschriftung („Bildfläche", „Icon", „Rahmen fehlt").
      - `visible: false` → Ebene gar nicht erst zeichnen.
- [ ] **Vorschauseite verdrahten** — die Platzhalterseite aus Phase 4 zeigt jetzt die
      Vorschau des geladenen Templates. Damit ist der Fortschritt sichtbar, bevor Phase 6
      die Bedienung baut.
- [ ] **Doc-Update `docs/code-map.md`** — `shared/canvas/` ist nicht mehr leer: Eintrag für
      `card-canvas/`, `asset-image-loader.ts` und die drei Dateien unter `rendering/`.
- [ ] **Doc-Update `docs/conventions/state-management.md`** — falls sich beim Bauen zeigt,
      dass der dort notierte Konva-Fallstrick anders aussieht als beschrieben, die Stelle
      korrigieren statt danebenzuschreiben.
- [ ] **Prüfen** — `npm run lint`, `npm run build`, Seite im Browser öffnen und alle sieben
      Abnahmekriterien einzeln durchgehen (DoD-Regel: „Der Build war grün" ist kein Beleg).

## Report-Back
