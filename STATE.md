# STATE

**Aktiver Plan:** `docs/planning/2026-08-10_karteneditor/`
**Phase:** 2/9 — Backend: Karten (pending, standard)
**Nächster Schritt:** `phase-2-backend-karten.md` öffnen und umsetzen. Vorher die vier
Phase-2-Einträge in `FINDINGS.md` lesen — Migrationsnummern, `INT UNSIGNED`, Backticks um
`values`, eindeutiger Schlüssel auf (`card_id`, `layer_id`).

**Offen aus Phase 1:** Die beiden Migrationen (`M008CreateCards`, `M009CreateCardImages`)
sind geschrieben, aber noch nicht gelaufen — es gibt keine lokale Datenbank, der Lauf geht
nur per `deploy.cmd` + `POST /api/migrate` gegen Strato. Sascha muss das freigeben.

Plan „Eigene Schriften hochladen" ist abgeschlossen und archiviert:
`docs/archive/2026-08/2026-08-11_schriften-hochladen/`. Keine offenen Punkte.

Plan „Neues Aussehen (Organic)" ist abgeschlossen und archiviert:
`docs/archive/2026-08/2026-08-10_design-organic/`. Offene Punkte von dort (siehe README
„Follow-ups"): Prettier-Zeilenbreite-Entscheidung liegt bei Sascha, Smoke-Test der
Eigenschaftenspalte/Bildauswahl im Browser steht noch aus.
