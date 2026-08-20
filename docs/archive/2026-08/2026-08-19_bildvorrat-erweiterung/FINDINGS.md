# Findings

Getaggte Erkenntnisse aus der Umsetzung, die eine spätere Phase betreffen.

Format: `- [ ] → Phase N: <Erkenntnis>`

- [x] → Phase 4: `GET /api/meta` liefert jetzt `assets.nameMaxLength` (191). Frontend hat
      bislang für keine Entity (auch nicht `fonts`) eine Meta-Anbindung fürs Nachziehen von
      Längengrenzen — kein bestehendes Muster zum Kopieren. Umbenennen-Eingabe validiert
      client-seitig nicht auf 191, das Backend liefert bei Überlänge einen 422 mit
      Klartext-Meldung, die die Seite anzeigt (AK 2). Kein neuer Meta-Store für diese eine
      Grenze gebaut — würde die Phase sprengen, ohne dass ein AK das verlangt.
- [x] → Phase 4: Auswahldialog im Template-Editor (`asset-picker.ts`) bekommt an jeder
      Aufrufstelle (`icon-properties.ts`, `frame-properties.ts`) weiterhin nur `kind: 'icon'`
      oder `kind: 'frame'` — geprüft, `'artwork'` taucht nirgends auf. Dialogtitel
      (`asset-picker.html` Zeile 3) bleibt deshalb unverändert korrekt, keine Änderung nötig.
- [x] → Phase 4: `AssetKind` im Frontend auf `'frame' | 'icon' | 'artwork'` erweitert
      (`assets.actions.ts`).
