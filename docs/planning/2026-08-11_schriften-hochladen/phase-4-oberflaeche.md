# Phase 4 — Verwaltung in der Oberfläche

Jetzt wird das Feature sichtbar: hochladen, umbenennen, löschen — an der Stelle, an der man
eine Schrift braucht.

## Wo das wohnt — und warum nicht woanders

Die Schriftenverwaltung wird ein Dialog aus dem Template-Editor heraus, **genau nach dem
Vorbild von `asset-picker/`** (dem Dialog, der Rahmen und Symbole wählen lässt und ein neues
Bild hochlädt). Neben der Schriftauswahl in der Eigenschaftenspalte sitzt ein kleiner Knopf,
der ihn öffnet.

Die naheliegende Alternative — ein eigener Punkt „Schriften" in der Seitenspalte, neben
Kartengruppen und Templates — wurde verworfen: Für die Seitenspalte gibt es einen
Gestaltungsentwurf mit genau vier Einträgen, ein fünfter wäre erfunden. Und Schriften wählt
man nie „auf Vorrat", sondern in dem Moment, in dem ein Textfeld eine braucht. Bekommt das
Projekt später einen Verwaltungsbereich, kann die Liste dort ein zweites Zuhause bekommen —
die Bausteine aus dieser Phase bleiben dieselben.

## Vorher lesen

- `frontend/src/app/features/templates/template-editor/asset-picker/` — **das Vorbild**,
  alle drei Dateien: Dialog-Aufbau, Hochladen, Fehlerbehandlung
- `frontend/src/app/features/templates/template-editor/layer-properties/text-properties/`
  — dort sitzt die Schriftauswahl, die erweitert wird
- `frontend/src/app/shared/canvas/rendering/fonts.ts` — `FONT_GROUPS`
- `frontend/src/app/shared/components/field-hint/` — der Fragezeichen-Knopf für Erklärungen
- `frontend/src/app/shared/components/confirm-dialog/` — Rückfrage vor dem Löschen
- `docs/conventions/css.md`, `docs/conventions/angular.md`

## Abnahmekriterien

- Neben der Schriftauswahl sitzt ein Knopf „Schriften verwalten"; er öffnet den Dialog.
- Der Dialog zeigt jede hochgeladene Schrift **in sich selbst gesetzt** (Beispieltext), dazu
  Name, Format und Größe.
- Hochladen: Datei wählen, Name vorbelegt aus dem Dateinamen (ohne Endung), änderbar.
- Pflicht-Kontrollkästchen „Ich darf diese Schrift verwenden" — der Hochladen-Knopf bleibt
  bis dahin gesperrt. Daneben ein Fragezeichen-Knopf, der in zwei Sätzen erklärt, warum:
  Schriften aus Office/Windows dürfen nicht auf einen Server gestellt werden, freie Schriften
  von Google Fonts oder mit offener Lizenz schon.
- Nach dem Hochladen steht die Schrift **ohne Neuladen** in der Auswahlliste, in einer eigenen
  Gruppe „Eigene Schriften" unter den eingebauten.
- Umbenennen direkt in der Liste, Löschen mit Rückfrage.
- Löschen einer benutzten Schrift zeigt die Meldung des Servers verständlich an, nicht als
  rohen Fehlercode.
- Fehler beim Hochladen (zu groß, keine Schriftdatei) erscheinen im Dialog am Feld, nicht als
  Konsolenmeldung.
- Tastaturbedienbar und AXE-sauber, wie die anderen Dialoge.

## Checkliste

- [ ] `ng generate component features/templates/template-editor/font-manager --skip-tests`
      (CDK-Dialog wie `asset-picker`).
- [ ] Liste, Hochlade-Formular, Umbenennen und Löschen im Dialog — Daten über die
      Schriften-Facade aus Phase 3, kein `HttpClient` in der Komponente.
- [ ] Die Vorschau in der jeweiligen Schrift setzen: dafür muss der `FontLoader` sie geladen
      haben — beim Öffnen des Dialogs alle Schriften der Liste anfordern.
- [ ] `text-properties`: Auswahlliste um die Gruppe „Eigene Schriften" erweitern (aus der
      Facade, nicht aus `FONT_GROUPS`) und den Knopf daneben setzen.
- [ ] Beschriftung: Im Editor steht überall der **Anzeigename**, nie `cmfont-7`. Der interne
      Name taucht in der Oberfläche an keiner Stelle auf.
- [ ] Eigene Stylesheet-Regeln nach `docs/conventions/css.md` (BEM, nur Zweck-Tokens).

## Bericht

*(nach der Umsetzung füllen)*
