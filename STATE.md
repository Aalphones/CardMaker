# STATE

**Aktiver Plan:** `docs/planning/2026-08-10_karteneditor/`
**Phase:** 5/9 — Alle Karten (pending, standard)
**Nächster Schritt:** `phase-5-kartenliste.md` öffnen und umsetzen — die Datei
`frontend/src/app/features/cards/cards-list/` existiert als Rohbau und wird gefüllt,
nicht neu angelegt. Vorlage ist `features/card-groups/card-groups-list/`.

**Offen aus Phase 1/2/3:** Die beiden Migrationen (`M008CreateCards`, `M009CreateCardImages`)
sind geschrieben, aber noch nicht gelaufen — es gibt keine lokale Datenbank, der Lauf geht
nur per `deploy.cmd` + `POST /api/migrate` gegen Strato. Sascha muss das freigeben. Dadurch
konnte auch der Live-Rundlauf von Phase 2 (`CardController`/`CardService`/`CardRepository`/
`CardValidator`) und Phase 3 (`CardImageController`/`CardImageService`, Endpunkte
`/api/cards/{id}/images*`) noch nicht gefahren werden — nur `php -l` geprüft.
Dasselbe gilt jetzt für den Frontend-Speicher aus Phase 4: Lint und Build sind grün, ein
echter Aufruf gegen den Server ist nie gelaufen. Alles gehört in die Smoke-Checkliste am
Plan-Ende.

Plan „Eigene Schriften hochladen" ist abgeschlossen und archiviert:
`docs/archive/2026-08/2026-08-11_schriften-hochladen/`. Keine offenen Punkte.

Plan „Neues Aussehen (Organic)" ist abgeschlossen und archiviert:
`docs/archive/2026-08/2026-08-10_design-organic/`. Offene Punkte von dort (siehe README
„Follow-ups"): Prettier-Zeilenbreite-Entscheidung liegt bei Sascha, Smoke-Test der
Eigenschaftenspalte/Bildauswahl im Browser steht noch aus.
