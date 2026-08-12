# STATE

**Aktiver Plan:** Vorschaubilder-Plan ist fertig umgesetzt (alle 3 Phasen `complete`) und
seit 2026-08-12 live deployt. Noch nicht archiviert — die Smoke-Checkliste in
`docs/planning/2026-08-12_template-vorschaubilder/README.md` steht noch aus (Sascha prüft).
**Phase:** — (Plan-Ende erreicht)
**Nächster Schritt:** Smoke-Checkliste im README abhaken, dann archivieren. Danach weiter mit
Karteneditor-Plan Phase 5 (siehe Umsetzungsreihenfolge Punkt 3).

## Umsetzungsreihenfolge (festgelegt 2026-08-12, freigegeben)

Der Karteneditor-Plan ist **unterbrochen** und wird nach dem Vorschaubild-Plan fortgesetzt.
Grund: Kartenliste (dessen Phase 5) und Karteneditor (dessen Phase 7) benutzen ab jetzt die
gespeicherten Vorschaubilder statt jede Kachel live zu zeichnen — die Bausteine dafür
entstehen hier. Andersherum würde die Kachel zweimal gebaut.

1. **Vorschaubilder** (`2026-08-12_template-vorschaubilder/`) Phase 1 → 2 → 3. ✅ Erledigt.
2. **Deploy-Lauf gegen Strato** mit `deploy.cmd` + `POST /api/migrate`. ✅ Erledigt
   2026-08-12 — Backend + Frontend hochgeladen, alle drei Migrationen angewendet
   (`M008CreateCards`, `M009CreateCardImages`, `M010AddPreviewImages`).
3. **Karteneditor** (`2026-08-10_karteneditor/`) weiter ab Phase 5 — die Datei
   `frontend/src/app/features/cards/cards-list/` existiert als Rohbau und wird gefüllt,
   nicht neu angelegt. Vorlage ist ab jetzt `features/templates/templates-list/` (dieselbe
   Kachel mit Bild), für Suche und Löschabfrage weiterhin
   `features/card-groups/card-groups-list/`.

Karten haben erst nach dessen Phase 7 eigene Vorschaubilder; bis dahin zeigt die Kartenliste
Platzhalter. Das ist so gewollt und kein Fehler.

**Offen aus dem Karteneditor-Plan, Phase 1-4:** Die Migrationen sind seit 2026-08-12 live
gelaufen (`M008CreateCards`, `M009CreateCardImages`) — die Tabellen existieren jetzt. Der
Live-Rundlauf von Phase 2 (`CardController`/`CardService`/`CardRepository`/`CardValidator`),
Phase 3 (`CardImageController`/`CardImageService`, Endpunkte `/api/cards/{id}/images*`) und
Phase 4 (Frontend-Speicher — Lint/Build waren grün, ein echter Server-Aufruf steht noch aus)
ist damit erstmals möglich, aber noch nicht gefahren. Gehört in die Smoke-Checkliste am
Plan-Ende bzw. wird beim Weiterarbeiten in Phase 5 mitgeprüft.

Plan „Eigene Schriften hochladen" ist abgeschlossen und archiviert:
`docs/archive/2026-08/2026-08-11_schriften-hochladen/`. Keine offenen Punkte.

Plan „Neues Aussehen (Organic)" ist abgeschlossen und archiviert:
`docs/archive/2026-08/2026-08-10_design-organic/`. Offene Punkte von dort (siehe README
„Follow-ups"): Prettier-Zeilenbreite-Entscheidung liegt bei Sascha, Smoke-Test der
Eigenschaftenspalte/Bildauswahl im Browser steht noch aus.
