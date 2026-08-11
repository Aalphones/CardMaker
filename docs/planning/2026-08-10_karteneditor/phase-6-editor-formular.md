# Phase 6 — Karteneditor: Formular

**Rating:** heikel (die Felder entstehen zur Laufzeit aus dem Template)

## Kontext — vorher lesen

- [Handoff-Beschreibung](../../design/handoff-organic/README.md), Abschnitt „8. Karten-Editor (card instance)"
- `frontend/src/app/shared/canvas/rendering/layer.ts` — die Ebenentypen, insbesondere
  `TextLayer.source`/`.key` und `IconLayer.source`/`.choiceAssetIds`
- `frontend/src/app/features/card-groups/card-groups-detail/` — Muster für
  Formular, Schutz vor ungespeicherten Änderungen
- `frontend/src/app/store/cards/cards.facade.ts` (Phase 4)
- `README.md` dieses Plans → Kontrakt

## Abnahmekriterien

- Route `cards/new` und `cards/:id`, Ordner `features/cards/card-editor/`.
- Kopf: gedämpfter Rückverweis „Zurück" mit Pfeil-links, darunter die Überschrift
  (Kartenname oder „Neue Karte").
- Aufbau `grid-template-columns: 1fr 300px`, Abstand 26.4px, oben ausgerichtet.
  Unter 900px stapeln sich die Spalten, Vorschau zuerst.
- **Linke Spalte**, Abstand 17.6px, in dieser Reihenfolge:
  1. „Kartenname" (Textfeld)
  2. „Template" (Auswahl)
  3. je **Bildfläche** des Templates ein Ablagefeld (Höhe 170px, Radius 12,
     Platzhaltertext „Bild ablegen"), beschriftet mit dem Ebenennamen
  4. je **Textebene mit „Wird pro Karte ausgefüllt"** ein Block: mehrzeiliges Textfeld
     (3 Zeilen), daneben „Größe" (Zahlenfeld, 72px breit) und „Farbe" (Farbfläche 32×32)
  5. je **Icon-Ebene mit „Wird pro Karte gewählt"** ein Block mit den erlaubten Bildern
     als anklickbare Tags; das gewählte Tag ist akzentuiert
  6. „Kartengruppe" (Auswahl, erster Eintrag „Keine")
- Aktionen rechtsbündig: „Abbrechen" (Zweitrang), „Karte speichern" (Erstrang).
- **Größe und Farbe sind Abweichungen**: leer gelassen heißt „so wie im Template".
  Ein gesetzter Wert überschreibt ihn nur für diese Karte. Beide Felder haben einen
  Zurücksetzen-Knopf und eine Fragezeichen-Erklärung.
- **Fett und Kursiv** gehören in denselben Block, mit derselben Dreier-Logik (aus dem
  Template / an / aus) statt eines einfachen Umschalters — ein zweistufiger Schalter kann
  „nimm's vom Template" nicht ausdrücken. **Nur einbauen, wenn der Plan „Eigene Schriften
  hochladen" (Phase 5) schon durch ist**; sonst gäbe es einen Schalter, den die Vorschau
  ignoriert. Gespeichert und durchgereicht werden die Werte in jedem Fall (Phase 2).
- **Template wechseln** an einer bestehenden Karte: es erscheint eine Rückfrage
  („Felder, die das neue Template nicht kennt, werden nicht mehr angezeigt. Fortfahren?").
  Nach dem Wechsel bleiben die alten Werte im Datensatz erhalten und tauchen wieder auf,
  wenn das ursprüngliche Template zurückgewählt wird — nichts wird stillschweigend
  gelöscht.
- **Template nachträglich geändert**: Werte zu Feldschlüsseln, die es nicht mehr gibt,
  werden nicht angezeigt, aber beim Speichern mitgeschrieben. Ein gedämpfter Hinweis
  nennt die Anzahl solcher verwaisten Werte und bietet an, sie zu entfernen.
- Der Schutz vor ungespeicherten Änderungen greift beim Verlassen.
- Ohne Template ist nichts auszufüllen: bevor eines gewählt ist, zeigt die linke Spalte
  nur Name und Template-Auswahl plus eine gedämpfte Zeile „Wähle ein Template — die
  Felder richten sich danach."

## Checkliste

- [ ] `features/cards/card-editor/` anlegen. Formular über `NonNullableFormBuilder`,
      die dynamischen Felder in einer `FormRecord` oder einer `FormGroup`, die beim
      Template-Wechsel neu aufgebaut wird.
- [ ] Eine reine Funktion `features/cards/card-editor/card-fields.ts` schreiben, die aus
      `Layer[]` die Formularbeschreibung ableitet: Liste von Bildflächen, Textfeldern
      (Schlüssel, Beschriftung, Vorgabetext) und Icon-Feldern (Ebenen-Id, erlaubte
      Bilder). **Ohne Angular-Abhängigkeit**, damit sie nachvollziehbar bleibt und die
      Vorschau in Phase 7 dieselbe Ableitung benutzt.
- [ ] Ablagefeld als eigene Komponente `features/cards/card-editor/image-drop/`:
      nimmt Ziehen-und-Ablegen sowie Klick zum Auswählen, zeigt nach dem Hochladen eine
      kleine Vorschau plus „Ersetzen" und „Entfernen". Fehlermeldungen im Klartext
      (Format, Größe).
- [ ] Hochladen läuft **sofort** gegen das Backend, nicht erst beim Speichern der Karte.
      Bei einer neuen Karte heißt das: die Karte wird beim ersten Bild-Upload angelegt
      (Name „Neue Karte", falls leer) und der Editor arbeitet ab dann auf einer
      bestehenden Karte. Diese Umschaltung muss sichtbar sein — die Adresse wechselt von
      `cards/new` auf `cards/:id`.
- [ ] Icon-Auswahl als Tag-Gruppe mit Tastaturbedienung (Pfeiltasten, Enter).
- [ ] Rückfrage beim Template-Wechsel über den vorhandenen Bestätigungsdialog.
- [ ] Hinweis auf verwaiste Werte samt Aufräum-Knopf.
- [ ] Fragezeichen-Erklärungen für: Größe, Farbe, verwaiste Werte, Template-Wechsel.
- [ ] `docs/code-map.md` nachziehen.

## Report-Back
