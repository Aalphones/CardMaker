# Phase 1 — Entscheidungen & Datenmodell festhalten

**Rating:** mechanisch · **Status:** pending

Reine Schreibarbeit. Die Entscheidungen sind im Plan schon gefallen; diese Phase sorgt
dafür, dass sie den nächsten `/clear` überleben. Kein Code.

## Kontext (vorher lesen)

- [`README.md`](README.md) dieses Plans — der Kontrakt, aus dem alles hier abgeleitet wird
- `docs/decisions/README.md` — Aufbau einer Entscheidungsnotiz
- `docs/decisions/009-keine-automatisierten-tests.md` — Kurzform als Vorlage
- `docs/glossary.md`
- `docs/PROJECT.md` → Abschnitt „Offene Fragen"

Höchste vergebene Entscheidungsnummer auf Platte ist **013**, in geparkten Plänen ist keine
reserviert (geprüft am 2026-08-03). Neue Nummern: **014** und **015**.

## Abnahmekriterien

1. `docs/decisions/014-template-layout-als-datenblock.md` existiert und nennt Kontext,
   betrachtete Optionen, Entscheidung, Konsequenzen.
2. `docs/decisions/015-bildablage-und-dateiformate.md` ebenso, inklusive der Begründung,
   warum SVG draußen bleibt.
3. `docs/glossary.md` erklärt die neuen Begriffe, und der Eintrag zur Bildebene sagt
   ausdrücklich, dass Zoom und Bildausschnitt zur Karteninstanz gehören, nicht zum Template.
4. Die offene Frage zum Datenbankschema in `docs/PROJECT.md` ist beantwortet, nicht mehr
   offen.

## Checkliste

- [ ] **ADR-014 schreiben** — `docs/decisions/014-template-layout-als-datenblock.md`.
      Entscheidung: Die Ebenen eines Templates liegen als ein JSON-Wert in der Spalte
      `templates.layers`, nicht in einer eigenen Tabelle mit einer Zeile pro Ebene.
      Begründung: Ein Template wird immer als Ganzes gelesen und als Ganzes gespeichert;
      einzelne Ebenen werden nie gesucht, gefiltert oder sortiert. Eine Ebenentabelle
      bräuchte für jede neue Eigenschaft eine Schema-Änderung, der Datenblock nicht.
      Betrachtete Alternative: normalisierte Tabelle `template_layers` mit Typ-Spalte und
      Eigenschaften-Blob — dieselbe fehlende Prüfbarkeit, aber zusätzlich Reihenfolge-Spalte,
      Fremdschlüssel und mehrere Abfragen pro Speichervorgang.
      Konsequenzen: Die Datenbank prüft nichts an der Struktur — die vollständige Prüfung im
      Backend (Phase 3) ist Pflicht, nicht Kür. Ein Bild lässt sich nicht per Fremdschlüssel
      vor dem Löschen schützen, das übernimmt eine Prüfung im Programm.
- [ ] **ADR-015 schreiben** — `docs/decisions/015-bildablage-und-dateiformate.md`.
      Entscheidung a): Hochgeladene Rahmen und Icons liegen in `backend/uploads/`, also
      **außerhalb** des ausgelieferten Bereichs (ADR-013), und werden von PHP über
      `GET /api/assets/{id}/file` ausgeliefert.
      Begründung: Die Anmeldepflicht ist im Backend als Positivliste gebaut — was nicht
      ausdrücklich offen ist, ist zu. Ein Upload-Ordner, den der Webserver direkt ausliefert,
      wäre ein Loch in genau dieser Systematik und die klassische Stelle, an der eine
      hochgeladene Programmdatei ausgeführt wird.
      Betrachtete Alternative: öffentlicher Ordner im Webbereich — schneller und ohne
      Bildlader im Frontend, aber Bilder wären ohne Anmeldung abrufbar und der Ordner müsste
      gegen Ausführung gesondert abgesichert werden.
      Entscheidung b): Erlaubt ist ausschließlich `image/png`. SVG bleibt draußen, weil es
      eine ausführbare Datei ist und weil Browser SVG beim späteren Zeichnen in Druckauflösung
      uneinheitlich rastern. Abweichung vom Konzeptdokument, bewusst.
      Konsequenzen: Das Frontend braucht einen Bildlader, der die Datei angemeldet abruft und
      im Speicher hält. Icons werden beim Vergrößern unscharf, wenn sie klein hochgeladen
      wurden.
- [ ] **Doc-Update `docs/glossary.md`** — neue Zeilen: **Bildvorrat** (die hochgeladenen
      Rahmen- und Icon-Dateien, gemeinsam verwaltet, PNG, hinter der Anmeldung),
      **Feldschlüssel** (der Name, unter dem eine Textebene ihren Text von der Karteninstanz
      oder von Claude erwartet — Kleinbuchstaben, eindeutig im Template),
      **Ebenenreihenfolge** (im gespeicherten Datenblock liegt Index 0 zuunterst, in der
      Ebenenliste der Oberfläche steht das Vorderste oben).
- [ ] **Doc-Update `docs/glossary.md`, bestehende Zeile „ImageLayer" schärfen** — das
      Template legt nur Fläche, Größe und Drehung fest; Zoom und Bildausschnitt sind Werte
      der Karteninstanz und entstehen erst in Meilenstein 3. Das Konzeptdokument listet sie
      beim ImageLayer, das ist die Stelle, an der es unpräzise ist.
- [ ] **Doc-Update `docs/PROJECT.md`** — unter „Offene Fragen" den Punkt zum Datenbankschema
      streichen und im Abschnitt Stack/Constraints nichts ändern. Stattdessen bei
      Meilenstein 2 einen Halbsatz ergänzen, dass das Layout als Datenblock gespeichert wird
      (ADR-014).
- [ ] **Doc-Update `docs/decisions/README.md`** — die beiden neuen Einträge in die Liste
      aufnehmen, falls dort eine geführt wird.

## Report-Back
