# STATE

**Aktiver Plan:** `docs/planning/2026-08-10_karteneditor/`
**Phase:** 3/9 — Backend: Kartenbilder (pending, standard)
**Nächster Schritt:** `phase-3-backend-kartenbilder.md` öffnen und umsetzen. Vorher den
Phase-3-Eintrag in `FINDINGS.md` lesen — eindeutiger Schlüssel auf (`card_id`, `layer_id`),
ein zweiter Upload in dieselbe Bildfläche muss ersetzen statt einfügen.

**Offen aus Phase 1/2:** Die beiden Migrationen (`M008CreateCards`, `M009CreateCardImages`)
sind geschrieben, aber noch nicht gelaufen — es gibt keine lokale Datenbank, der Lauf geht
nur per `deploy.cmd` + `POST /api/migrate` gegen Strato. Sascha muss das freigeben. Dadurch
konnte auch der Live-Rundlauf von Phase 2 (`CardController`/`CardService`/`CardRepository`/
`CardValidator`, Endpunkte `/api/cards*`) noch nicht gefahren werden — nur `php -l` geprüft.
Beides gehört in die Smoke-Checkliste am Plan-Ende.

Plan „Eigene Schriften hochladen" ist abgeschlossen und archiviert:
`docs/archive/2026-08/2026-08-11_schriften-hochladen/`. Keine offenen Punkte.

Plan „Neues Aussehen (Organic)" ist abgeschlossen und archiviert:
`docs/archive/2026-08/2026-08-10_design-organic/`. Offene Punkte von dort (siehe README
„Follow-ups"): Prettier-Zeilenbreite-Entscheidung liegt bei Sascha, Smoke-Test der
Eigenschaftenspalte/Bildauswahl im Browser steht noch aus.
