# CardMaker MCP-Server

Lokaler MCP-Server, der die CardMaker-REST-API als typisierte Werkzeuge für Claude Code
bereitstellt. **Läuft nur lokal, nie auf Strato** — `deploy.cmd` fasst diesen Ordner nicht an.

## Einrichten

```powershell
cd mcp
py -3 -m venv .venv        # "py" trifft auf Windows immer den echten Interpreter, "python" ggf. den Store-Platzhalter
.venv\Scripts\activate
pip install -e .
```

Zugriffstoken im Frontend erzeugen (Einstellungen → Zugriffstoken) und setzen — **nie
committen**:

```powershell
setx CM_TOKEN "cmpat_xxxxx"     # persistent für alle künftigen Terminals
```

Ausweichweg ohne Umgebungsvariable: den Token in eine Datei `.cm_token` legen
(Arbeitsverzeichnis oder `cardmaker_mcp/`). Beide Namen stehen in `.gitignore`.

Andere Basisadresse als `https://quantum-canvas.de/api` (z.B. lokaler Server): `CM_BASE`
setzen.

## Starten (Rauchtest)

```powershell
python -m cardmaker_mcp
```

Der Server spricht über stdio — **keine Ausgabe im Leerlauf ist der Erfolgsfall**. Fehlt der
Token, kommt genau eine Zeile mit dem, was zu tun ist, und der Start bricht ab.

## Registrierung in Claude Code

`.mcp.json` im Repo-Root ist bereits eingerichtet — hier nur zum Nachlesen. Kein
Token-Literal darin, `CM_TOKEN` kommt aus der Umgebung. Der `command`-Pfad zeigt bewusst
auf den venv-Interpreter statt auf bares `python`, sonst greift auf Windows der
Store-Platzhalter.

```json
{
  "mcpServers": {
    "cardmaker": {
      "command": "mcp/.venv/Scripts/python.exe",
      "args": ["-m", "cardmaker_mcp"],
      "cwd": "mcp",
      "env": { "CM_TOKEN": "${CM_TOKEN}" }
    }
  }
}
```

macOS/Linux: `command` auf `mcp/.venv/bin/python` ändern.

## Werkzeuge (Stand Phase 3)

| Werkzeug | Wofür |
|---|---|
| `get_meta` | Die Regeln der laufenden API: Canvas-Maße, Ebenen-Enums, Schriften, Grenzwerte. |
| `get_state(refresh)` | Übersicht aus Kartengruppen, Templates und Karten (Kurzfassungen). |
| `find_template(query)` | Templates nach Namensteil suchen (Kurzfassungen). |
| `find_card(query, template_id, card_group_id)` | Karten suchen, optional nach Template/Kartengruppe gefiltert. |
| `find_card_group(query)` | Kartengruppen nach Namensteil suchen. |
| `get_template(template_id)` | Template vollständig, inklusive Ebenen — nur lesend. |
| `get_card(card_id)` | Karte vollständig: Werte, Icon-Auswahl, Text-Abweichungen, Bilder. |
| `describe_card_fields(template_id)` | Was an diesem Template pro Karte befüllt wird: Text-, Bild- und Icon-Felder. |
| `list_assets(kind)` | Bildvorrat (Rahmen/Icons) — Kennungen für die Icon-Auswahl. |

Weitere Werkzeuge (Schreiben, Bilder) kommen in den Phasen 4–5 dazu
(`docs/planning/2026-08-13_mcp-server/`).

## Aufbau

```
Claude Code ──MCP/stdio── lokaler Server (Python) ──HTTPS + Zugriffstoken── Strato PHP-API ──SQL── MySQL
```

- `client.py` — HTTP-Strecke: Token-Auflösung, Wiederholung bei Drosselung, Fehlerformat
  `{ error, message, fields? }` → lesbarer Text, mehrteiliger Upload.
- `state_cache.py` — prozessweiter Zwischenspeicher für Auskunft und Zustandsbild. **Jedes
  Schreib-Werkzeug muss ihn verwerfen**, sonst antworten Suchen aus veralteten Daten.
- `search.py` — Teilzeichenketten-Suche über die Kurzfassungen im Zustandsbild (Client-seitig,
  das Backend hat keine Suchroute).
- `card_fields.py` — leitet aus den Ebenen eines Templates die Kartenfelder ab, 1:1 nach
  `card-fields.ts` im Frontend.
- `server.py` — Server-Instanz, Fehlerabbildung, Werkzeug-Registrierung, Start.
