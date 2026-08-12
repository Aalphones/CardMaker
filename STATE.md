# STATE

**Aktiver Plan:** `docs/planning/2026-08-10_karteneditor/`
**Phase:** 5/7 — Alle Karten (Kartenliste) (pending, Rating: standard)
**Nächster Schritt:** Phase 5 umsetzen. `frontend/src/app/features/cards/cards-list/`
existiert als Rohbau und wird gefüllt, nicht neu angelegt. Vorlage ist
`features/templates/templates-list/` (dieselbe Kachel mit Vorschaubild), für Suche und
Löschabfrage weiterhin `features/card-groups/card-groups-list/`.

Der Vorschaubilder-Plan ist am 2026-08-12 fertig, deployt, per Smoke-Test bestätigt und
archiviert: `docs/archive/2026-08/2026-08-12_template-vorschaubilder/`. Keine offenen Punkte
außer den unten genannten 🟡.

**Offen aus dem Karteneditor-Plan, Phase 1-4:** Die Migrationen sind seit 2026-08-12 live
gelaufen (`M008CreateCards`, `M009CreateCardImages`) — die Tabellen existieren jetzt. Der
Live-Rundlauf von Phase 2 (`CardController`/`CardService`/`CardRepository`/`CardValidator`),
Phase 3 (`CardImageController`/`CardImageService`, Endpunkte `/api/cards/{id}/images*`) und
Phase 4 (Frontend-Speicher — Lint/Build waren grün, ein echter Server-Aufruf steht noch aus)
ist damit erstmals möglich, aber noch nicht gefahren. Beim Arbeiten an Phase 5 (die diese
Endpunkte benutzt) fällt das mit ab.

Karten haben erst nach Phase 7 eigene Vorschaubilder; bis dahin zeigt die Kartenliste
Platzhalter. Das ist so gewollt und kein Fehler.

Plan „Eigene Schriften hochladen" ist abgeschlossen und archiviert:
`docs/archive/2026-08/2026-08-11_schriften-hochladen/`. Keine offenen Punkte.

Plan „Neues Aussehen (Organic)" ist abgeschlossen und archiviert:
`docs/archive/2026-08/2026-08-10_design-organic/`. Offene Punkte von dort (siehe README
„Follow-ups"): Prettier-Zeilenbreite-Entscheidung liegt bei Sascha, Smoke-Test der
Eigenschaftenspalte/Bildauswahl im Browser steht noch aus.
