# Phase 3 — Der Druckprojekt-Bildschirm

Rating: **standard**

## Kontext (vorher lesen)

- `docs/design/handoff-organic/README.md` → Abschnitt „9. Druckprojekt" (verbindlich) und
  „Cards list" → Add-to-print
- `docs/design/handoff-organic/CardMaker.dc.html` → der Block hinter `isPrint` (Markup und
  Maße im Original) sowie Zeile ~171 (der Knopf in der Kartenkachel)
- `docs/conventions/css.md`, `frontend/src/styles/_bausteine.scss` — Bausteinklassen, keine
  eigenen Button-Grundregeln
- `frontend/src/app/features/cards/cards-list/*` — dort kommt der neue Knopf hinein
- `frontend/src/app/shared/canvas/preview-image-loader.ts` — Kachelbilder
- README dieses Plans → Kontrakt

Die Bogen-Vorschau rechts entsteht erst in Phase 4 — hier bleibt an ihrer Stelle ein leerer
Bereich mit der Beschriftung „Vorschau folgt".

## Abnahmekriterien

- Route `/print-project`: Überschrift „Druckprojekt", darunter eine Zusammenfassung in
  Klartext („12 Karten auf 2 Bögen"), rechts „PNG exportieren" (zweitrangig) und „Als PDF
  drucken" (erstrangig), beide gesperrt, solange nichts drin ist. Die Knöpfe tun in dieser
  Phase noch nichts (Phase 5).
- Leerer Zustand: Karte mit dem Hinweistext aus dem Prototyp und dem Knopf „Zu allen Karten".
- Gefüllt: zweispaltig `340px 1fr`. Links Karte „IM DRUCKPROJEKT" mit je Zeile Name, Anzahl
  (−, Zahl, +), Entfernen-Kreuz und darunter „Alles entfernen"; darunter Karte
  „DRUCKOPTIONEN" mit den Umschaltern „Schnittmarken" (an) und „Beschnitt" (aus).
- Beide Umschalter tragen einen Fragezeichen-Hinweis (`shared/components/field-hint`) in
  Klartext: Schnittmarken → „Dünne Hilfslinien am Blattrand zeigen, wo geschnitten wird.";
  Beschnitt → „Jede Karte wird 2 mm größer gedruckt. Beim Schneiden entstehen dann auch bei
  leichtem Verrutschen keine weißen Ränder — dafür fällt am Rand etwas vom Motiv weg."
- „−" bei Anzahl 1 entfernt die Position nicht, sondern ist gesperrt; „Alles entfernen" fragt
  über `shared/components/confirm-dialog` nach.
- In der Kartenliste hat jede Karte (Raster wie Tabelle) einen Knopf „Drucken": legt die Karte
  ins Druckprojekt; ist sie bereits drin, heißt er „Im Druckprojekt +1", erhöht die Anzahl und
  steht in der Akzentfarbe.

## Checkliste

- [ ] `frontend/src/app/features/print-project/print-project-page/` — Komponente, Vorlage,
      Stylesheet (BEM-Block `print-project`), an die Facade gebunden.
- [ ] Zusammenfassungstext aus Positionen + Bogenzahl ableiten; die Bogenzahl bis Phase 4
      schlicht `Math.ceil(summe / 9)`.
- [ ] Positionsliste, Mengensteuerung, Entfernen, „Alles entfernen" mit Rückfrage.
- [ ] Druckoptionen-Karte mit den beiden Umschaltern + Fragezeichen-Hinweisen; Änderung geht
      direkt an die Facade (kein Speichern-Knopf).
- [ ] Platzhalterbereich rechts für die Bogen-Vorschau.
- [ ] `cards-list`: Knopf je Karte (Raster: Icon mit `aria-label`, Tabelle: Text), Zustand aus
      `selectItems` der Druckprojekt-Slice, Aufruf über deren Facade.
- [ ] Route in `app.routes.ts` auf die echte Komponente umstellen.
- [ ] `docs/code-map.md`: den Frontend-Layout-Block um `features/print-project/` mit einer
      kurzen Beschreibung ergänzen.

## Report-Back

_(beim Abschluss der Phase füllen)_
