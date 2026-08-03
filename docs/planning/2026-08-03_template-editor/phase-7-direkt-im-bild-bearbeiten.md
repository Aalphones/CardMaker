# Phase 7 — Direkt im Bild bearbeiten

**Rating:** heikel · **Status:** pending

Ebenen mit der Maus verschieben, an den Ecken größer ziehen und drehen — statt Zahlen in
Felder zu tippen. Die kleinste Phase mit dem größten Fallenpotenzial: Konva feuert bei jeder
Mausbewegung, und der Zustand darf nur beim Loslassen wandern.

## Kontext (vorher lesen)

- [`README.md`](README.md) dieses Plans → „Wo ich mir am wenigsten sicher bin", erste Zeile
- `docs/conventions/state-management.md` → Fallstrick „Konva-Transform-Events und
  Reducer-Frequenz" — die verbindliche Regel für diese Phase
- `frontend/src/app/shared/canvas/card-canvas/` (Phase 5)
- `frontend/src/app/signal-stores/template-editor.ts` (Phase 6)
- `node_modules/ng2-konva/lib/components/core-shape.component.d.ts` — dort steht, welche
  Ereignisse es gibt (`dragstart`, `dragmove`, `dragend`, `transformstart`, `transform`,
  `transformend`) und dass `getNode()` den Konva-Knoten liefert

## Vorab: der Check, der über den Bauweg entscheidet

**Bevor irgendetwas an der Auswahl-Logik entsteht**, ein Wegwerf-Beispiel bauen: ein
`ko-stage` mit einem `ko-rect` und einem `ko-transformer`, die Anfasser über
`viewChildren` + `getNode()` an das Rechteck hängen. Funktioniert das, wird es unten so
gebaut. Funktioniert es nicht (weil die Kinder aus einer `@for`-Schleife zu spät oder in
falscher Reihenfolge da sind), dann der Ausweg: **ein einziger** Anfasser-Knoten, der beim
Auswechseln der Auswahl imperativ auf den passenden Konva-Knoten umgehängt wird
(`transformer.nodes([node])`), Knoten gesucht über `stage.findOne('#' + layerId)`.

Ergebnis dieses Checks unten unter „Report-Back" festhalten — auch wenn er auf Anhieb klappt.

## Abnahmekriterien

1. Ein Klick auf eine Ebene in der Vorschau wählt sie aus; ein Klick ins Leere hebt die
   Auswahl auf.
2. Die ausgewählte Ebene bekommt Anfasser: acht Ecken/Kanten zum Skalieren, ein Griff zum
   Drehen.
3. Ziehen, Skalieren und Drehen verändern die Ebene sichtbar und flüssig.
4. Die Zahlen in der Eigenschaftenspalte ändern sich **beim Loslassen**, nicht während der
   Bewegung.
5. Umgekehrt gilt weiter: Wer die Zahlen tippt, sieht die Ebene sofort wandern.
6. Rahmen-Ebenen lassen sich nicht anfassen (sie liegen immer vollflächig) — ein Klick
   darauf wählt sie aus, zeigt aber keine Anfasser.
7. Halten der Umschalttaste beim Skalieren behält das Seitenverhältnis.
8. Nach dem Loslassen stehen in der Ebene wieder saubere Werte: kein Konva-Maßstabsfaktor,
   sondern umgerechnete Breite und Höhe in Canvas-Einheiten.

## Checkliste

- [ ] **Wegwerf-Check aus dem Abschnitt oben durchführen** und den gewählten Weg festhalten.
- [ ] **Auswahl in `card-canvas`** — jede gezeichnete Ebene bekommt `id: layer.id` und
      (außer beim Rahmen) `draggable: interactive`. Klick auf eine Form meldet
      `layerClicked`; Klick auf die leere Bühne meldet `layerClicked` mit `null`.
- [ ] **Anfasser** — `ko-transformer` mit `rotateEnabled: true`,
      `keepRatio: false` (die Umschalttaste schaltet es zur Laufzeit um),
      `borderStrokeWidth`/`anchorSize` so gewählt, dass sie unabhängig vom Bühnenmaßstab
      gleich groß aussehen (`ignoreStroke` und Maßstab-Ausgleich beachten).
      Beim Rahmen keine Anfasser anhängen.
- [ ] **Nur beim Loslassen melden** — auf `dragend` und `transformend` reagieren,
      **nicht** auf `dragmove`/`transform`. Das ist die Regel aus
      `docs/conventions/state-management.md`; ein Kommentar an der Stelle sagt warum.
- [ ] **Werte zurückrechnen** — Konva schreibt beim Skalieren `scaleX`/`scaleY` an den
      Knoten statt Breite und Höhe zu ändern. Beim `transformend` deshalb:
      neue Breite = `node.width() * node.scaleX()`, neue Höhe entsprechend, danach
      `scaleX`/`scaleY` am Knoten wieder auf 1 setzen. Anschließend Bühnenmaßstab
      herausrechnen, damit in der Ebene wieder Canvas-Einheiten stehen. Diese Umrechnung als
      eigene, benannte Funktion in `shared/canvas/rendering/` — sie ist die Stelle, an der
      still falsche Zahlen entstehen, und Meilenstein 3 braucht sie beim Bildzuschnitt wieder.
- [ ] **Zurück in den Bedien-Zustand** — `patchLayer(id, { x, y, width, height, rotation })`.
      Werte auf zwei Nachkommastellen runden; Canvas-Einheiten sind zehntel Millimeter,
      alles darunter ist Rauschen im gespeicherten Datenblock.
- [ ] **Linien gesondert behandeln** — eine Linie hat keine Geometrie, sondern zwei Punkte.
      Beim Verschieben die Punkte um die Verschiebung versetzen und den Knotenversatz wieder
      auf null setzen; Skalieren und Drehen für Linien abschalten
      (`enabledAnchors: []`, `rotateEnabled: false`).
- [ ] **Tastatur** — `Entf` löscht die ausgewählte Ebene (mit derselben Rückfrage wie in der
      Liste), Pfeiltasten verschieben um 1 Canvas-Einheit, mit Umschalttaste um 10. Nur
      wirksam, wenn der Fokus nicht in einem Eingabefeld steht.
- [ ] **Doc-Update `docs/conventions/state-management.md`** — den Konva-Fallstrick um das
      ergänzen, was sich hier tatsächlich gezeigt hat (Maßstabsfaktor zurückrechnen), damit
      Meilenstein 3 nicht dieselbe Runde dreht.
- [ ] **Doc-Update `docs/code-map.md`** — die neue Umrechnungsdatei eintragen.
- [ ] **Prüfen** — `npm run lint`, `npm run build`, dann alle acht Abnahmekriterien einzeln
      im Browser. Besonders Punkt 8: nach dem Skalieren speichern, neu laden, Maße
      vergleichen.

## Report-Back
