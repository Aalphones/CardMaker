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

**Deploy & Migration (2026-08-13):** `deploy.cmd all` gelaufen (Backend + Frontend live),
`POST /api/migrate` aufgerufen → `{"applied":[]}` (keine ausstehenden Migrationen). Live
gegengeprüft: `GET /api/health` → `200`, `GET /api/meta` ohne Token → `401`, mit Token →
`200` mit exakt dem Vertrag aus der Plan-README (inklusive PHP-Trennzeichen in den
Mustern). Damit ist `GET /api/meta` (Phase 1) erstmals live belegt.

**Offen technisch:** Der stdio-Handschlag des MCP-Servers und die Fehlermeldung ohne Token
sind belegt, ein echter Werkzeugaufruf **über den MCP-Server** gegen die jetzt laufende API
noch nicht (lokal kein `CM_TOKEN` gesetzt) — die Bausteine darunter (`client.py`, `meta.py`-
Prüfregeln) sind einzeln gegen die reale Antwort von `/api/meta` verifizierbar, aber der
Durchstich über ein MCP-Werkzeug ist noch offen. Alle Schreib- und Bild-Werkzeuge
(Phase 4 + 5) sind nur syntaktisch geprüft und gegen `meta.py`-Regeln trocken durchgespielt
(`.venv` läuft lokal) — kein einziger echter Schreibvorgang oder Bild-Upload ist gelaufen.
