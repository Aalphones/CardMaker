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

- [ ] Zeichenseite: die aktive Fläche und ihren Rahmen in `draw-items.ts` unterbringen,
      analog zum Auswahlrahmen des Template-Editors — kein zweiter Zeichenweg.
- [ ] Ziehen: die Verschiebung des Konva-Bildes über `apply-transform.ts`-Hilfen in
      Canvas-Einheiten zurückrechnen. 🟡 Das Bild sitzt in einer zugeschnittenen Gruppe;
      beim Zurückrechnen ist die Gruppenverschiebung abzuziehen, sonst wandert der
      Ausschnitt doppelt. Diese Stelle im Report-Back ausdrücklich bestätigen.
- [ ] Zoomen zum Mauszeiger hin: derselbe Punkt des Bildes bleibt unter dem Zeiger.
- [ ] Begrenzung der Verschiebung als reine Funktion in `card-content.ts`
      (`clampPlacement(placement, layer, imageSize)`) — prüfbar ohne Oberfläche und
      später beim Drucken wiederverwendbar.
- [ ] Bedienleiste unter der Vorschau als Teil des Karteneditors, nicht der
      Vorschaukomponente — `card-canvas` bleibt frei von Karteneditor-Wissen.
- [ ] Verzögertes Speichern umsetzen; beim Verlassen des Editors sofort schreiben,
      damit nichts verloren geht.
- [ ] Von Hand prüfen: hochformatiges Bild in querformatiger Fläche und umgekehrt,
      sehr kleines Bild (unter der Flächengröße), sehr großes Bild, Zoom bis Anschlag,
      Ziehen bis an alle vier Grenzen, Zurücksetzen, Neuladen der Seite.
- [ ] `docs/code-map.md` nachziehen.

## Report-Back
