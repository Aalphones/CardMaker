# Phase 8 — Doku-Abgleich & Abnahme

**Rating:** mechanisch · **Status:** pending

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

- [ ] `docs/code-map.md` gegen den tatsächlichen Baum abgleichen: alle entstandenen
      Feature-Ordner eingetragen, keine geplanten Ordner mehr aufgeführt, die es nicht gibt.
      Aus „geplantes Layout" wird das tatsächliche Layout.
- [ ] `docs/PROJECT.md`: Meilenstein 1 als erledigt kennzeichnen; die in Phase 2 ermittelten
      Serverwerte stehen unter Constraints; die Liste offener Fragen enthält nur noch das,
      was wirklich offen ist.
- [ ] `docs/glossary.md`: Begriffe ergänzen, die in diesem Plan entstanden sind —
      „Zugriffstoken", „Einrichtungsaufruf". „Kartengruppe" steht dort bereits (ADR-011).
- [ ] `README.md` im Projektstamm: Abschnitt „Loslegen" mit den tatsächlichen Schritten —
      Abhängigkeiten holen, App starten, wo die API liegt, wie die Ersteinrichtung läuft.
      Aktuell steht dort nichts Ausführbares.
- [ ] `README.md` zusätzlich um einen Abschnitt „Hochladen" ergänzen: `deploy.env` aus der
      Vorlage anlegen, WinSCP-Pfad eintragen, Fingerabdruck einmalig ermitteln, die drei
      Aufrufvarianten des Skripts. Das ist die Betriebsanleitung des Projekts — sie muss ohne
      Rückfrage befolgbar sein, auch in einem Jahr.
- [ ] Prüfen, dass wirklich nichts mehr auf ein Testwerkzeug oder eine Bau-Automatik
      verweist: über die Doku nach „test", „CI", „workflow", „PHPUnit", „Vitest", „Karma"
      suchen und die Treffer bewerten. Übrig bleiben dürfen nur ADR-009 und die
      Wiedervorlage-Notiz darin.
- [ ] `AGENTS.md`: Zeile „🚧 Aktive Arbeit → STATE.md" prüfen; Critical Rules ergänzen um
      „Das Backend rendert nicht" (ADR-005) und „Ein Benutzerkonto, keine Registrierung"
      (ADR-008), falls sie sich in der Umsetzung als Stolperstellen erwiesen haben.
- [ ] `FINDINGS.md` durchgehen: jeder Eintrag ist erledigt oder wandert als Zeile in
      „Follow-ups" der Plan-README.
- [ ] Plan-README: die Abschnitte Summary, Files touched, Commits, Deviations und Follow-ups
      füllen.
- [ ] Den Abnahme-Rundgang dem Nutzer zur Durchführung vorlegen. **Nicht selbst abhaken** —
      die Punkte, die zählen, sind genau die, die ein grüner Bau-Durchlauf nicht sieht.
- [ ] Nach Bestätigung: Plan-Ordner nach `docs/archive/2026-08/` verschieben, `STATE.md`
      aktualisieren. `STATE.md` wird nie gelöscht.
- [ ] Zwei Folgepläne benennen, nicht schreiben: Template-Editor (Meilenstein 2) und darin
      als erste Frage das Datenbankschema für Templates und Karteninstanzen.
- [ ] Die Wiedervorlage aus ADR-009 als Zeile in die Folgeaufgaben der Plan-README schreiben:
      Vor dem Rendering-Plan wird die Testfrage neu gestellt. Sie darf nicht in einem ADR
      versauern, das niemand mehr aufschlägt.

## Report-Back
