# MCP Server (Assistant Tool Access) — CardMaker

`mcp/` ist ein versioniertes Python-Subprojekt, das die CardMaker-REST-API als typisierte
MCP-Tools exponiert. Läuft **nur lokal**, neben Claude Code — nie auf Strato. Gleiche
REST-API, gleiche PAT-Auth wie das Web-Frontend, nichts am Backend ändert sich dadurch.

Analog zu Promptigofants `mcp/`-Subprojekt (siehe `docs/decisions/033-mcp-server-for-assistant-access.md`
dort als Referenzmuster) — noch nicht gescaffoldet, entsteht in Meilenstein 6
(siehe `docs/PROJECT.md`).

## Geplanter Aufbau

- **Setup:** venv, `CM_TOKEN`-Env-Var (Personal Access Token), Registrierung in `.mcp.json`
  am Repo-Root — kein Token-Literal dort
- **Tool-Schemas aus `GET /api/meta` zur Laufzeit ableiten**, nicht aus einer
  hand-kopierten Feldliste — ein Backend-Änderung an Enum/Required-Feld muss dann nicht im
  MCP-Code nachgezogen werden
- **Tools grob nach Domäne**: Read (`get_state`, `get_meta`), Search (`find_character`,
  `find_template`), Write (`create_character`/`update_character`, `create_template`,
  `create_card`, `upload_image`)

## Drift-Regeln (was still veralten kann)

Sobald implementiert, gelten dieselben Regeln wie bei Promptigofant:

- Tool-Schemas aus der Laufzeit-Meta-Route ableiten, nicht hand-pflegen
- Jedes neue Write-Tool braucht eine Cache-Invalidierungs-Markierung, sonst liefern
  `find_*`/`get_state`-Lookups nach einem Write veraltete Daten bis zum Prozess-Neustart
- Route-Inventar im MCP-Code muss mit der tatsächlichen API-Oberfläche synchron bleiben —
  neue PAT-erreichbare Routes brauchen ein Tool oder eine explizite „out of scope"-Notiz

## Critical Rules

1. **Nie deployen** — `mcp/` läuft ausschließlich lokal neben Claude Code.
2. **Kein Token-Literal in `.mcp.json`** — Token kommt aus der Umgebung.
3. **Tool-Schemas aus der Laufzeit ableiten, nicht hand-kopieren** — sonst driftet die
   Doku vom tatsächlichen API-Vertrag weg, ohne dass es auffällt.
