# Phase 7 — Karteneditor: Live-Vorschau

**Rating:** heikel (die Zeichenregeln bekommen erstmals zwei Datenquellen)

Bisher zeichnet `card-canvas` ein Template: jede Ebene bringt ihren eigenen Inhalt mit.
Jetzt kommt eine zweite Quelle dazu — die Werte der Karte. Diese Phase führt beide
zusammen, **ohne** die Template-Ansicht zu beschädigen.

## Kontext — vorher lesen

- [Handoff-Beschreibung](../../design/handoff-organic/README.md), Abschnitte „8." (rechte Spalte) und „Text rendering rules"
- `frontend/src/app/shared/canvas/card-canvas/card-canvas.ts` und `draw-items.ts`
- `frontend/src/app/shared/canvas/rendering/auto-shrink.ts` und `measure-text.ts`
- `frontend/src/app/shared/canvas/asset-image-loader.ts`
- `features/cards/card-editor/card-fields.ts` (Phase 6)
- `docs/decisions/005-client-side-rendering.md` — warum die Zeichenregeln frei von
  Konva bleiben sollen

## Chesterton's Fence

`draw-items.ts` übersetzt heute Ebene → Konva-Beschreibung und wird vom Template-Editor
benutzt (inklusive Auswahlrahmen und Ziehbarkeit). Diese Aufgabe bleibt bestehen; die
Kartenwerte kommen als **zusätzlicher, optionaler** Eingang dazu. Wird stattdessen ein
zweiter Zeichenweg gebaut, driften Vorschau und späterer Druck auseinander — genau das,
was ADR-005 verhindern soll.

## Abnahmekriterien

- Es gibt einen Typ `CardContent` (Werte, Icon-Wahl, Abweichungen, Bildplatzierungen) in
  `shared/canvas/rendering/card-content.ts`. `buildDrawItems(layers, context)` bekommt
  **keinen neuen Parameter** — der vorhandene `DrawContext` (in `draw-items.ts`) wird um
  ein optionales Feld `content?: CardContent` und die geladenen Kartenbilder erweitert.
  Ohne dieses Feld verhält sich alles exakt wie bisher.
- Zeichenregeln für Text:
  - Eine Textebene mit „Wird pro Karte ausgefüllt" zeigt den Wert der Karte; ist er leer
    oder fehlt, den Vorgabetext des Templates.
  - Abweichungen der Karte bei Schriftgröße und Farbe schlagen die Template-Werte.
  - Dasselbe gilt für Fett und Kursiv, **sobald die Textebene sie kennt** (Plan
    „Eigene Schriften hochladen", Phase 5). Ist dieser Plan hier zuerst dran, werden die
    beiden Werte nur durchgereicht und nicht gezeichnet — dann darf hier auch keine
    Umschaltung im Formular auftauchen (Phase 6), sonst gibt es einen Schalter ohne Wirkung.
  - Automatisches Verkleinern verringert die Schriftgröße bis zur Mindestgröße, bis der
    Text in seinen Bereich passt (bestehende Funktion `fitFontSize`, unverändert).
  - Waagerechte und senkrechte Ausrichtung, Zeilenabstand, Umrandung, Schatten und
    Deckkraft wirken wie im Template festgelegt.
- Zeichenregeln für Icons: eine Icon-Ebene mit „Wird pro Karte gewählt" zeigt das von der
  Karte gewählte Bild; ohne Wahl bleibt die Fläche leer (kein Platzhalter-Kästchen in der
  Vorschau — das gibt es nur im Template-Editor).
- Zeichenregeln für Bildflächen: das Kartenbild wird in seiner Fläche zugeschnitten
  dargestellt (kein Überstehen), unter Berücksichtigung von Verschiebung und Maßstab.
  Ohne Bild bleibt die Fläche leer.
- **Rechte Spalte** des Karteneditors: klebt oben, gedämpfte 12px-Zeile „Live-Vorschau",
  darunter die Vorschau 280×391, Radius 8px, großer Schatten, Flächenhintergrund.
- Jede Eingabe im Formular ist ohne merkliche Verzögerung in der Vorschau sichtbar.

## Checkliste

- [ ] `shared/canvas/rendering/card-content.ts` anlegen: Typ plus reine Funktionen
      `resolveText(layer, content)`, `resolveFontSize(layer, content)`,
      `resolveColor(layer, content)`, `resolveIconAssetId(layer, content)`.
      Keine Konva-Abhängigkeit — sie werden von Meilenstein 4 (Drucken) wiederverwendet.
- [ ] `draw-items.ts` um den optionalen Eingang erweitern und die Auflösung über die
      neuen Funktionen führen. Keine Verzweigung „bin ich im Karteneditor?" — der
      Unterschied ist allein „Inhalt vorhanden oder nicht".
- [ ] Das Zuschneiden der Bildfläche über die Zuschnitt-Eigenschaft der Konva-Gruppe
      lösen, nicht durch Vorab-Beschneiden des Bildes — das Original bleibt unangetastet.
- [ ] `card-canvas` um den Eingang `content` erweitern (Vorgabe: nichts) und das Laden
      der Kartenbilder über den Lader aus Phase 4 anschließen.
- [ ] Rechte Spalte im Karteneditor aufbauen.
- [ ] 🟡 Messgetriebenes Nachrechnen: Automatisches Verkleinern misst über einen
      unsichtbaren Konva-Text. Wird bei jedem Tastendruck neu gemessen, ruckelt es.
      Messergebnisse pro Kombination aus Text, Schrift und Bereich zwischenspeichern und
      im Report-Back festhalten, ob es ohne Zwischenspeicher flüssig genug war — nicht
      vorsorglich optimieren, sondern erst messen.
- [ ] **Vorschaubild der Karte beim Speichern erzeugen** (ergänzt 2026-08-12, Gegenstück zur
      Kachel in Phase 5): nach erfolgreichem Speichern `CardCanvas.exportPng(420)` aufrufen
      und über `PreviewUploadService.upload('cards', kartenId, bild)` hochladen — beides
      liegt fertig in `shared/canvas/` (Plan `2026-08-12_template-vorschaubilder`, Phasen 2
      und 3). Der Template-Editor macht genau dasselbe; dessen `uploadPreview()` ist die
      Vorlage. Scheitert es, bleibt das Speichern erfolgreich und es gibt nur eine
      Hinweismeldung.
      🟡 Die Live-Vorschau ist nur 280 px breit — `exportPng` rechnet den Maßstab aus der
      gemessenen Bühnenbreite hoch, das Bild wird trotzdem 420 px breit. Im Report-Back
      festhalten, ob es scharf genug aussieht.
- [ ] Gegenprobe, dass der Template-Editor unverändert funktioniert: Ebene auswählen,
      verschieben, skalieren, drehen, Platzhalter für fehlende Bilder.
- [ ] `docs/code-map.md` nachziehen.

## Report-Back
