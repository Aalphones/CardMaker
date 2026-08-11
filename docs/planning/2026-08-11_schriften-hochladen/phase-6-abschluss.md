# Phase 6 — Abschluss

## Checkliste

- [x] ADR `docs/decisions/019-eigene-schriften.md` — Kontext, betrachtete Wege, Entscheidung,
      Folgen. Muss die zwei Entscheidungen aus dem README festhalten (eigener Schriftname
      `cmfont-<id>`, Blob statt CSS-Adresse) **samt Begründung** — beide sind später nicht mehr
      offensichtlich und würden sonst in einer künftigen Sitzung neu aufgerollt.
      (Nummer 019: 017 und 018 sind vom Karteneditor-Plan belegt — vor dem Anlegen kurz
      gegenprüfen, ob der inzwischen umgesetzt wurde.)
- [x] `docs/code-map.md`, `docs/models.md`, `docs/routes.md`, `docs/clients.md` gegen den Code
      abgleichen — steht alles drin, stimmt alles noch? (Nur `code-map.md` existiert in diesem
      Projekt — `font-manager/`-Dialog fehlte im Baum, nachgetragen. `models.md`/`routes.md`/
      `clients.md` gibt es hier nicht, das Projekt hält nur `code-map.md` als Referenz-Doku.)
- [x] `frontend/public/fonts/LIZENZ.md`: den Abschnitt „Neue Schrift aufnehmen" auf den neuen
      Weg umschreiben — der Handbetrieb bleibt nur noch für Schriften, die fest mitgeliefert
      werden sollen.
- [x] `docs/PROJECT.md` prüfen: Gehört das Feature in die Meilenstein-Übersicht?
- [x] Build und Lint grün (`ng build`, `ng lint`, `php -l` über die neuen Dateien).
- [ ] Abnahme durch Sascha nach der Liste im README („Finale Abnahme", sieben Punkte) — die
      Punkte 2, 6 und 7 zuerst, das sind die Stellen, an denen ein Fehler still bleibt.
- [ ] Plan nach `docs/archive/2026-08/` verschieben, `STATE.md` auf den nächsten Plan zeigen
      lassen.

## Bericht

Doku (ADR-019, LIZENZ.md, PROJECT.md, code-map.md) nachgezogen, Build (`ng build`) und Lint
(`ng lint`) grün, `php -l` über alle Font-Backend-Dateien (Controller, Service, Repository,
Validator, LayerValidator, Migration) grün. Offen bleibt nur die manuelle Abnahme durch
Sascha im Browser — die kann ich nicht selbst ausführen.
