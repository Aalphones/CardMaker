# Phase 8 — Bild ziehen und zoomen

**Rating:** heikel (Bedienung direkt auf der Vorschau, zwei Koordinatensysteme)

Umsetzung von ADR-018: der Bildausschnitt wird nicht in einem eigenen Dialog gewählt,
sondern direkt in der Live-Vorschau geschoben und gezoomt.

## Kontext — vorher lesen

- ADR-018 (Phase 1)
- `frontend/src/app/shared/canvas/rendering/apply-transform.ts` — die bestehende
  Rückrechnung von Konva-Transformationen in Canvas-Einheiten
- `frontend/src/app/shared/canvas/rendering/units.ts`
- Ergebnis aus Phase 7 (`card-content.ts`, erweiterte `draw-items.ts`)
- `README.md` dieses Plans → Kontrakt (`CardImage`)

## Das Maßstab-Modell — verbindlich

- `scale = 1` bedeutet: das Bild **füllt die Fläche vollständig aus**, die kürzere Seite
  passt genau (wie „Bild füllen", nicht „Bild einpassen"). Damit ist der Ausgangszustand
  immer lückenlos und ein frisch hochgeladenes Bild sieht nie falsch aus.
- `offsetX`/`offsetY` verschieben das Bild **innerhalb** seiner Fläche, gemessen in
  Canvas-Einheiten, Ursprung ist die zentrierte Lage (0/0 = mittig).
- Verschiebung wird begrenzt: das Bild darf nie so weit geschoben werden, dass eine
  Ecke der Fläche leer bleibt. Die Begrenzung wird beim Ziehen **und** beim Zoomen
  neu berechnet, damit ein Herauszoomen keine Lücke reißt.
- Alle drei Werte werden in Canvas-Einheiten gespeichert, nie in Bildschirmpixeln —
  sonst hängt der Ausschnitt an der Fenstergröße (`AGENTS.md`, Regel 2).

## Abnahmekriterien

- Ein Klick auf eine Bildfläche in der Vorschau macht sie zur aktiven Fläche: sie bekommt
  einen dezenten Rahmen, die anderen Ebenen bleiben unangetastet.
- In der aktiven Fläche lässt sich das Bild mit gedrückter Maustaste ziehen und mit dem
  Mausrad zoomen (Grenzen 1 bis 10; unter 1 gibt es nichts zu sehen, siehe Modell).
- Unter der Vorschau erscheint bei aktiver Fläche eine schmale Leiste: Zoom-Regler,
  Knopf „Zurücksetzen" (Verschiebung 0/0, Maßstab 1) und eine Fragezeichen-Erklärung
  („Ziehen verschiebt das Bild, das Mausrad zoomt.").
- Auf Geräten mit Tastatur bedienbar: bei aktiver Fläche verschieben die Pfeiltasten um
  5 Einheiten (mit Umschalt um 25), Plus und Minus zoomen.
- Änderungen an Verschiebung und Maßstab werden **gesammelt** gespeichert — nicht bei
  jeder Mausbewegung eine Anfrage, sondern eine, nachdem 400 ms lang nichts mehr
  passiert ist, sowie beim Verlassen des Editors.
- Nach dem Speichern und erneutem Öffnen der Karte ist der Ausschnitt exakt derselbe.
- Ein Klick neben die Flächen hebt die aktive Fläche auf.

## Checkliste

- [x] Zeichenseite: die aktive Fläche und ihren Rahmen in `draw-items.ts` unterbringen,
      analog zum Auswahlrahmen des Template-Editors — kein zweiter Zeichenweg.
- [x] Ziehen: die Verschiebung des Konva-Bildes über `apply-transform.ts`-Hilfen in
      Canvas-Einheiten zurückrechnen. 🟡 Das Bild sitzt in einer zugeschnittenen Gruppe;
      beim Zurückrechnen ist die Gruppenverschiebung abzuziehen, sonst wandert der
      Ausschnitt doppelt. Diese Stelle im Report-Back ausdrücklich bestätigen.
- [x] Zoomen zum Mauszeiger hin: derselbe Punkt des Bildes bleibt unter dem Zeiger.
- [x] Begrenzung der Verschiebung als reine Funktion in `card-content.ts`
      (`clampPlacement(placement, layer, imageSize)`) — prüfbar ohne Oberfläche und
      später beim Drucken wiederverwendbar.
- [x] Bedienleiste unter der Vorschau als Teil des Karteneditors, nicht der
      Vorschaukomponente — `card-canvas` bleibt frei von Karteneditor-Wissen.
- [x] Verzögertes Speichern umsetzen; beim Verlassen des Editors sofort schreiben,
      damit nichts verloren geht.
- [ ] Von Hand prüfen: hochformatiges Bild in querformatiger Fläche und umgekehrt,
      sehr kleines Bild (unter der Flächengröße), sehr großes Bild, Zoom bis Anschlag,
      Ziehen bis an alle vier Grenzen, Zurücksetzen, Neuladen der Seite.
      **Offen — hängt am Live-Rundlauf, siehe Abnahme in Phase 9.**
- [x] `docs/code-map.md` nachziehen.

## Report-Back

**Stand:** umgesetzt, `npm run lint` und `npm run build` grün. Der Bildschirm-Test steht aus —
er hängt am selben Live-Rundlauf wie die Phasen 2-7.

### Die Gruppenverschiebung — ausdrücklich bestätigt

Die im Plan markierte Falle greift hier **nicht**, und zwar aus einem belegbaren Grund: das
Bild ist ein **Kind** der zugeschnittenen Gruppe, und Konva führt `node.x()`/`node.y()` in
Koordinaten des Elternknotens. Die Zahl, die nach dem Ziehen herauskommt, zählt also bereits
ab der linken oberen Ecke der Fläche — genau das Bezugssystem, in dem `cardImageBox()` rechnet.
Ein Abziehen der Gruppenlage würde den Ausschnitt hier erst kaputtmachen.

Doppelt gewandert wäre er mit `node.absolutePosition()` oder `getClientRect()` — beide rechnen
die Gruppe mit ein. Deshalb steht in `placementFromNode()` (card-canvas.ts) ausdrücklich
`node.position()`, mit dem Grund als Kommentar daneben, damit es niemand „aufräumt".

### Abweichungen vom Plan

- **Signatur der Begrenzung:** `clampPlacement(area, placement)` statt
  `clampPlacement(placement, layer, imageSize)`. Der Ausschnitt trägt die Bildmaße bereits in
  sich (`width`/`height` im Kontrakt), ein dritter Parameter wäre eine zweite Wahrheit über
  dieselbe Zahl gewesen. Aus der Ebene braucht die Rechnung nur die Fläche, nicht die Ebene.
- **Dazugekommen in `card-content.ts`:** `placementFromBoxPosition()` (Umkehrung von
  `cardImageBox`, für das Ziehen), `zoomPlacementAt()` (Maßstabswechsel um einen Ankerpunkt)
  und `resetPlacement()`. Alle drei sind reine Funktionen ohne Konva — dieselbe Begründung wie
  bei `clampPlacement`.
- **Vorschaubild der Kachel:** Die offene Frage aus den Findings ist mit „ja" beantwortet — nach
  jedem gesammelten Speichern des Ausschnitts entsteht auch ein neues Kachelbild. Ohne das
  zeigte „Alle Karten" den Ausschnitt von vor der Korrektur, bis jemand die Karte erneut
  speichert. Beim Verlassen des Editors wird nur der Ausschnitt geschrieben, kein neues
  Kachelbild — die Zeichenfläche wird in dem Moment gerade abgebaut.

### Gefunden und mitbehoben

Der Rahmen der bearbeiteten Bildfläche wäre in das hochgeladene Kachel-Vorschaubild
eingebrannt: `exportPng()` blendete bisher nur den Anfasser aus. Es blendet jetzt beide aus.

### Wo ich mir am wenigsten sicher bin

Ob das Mausrad-Zoomen wirklich am Zeiger klebt — die Rechnung dahinter ist geprüft, aber der
Anker kommt von Konvas `getRelativePointerPosition()` auf der zugeschnittenen Gruppe. Dass ein
Zuschnitt daran nichts ändert, ist Theorie, bis es einmal jemand gesehen hat.
