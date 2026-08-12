# STATE

**Aktiver Plan:** `docs/planning/2026-08-12_template-vorschaubilder/`
**Phase:** 2/3 — Template-Editor erzeugt das Bild und lädt es hoch (pending, heikel)
**Nächster Schritt:** `phase-2-editor-export.md` öffnen und umsetzen.

## Umsetzungsreihenfolge (festgelegt 2026-08-12, freigegeben)

Der Karteneditor-Plan ist **unterbrochen** und wird nach dem Vorschaubild-Plan fortgesetzt.
Grund: Kartenliste (dessen Phase 5) und Karteneditor (dessen Phase 7) benutzen ab jetzt die
gespeicherten Vorschaubilder statt jede Kachel live zu zeichnen — die Bausteine dafür
entstehen hier. Andersherum würde die Kachel zweimal gebaut.

1. **Vorschaubilder** (`2026-08-12_template-vorschaubilder/`) Phase 1 → 2 → 3.
2. **Ein Deploy-Lauf gegen Strato** mit `deploy.cmd` + `POST /api/migrate`: erledigt
   `M008`, `M009` **und** `M010` in einem Rutsch und macht alles prüfbar, was seit dem
   Karteneditor-Plan nur `php -l`-geprüft ist. 🔴 Braucht Saschas Freigabe.
3. **Karteneditor** (`2026-08-10_karteneditor/`) weiter ab Phase 5 — die Datei
   `frontend/src/app/features/cards/cards-list/` existiert als Rohbau und wird gefüllt,
   nicht neu angelegt. Vorlage ist ab jetzt `features/templates/templates-list/` (dieselbe
   Kachel mit Bild), für Suche und Löschabfrage weiterhin
   `features/card-groups/card-groups-list/`.

Karten haben erst nach dessen Phase 7 eigene Vorschaubilder; bis dahin zeigt die Kartenliste
Platzhalter. Das ist so gewollt und kein Fehler.

**Offen aus dem Karteneditor-Plan, Phase 1/2/3:** Die beiden Migrationen
(`M008CreateCards`, `M009CreateCardImages`)
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
