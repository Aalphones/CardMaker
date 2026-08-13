# STATE

**Aktiver Plan:** `docs/planning/2026-08-13_mcp-server/`
**Phase:** 3/5 — Such- und Lese-Werkzeuge (complete)
**Nächster Schritt:** Phase 4 (Schreib-Werkzeuge) starten — `/implement`. Vor Beginn: Phase 4
ist als **heikel** geratet, `/model opusplan` empfohlen (aktuell läuft die Session mutmaßlich
auf Sonnet für Phase 3 = mechanisch, das war richtig).

**Offen beim Nutzer:** Bildschirm-Rundlauf gegen die Smoke-Checklisten von Meilenstein 3
(`docs/archive/2026-08/2026-08-10_karteneditor/phase-9-abschluss.md`), Meilenstein 4
(`docs/archive/2026-08/2026-08-13_rendering-engine/README.md`) und Meilenstein 5
(`docs/archive/2026-08/2026-08-13_druckprojekt-und-export/README.md`) ist nie gefahren
worden.

**Offen technisch:** Migration und Endpunkte von Meilenstein 5 sind lokal nicht lauffähig
(örtliches PHP 8.3, `vendor/` gegen 8.5 gebaut). Erster echter Beleg ist der nächste Deploy
mit `POST /api/migrate`. Dasselbe gilt für `GET /api/meta` (Phase 1) — und damit für den
MCP-Server aus Phase 2: der stdio-Handschlag und die Fehlermeldung ohne Token sind belegt,
ein echter Werkzeugaufruf gegen die API nicht (Route nicht hochgeladen, `CM_TOKEN` lokal
nicht gesetzt).
