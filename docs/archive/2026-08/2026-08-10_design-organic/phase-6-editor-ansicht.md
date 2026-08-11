# Phase 6 — Template-Editor: Zoom, Ansicht verschieben, Element-Menü

**Rating:** heikel (neue Bedienmechanik auf der Konva-Bühne)

## Kontext — vorher lesen

- [Handoff-Beschreibung](../../design/handoff-organic/README.md), Abschnitt „7." (Zoom-Pille, Status-Pille, „Element hinzufügen"-Menü)
  und „Interactions & Behavior → Template editor" (Pan/Zoom/Einpassen)
- `frontend/src/app/shared/canvas/card-canvas/card-canvas.ts` — heutige Skalierung
  Bildschirm↔Canvas-Einheiten (`CANVAS_WIDTH` 630, `CANVAS_HEIGHT` 880)
- `frontend/src/app/signal-stores/template-editor.ts`
- `frontend/src/app/shared/canvas/rendering/layer.ts` — `createLayer()` und die
  Ebenentypen (Grundlage für das Hinzufügen-Menü)

## Abnahmekriterien

**Zoom und Ansicht**
- Der Maßstab ist ein Zustand mit zwei Modi: „eingepasst" und „von Hand". Beim Öffnen und
  bei jeder Größenänderung des Fensters wird im Modus „eingepasst" neu berechnet:
  die Karte füllt die gemessene Bühnengröße minus 96px, in beide Richtungen passend.
- Die Bühnengröße wird gemessen (ResizeObserver), nicht geraten.
- **Zoom-Pille** unten links: Pillenform, Flächenfarbe, mittlerer Schatten. Inhalt:
  Button „−", Maßstab in Prozent als Button (Klick = einpassen), Button „+", Button „?"
  (öffnet den Kürzel-Dialog aus Phase 7 — hier nur anlegen und sperren).
- Mausrad über der Bühne zoomt stufenlos zum Mauszeiger hin, Grenzen 10 % bis 400 %.
  „−"/„+" springen in Stufen (25 → 50 → 75 → 100 → 150 → 200 → 300 → 400).
- **Ansicht verschieben**: Leertaste gedrückt halten und ziehen, oder mittlere Maustaste
  ziehen. Solange die Leertaste gedrückt ist, zeigt der Zeiger eine Hand, und ein Ziehen
  verschiebt **nicht** die ausgewählte Ebene.
- **Status-Pille** unten rechts: Pillenform, 11px. Zeigt die Zeigerposition in
  Canvas-Einheiten (`x / y`), solange der Zeiger über der Karte ist; sonst den Hinweis
  „Leertaste + Ziehen verschiebt die Ansicht".

**Element hinzufügen**
- Der Block-Button oben in der linken Spalte öffnet ein Menü, das unmittelbar darunter
  liegt (oben `calc(100% - 2px)`, links/rechts 8px, Ebene 30, Innenabstand 6px), als
  Karte mit großem Schatten.
- Einträge, je mit Symbol, Bezeichnung und Kürzelhinweis rechts:
  Text (T) · Bildfläche (I) · Icon (K) · Rechteck (R) · Kreis (O) · Linie (L) · Rahmen (F).
- „Rahmen" ist gesperrt, sobald das Template bereits eine Rahmenebene hat — mit sichtbarem
  Grund („nur eine Rahmenebene je Template"), nicht kommentarlos ausgegraut.
- Ein Klick legt die Ebene über `createLayer()` an, wählt sie aus und schließt das Menü.
- Klick daneben oder Escape schließt das Menü.

## Checkliste

- [x] Zoom- und Verschiebe-Zustand in `signal-stores/template-editor.ts` ergänzen:
      `zoomMode` ('fit' | 'manual'), `zoomValue`, `pan {x, y}`, `stageSize`,
      `spaceDown`, `cursorPos`. Alles reine Bedienzustände — **nicht** in den
      NgRx-Store und **nicht** Teil der gespeicherten Template-Daten.
      *(Umgesetzt als `zoomMode` + `manualZoom`; der wirksame Maßstab `zoom` ist eine
      Rechnung daraus — im Modus „eingepasst" fällt er bei jeder Größenänderung von
      selbst neu aus, statt an zwei Stellen nachgehalten zu werden.)*
- [x] `card-canvas` um die Eingänge `zoom` und `pan` erweitern und den bisher fest
      berechneten Maßstab daraus ableiten. Die Umrechnung Canvas-Einheiten ↔ Bildschirm
      bleibt an einer Stelle (`rendering/units.ts` mitbenutzen), damit Meilenstein 4
      dieselbe Rechnung wiederverwenden kann.
      *(Abweichung, siehe Report-Back: `card-canvas` misst seine eigene Breite bereits und
      rechnet daraus den Maßstab. Statt zwei neuer Eingänge setzt der Editor die Karte in
      Bildschirmpunkten — Breite `630 × Maßstab`, Ecke aus `cardOrigin()`. Die Rechnung
      liegt vollständig in `rendering/units.ts`.)*
- [x] Einpassen berechnen: `min((breite - 96) / 630, (höhe - 96) / 880)`.
- [x] Radzoom zum Zeiger hin: vor dem Skalieren die Zeigerposition in Canvas-Einheiten
      merken, nach dem Skalieren die Verschiebung so korrigieren, dass derselbe Punkt
      unter dem Zeiger bleibt.
- [x] Verschieben umsetzen. 🟡 Achtung: solange die Leertaste gedrückt ist, muss das
      Ziehen der ausgewählten Ebene abgeschaltet sein (`draggable` auf den Konva-Knoten),
      sonst zieht ein Verschieben der Ansicht ungewollt die Ebene mit.
      *(Gelöst über einen Eingang `panning`, der die Zeichenebene auf `listening: false`
      stellt — damit reagieren Ebenen **und** Anfasser nicht mehr, die Auswahl bleibt
      aber sichtbar.)*
- [x] Zoom-Pille und Status-Pille als eigene Komponente
      `template-editor/stage-controls/` anlegen (Vorlage + Stylesheet), Werte über
      Eingänge, Aktionen über Ausgänge — keine Store-Zugriffe in der Vorlage.
- [x] „Element hinzufügen"-Menü als Komponente
      `template-editor/add-layer-menu/` anlegen. Tastaturbedienbar: Pfeiltasten wandern
      durch die Einträge, Enter wählt, Escape schließt, der Fokus kehrt auf den Button
      zurück.
- [x] Wo bisher Ebenen angelegt wurden (heutige Schaltflächen in `layer-list`), auf das
      neue Menü umstellen und die alten Schaltflächen entfernen.
- [x] `docs/code-map.md`: die beiden neuen Unterordner eintragen.

## Report-Back

**Status:** complete (`npm run lint` und `npm run build` grün).

**Abweichung vom Plan — wo der Maßstab angewendet wird.** Der Plan sah zwei neue Eingänge
`zoom`/`pan` an `card-canvas` vor. `card-canvas` misst seine eigene Breite aber schon selbst
und leitet den Konva-Maßstab daraus ab. Die Karte in Bildschirmpunkten zu setzen (Breite
`630 × Maßstab`, Ecke absolut in der Bühne) erreicht dasselbe, ohne dem gemeinsam genutzten
Bauteil eine zweite Größenquelle einzubauen — die Kartenliste und die spätere Druckvorschau
bleiben unberührt. Die gesamte Rechnung (Einpassen, Grenzen, Rasterstufen, Bildschirm →
Canvas-Einheiten, Ankerpunkt beim Radzoom) liegt in `shared/canvas/rendering/units.ts` und
ist damit für Meilenstein 4 wiederverwendbar. Neu ist an `card-canvas` nur der Eingang
`panning`.

🟡 **Preis dieser Lösung:** Bei 400 % ist die Zeichenfläche wirklich 2520 × 3520 Punkte groß,
nicht nur der sichtbare Ausschnitt. Auf einem hochauflösenden Bildschirm entspricht das
einigen hundert MB Bildspeicher. Für eine Karte im Format 630 × 880 ist das vertretbar;
fällt es im Betrieb auf, ist der Ausweg eine bühnengroße Konva-Fläche mit verschobener
Zeichenebene — dann muss aber der Kartenhintergrund (Schachbrett, Schatten) mitwandern.

**Zusätzlich erledigt (aus FINDINGS):** die drei violetten Festwerte auf der Konva-Fläche
(Platzhalterrand, Platzhalterfüllung, Auswahlrahmen) stehen jetzt auf Terrakotta — damit ist
der letzte sichtbare Rest der alten Palette weg.

**Noch nicht Teil dieser Phase (Phase 7):** der Kürzel-Dialog hinter dem „?"-Knopf, die
Zoom-Kürzel und die Buchstabenkürzel der Elementarten.
