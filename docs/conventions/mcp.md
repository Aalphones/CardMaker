# MCP-Server (Werkzeug-Zugriff für den Assistenten) — CardMaker

`mcp/` ist ein versioniertes Python-Subprojekt, das die CardMaker-REST-API als typisierte
MCP-Werkzeuge bereitstellt. Läuft **nur lokal**, neben Claude Code — nie auf Strato. Dieselbe
REST-API, dieselbe Zugriffstoken-Anmeldung wie das Frontend; am Backend ändert sich dadurch
nichts (einzige Ausnahme: die Auskunftsroute `GET /api/meta`).

Einrichtung, Token setzen und die vollständige Werkzeugliste: `mcp/README.md`.
Aufbau in der Landkarte: `docs/code-map.md` → „MCP-Server".

## Stand (Phase 2 von `docs/planning/2026-08-13_mcp-server/`)

- **Paket** `cardmaker_mcp`, Projektname `cardmaker-mcp`, Abhängigkeit `mcp[cli]>=2.0.0`,
  `requires-python >=3.10`, Build über `hatchling`.
- **Umgebungsvariablen:** `CM_TOKEN` (Zugriffstoken, Pflicht — Ausweichweg: Datei `.cm_token`
  im Arbeitsverzeichnis oder Paketordner), `CM_BASE` (Basisadresse, Vorgabe
  `https://quantum-canvas.de/api`).
- **Werkzeuge:** `get_meta` (Prüfregeln/Enums der laufenden API), `get_state`
  (Kartengruppen + Templates + Karten). Die Werkzeuge der Phasen 3–5 (Suchen, Lesen,
  Schreiben, Bilder) kommen dort dazu.
- **Kein Zustandsbild im Backend:** `get_state` wird im MCP-Server aus drei Listenabrufen
  zusammengesetzt (ADR-025) und prozessweit zwischengespeichert.
- **SDK-Namen:** Ab SDK 2.0 heißt die Server-Klasse `MCPServer` (`mcp.server.mcpserver`),
  in 1.x hieß sie `FastMCP` — die Referenz-Umsetzung bei Promptigofant steht noch auf 1.x.

## Drift-Regeln (was still veralten kann)

- **Werkzeug-Schemas aus der Laufzeit-Auskunft ableiten, nicht hand-pflegen** — ändert sich
  eine Prüfregel im Backend, darf das keine Codeänderung im MCP-Server erzwingen.
- **Jedes neue Schreib-Werkzeug muss den Zwischenspeicher verwerfen**
  (`invalidates_state`), sonst antworten `find_*`/`get_state` nach einem Schreibvorgang mit
  veralteten Daten bis zum Neustart des Prozesses.
- **Routen-Bestand im MCP-Code muss mit der API-Oberfläche mitlaufen** — neue Routen, die
  mit Zugriffstoken erreichbar sind, brauchen ein Werkzeug oder eine ausdrückliche Notiz
  „bewusst außen vor".

## Critical Rules

1. **Nie hochladen** — `mcp/` läuft ausschließlich lokal neben Claude Code.
2. **Kein Token-Literal in `.mcp.json`** — der Token kommt aus der Umgebung (`${CM_TOKEN}`).
3. **Werkzeug-Schemas zur Laufzeit ableiten, nicht abschreiben** — sonst driftet die
   Beschreibung vom tatsächlichen API-Vertrag weg, ohne dass es auffällt.
4. **Templates bleiben lesend** — das Ebenen-Layout entsteht im Editor, nicht als blind
   geschriebener JSON-Block (Entscheidung 2026-08-13).
