# Findings — MCP-Server

Erkenntnisse aus der Umsetzung, die eine spätere Phase betreffen. Format:

```
- [ ] → Phase N: <Erkenntnis, in einem Satz>
```

Erledigte Punkte abhaken, nicht löschen.

- [ ] → Phase 3: Das MCP-SDK ist inzwischen bei 2.0 — die Server-Klasse heißt `MCPServer`
      (`mcp.server.mcpserver`), nicht mehr `FastMCP` wie in der Referenz. Bedienung
      identisch (`@mcp.tool()`, `mcp.run()`); beim Abschauen bei Promptigofant nur den
      Namen übersetzen.
- [ ] → Phase 4: `server.py` bringt beide Dekoratoren schon mit — `@api_tool` (Fehler →
      lesbarer Text) und `@invalidates_state` (verwirft das Zustandsbild, auch wenn der
      Schreibvorgang fehlschlägt). Reihenfolge wie bei den Lese-Werkzeugen:
      `@mcp.tool()` außen, darunter `@api_tool`.
- [ ] → Phase 4: Der Zwischenspeicher trennt Auskunft und Zustandsbild. `invalidate()`
      trifft nur das Zustandsbild; ein Schrift-Upload muss zusätzlich `invalidate_meta()`
      rufen, sonst zeigt `get_meta` die neue Schrift bis zum Neustart nicht.
- [ ] → Phase 5: `Client.post_multipart(path, fields, files)` nimmt neben der Datei auch
      Textfelder — für `POST /api/cards/{id}/images` also `fields={"layerId": …}`.
      Erlaubte Endungen sind dort auf PNG/JPEG begrenzt (`MULTIPART_CONTENT_TYPES`),
      passend zu `CardImageValidator`.
