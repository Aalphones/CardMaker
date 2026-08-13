# Meilenstein 6 — MCP-Server (Assistant-Zugriff auf die CardMaker-API)

Ein lokaler MCP-Server (`mcp/`, Python) macht die CardMaker-REST-API für Claude Code als
typisierte Werkzeuge verfügbar. Kernnutzen: **Claude befüllt die Textfelder eines Templates
mit Text** — der zweite Weg neben dem Formular im Karteneditor. Dazu Lesen/Suchen über
Templates, Karten, Kartengruppen und Bildvorrat, plus Kartengruppen anlegen/ändern und
Motivbilder an Karten hochladen.

**Templates bleiben lesend** (Entscheidung 2026-08-13): das Ebenen-Layout entsteht im Editor,
nicht als blind geschriebener JSON-Block.

Läuft **nur lokal** neben Claude Code, nie auf Strato — dieselbe REST-API, dieselbe
Zugriffstoken-Anmeldung wie das Frontend. Am Backend ändert sich genau eine Sache: die neue
Auskunfts-Route `GET /api/meta`.

## Phasen

| # | Phase | Inhalt | Rating | Status |
|---|---|---|---|---|
| 1 | [Auskunfts-Route](phase-1-meta-route.md) | `GET /api/meta` — Prüfregeln und Enums der laufenden API als eine Antwort | standard | complete |
| 2 | [MCP-Gerüst](phase-2-mcp-geruest.md) | `mcp/`-Subprojekt, HTTP-Client, Serverstart, `.mcp.json`, Werkzeuge `get_meta`/`get_state` | standard | complete |
| 3 | [Such- und Lese-Werkzeuge](phase-3-lese-werkzeuge.md) | `find_*`, `get_card`, `get_template`, `describe_card_fields` | mechanisch | pending |
| 4 | [Schreib-Werkzeuge](phase-4-schreib-werkzeuge.md) | Karten anlegen/ändern/duplizieren, Kartengruppen, Meta-Prüfung, Zwischenspeicher-Verfall | heikel | pending |
| 5 | [Bilder & Abschluss](phase-5-bilder-und-abschluss.md) | Motivbild hochladen/platzieren/entfernen, Doku, ADRs, Meilenstein-Abschluss | standard | pending |

## Kontrakt: `GET /api/meta`

Die Werkzeug-Schemas des MCP-Servers werden **zur Laufzeit** aus dieser Antwort abgeleitet,
nicht im Python-Code hand-gepflegt (`docs/conventions/mcp.md` → Critical Rules). Wire-Format
wie überall: camelCase. Hinter der Anmeldung, mit Zugriffstoken erreichbar.

```jsonc
{
  "canvas":   { "width": 630, "height": 880, "unitsPerMm": 10,
                "cardWidthMm": 63, "cardHeightMm": 88, "printDpi": 300 },
  "layers":   { "maxLayers": 100,
                "types": ["image","shape","icon","frame","text"],
                "shapeKinds": ["rect","circle","line"],
                "sources": ["static","user"],
                "textAligns": ["left","center","right"],
                "textVerticalAligns": ["top","middle","bottom"],
                "fieldKeyPattern": "^[a-z][a-z0-9_]{0,39}$",
                "colorPattern": "^#[0-9a-fA-F]{6}$" },
  "fonts":    { "builtIn": ["<Familienname>", "…"],
                "uploaded": [{ "id": 1, "name": "Wunschname", "family": "cmfont-1" }] },
  "cards":    { "nameMaxLength": 191,
                "valueKeyPattern": "^[a-z][a-z0-9_]{0,39}$",
                "valueMaxLength": 2000,
                "textOverrides": { "fontSizeMin": 4, "fontSizeMax": 200,
                                   "colorPattern": "^#[0-9a-fA-F]{6}$",
                                   "flags": ["bold","italic"] },
                "imagePlacement": { "offsetMin": -2000, "offsetMax": 2000,
                                    "scaleMin": 0.1, "scaleMax": 10 } },
  "cardGroups": { "nameMaxLength": 191, "descriptionMaxLength": 2000 },
  "assets":   { "kinds": ["frame","icon"] },
  "uploads":  { "imageMaxBytes": 8388608, "imageMimeTypes": ["image/png","image/jpeg"],
                "fontMaxBytes": 2097152 },
  "printProject": { "quantityMin": 1, "quantityMax": 99 }
}
```

**Alle Zahlen und Listen darin stammen aus den vorhandenen Prüfklassen, nicht aus einer
zweiten Abschrift** — die Werte oben sind der erwartete Stand, verbindlich ist die Quelle
(Phase 1 nennt sie pro Feld). Weicht ein Wert beim Bauen ab, gilt die Prüfklasse und die
Beispielzeile hier wird korrigiert.

## Finale Abnahmekriterien

1. `GET /api/meta` antwortet mit dem Kontrakt oben, mit Zugriffstoken erreichbar, ohne
   Anmeldung `401`.
2. `claude mcp list` bzw. der Werkzeug-Katalog in Claude Code zeigt den Server `cardmaker`
   mit allen Werkzeugen der Phasen 2–5.
3. Ein Durchstich ohne Oberfläche: Claude legt über MCP eine Kartengruppe an, legt darin
   eine Karte zu einem bestehenden Template an, befüllt deren Textfelder, lädt ein
   Motivbild hoch — anschließend zeigt die Kartenliste im Browser die Karte mit den
   richtigen Werten und die Live-Vorschau im Editor das Bild.
4. Kein Token-Literal im Git: weder in `.mcp.json` noch sonstwo; `mcp/.venv` bleibt ignoriert.
5. `docs/routes.md`, `docs/code-map.md`, `docs/conventions/mcp.md` und `docs/PROJECT.md`
   sind auf Stand.

## Bekannte Grenzen (bewusst so)

- **Über MCP angelegte Karten haben kein Vorschaubild.** Das Bild entsteht im Browser
  (ADR-005/ADR-022); der Server kann nicht rendern. Die Kachel bleibt leer, bis die Karte
  einmal im Editor gespeichert wird. Jedes Schreib-Werkzeug sagt das im Antworttext
  (Phase 4), Festlegung als ADR-026.
- **Kein Deploy.** `mcp/` läuft ausschließlich lokal, `deploy.cmd` fasst den Ordner nicht an.

## Summary

_(beim Archivieren füllen)_

## Files touched

_(beim Archivieren füllen)_

## Commits

_(beim Archivieren füllen)_

## Deviations from plan

_(beim Archivieren füllen)_

## Follow-ups

_(beim Archivieren füllen)_
