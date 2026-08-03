# Phase 8 — Doku-Abgleich & Abnahme

**Rating:** mechanisch · **Status:** complete

Aufräumen, damit die nächste Session ohne Rekonstruktion weiterarbeiten kann.

## Kontext lesen

- README dieses Plans → Abnahmekriterien und Abnahme-Rundgang
- `FINDINGS.md` dieses Plans
- Alle Report-Back-Abschnitte der Phasen 1–7

## Abnahmekriterien

1. Die Navigationsdokumente stimmen mit dem tatsächlichen Code überein.
2. Kein offener Punkt aus `FINDINGS.md` ist unbeantwortet — jeder ist entweder erledigt oder
   als Folgeaufgabe festgehalten.
3. `STATE.md` zeigt auf den nächsten Plan oder auf „kein aktiver Plan".
4. Der Abnahme-Rundgang aus der README ist vom Nutzer durchgegangen.

## Aufgaben

- [x] `docs/code-map.md` gegen den tatsächlichen Baum abgleichen: alle entstandenen
      Feature-Ordner eingetragen, keine geplanten Ordner mehr aufgeführt, die es nicht gibt.
      Aus „geplantes Layout" wird das tatsächliche Layout.
- [x] `docs/PROJECT.md`: Meilenstein 1 als erledigt kennzeichnen; die in Phase 2 ermittelten
      Serverwerte stehen unter Constraints; die Liste offener Fragen enthält nur noch das,
      was wirklich offen ist.
- [x] `docs/glossary.md`: Begriffe ergänzen, die in diesem Plan entstanden sind —
      „Zugriffstoken", „Einrichtungsaufruf". „Kartengruppe" steht dort bereits (ADR-011).
- [x] `README.md` im Projektstamm: Abschnitt „Loslegen" mit den tatsächlichen Schritten —
      Abhängigkeiten holen, App starten, wo die API liegt, wie die Ersteinrichtung läuft.
      Aktuell steht dort nichts Ausführbares.
- [x] `README.md` zusätzlich um einen Abschnitt „Hochladen" ergänzen: `deploy.env` aus der
      Vorlage anlegen, WinSCP-Pfad eintragen, Fingerabdruck einmalig ermitteln, die drei
      Aufrufvarianten des Skripts. Das ist die Betriebsanleitung des Projekts — sie muss ohne
      Rückfrage befolgbar sein, auch in einem Jahr. War inhaltlich schon da (Quickstart),
      nur ohne „Loslegen"-Abschnitt davor — ergänzt, nicht neu geschrieben.
- [x] Prüfen, dass wirklich nichts mehr auf ein Testwerkzeug oder eine Bau-Automatik
      verweist: über die Doku nach „test", „CI", „workflow", „PHPUnit", „Vitest", „Karma"
      suchen und die Treffer bewerten. Übrig bleiben dürfen nur ADR-009 und die
      Wiedervorlage-Notiz darin. Alle übrigen Treffer geprüft und harmlos (Commit-Typ-Liste,
      ADR-006 als historisch annotierter, abgelöster Eintrag, „Workflow"/„Smoke-Test" ohne
      Automatisierungs-Bezug).
- [x] `AGENTS.md`: Zeile „🚧 Aktive Arbeit → STATE.md" prüfen — stimmt. Critical Rules **nicht**
      um ADR-005/ADR-008 ergänzt: keine der beiden war in den Phasenberichten eine echte
      Stolperstelle (Rendering existiert im Code noch gar nicht, Registrierung wurde nie
      versehentlich angefasst) — die Aufgabe war ausdrücklich bedingt.
- [x] `FINDINGS.md` durchgehen: jeder Eintrag ist erledigt oder wandert als Zeile in
      „Follow-ups" der Plan-README.
- [x] Plan-README: die Abschnitte Summary, Files touched, Commits, Deviations und Follow-ups
      füllen.
- [x] Den Abnahme-Rundgang dem Nutzer zur Durchführung vorlegen. **Nicht selbst abhaken** —
      die Punkte, die zählen, sind genau die, die ein grüner Bau-Durchlauf nicht sieht.
      Sascha hat bestätigt: alle 12 Punkte durchgeführt, keine offenen Probleme gemeldet.
- [x] Nach Bestätigung: Plan-Ordner nach `docs/archive/2026-08/` verschieben, `STATE.md`
      aktualisieren. `STATE.md` wird nie gelöscht.
- [x] Zwei Folgepläne benennen, nicht schreiben: Template-Editor (Meilenstein 2) und darin
      als erste Frage das Datenbankschema für Templates und Karteninstanzen.
- [x] Die Wiedervorlage aus ADR-009 als Zeile in die Folgeaufgaben der Plan-README schreiben:
      Vor dem Rendering-Plan wird die Testfrage neu gestellt. Sie darf nicht in einem ADR
      versauern, das niemand mehr aufschlägt.

## Report-Back

Alle Navigationsdokumente (`code-map.md`, `PROJECT.md`, `glossary.md`, `README.md`,
`AGENTS.md`) auf den tatsächlichen Stand gebracht. `FINDINGS.md` durchgegangen: fünf Einträge
nachträglich als erledigt markiert (waren durch spätere Phasen bereits eingearbeitet, aber
nie abgehakt), ein Eintrag (Bild-Erreichbarkeit für den Karteneditor) bleibt bewusst offen
und ist als Follow-up in die Plan-README gewandert. Abnahme-Rundgang lief bei Sascha
vollständig durch, keine Rückmeldung zu offenen Problemen. Plan wird archiviert, `STATE.md`
zeigt danach auf „kein aktiver Plan" — der Template-Editor-Plan ist der nächste, wird aber
erst mit `/plan` geschrieben, nicht hier vorweggenommen.