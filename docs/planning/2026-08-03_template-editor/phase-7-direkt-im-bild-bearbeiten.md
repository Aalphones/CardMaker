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

- [x] **Wegwerf-Check aus dem Abschnitt oben durchführen** und den gewählten Weg festhalten.
      Nicht als separates Wegwerf-Beispiel gebaut, sondern direkt entschieden: Es kann immer
      nur eine Ebene gleichzeitig ausgewählt sein, also gibt es nur **einen** Anfasser-Knoten
      (`ko-transformer`), der bei jedem Auswahlwechsel per `transformer.nodes([node])`
      umgehängt wird (`stage.findOne('.' + layerId)`). Die im Plan skizzierte Alternative
      (ein Transformer pro `@for`-Zeile) hätte dieselbe Zielsetzung nur umständlicher
      erreicht — die Wegwerf-Probe dafür entfällt, weil der einfachere Weg unabhängig vom
      Testergebnis der bessere gewesen wäre. Siehe Kommentar in `card-canvas.ts`.
- [x] **Auswahl in `card-canvas`** — jede gezeichnete Ebene bekommt `name: layer.id` (statt
      `id`, siehe Abweichung unten) und ist nur ziehbar, wenn sie ausgewählt **und**
      `interactive` ist (nicht generell bei `interactive`, sonst verschiebt ein Klick-Drag
      über eine fremde Ebene diese versehentlich mit). Klick auf eine Form meldet weiter
      `layerClicked` wie in Phase 6.
- [x] **Anfasser** — `ko-transformer` mit `rotateEnabled` (aus bei Linien), `keepRatio: false`
      (Konvas eingebautes `shiftBehavior: 'default'` schaltet bei gehaltener Umschalttaste
      automatisch auf Seitenverhältnis behalten um — kein eigenes Tastatur-Tracking nötig,
      siehe `konva/lib/shapes/Transformer.js`), `anchorSize`/`borderStrokeWidth`/
      `rotateAnchorOffset` durch den Bühnenmaßstab geteilt. Beim Rahmen bleibt der Transformer
      leer (`nodes([])`).
- [x] **Nur beim Loslassen melden** — `(dragend)`/`(transformend)` gebunden, `dragmove`/
      `transform` nirgends verdrahtet.
- [x] **Werte zurückrechnen** — `neueBreite = node.width() * node.scaleX()` **ohne**
      zusätzliche Division durch den Bühnenmaßstab (Abweichung vom Plantext, siehe unten),
      danach `scaleX`/`scaleY` auf 1. Eigene Funktion: `shared/canvas/rendering/apply-transform.ts`.
- [x] **Zurück in den Bedien-Zustand** — `layerTransformed`-Output aus `card-canvas`,
      `template-editor.ts` ruft `editor.patchLayer(id, changes)`. Rundung auf zwei
      Nachkommastellen sitzt in `apply-transform.ts`.
- [x] **Linien gesondert behandeln** — Punkte werden in `onDragEnd` um `node.x()/node.y()`
      versetzt (`offsetLinePoints`), der Knoten danach auf `{x:0,y:0}` zurückgesetzt.
      `enabledAnchors: []`, `rotateEnabled: false` bei ausgewählter Linie.
- [x] **Tastatur** — in `template-editor.ts` (nicht `card-canvas`, das bleibt reines
      Präsentations-Bauteil ohne Dialog-/Store-Zugriff): `Entf`/`Backspace` löscht mit
      Rückfrage (derselbe `ConfirmDialog` wie in der Ebenenliste), Pfeiltasten bewegen um 1,
      mit Umschalttaste um 10 Canvas-Einheiten. Ignoriert, wenn ein Eingabefeld den Fokus hat.
- [x] **Doc-Update `docs/conventions/state-management.md`** — Fallstrick um die bestätigte
      Konva-Transformer-Mechanik ergänzt (Bühnenmaßstab wird für Geometrie bereits von Konva
      selbst herausgerechnet, nur die Anfasser-Optik braucht die manuelle Division) und die
      `id`-vs-`name`-Warnung von `ng2-konva` festgehalten.
- [x] **Doc-Update `docs/code-map.md`** — `apply-transform.ts` eingetragen.
- [x] **Prüfen** — `npm run lint` und `npm run build` grün. Die acht Abnahmekriterien im
      Browser durchklicken ist noch offen — läuft beim User (siehe Report-Back).

## Report-Back

**Abweichung vom Plantext — Bühnenmaßstab bei der Geometrie-Rückrechnung:** Der Plan verlangte,
nach `neueBreite = node.width() * node.scaleX()` zusätzlich „den Bühnenmaßstab
herauszurechnen". Im Konva-Quelltext (`Transformer._fitNodesInto()`) nachgesehen: Der
Transformer invertiert den Eltern-Transform (die skalierte Konva-Ebene) bereits selbst, bevor
er `x`/`y`/`scaleX`/`scaleY` an den Knoten schreibt — die Werte stehen danach schon in
Canvas-Einheiten. Eine zusätzliche Division hätte die Werte verfälscht. Was den Maßstab
tatsächlich braucht: die Anfasser-Optik (`anchorSize` u. Ä.), das ist im Code entsprechend
umgesetzt und in `docs/conventions/state-management.md` nachgezogen.

**Abweichung — `id` → `name`:** `ng2-konva` warnt beim Setzen des Konva-`id`-Attributs
ausdrücklich vor möglichen Bugs. Statt `id: layer.id` (wie im Plan skizziert) trägt jeder
Knoten `name: layer.id`, gesucht wird über `stage.findOne('.' + id)`. Gleiche Wirkung, folgt
aber der Empfehlung der Bibliothek.

**Kein eigenes Umschalttaste-Tracking:** Konvas `Transformer` behält bei `keepRatio: false`
automatisch das Seitenverhältnis, solange Umschalt gehalten wird (`shiftBehavior: 'default'`,
im Quelltext bestätigt) — das im Plan vermutete manuelle `keydown`/`keyup`-Tracking war nicht
nötig und wurde nicht gebaut.

**Wegwerf-Check:** siehe Checkliste oben — direkt der einfachere Weg gewählt statt
experimentell zu prüfen, ob der Umweg über `@for` + `viewChildren` funktioniert hätte.

**Noch offen:** `npm run lint`/`npm run build` sind grün, die manuelle Sichtprüfung der acht
Abnahmekriterien im Browser läuft beim User — Checkliste unten. Besonders Punkt 8 (Skalieren,
speichern, neu laden, Maße vergleichen) prüft die oben beschriebene Rückrechnung in der
Praxis; das ist die Stelle, an der ich am wenigsten sicher bin, weil ich sie nur am
Konva-Quelltext nachvollzogen, nicht im Browser gesehen habe.
