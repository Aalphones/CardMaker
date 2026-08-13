# STATE

**Aktiver Plan:** (kein aktiver Plan)
**Im Backlog:** Meilenstein 6 (MCP-Server), fünf Phasen, freigegeben und geparkt —
`docs/planning/2026-08-13_mcp-server/`.
**Nächster Schritt:** Umsetzung mit Phase 1 (`GET /api/meta`) starten — `/implement`.

**Offen beim Nutzer:** Bildschirm-Rundlauf gegen die Smoke-Checklisten von Meilenstein 3
(`docs/archive/2026-08/2026-08-10_karteneditor/phase-9-abschluss.md`), Meilenstein 4
(`docs/archive/2026-08/2026-08-13_rendering-engine/README.md`) und Meilenstein 5
(`docs/archive/2026-08/2026-08-13_druckprojekt-und-export/README.md`) ist nie gefahren
worden.

**Offen technisch:** Migration und Endpunkte von Meilenstein 5 sind lokal nicht lauffähig
(örtliches PHP 8.3, `vendor/` gegen 8.5 gebaut). Erster echter Beleg ist der nächste Deploy
mit `POST /api/migrate`.
