# Findings

Getaggte Erkenntnisse aus der Umsetzung, die eine spätere Phase betreffen.

Format: `- [ ] → Phase N: <Erkenntnis>`

- [ ] → Phase 4: `GET /api/meta` liefert jetzt `assets.nameMaxLength` (191). Die
      Umbenennen-Eingabe auf der Bildvorrat-Seite zieht ihre Längengrenze von dort, statt 191
      im Frontend zu wiederholen.
- [ ] → Phase 4: Der Auswahldialog im Template-Editor
      (`asset-picker.ts`, Zeile 28) filtert bereits selbst nach `asset.kind` — Artwork taucht
      dort nicht auf, ohne dass etwas geändert werden muss. Der Titel des Dialogs
      (`asset-picker.html`, Zeile 3) entscheidet allerdings per `kind === 'frame' ? … : 'Icon
      wählen'`, ist also mit einer dritten Art nicht mehr vollständig.
- [ ] → Phase 4: `AssetKind` im Frontend muss um `'artwork'` erweitert werden — das Backend
      nimmt die Art seit Phase 2 an.
