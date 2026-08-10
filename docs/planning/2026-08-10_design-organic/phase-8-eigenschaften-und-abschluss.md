# Phase 8 — Eigenschaften, Bildauswahl, Doku und Abnahme

**Rating:** standard

## Kontext — vorher lesen

- [Handoff-Beschreibung](../../design/handoff-organic/README.md), Abschnitt „7." → „Right panel Eigenschaften" und „Asset-Picker dialog"
- `frontend/src/app/features/templates/template-editor/layer-properties/` (alle
  Unterordner)
- `frontend/src/app/features/templates/template-editor/asset-picker/`
- `frontend/src/styles/_bausteine.scss`

## Abnahmekriterien

**Eigenschaftenspalte**
- Ohne Auswahl: gedämpfter Hinweis in 13px, sonst nichts.
- Mit Auswahl: Punkt in der Typfarbe plus Ebenenname in Caprasimo 16px, darunter die
  typabhängigen Felder in dieser Reihenfolge:
  - **Geometrie** (alle außer Rahmen): Position X/Y und Breite/Höhe als Zahlenfelder,
    paarweise nebeneinander.
  - **Text**: Textfeld · Ankreuzfeld „Wird pro Karte ausgefüllt" · Schrift (Auswahl plus
    Größe als 72px breites Zahlenfeld) · Farbe (36×36 Farbfläche plus Hexfeld) ·
    Ausrichtung als Segment-Umschalter „Links | Mitte | Rechts".
  - **Form**: Füllfarbe (leer = durchsichtig) · Rahmenfarbe · Rahmenstärke.
  - **Bildfläche**: gedämpfter Hinweis, dass das Bild von der Karte kommt und das
    Template nur den Bereich festlegt.
  - **Icon**: Ankreuzfeld „Wird pro Karte gewählt"; fest → Auswahlknopf für ein Bild,
    pro Karte → „Auswahl verwalten (N)" plus die gewählten Bilder als Tags.
  - **Rahmen**: gedämpfter Hinweis (liegt immer über der ganzen Karte) plus Auswahlknopf.
- **Aufklappbereich „Erweitert"** (Auslöser in `--color-accent-700`, 13px): Deckkraft als
  Schieberegler (0–1, Schritt 0.05, Reglerfarbe = Akzent) · Drehung in Grad ·
  Eckradius (nur Rechteck) · für Text zusätzlich: Feldschlüssel, Vertikale Ausrichtung
  („Oben | Mitte | Unten"), Mindestgröße, Zeilenabstand, Umrandung (Farbe/Stärke),
  Schatten (Farbe/Unschärfe), Ankreuzfeld „Automatisch verkleinern".
- Zu jeder Einstellung, deren Wirkung nicht am Namen ablesbar ist — Feldschlüssel,
  Mindestgröße, Automatisch verkleinern, Deckkraft, „Wird pro Karte ausgefüllt" —
  gehört ein Fragezeichen-Knopf mit Klartext-Erklärung
  (`shared/components/field-hint`, existiert bereits). Ohne diese Erklärungen gilt die
  Phase als nicht fertig.

**Bildauswahl-Dialog**
- Titel, darunter Zeilen mit 34×34 großer Vorschaufläche (Radius 8, `--color-accent-200`),
  Name und einem Akzent-Haken bei der aktuellen Wahl.
- Darunter ein Ablagefeld „Neues PNG hochladen", 80px hoch, das auch Ziehen und Ablegen
  annimmt.
- Aktion „Fertig". Mehrfachauswahl für die Icon-Auswahlliste einer Karte, Einfachauswahl
  für Rahmen und feste Icons — wie bisher.

**Abschluss**
- `npm run lint` und `npm run build` laufen sauber.
- Alle Punkte der finalen Abnahmekriterien in der README sind geprüft.

## Checkliste

- [ ] `layer-properties` und alle Untertypen auf die Bausteinklassen umstellen; eigene
      Farb-, Rahmen- und Abstandsregeln entfernen, wo die Bausteine sie tragen.
- [ ] Segment-Umschalter für Ausrichtung und vertikale Ausrichtung auf `.seg` umstellen
      (heute vermutlich Auswahlfelder oder Buttons) — als echte Radiogruppe mit
      `<input type="radio">`, damit die Tastaturbedienung stimmt.
- [ ] Aufklappbereich „Erweitert" umsetzen: `<details>`/`<summary>` mit eigenem
      Aufklapp-Pfeil, offener Zustand bleibt im Bedienzustand erhalten, damit er beim
      Wechsel der Ebene nicht zuklappt.
- [ ] Fehlende Fragezeichen-Erklärungen ergänzen. Texte in Alltagssprache, ein bis zwei
      Sätze, kein Fachbegriff ohne Erklärung. Beispiel Feldschlüssel: „Der Name, unter
      dem dieses Textfeld beim Befüllen einer Karte auftaucht. Nur Kleinbuchstaben,
      Ziffern und Unterstriche."
- [ ] `asset-picker` auf Dialog- und Karten-Bausteine umstellen, Ablagefeld ergänzen.
- [ ] Vollständiger Durchgang gegen die finalen Abnahmekriterien der README, jeder Punkt
      einzeln abgehakt.
- [ ] `docs/code-map.md` und `docs/conventions/css.md` auf Endstand prüfen (die vorherigen
      Phasen haben stückweise ergänzt — hier auf Vollständigkeit gegenlesen).
- [ ] `docs/PROJECT.md`: Meilensteinliste um den Eintrag „Neues Aussehen (Organic)" als
      erledigt zwischen Meilenstein 2 und 3 ergänzen, mit Verweis auf den Archivordner.
- [ ] `STATE.md` auf den Karteneditor-Plan zeigen lassen.
- [ ] Plan nach `docs/archive/2026-08/` verschieben.

## Report-Back
