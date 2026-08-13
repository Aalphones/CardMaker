# STATE

**Aktiver Plan:** `docs/planning/2026-08-13_mcp-server/`
**Phase:** 5/5 — Bilder & Abschluss (complete, Doku nachgezogen)
**Nächster Schritt:** Nutzer fährt die Smoke-Checkliste am Ende von
`docs/planning/2026-08-13_mcp-server/phase-5-bilder-und-abschluss.md`. Danach Plan nach
`docs/archive/2026-08/2026-08-13_mcp-server/` verschieben und STATE.md auf „kein aktiver
Plan" setzen.

**Offen beim Nutzer:** Bildschirm-Rundlauf gegen die Smoke-Checklisten von Meilenstein 3
(`docs/archive/2026-08/2026-08-10_karteneditor/phase-9-abschluss.md`), Meilenstein 4
(`docs/archive/2026-08/2026-08-13_rendering-engine/README.md`), Meilenstein 5
(`docs/archive/2026-08/2026-08-13_druckprojekt-und-export/README.md`) und jetzt Meilenstein 6
(`docs/planning/2026-08-13_mcp-server/phase-5-bilder-und-abschluss.md` → Smoke-Checkliste)
ist nie gefahren worden.

**Offen technisch:** Migration und Endpunkte von Meilenstein 5 sind lokal nicht lauffähig
(örtliches PHP 8.3, `vendor/` gegen 8.5 gebaut). Erster echter Beleg ist der nächste Deploy
mit `POST /api/migrate`. Dasselbe gilt für `GET /api/meta` (Phase 1) — und damit für den
gesamten MCP-Server: der stdio-Handschlag und die Fehlermeldung ohne Token sind belegt, ein
echter Werkzeugaufruf gegen die API nicht (Route nicht hochgeladen, `CM_TOKEN` lokal nicht
gesetzt). Alle Schreib- und Bild-Werkzeuge (Phase 4 + 5) sind nur syntaktisch geprüft und
gegen `meta.py`-Regeln trocken durchgespielt (`.venv` läuft lokal) — kein einziger echter
Schreibvorgang oder Bild-Upload gegen die laufende API ist gelaufen.
