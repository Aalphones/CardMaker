# MCP-Server (Werkzeug-Zugriff für den Assistenten) — CardMaker

`mcp/` ist ein versioniertes Python-Subprojekt, das die CardMaker-REST-API als typisierte
MCP-Werkzeuge bereitstellt. Läuft **nur lokal**, neben Claude Code — nie auf Strato. Dieselbe
REST-API, dieselbe Zugriffstoken-Anmeldung wie das Frontend; am Backend ändert sich dadurch
nichts (einzige Ausnahme: die Auskunftsroute `GET /api/meta`).

Einrichtung, Token setzen und die vollständige Werkzeugliste: `mcp/README.md`.
Aufbau in der Landkarte: `docs/code-map.md` → „MCP-Server".

## Stand (Phase 3 von `docs/planning/2026-08-13_mcp-server/`)

- **Paket** `cardmaker_mcp`, Projektname `cardmaker-mcp`, Abhängigkeit `mcp[cli]>=2.0.0`,
  `requires-python >=3.10`, Build über `hatchling`.
- **Umgebungsvariablen:** `CM_TOKEN` (Zugriffstoken, Pflicht — Ausweichweg: Datei `.cm_token`
  im Arbeitsverzeichnis oder Paketordner), `CM_BASE` (Basisadresse, Vorgabe
  `https://quantum-canvas.de/api`).
- **Kein Zustandsbild im Backend:** `get_state` wird im MCP-Server aus drei Listenabrufen
  zusammengesetzt (ADR-025) und prozessweit zwischengespeichert.
- **SDK-Namen:** Ab SDK 2.0 heißt die Server-Klasse `MCPServer` (`mcp.server.mcpserver`),
  in 1.x hieß sie `FastMCP` — die Referenz-Umsetzung bei Promptigofant steht noch auf 1.x.

### Werkzeuge

| Werkzeug | Phase | Zweck |
|---|---|---|
| `get_meta` | 2 | Prüfregeln/Enums der laufenden API |
| `get_state(refresh)` | 2 | Kartengruppen + Templates + Karten (Kurzfassungen) |
| `find_template(query)` | 3 | Templates nach Namensteil suchen |
| `find_card(query, template_id, card_group_id)` | 3 | Karten suchen, optional gefiltert |
| `find_card_group(query)` | 3 | Kartengruppen nach Namensteil suchen |
| `get_template(template_id)` | 3 | Template vollständig, inklusive Ebenen — nur lesend |
| `get_card(card_id)` | 3 | Karte vollständig |
| `describe_card_fields(template_id)` | 3 | Kartenfelder eines Templates: Text, Bild, Icon |
| `list_assets(kind)` | 3 | Bildvorrat (Rahmen/Icons) |

Schreiben und Bilder (Phasen 4–5) kommen hier dazu, sobald umgesetzt.

## Drift-Regeln (was still veralten kann)

- **Werkzeug-Schemas aus der Laufzeit-Auskunft ableiten, nicht hand-pflegen** — ändert sich
  eine Prüfregel im Backend, darf das keine Codeänderung im MCP-Server erzwingen.
- **Jedes neue Schreib-Werkzeug muss den Zwischenspeicher verwerfen**
  (`invalidates_state`), sonst antworten `find_*`/`get_state` nach einem Schreibvorgang mit
  veralteten Daten bis zum Neustart des Prozesses.
- **Routen-Bestand im MCP-Code muss mit der API-Oberfläche mitlaufen** — neue Routen, die
  mit Zugriffstoken erreichbar sind, brauchen ein Werkzeug oder eine ausdrückliche Notiz
  „bewusst außen vor".
- **`card_fields.py` und `card-fields.ts` müssen deckungsgleich bleiben** — beide leiten aus
  denselben Ebenen dieselben Kartenfelder ab. Ändert sich die Regel in einer Fassung
  (Feldtypen, Dopplungs-Behandlung, `source`-Filter), zieht die andere sofort nach.

## Critical Rules

1. **Nie hochladen** — `mcp/` läuft ausschließlich lokal neben Claude Code.
2. **Kein Token-Literal in `.mcp.json`** — der Token kommt aus der Umgebung (`${CM_TOKEN}`).
3. **Werkzeug-Schemas zur Laufzeit ableiten, nicht abschreiben** — sonst driftet die
   Beschreibung vom tatsächlichen API-Vertrag weg, ohne dass es auffällt.
4. **Templates bleiben lesend** — das Ebenen-Layout entsteht im Editor, nicht als blind
   geschriebener JSON-Block (Entscheidung 2026-08-13).
