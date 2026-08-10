# Phase 4 — Kartengruppen und Template-Liste

**Rating:** standard

## Kontext — vorher lesen

- [Handoff-Beschreibung](../../design/handoff-organic/README.md), Abschnitte „4. Kartengruppen", „5. Kartengruppe anlegen/bearbeiten",
  „6. Templates (list)"
- `frontend/src/app/features/card-groups/card-groups-list/`
- `frontend/src/app/features/card-groups/card-groups-detail/`
- `frontend/src/app/features/templates/templates-list/`
- `frontend/src/styles/_bausteine.scss` (Phase 2)

## Abnahmekriterien

**Kartengruppen-Liste**
- Überschrift „Kartengruppen", darunter gedämpft „Gruppen sind Filter auf der Gesamtliste
  aller Karten.", rechts der Erstrang-Button „Neue Kartengruppe".
- Raster `repeat(auto-fill, minmax(17rem, 1fr))`, Abstand 17.6px. Jede Kachel ist eine
  Karte mit kleinem Schatten: Titel = Name, Fließtext = Beschreibung, Fußzeile
  „N Karten anzeigen →".
- Rechtsbündig zwei Textbuttons „Bearbeiten" und „Löschen"; „Löschen" in
  `--color-accent-700`.
- Leerzustand: eine Karte mit Innenabstand 35.2px, gedämpfter Absatz (maximal 36rem breit)
  und Erstrang-Button.
- 🟡 „N Karten anzeigen →" zeigt auf den Kartenscreen, den es noch nicht gibt. In dieser
  Phase wird die Fußzeile **ohne Verlinkung** dargestellt und zeigt statt der Zahl nichts.
  Meilenstein 3 macht daraus den Sprung in die vorgefilterte Kartenliste — das steht
  dort als eigene Aufgabe.

**Kartengruppen-Formular**
- Maximal 32rem breit, Überschrift „Neue Kartengruppe" bzw. „Kartengruppe bearbeiten".
- Felder „Name" und „Beschreibung (optional)" (Textfeld, 4 Zeilen, nur senkrecht
  vergrößerbar). Aktionen rechtsbündig: „Abbrechen" (Zweitrang), „Speichern" (Erstrang).

**Template-Liste**
- Überschrift „Templates", rechts „Neues Template". Suchfeld maximal 22rem breit,
  Platzhalter „Nach Name suchen …".
- Raster wie bei den Gruppen. Jede Kachel: Überzeile „N Layer · M Karten" in der
  Akzentfarbe, Titel = Name, Fließtext = Beschreibung, Fußzeile „geändert <Datum>".
- Die ganze Kachel ist ein Verweis in den Editor.
- 🟡 „M Karten" ist erst mit Meilenstein 3 bekannt. Bis dahin zeigt die Überzeile nur
  „N Layer" — die Karten-Angabe wird dort ergänzt, nicht hier mit einer Null erfunden.

## Checkliste

- [ ] `card-groups-list` Vorlage und Stylesheet auf Karten-Bausteine und das neue Raster
      umstellen; eigene Farb-/Rahmenregeln entfernen. Suchfeld auf `.input`.
- [ ] Leerzustand nach Vorgabe umbauen.
- [ ] `card-groups-detail` auf `.field`/`.input`/`.btn` umstellen. Formularlogik,
      Validierung und der Schutz vor ungespeicherten Änderungen bleiben unverändert.
- [ ] `templates-list` analog umstellen, inklusive Überzeile mit Ebenenzahl.
- [ ] Löschabfragen weiterhin über `shared/components/confirm-dialog` — jetzt im neuen
      Dialog-Aussehen (aus Phase 2), keine eigenen Regeln in den Listen.
- [ ] Sichtprüfung: leere Liste, eine Kachel, zwölf Kacheln, sehr langer Gruppenname
      (muss abgeschnitten werden statt das Raster zu sprengen).

## Report-Back
